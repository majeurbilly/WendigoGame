import React from 'react';
import { Player, GameState } from '../../types';
import './GameBoard.css';

interface GameBoardProps {
  players: Player[];
  currentPlayer: Player;
  gameState: GameState;
  onPlayerSelect: (playerId: string) => void;
  selectedTarget: string | null;
}

const GameBoard: React.FC<GameBoardProps> = ({
  players,
  currentPlayer,
  gameState,
  onPlayerSelect,
  selectedTarget
}) => {
  const isNightPhase = gameState.phase === 'NIGHT';
  const isVotingPhase = gameState.phase === 'VOTING';
  const isDayPhase = gameState.phase === 'DAY';

  // Calculer la position des joueurs en cercle
  const getPlayerPosition = (index: number, total: number) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2; // Commencer en haut
    const radius = 200; // Rayon du cercle
    const centerX = 50; // Centre X en pourcentage
    const centerY = 50; // Centre Y en pourcentage
    
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    return { x, y };
  };

  // Déterminer si un joueur peut être sélectionné
  const canSelectPlayer = (player: Player): boolean => {
    if (player.user_id === currentPlayer.user_id) return false;
    if (player.is_dead) return false;
    
    // En phase de vote, tous les joueurs vivants peuvent être votés
    if (isVotingPhase) return true;
    
    // En phase de jour, tous les joueurs vivants peuvent être accusés
    if (isDayPhase) return true;
    
    // En phase de nuit, dépend du rôle et des pouvoirs
    if (isNightPhase) {
      // Logique spécifique selon le rôle (à implémenter)
      return true;
    }
    
    return false;
  };

  // Obtenir la classe CSS pour un joueur
  const getPlayerClass = (player: Player): string => {
    let classes = ['player-token'];
    
    if (player.is_dead) {
      classes.push('dead');
    }
    
    if (player.user_id === currentPlayer.user_id) {
      classes.push('current-player');
    }
    
    if (selectedTarget === player.user_id) {
      classes.push('selected');
    }
    
    if (player.is_ready) {
      classes.push('ready');
    }
    
    // Ajouter des classes selon le rôle (si visible)
    if (currentPlayer.role && player.role && 
        (currentPlayer.role.team === player.role.team || 
         currentPlayer.role.name === 'Voyante' ||
         currentPlayer.role.name === 'Rêveur')) {
      classes.push(`team-${player.role.team.toLowerCase()}`);
    }
    
    return classes.join(' ');
  };

  // Obtenir l'icône du joueur selon son statut
  const getPlayerIcon = (player: Player): string => {
    if (player.is_dead) return '💀';
    if (player.is_ready) return '✅';
    if (player.role?.team === 'WOLVES') return '🐺';
    if (player.role?.team === 'VILLAGERS') return '🛡️';
    return '👤';
  };

  // Obtenir le nom d'affichage du joueur
  const getPlayerDisplayName = (player: Player): string => {
    if (player.user_id === currentPlayer.user_id) {
      return 'Vous';
    }
    
    // En phase de nuit ou si le joueur est mort, masquer le nom
    if (isNightPhase || player.is_dead) {
      return `Joueur ${player.chair_number + 1}`;
    }
    
    return player.username;
  };

  return (
    <div className="game-board">
      <div className="board-container">
        {/* Plateau circulaire */}
        <div className="board-circle">
          {players.map((player, index) => {
            const position = getPlayerPosition(index, players.length);
            const selectable = canSelectPlayer(player);
            
            return (
              <div
                key={player.user_id}
                className={getPlayerClass(player)}
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={() => selectable && onPlayerSelect(player.user_id)}
                title={`${getPlayerDisplayName(player)} - Chaise ${player.chair_number + 1}`}
              >
                <div className="player-icon">
                  {getPlayerIcon(player)}
                </div>
                
                <div className="player-info">
                  <div className="player-name">
                    {getPlayerDisplayName(player)}
                  </div>
                  
                  {player.chair_number !== undefined && (
                    <div className="player-chair">
                      {player.chair_number + 1}
                    </div>
                  )}
                  
                  {player.role && currentPlayer.role && 
                   (currentPlayer.role.name === 'Voyante' || 
                    currentPlayer.role.name === 'Rêveur' ||
                    player.user_id === currentPlayer.user_id) && (
                    <div className="player-role">
                      {player.role.name}
                    </div>
                  )}
                </div>
                
                {/* Indicateurs de statut */}
                {player.is_dead && (
                  <div className="death-indicator">💀</div>
                )}
                
                {player.is_ready && !player.is_dead && (
                  <div className="ready-indicator">✅</div>
                )}
                
                {player.role?.team === 'WOLVES' && 
                 currentPlayer.role?.team === 'WOLVES' && (
                  <div className="wolf-indicator">🐺</div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Centre du plateau */}
        <div className="board-center">
          <div className="center-info">
            <div className="phase-display">
              {isNightPhase && '🌙'}
              {isDayPhase && '☀️'}
              {isVotingPhase && '🗳️'}
            </div>
            <div className="player-count">
              {players.filter(p => !p.is_dead).length} / {players.length}
            </div>
          </div>
        </div>
        
        {/* Légende */}
        <div className="board-legend">
          <div className="legend-item">
            <span className="legend-icon">👤</span>
            <span>Joueur vivant</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon">💀</span>
            <span>Joueur mort</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon">✅</span>
            <span>Prêt</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon">🐺</span>
            <span>Loup (si visible)</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon">🛡️</span>
            <span>Villageois (si visible)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
