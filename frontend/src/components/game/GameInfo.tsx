import React from 'react';
import { Player, GameState } from '../../types';
import './GameInfo.css';

interface GameInfoProps {
  currentPlayer: Player;
  gameState: GameState;
  players: Player[];
}

const GameInfo: React.FC<GameInfoProps> = ({
  currentPlayer,
  gameState,
  players
}) => {
  const isNightPhase = gameState.phase === 'NIGHT';
  const isDayPhase = gameState.phase === 'DAY';
  const isVotingPhase = gameState.phase === 'VOTING';

  // Compter les joueurs par équipe
  const getTeamCounts = () => {
    const wolves = players.filter(p => p.role?.team === 'WOLVES' && !p.is_dead).length;
    const villagers = players.filter(p => p.role?.team === 'VILLAGERS' && !p.is_dead).length;
    return { wolves, villagers };
  };

  const { wolves, villagers } = getTeamCounts();

  // Obtenir les informations du rôle
  const getRoleInfo = () => {
    if (!currentPlayer.role) return null;

    const role = currentPlayer.role;
    const roleInfo: { [key: string]: any } = {
      'Voyante': {
        description: 'Vous pouvez révéler l\'identité d\'un joueur chaque nuit',
        power: '🔮 Révéler l\'identité d\'un joueur',
        team: 'Villageois',
        color: '#27ae60'
      },
      'Épouvantail': {
        description: 'Vous protégez les joueurs adjacents une fois par partie',
        power: '🛡️ Protéger les joueurs adjacents',
        team: 'Villageois',
        color: '#27ae60'
      },
      'Corbeau': {
        description: 'Vous pouvez maudire un joueur pour lui donner un vote supplémentaire',
        power: '🦅 Donner un vote supplémentaire',
        team: 'Villageois',
        color: '#27ae60'
      },
      'Renard': {
        description: 'Vous pouvez flairer les 3 joueurs à votre gauche une fois',
        power: '🦊 Détecter les loups',
        team: 'Villageois',
        color: '#27ae60'
      },
      'Rêveur': {
        description: 'Vous voyez la cible des loups chaque nuit',
        power: '💭 Voir la cible des loups',
        team: 'Villageois',
        color: '#27ae60'
      },
      'Skinwalker': {
        description: 'Vous votez avec les autres loups pour tuer un joueur',
        power: '🗡️ Voter pour tuer',
        team: 'Loups',
        color: '#e74c3c'
      },
      'Bouc Émissaire': {
        description: 'Vous connaissez les autres loups mais ne votez pas avec eux',
        power: '🐐 Connaître les loups',
        team: 'Loups',
        color: '#e74c3c'
      },
      'Warlord': {
        description: 'Vous protégez un loup d\'une attaque une fois par partie',
        power: '🛡️ Protéger un loup',
        team: 'Loups',
        color: '#e74c3c'
      },
      'Sbire': {
        description: 'Vous protégez un loup d\'une attaque une fois par partie',
        power: '🛡️ Protéger un loup',
        team: 'Loups',
        color: '#e74c3c'
      },
      'Marchand de Sable': {
        description: 'Vous pouvez endormir le village et sauter la phase d\'accusation',
        power: '😴 Sauter la phase d\'accusation',
        team: 'Loups',
        color: '#e74c3c'
      },
      'Pestiféré': {
        description: 'Votre morsure contamine et transforme les joueurs en loups',
        power: '🦠 Contaminer les joueurs',
        team: 'Loups',
        color: '#e74c3c'
      }
    };

    return roleInfo[role.name] || {
      description: 'Rôle spécial avec des pouvoirs uniques',
      power: 'Pouvoir spécial',
      team: role.team === 'WOLVES' ? 'Loups' : 'Villageois',
      color: role.team === 'WOLVES' ? '#e74c3c' : '#27ae60'
    };
  };

  const roleInfo = getRoleInfo();

  return (
    <div className="game-info">
      {/* Informations du joueur */}
      <div className="player-info-section">
        <h3>👤 Votre profil</h3>
        
        <div className="player-card">
          <div className="player-avatar">
            {currentPlayer.username.charAt(0).toUpperCase()}
          </div>
          
          <div className="player-details">
            <div className="player-name">{currentPlayer.username}</div>
            <div className="player-chair">Chaise {currentPlayer.chair_number + 1}</div>
            <div className="player-status">
              {currentPlayer.is_dead ? '💀 Mort' : '❤️ Vivant'}
            </div>
          </div>
        </div>
      </div>

      {/* Informations du rôle */}
      {roleInfo && (
        <div className="role-info-section">
          <h3>🎭 Votre rôle</h3>
          
          <div className="role-card" style={{ borderColor: roleInfo.color }}>
            <div className="role-header">
              <span className="role-name">{currentPlayer.role?.name}</span>
              <span className="role-team" style={{ backgroundColor: roleInfo.color }}>
                {roleInfo.team}
              </span>
            </div>
            
            <div className="role-description">
              {roleInfo.description}
            </div>
            
            <div className="role-power">
              <strong>Pouvoir :</strong> {roleInfo.power}
            </div>
          </div>
        </div>
      )}

      {/* État du jeu */}
      <div className="game-status-section">
        <h3>📊 État du jeu</h3>
        
        <div className="status-grid">
          <div className="status-item">
            <span className="status-icon">🌙</span>
            <span className="status-label">Loups</span>
            <span className="status-value">{wolves}</span>
          </div>
          
          <div className="status-item">
            <span className="status-icon">🛡️</span>
            <span className="status-label">Villageois</span>
            <span className="status-value">{villagers}</span>
          </div>
          
          <div className="status-item">
            <span className="status-icon">💀</span>
            <span className="status-label">Morts</span>
            <span className="status-value">{players.filter(p => p.is_dead).length}</span>
          </div>
          
          <div className="status-item">
            <span className="status-icon">👥</span>
            <span className="status-label">Total</span>
            <span className="status-value">{players.length}</span>
          </div>
        </div>
      </div>

      {/* Phase actuelle */}
      <div className="phase-info-section">
        <h3>⏰ Phase actuelle</h3>
        
        <div className="phase-card">
          <div className="phase-display">
            {isNightPhase && '🌙 Nuit'}
            {isDayPhase && '☀️ Jour'}
            {isVotingPhase && '🗳️ Vote'}
            {gameState.phase === 'ACCUSATION' && '⚖️ Accusation'}
            {gameState.phase === 'FINISHED' && '🏁 Terminé'}
          </div>
          
          {gameState.turn > 0 && (
            <div className="turn-info">
              Tour {gameState.turn}
            </div>
          )}
          
          {gameState.phase_message && (
            <div className="phase-message">
              {gameState.phase_message}
            </div>
          )}
        </div>
      </div>

      {/* Règles rapides */}
      <div className="rules-section">
        <h3>📖 Règles rapides</h3>
        
        <div className="rules-list">
          <div className="rule-item">
            <span className="rule-icon">🌙</span>
            <span className="rule-text">La nuit, les loups votent pour tuer</span>
          </div>
          
          <div className="rule-item">
            <span className="rule-icon">☀️</span>
            <span className="rule-text">Le jour, discutez et accusez</span>
          </div>
          
          <div className="rule-item">
            <span className="rule-icon">🗳️</span>
            <span className="rule-text">Votez pour éliminer un suspect</span>
          </div>
          
          <div className="rule-item">
            <span className="rule-icon">🎯</span>
            <span className="rule-text">Utilisez vos pouvoirs stratégiquement</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameInfo;
