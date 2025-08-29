import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Game, Player, GameState, GamePhase, ChatMessage } from '../../types';
import apiService from '../../services/api';
import GameBoard from './GameBoard';
import GameChat from './GameChat';
import GameActions from './GameActions';
import GameInfo from './GameInfo';
import './Game.css';

interface GameProps {
  gameId: string;
}

const Game: React.FC<GameProps> = ({ gameId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [actionType, setActionType] = useState<string | null>(null);

  useEffect(() => {
    loadGameData();
    const interval = setInterval(loadGameData, 2000); // Rafraîchir toutes les 2 secondes
    return () => clearInterval(interval);
  }, [gameId]);

  useEffect(() => {
    if (players.length > 0 && user) {
      const player = players.find(p => p.user_id === user.id);
      setCurrentPlayer(player || null);
    }
  }, [players, user]);

  const loadGameData = async () => {
    try {
      const [gameData, playersData, stateData] = await Promise.all([
        apiService.getGame(gameId),
        apiService.getGamePlayers(gameId),
        apiService.getGameState(gameId)
      ]);

      setGame(gameData);
      setPlayers(playersData);
      setGameState(stateData);
    } catch (error: any) {
      setError('Erreur lors du chargement du jeu');
      console.error('Game load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChatMessages = async (chatType: string) => {
    try {
      const messages = await apiService.getChatMessages(gameId, chatType);
      setChatMessages(messages);
    } catch (error: any) {
      console.error('Chat load error:', error);
    }
  };

  const handleAction = async (action: string, targetId?: string) => {
    try {
      if (action === 'vote' && targetId) {
        await apiService.submitVote(gameId, targetId);
      } else if (action === 'use_power' && targetId) {
        await apiService.executeAction(gameId, action, targetId);
      }
      
      // Recharger les données du jeu
      await loadGameData();
      setSelectedTarget(null);
      setActionType(null);
    } catch (error: any) {
      setError('Erreur lors de l\'exécution de l\'action');
    }
  };

  const sendChatMessage = async (message: string, chatType: string) => {
    try {
      await apiService.sendChatMessage(gameId, message, chatType);
      await loadChatMessages(chatType);
    } catch (error: any) {
      setError('Erreur lors de l\'envoi du message');
    }
  };

  const handleLeaveGame = async () => {
    try {
      await apiService.leaveGame(gameId);
      navigate('/');
    } catch (error: any) {
      setError('Erreur lors de la sortie du jeu');
    }
  };

  if (isLoading) {
    return (
      <div className="game-container">
        <div className="loading-spinner">⏳ Chargement du jeu...</div>
      </div>
    );
  }

  if (!game || !gameState || !currentPlayer) {
    return (
      <div className="game-container">
        <div className="error-message">Erreur de chargement du jeu</div>
      </div>
    );
  }

  const isGameFinished = gameState.phase === 'FINISHED';
  const isNightPhase = gameState.phase === 'NIGHT';
  const isDayPhase = gameState.phase === 'DAY';
  const isVotingPhase = gameState.phase === 'VOTING';

  return (
    <div className="game-container">
      {/* En-tête du jeu */}
      <div className="game-header">
        <div className="game-title">
          <h1>🐺 {game.name}</h1>
          <div className="game-phase">
            <span className={`phase-badge ${gameState.phase.toLowerCase()}`}>
              {getPhaseDisplayName(gameState.phase)}
            </span>
            {gameState.turn > 0 && (
              <span className="turn-counter">Tour {gameState.turn}</span>
            )}
          </div>
        </div>
        
        <div className="game-controls">
          <button 
            className="control-button leave-button"
            onClick={handleLeaveGame}
          >
            🚪 Quitter
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Contenu principal du jeu */}
      <div className="game-content">
        {/* Plateau de jeu */}
        <div className="game-main">
          <GameBoard
            players={players}
            currentPlayer={currentPlayer}
            gameState={gameState}
            onPlayerSelect={setSelectedTarget}
            selectedTarget={selectedTarget}
          />
        </div>

        {/* Panneau latéral */}
        <div className="game-sidebar">
          {/* Informations du joueur */}
          <GameInfo
            currentPlayer={currentPlayer}
            gameState={gameState}
            players={players}
          />

          {/* Actions disponibles */}
          <GameActions
            currentPlayer={currentPlayer}
            gameState={gameState}
            selectedTarget={selectedTarget}
            onAction={handleAction}
            onTargetSelect={setSelectedTarget}
          />

          {/* Chat du jeu */}
          <GameChat
            chatMessages={chatMessages}
            onSendMessage={sendChatMessage}
            gameState={gameState}
            currentPlayer={currentPlayer}
            onLoadMessages={loadChatMessages}
          />
        </div>
      </div>

      {/* Messages de phase */}
      {gameState.phase_message && (
        <div className="phase-message">
          <div className="message-content">
            {gameState.phase_message}
          </div>
        </div>
      )}

      {/* Fin de partie */}
      {isGameFinished && (
        <div className="game-overlay">
          <div className="game-result">
            <h2>🎯 Partie terminée !</h2>
            <div className="winner-announcement">
              {gameState.winner_team === 'VILLAGERS' ? (
                <div className="villagers-win">
                  🛡️ Les Villageois ont gagné !
                </div>
              ) : (
                <div className="wolves-win">
                  🐺 Les Loups ont gagné !
                </div>
              )}
            </div>
            <div className="game-summary">
              <p>Durée : {gameState.duration || 'N/A'}</p>
              <p>Joueurs : {players.length}</p>
            </div>
            <button 
              className="return-button"
              onClick={() => navigate('/')}
            >
              🏠 Retour au menu principal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Fonction utilitaire pour afficher le nom de la phase
const getPhaseDisplayName = (phase: string): string => {
  const phaseNames: { [key: string]: string } = {
    'NIGHT': '🌙 Nuit',
    'DAY': '☀️ Jour',
    'VOTING': '🗳️ Vote',
    'ACCUSATION': '⚖️ Accusation',
    'FINISHED': '🏁 Terminé'
  };
  return phaseNames[phase] || phase;
};

export default Game;
