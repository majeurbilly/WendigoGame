import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Game, Player, Phase, GameState, WebSocketMessage, ChatMessage } from '../types';
import apiService from '../services/api';
import websocketService from '../services/websocket';

// Types pour les actions
type GameAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_GAME'; payload: Game }
  | { type: 'SET_PLAYERS'; payload: Player[] }
  | { type: 'SET_PHASE'; payload: Phase }
  | { type: 'SET_TIME_REMAINING'; payload: number }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'UPDATE_PLAYER'; payload: Player }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'CLEAR_GAME' }
  | { type: 'GAME_UPDATE'; payload: any }
  | { type: 'PLAYER_UPDATE'; payload: Player }
  | { type: 'PHASE_UPDATE'; payload: Phase };

// État initial
const initialState: GameState = {
  currentGame: null,
  players: [],
  currentPhase: null,
  timeRemaining: 0,
  isConnected: false,
  isLoading: false,
  error: null,
};

// Reducer pour le jeu
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'SET_GAME':
      return {
        ...state,
        currentGame: action.payload,
        error: null,
      };
    case 'SET_PLAYERS':
      return {
        ...state,
        players: action.payload,
      };
    case 'SET_PHASE':
      return {
        ...state,
        currentPhase: action.payload,
      };
    case 'SET_TIME_REMAINING':
      return {
        ...state,
        timeRemaining: action.payload,
      };
    case 'SET_CONNECTED':
      return {
        ...state,
        isConnected: action.payload,
      };
    case 'UPDATE_PLAYER':
      return {
        ...state,
        players: state.players.map(player =>
          player.id === action.payload.id ? action.payload : player
        ),
      };
    case 'GAME_UPDATE':
      return {
        ...state,
        currentGame: action.payload.game ? { ...state.currentGame, ...action.payload.game } : state.currentGame,
        timeRemaining: action.payload.time_remaining || state.timeRemaining,
      };
    case 'PLAYER_UPDATE':
      return {
        ...state,
        players: state.players.map(player =>
          player.id === action.payload.id ? action.payload : player
        ),
      };
    case 'PHASE_UPDATE':
      return {
        ...state,
        currentPhase: action.payload,
      };
    case 'CLEAR_GAME':
      return {
        ...initialState,
        isLoading: false,
      };
    default:
      return state;
  }
};

// Interface pour le contexte
interface GameContextType extends GameState {
  // Actions de jeu
  loadGame: (gameId: string) => Promise<void>;
  joinGame: (gameId: string) => Promise<void>;
  startGame: (gameId: string) => Promise<void>;
  leaveGame: () => void;
  
  // Actions de joueur
  setPlayerReady: (isReady: boolean) => Promise<void>;
  selectChair: (chairPosition: number) => Promise<void>;
  updateNotes: (notes: string) => Promise<void>;
  
  // Actions WebSocket
  sendChatMessage: (message: string, chatType: string) => void;
  sendAction: (actionType: string, targetId?: string, additionalData?: any) => void;
  sendVote: (voteType: string, targetId?: string) => void;
  sendReady: (isReady: boolean) => void;
  sendChairSelection: (chairPosition: number) => void;
  
  // Utilitaires
  getCurrentPlayer: () => Player | undefined;
  getPlayerById: (playerId: string) => Player | undefined;
  getAlivePlayers: () => Player[];
  getPlayersByTeam: (teamName: string) => Player[];
  clearError: () => void;
}

// Création du contexte
const GameContext = createContext<GameContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

// Props pour le provider
interface GameProviderProps {
  children: ReactNode;
}

