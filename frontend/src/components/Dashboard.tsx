import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Game, UserStats } from '../types';
import apiService from '../services/api';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [newGameData, setNewGameData] = useState({
    name: '',
    description: '',
    min_players: 8,
    max_players: 12
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [gamesData, statsData] = await Promise.all([
        apiService.getGames(),
        apiService.getUserStats()
      ]);

      setGames(gamesData);
      setStats(statsData);
    } catch (error: any) {
      setError('Erreur lors du chargement des données');
      console.error('Dashboard load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newGame = await apiService.createGame(newGameData);
      setGames(prev => [newGame, ...prev]);
      setShowCreateGame(false);
      setNewGameData({
        name: '',
        description: '',
        min_players: 8,
        max_players: 12
      });
    } catch (error: any) {
      setError('Erreur lors de la création du jeu');
      console.error('Create game error:', error);
    }
  };

  const handleJoinGame = async (gameId: string) => {
    try {
      await apiService.joinGame(gameId);
      navigate(`/game/${gameId}`);
    } catch (error: any) {
      setError('Erreur lors de la connexion au jeu');
      console.error('Join game error:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED':
        return '#3182ce';
      case 'WAITING':
        return '#d69e2e';
      case 'PLAYING':
        return '#38a169';
      case 'FINISHED':
        return '#e53e3e';
      default:
        return '#718096';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CREATED':
        return 'Créé';
      case 'WAITING':
        return 'En attente';
      case 'PLAYING':
        return 'En cours';
      case 'FINISHED':
        return 'Terminé';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">⏳</div>
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🐺 Wendigo Game</h1>
          <div className="user-info">
            <span>Bienvenue, {user?.username}!</span>
            <button onClick={handleLogout} className="logout-button">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Statistiques utilisateur */}
      {stats && (
        <section className="stats-section">
          <h2>📊 Mes Statistiques</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.games_played}</div>
              <div className="stat-label">Parties jouées</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.games_won}</div>
              <div className="stat-label">Victoires</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.total_score}</div>
              <div className="stat-label">Score total</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.win_rate.toFixed(1)}%</div>
              <div className="stat-label">Taux de victoire</div>
            </div>
          </div>
        </section>
      )}

      {/* Section des jeux */}
      <section className="games-section">
        <div className="section-header">
          <h2>🎮 Lobbys Disponibles</h2>
          <button 
            onClick={() => setShowCreateGame(true)}
            className="create-game-button"
          >
            + Créer un lobby
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)} className="error-close">×</button>
          </div>
        )}

        {/* Liste des jeux */}
        <div className="games-grid">
          {games.length === 0 ? (
            <div className="no-games">
              <p>Aucun lobby disponible</p>
              <p>Soyez le premier à créer un lobby !</p>
            </div>
          ) : (
            games.map(game => (
              <div key={game.id} className="game-card">
                <div className="game-header">
                  <h3>{game.name}</h3>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(game.status) }}
                  >
                    {getStatusText(game.status)}
                  </span>
                </div>
                
                {game.description && (
                  <p className="game-description">{game.description}</p>
                )}
                
                <div className="game-info">
                  <div className="info-item">
                    <span className="info-label">Joueurs:</span>
                    <span className="info-value">
                      {game.current_players}/{game.max_players}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Min:</span>
                    <span className="info-value">{game.min_players}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Créé le:</span>
                    <span className="info-value">
                      {new Date(game.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="game-actions">
                  {game.status === 'CREATED' && game.current_players < game.max_players && (
                    <button 
                      onClick={() => handleJoinGame(game.id)}
                      className="join-button"
                    >
                      Rejoindre
                    </button>
                  )}
                  {game.status === 'WAITING' && (
                    <button 
                      onClick={() => navigate(`/lobby/${game.id}`)}
                      className="view-button"
                    >
                      Voir le lobby
                    </button>
                  )}
                  {game.status === 'PLAYING' && (
                    <button 
                      onClick={() => navigate(`/game/${game.id}`)}
                      className="spectate-button"
                    >
                      Spectateur
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Modal de création de jeu */}
      {showCreateGame && (
        <div className="modal-overlay" onClick={() => setShowCreateGame(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Créer un nouveau lobby</h3>
            <form onSubmit={handleCreateGame}>
              <div className="form-group">
                <label htmlFor="gameName">Nom du lobby</label>
                <input
                  type="text"
                  id="gameName"
                  value={newGameData.name}
                  onChange={e => setNewGameData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nom du lobby"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="gameDescription">Description (optionnel)</label>
                <textarea
                  id="gameDescription"
                  value={newGameData.description}
                  onChange={e => setNewGameData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description du lobby"
                  rows={3}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="minPlayers">Joueurs minimum</label>
                  <input
                    type="number"
                    id="minPlayers"
                    min="8"
                    max="29"
                    value={newGameData.min_players}
                    onChange={e => setNewGameData(prev => ({ ...prev, min_players: parseInt(e.target.value) }))}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="maxPlayers">Joueurs maximum</label>
                  <input
                    type="number"
                    id="maxPlayers"
                    min="8"
                    max="29"
                    value={newGameData.max_players}
                    onChange={e => setNewGameData(prev => ({ ...prev, max_players: parseInt(e.target.value) }))}
                    required
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateGame(false)}>
                  Annuler
                </button>
                <button type="submit" className="primary">
                  Créer le lobby
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
