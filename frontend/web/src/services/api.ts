// Service pour communiquer avec votre backend C#
// C'est comme un HttpClient en C#, mais pour le frontend

const API_BASE_URL = 'https://localhost:7001'; // Votre backend C#

// Types TypeScript (comme vos modèles C#)
export interface Player {
  id: string;
  username: string;
  isReady: boolean;
  isHost: boolean;
}

export interface Game {
  id: string;
  status: 'waiting' | 'playing' | 'finished';
  players: Player[];
  currentPhase: string;
  maxPlayers: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
}

// Classe pour gérer les appels API (comme un service en C#)
class ApiService {
  
  // Méthode générique pour faire des requêtes HTTP
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET - Récupérer des données (comme GET en C#)
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST - Envoyer des données (comme POST en C#)
  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT - Mettre à jour des données (comme PUT en C#)
  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE - Supprimer des données (comme DELETE en C#)
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Méthodes spécifiques pour votre jeu
  async getLobbies(): Promise<Game[]> {
    return this.get<Game[]>('/api/games/lobbies');
  }

  async createGame(gameData: Partial<Game>): Promise<Game> {
    return this.post<Game>('/api/games', gameData);
  }

  async joinGame(gameId: string, playerId: string): Promise<Game> {
    return this.post<Game>(`/api/games/${gameId}/join`, { playerId });
  }

  async getGameStatus(gameId: string): Promise<Game> {
    return this.get<Game>(`/api/games/${gameId}`);
  }

  async sendChatMessage(gameId: string, message: ChatMessage): Promise<ChatMessage> {
    return this.post<ChatMessage>(`/api/games/${gameId}/chat`, message);
  }

  async getChatHistory(gameId: string): Promise<ChatMessage[]> {
    return this.get<ChatMessage[]>(`/api/games/${gameId}/chat`);
  }
}

// Instance unique du service (comme un singleton en C#)
export const apiService = new ApiService();
export default apiService;
