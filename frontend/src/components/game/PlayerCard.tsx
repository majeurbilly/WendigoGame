import React from 'react';

interface Player {
  id: string;
  name: string;
  role?: string;
  team?: 'village' | 'wolf' | 'special';
  isAlive: boolean;
  color?: string;
  isOnTrial?: boolean;
  isSelected?: boolean;
}

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
  showRole?: boolean;
  showVoteCount?: boolean;
  voteCount?: number;
  className?: string;
  interactive?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onClick,
  showRole = false,
  showVoteCount = false,
  voteCount = 0,
  className = '',
  interactive = true
}) => {
  const getTeamColor = (team?: string) => {
    switch (team) {
      case 'wolf': return 'border-red-500 bg-red-900/20';
      case 'village': return 'border-green-500 bg-green-900/20';
      case 'special': return 'border-purple-500 bg-purple-900/20';
      default: return 'border-slate-600 bg-slate-800';
    }
  };

  const getStatusIcon = () => {
    if (!player.isAlive) return '💀';
    if (player.isOnTrial) return '🔥';
    return '👤';
  };

  return (
    <div
      className={`
        relative p-3 rounded-lg border-2 transition-all duration-200
        ${getTeamColor(player.team)}
        ${player.isSelected ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-900' : ''}
        ${interactive && player.isAlive ? 'cursor-pointer hover:scale-105' : ''}
        ${!player.isAlive ? 'opacity-60' : ''}
        ${className}
      `}
      onClick={interactive && player.isAlive ? onClick : undefined}
    >
      {/* Status Icon */}
      <div className="absolute top-1 right-1 text-lg">
        {getStatusIcon()}
      </div>

      {/* Player Name */}
      <div className="text-center">
        <h3 className={`font-semibold ${!player.isAlive ? 'line-through' : ''}`}>
          {player.name}
        </h3>
        
        {/* Role (if shown) */}
        {showRole && player.role && (
          <p className="text-xs text-slate-300 mt-1">
            {player.role}
          </p>
        )}
      </div>

      {/* Vote Count */}
      {showVoteCount && voteCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
          {voteCount}
        </div>
      )}
    </div>
  );
};

export default PlayerCard;