// Provider du contexte de jeu
export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Configuration WebSocket
  useEffect(() => {
    if (state.currentGame) {
      const token = localStorage.getItem('token');
      if (token) {
        websocketService
          .connect(state.currentGame.id, token)
          .then(() => {
            dispatch({ type: 'SET_CONNECTED', payload: true });
          })
          .catch((error) => {
            console.error('WebSocket connection failed:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Connexion WebSocket échouée' });
          });

        // Configuration des événements WebSocket
        websocketService.onMessage((message: WebSocketMessage) => {
          handleWebSocketMessage(message);
        });

        websocketService.onOpen(() => {
          dispatch({ type: 'SET_CONNECTED', payload: true });
        });

        websocketService.onClose(() => {
          dispatch({ type: 'SET_CONNECTED', payload: false });
        });

        websocketService.onError((error) => {
          console.error('WebSocket error:', error);
          dispatch({ type: 'SET_ERROR', payload: 'Erreur WebSocket' });
        });

        // Nettoyage à la déconnexion
        return () => {
          websocketService.disconnect();
        };
      }
    }
  }, [state.currentGame?.id]);

  // Gestion des messages WebSocket
  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'game_update':
        dispatch({ type: 'GAME_UPDATE', payload: message.data });
        break;
      case 'player_update':
        dispatch({ type: 'PLAYER_UPDATE', payload: message.data });
        break;
      case 'phase_update':
        dispatch({ type: 'PHASE_UPDATE', payload: message.data });
        break;
      case 'chat_message':
        // Gérer les messages de chat si nécessaire
        break;
      default:
        console.log('Unhandled WebSocket message:', message);
    }
  };

  // Charger un jeu
  const loadGame = async (gameId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const [game, players] = await Promise.all([
        apiService.getGame(gameId),
        apiService.getGamePlayers(gameId)
      ]);

      dispatch({ type: 'SET_GAME', payload: game });
      dispatch({ type: 'SET_PLAYERS', payload: players });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erreur lors du chargement du jeu';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Rejoindre un jeu
  const joinGame = async (gameId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await apiService.joinGame(gameId);
      await loadGame(gameId);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erreur lors de la connexion au jeu';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Démarrer un jeu
  const startGame = async (gameId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const updatedGame = await apiService.startGame(gameId);
      dispatch({ type: 'SET_GAME', payload: updatedGame });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erreur lors du démarrage du jeu';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Quitter un jeu
  const leaveGame = (): void => {
    websocketService.disconnect();
    dispatch({ type: 'CLEAR_GAME' });
  };

  // Actions de joueur
  const setPlayerReady = async (isReady: boolean): Promise<void> => {
    if (!state.currentGame) return;
    
    try {
      const updatedPlayer = await apiService.setPlayerReady(state.currentGame.id, isReady);
      dispatch({ type: 'UPDATE_PLAYER', payload: updatedPlayer });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erreur lors de la mise à jour du statut';
      throw new Error(errorMessage);
    }
  };

  const selectChair = async (chairPosition: number): Promise<void> => {
    if (!state.currentGame) return;
    
    try {
      const updatedPlayer = await apiService.selectChair(state.currentGame.id, chairPosition);
      dispatch({ type: 'UPDATE_PLAYER', payload: updatedPlayer });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erreur lors de la sélection de chaise';
      throw new Error(errorMessage);
    }
  };

  const updateNotes = async (notes: string): Promise<void> => {
    if (!state.currentGame) return;
    
    try {
      const updatedPlayer = await apiService.updatePlayerNotes(state.currentGame.id, notes);
      dispatch({ type: 'UPDATE_PLAYER', payload: updatedPlayer });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erreur lors de la mise à jour des notes';
      throw new Error(errorMessage);
    }
  };

  // Actions WebSocket
  const sendChatMessage = (message: string, chatType: string): void => {
    websocketService.sendChatMessage(message, chatType);
  };

  const sendAction = (actionType: string, targetId?: string, additionalData?: any): void => {
    websocketService.sendAction(actionType, targetId, additionalData);
  };

  const sendVote = (voteType: string, targetId?: string): void => {
    websocketService.sendVote(voteType, targetId);
  };

  const sendReady = (isReady: boolean): void => {
    websocketService.sendReady(isReady);
  };

  const sendChairSelection = (chairPosition: number): void => {
    websocketService.sendChairSelection(chairPosition);
  };

  // Utilitaires
  const getCurrentPlayer = (): Player | undefined => {
    if (!state.currentGame) return undefined;
    return state.players.find(player => player.user_id === localStorage.getItem('userId'));
  };

  const getPlayerById = (playerId: string): Player | undefined => {
    return state.players.find(player => player.id === playerId);
  };

  const getAlivePlayers = (): Player[] => {
    return state.players.filter(player => player.is_alive);
  };

  const getPlayersByTeam = (teamName: string): Player[] => {
    return state.players.filter(player => player.team_name === teamName);
  };

  const clearError = (): void => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  // Valeur du contexte
  const contextValue: GameContextType = {
    ...state,
    loadGame,
    joinGame,
    startGame,
    leaveGame,
    setPlayerReady,
    selectChair,
    updateNotes,
    sendChatMessage,
    sendAction,
    sendVote,
    sendReady,
    sendChairSelection,
    getCurrentPlayer,
    getPlayerById,
    getAlivePlayers,
    getPlayersByTeam,
    clearError,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};
