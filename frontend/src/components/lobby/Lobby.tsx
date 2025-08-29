import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Game, Player, GameState } from '../../types';
import apiService from '../../services/api';
import './Lobby.css';

interface LobbyProps {
  gameId: string;
}

const Lobby: React.FC<LobbyProps> = ({ gameId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChair, setSelectedChair] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadLobbyData();
    const interval = setInterval(loadLobbyData, 5000); // Rafraîchir toutes les 5 secondes
    return () => clearInterval(interval);
  }, [gameId]);

  const loadLobbyData = async () => {
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
      setError('Erreur lors du chargement du lobby');
      console.error('Lobby load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChairSelection = async (chairNumber: number) => {
    try {
      await apiService.selectChair(gameId, chairNumber);
      setSelectedChair(chairNumber);
    } catch (error: any) {
      setError('Erreur lors de la sélection de la chaise');
    }
  };

  const handleReady = async () => {
    try {
      await apiService.setPlayerReady(gameId);
      setIsReady(true);
    } catch (error: any) {
      setError('Erreur lors de la mise en attente');
    }
  };

  const handleStartGame = async () => {
    try {
      await apiService.startGame(gameId);
      navigate(`/game/${gameId}`);
    } catch (error: any) {
      setError('Erreur lors du démarrage du jeu');
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
      <div className="lobby-container">
        <div className="loading-spinner">⏳ Chargement du lobby...</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="lobby-container">
        <div className="error-message">Partie non trouvée</div>
      </div>
    );
  }

  const canStartGame = game.creator_id === user?.id && 
                      players.length >= game.min_players && 
                      players.every(p => p.is_ready);

  return (
    <div className="lobby-container">
      <div className="lobby-header">
        <h1>🎮 Lobby - {game.name}</h1>
        <p className="game-description">{game.description}</p>
        <div className="game-info">
          <span>👥 {players.length}/{game.max_players} joueurs</span>
          <span>🎯 {game.min_players} minimum</span>
          <span>📊 {game.status}</span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="lobby-content">
        {/* Sélection des chaises */}
        <div className="chair-selection">
          <h2>🪑 Sélection des positions</h2>
          <div className="chairs-grid">
            {Array.from({ length: game.max_players }, (_, i) => {
              const player = players.find(p => p.chair_number === i);
              const isOccupied = !!player;
              const isMyChair = player?.user_id === user?.id;
              
              return (
                <div
                  key={i}
                  className={`chair ${isOccupied ? 'occupied' : 'available'} ${isMyChair ? 'my-chair' : ''}`}
                  onClick={() => !isOccupied && handleChairSelection(i)}
                >
                  <div className="chair-number">{i + 1}</div>
                  {isOccupied ? (
                    <div className="player-info">
                      <div className="player-name">{player.username}</div>
                      <div className={`player-ready ${player.is_ready ? 'ready' : 'not-ready'}`}>
                        {player.is_ready ? '✅' : '⏳'}
                      </div>
                    </div>
                  ) : (
                    <div className="chair-available">Libre</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Liste des joueurs */}
        <div className="players-list">
          <h2>👥 Joueurs ({players.length}/{game.max_players})</h2>
          <div className="players-grid">
            {players.map((player) => (
              <div key={player.user_id} className="player-card">
                <div className="player-avatar">
                  {player.username.charAt(0).toUpperCase()}
                </div>
                <div className="player-details">
                  <div className="player-name">{player.username}</div>
                  <div className="player-chair">Chaise {player.chair_number + 1}</div>
                  <div className={`player-status ${player.is_ready ? 'ready' : 'not-ready'}`}>
                    {player.is_ready ? 'Prêt' : 'En attente'}
                  </div>
                </div>
                {player.user_id === game.creator_id && (
                  <div className="creator-badge">👑</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions du lobby */}
        <div className="lobby-actions">
          {selectedChair !== null && !isReady && (
            <button 
              className="action-button ready-button"
              onClick={handleReady}
            >
              ✅ Je suis prêt
            </button>
          )}
          
          {canStartGame && (
            <button 
              className="action-button start-button"
              onClick={handleStartGame}
            >
              🚀 Démarrer la partie
            </button>
          )}
          
          <button 
            className="action-button leave-button"
            onClick={handleLeaveGame}
          >
            🚪 Quitter la partie
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
