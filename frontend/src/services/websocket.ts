import { WebSocketMessage, ChatMessage, GameUpdate } from '../types';

// Configuration WebSocket
const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/api/v1/ws';

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private messageQueue: WebSocketMessage[] = [];
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map();

  // Callbacks pour les événements
  private onMessageCallback?: (message: WebSocketMessage) => void;
  private onOpenCallback?: () => void;
  private onCloseCallback?: () => void;
  private onErrorCallback?: (error: Event) => void;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Écouter les changements de visibilité de la page pour reconnecter
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.ws?.readyState === WebSocket.CLOSED) {
        this.reconnect();
      }
    });

    // Écouter les changements de connectivité
    window.addEventListener('online', () => {
      if (this.ws?.readyState === WebSocket.CLOSED) {
        this.reconnect();
      }
    });
  }

  // Connexion au WebSocket
  connect(gameId: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;
      const wsUrl = `${WS_BASE_URL}/game/${gameId}`;

      try {
        this.ws = new WebSocket(wsUrl);

        // Ajouter le token d'authentification
        this.ws.onopen = () => {
          this.sendMessage({
            type: 'auth',
            data: { token }
          });
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          this.isConnecting = false;
          this.onCloseCallback?.();
          
          // Tentative de reconnexion automatique
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
              this.reconnect();
            }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
          }
        };

        this.ws.onerror = (error) => {
          this.isConnecting = false;
          this.onErrorCallback?.(error);
          reject(error);
        };

        // Attendre la confirmation d'authentification
        const authHandler = (message: WebSocketMessage) => {
          if (message.type === 'auth_success') {
            this.removeEventListener('auth_success', authHandler);
            this.isConnecting = false;
            this.reconnectAttempts = 0;
            this.onOpenCallback?.();
            this.flushMessageQueue();
            resolve();
          } else if (message.type === 'auth_error') {
            this.removeEventListener('auth_error', authHandler);
            this.isConnecting = false;
            reject(new Error(message.data.message || 'Authentication failed'));
          }
        };

        this.addEventListener('auth_success', authHandler);
        this.addEventListener('auth_error', authHandler);

        // Timeout pour l'authentification
        setTimeout(() => {
          if (this.isConnecting) {
            this.isConnecting = false;
            reject(new Error('Authentication timeout'));
          }
        }, 5000);

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  // Déconnexion
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
      this.ws = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.messageQueue = [];
  }

  // Envoi de message
  sendMessage(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Mettre en file d'attente si pas connecté
      this.messageQueue.push(message);
    }
  }

  // Envoi de message de chat
  sendChatMessage(message: string, chatType: string): void {
    this.sendMessage({
      type: 'chat',
      data: {
        message,
        chat_type: chatType
      }
    });
  }

  // Envoi d'action
  sendAction(actionType: string, targetId?: string, additionalData?: any): void {
    this.sendMessage({
      type: 'action',
      data: {
        action_type: actionType,
        target_id: targetId,
        additional_data: additionalData
      }
    });
  }

  // Envoi de vote
  sendVote(voteType: string, targetId?: string): void {
    this.sendMessage({
      type: 'vote',
      data: {
        vote_type: voteType,
        target_id: targetId
      }
    });
  }

  // Envoi de statut prêt
  sendReady(isReady: boolean): void {
    this.sendMessage({
      type: 'ready',
      data: {
        is_ready: isReady
      }
    });
  }

  // Envoi de sélection de chaise
  sendChairSelection(chairPosition: number): void {
    this.sendMessage({
      type: 'chair_selection',
      data: {
        chair_position: chairPosition
      }
    });
  }

  // Gestion des messages reçus
  private handleMessage(message: WebSocketMessage): void {
    this.onMessageCallback?.(message);
    this.triggerEventListeners(message.type, message.data);
  }

  // Gestion de la file d'attente des messages
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }

  // Reconnexion automatique
  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    const token = localStorage.getItem('token');
    if (token) {
      // Récupérer le gameId depuis l'URL ou le state
      const gameId = this.getGameIdFromUrl();
      if (gameId) {
        this.connect(gameId, token).catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }
    }
  }

  private getGameIdFromUrl(): string | null {
    const pathParts = window.location.pathname.split('/');
    const gameIndex = pathParts.indexOf('game');
    if (gameIndex !== -1 && pathParts[gameIndex + 1]) {
      return pathParts[gameIndex + 1];
    }
    return null;
  }

  // Gestion des événements
  addEventListener(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: (data: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private triggerEventListeners(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Setters pour les callbacks
  onMessage(callback: (message: WebSocketMessage) => void): void {
    this.onMessageCallback = callback;
  }

  onOpen(callback: () => void): void {
    this.onOpenCallback = callback;
  }

  onClose(callback: () => void): void {
    this.onCloseCallback = callback;
  }

  onError(callback: (error: Event) => void): void {
    this.onErrorCallback = callback;
  }

  // Getters pour l'état
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): number {
    return this.ws?.readyState || WebSocket.CLOSED;
  }

  // Méthodes utilitaires pour les types de messages spécifiques
  isGameUpdate(message: WebSocketMessage): message is WebSocketMessage & { data: GameUpdate } {
    return message.type === 'game_update';
  }

  isChatMessage(message: WebSocketMessage): message is WebSocketMessage & { data: ChatMessage } {
    return message.type === 'chat_message';
  }

  isPlayerUpdate(message: WebSocketMessage): boolean {
    return message.type === 'player_update';
  }

  isPhaseUpdate(message: WebSocketMessage): boolean {
    return message.type === 'phase_update';
  }

  isVoteUpdate(message: WebSocketMessage): boolean {
    return message.type === 'vote_update';
  }

  isActionUpdate(message: WebSocketMessage): boolean {
    return message.type === 'action_update';
  }
}

// Instance singleton
const websocketService = new WebSocketService();
export default websocketService;
