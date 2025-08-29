import React, { useState } from 'react';
import { Player, GameState } from '../../types';
import './GameActions.css';

interface GameActionsProps {
  currentPlayer: Player;
  gameState: GameState;
  selectedTarget: string | null;
  onAction: (action: string, targetId?: string) => void;
  onTargetSelect: (playerId: string) => void;
}

const GameActions: React.FC<GameActionsProps> = ({
  currentPlayer,
  gameState,
  selectedTarget,
  onAction,
  onTargetSelect
}) => {
  const [showTargetSelector, setShowTargetSelector] = useState(false);

  const isNightPhase = gameState.phase === 'NIGHT';
  const isVotingPhase = gameState.phase === 'VOTING';
  const isDayPhase = gameState.phase === 'DAY';
  const isAccusationPhase = gameState.phase === 'ACCUSATION';

  // Déterminer les actions disponibles selon le rôle et la phase
  const getAvailableActions = () => {
    if (!currentPlayer.role) return [];

    const actions = [];
    const role = currentPlayer.role;

    // Actions de base selon la phase
    if (isVotingPhase) {
      actions.push({
        id: 'vote',
        name: '🗳️ Voter',
        description: 'Voter pour éliminer un joueur',
        requiresTarget: true,
        available: true
      });
    }

    if (isDayPhase || isAccusationPhase) {
      actions.push({
        id: 'accuse',
        name: '⚖️ Accuser',
        description: 'Accuser un joueur',
        requiresTarget: true,
        available: true
      });
    }

    // Actions spécifiques au rôle
    if (isNightPhase) {
      switch (role.name) {
        case 'Voyante':
          actions.push({
            id: 'reveal',
            name: '🔮 Révéler',
            description: 'Révéler l\'identité d\'un joueur',
            requiresTarget: true,
            available: true
          });
          break;

        case 'Épouvantail':
          actions.push({
            id: 'protect',
            name: '🛡️ Protéger',
            description: 'Protéger les joueurs adjacents',
            requiresTarget: false,
            available: true
          });
          break;

        case 'Corbeau':
          actions.push({
            id: 'curse',
            name: '🦅 Maudire',
            description: 'Donner un vote supplémentaire à un joueur',
            requiresTarget: true,
            available: true
          });
          break;

        case 'Renard':
          actions.push({
            id: 'sniff',
            name: '🦊 Flairer',
            description: 'Détecter les loups parmi 3 joueurs à gauche',
            requiresTarget: false,
            available: true
          });
          break;

        case 'Skinwalker':
        case 'Bouc Émissaire':
        case 'Pestiféré':
          actions.push({
            id: 'kill',
            name: '🗡️ Attaquer',
            description: 'Attaquer un joueur',
            requiresTarget: true,
            available: true
          });
          break;

        case 'Marchand de Sable':
          actions.push({
            id: 'sleep',
            name: '😴 Endormir',
            description: 'Sauter la phase d\'accusation',
            requiresTarget: false,
            available: true
          });
          break;

        case 'Warlord':
          actions.push({
            id: 'protect_wolf',
            name: '🛡️ Protéger Loup',
            description: 'Protéger un loup d\'une attaque',
            requiresTarget: true,
            available: true
          });
          break;

        case 'Sbire':
          actions.push({
            id: 'protect_wolf',
            name: '🛡️ Protéger Loup',
            description: 'Protéger un loup d\'une attaque',
            requiresTarget: true,
            available: true
          });
          break;
      }
    }

    // Actions spéciales
    if (role.name === 'Guerrier') {
      actions.push({
        id: 'duel',
        name: '⚔️ Duel',
        description: 'Provoquer un joueur en duel',
        requiresTarget: true,
        available: isDayPhase
      });
    }

    if (role.name === 'Avocat du Diable') {
      actions.push({
        id: 'defend',
        name: '⚖️ Défendre',
        description: 'Défendre un joueur (risque de mort)',
        requiresTarget: true,
        available: isVotingPhase
      });
    }

    if (role.name === 'Shérif') {
      actions.push({
        id: 'arrest',
        name: '🚔 Arrêter',
        description: 'Mettre un joueur en prison',
        requiresTarget: true,
        available: isDayPhase
      });
    }

    return actions;
  };

  const handleAction = (action: any) => {
    if (action.requiresTarget && !selectedTarget) {
      setShowTargetSelector(true);
      return;
    }

    onAction(action.id, selectedTarget || undefined);
    setShowTargetSelector(false);
  };

  const availableActions = getAvailableActions();

  if (availableActions.length === 0) {
    return (
      <div className="game-actions">
        <h3>🎯 Actions</h3>
        <div className="no-actions">
          <p>Aucune action disponible pour le moment</p>
          <p className="phase-info">
            Phase : {gameState.phase}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-actions">
      <h3>🎯 Actions disponibles</h3>
      
      <div className="actions-list">
        {availableActions.map((action) => (
          <div
            key={action.id}
            className={`action-item ${!action.available ? 'disabled' : ''}`}
          >
            <button
              className="action-button"
              onClick={() => action.available && handleAction(action)}
              disabled={!action.available}
              title={action.description}
            >
              <span className="action-icon">{action.name.split(' ')[0]}</span>
              <span className="action-name">{action.name.split(' ').slice(1).join(' ')}</span>
            </button>
            
            <div className="action-description">
              {action.description}
            </div>
            
            {action.requiresTarget && (
              <div className="target-required">
                {selectedTarget ? '✅ Cible sélectionnée' : '🎯 Sélectionnez une cible'}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sélecteur de cible */}
      {showTargetSelector && (
        <div className="target-selector">
          <h4>🎯 Sélectionner une cible</h4>
          <div className="targets-list">
            {gameState.players?.filter(p => 
              p.user_id !== currentPlayer.user_id && !p.is_dead
            ).map((player) => (
              <button
                key={player.user_id}
                className={`target-button ${selectedTarget === player.user_id ? 'selected' : ''}`}
                onClick={() => {
                  onTargetSelect(player.user_id);
                  setShowTargetSelector(false);
                }}
              >
                <span className="target-icon">👤</span>
                <span className="target-name">
                  {player.username || `Joueur ${player.chair_number + 1}`}
                </span>
                <span className="target-chair">Chaise {player.chair_number + 1}</span>
              </button>
            ))}
          </div>
          
          <button
            className="cancel-button"
            onClick={() => setShowTargetSelector(false)}
          >
            ❌ Annuler
          </button>
        </div>
      )}

      {/* Actions rapides */}
      <div className="quick-actions">
        <h4>⚡ Actions rapides</h4>
        
        {isVotingPhase && (
          <button
            className="quick-action-button"
            onClick={() => onAction('pass')}
          >
            🤐 Passer mon tour
          </button>
        )}
        
        {isDayPhase && (
          <button
            className="quick-action-button"
            onClick={() => onAction('skip')}
          >
            ⏭️ Passer à la suite
          </button>
        )}
      </div>
    </div>
  );
};

export default GameActions;
