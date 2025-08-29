import React from 'react';

interface Chair {
  id: number;
  isOccupied: boolean;
  occupiedBy?: string;
  isSelectable: boolean;
  isSelected?: boolean;
}

interface ChairSelectorProps {
  chairs: Chair[];
  onChairSelect?: (chairId: number) => void;
  maxPlayers: number;
  className?: string;
}

const ChairSelector: React.FC<ChairSelectorProps> = ({
  chairs,
  onChairSelect,
  maxPlayers,
  className = ''
}) => {
  const getChairPosition = (index: number, total: number) => {
    const angle = (index * 360) / total - 90; // Start from top
    const radius = 120; // Distance from center
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;
    return { x, y };
  };

  return (
    <div className={`relative w-80 h-80 mx-auto ${className}`}>
      {/* Center area */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-600">
          <span className="text-slate-300 text-sm font-semibold">
            Centre
          </span>
        </div>
      </div>

      {/* Chairs positioned in circle */}
      {chairs.map((chair, index) => {
        const position = getChairPosition(index, chairs.length);
        const isAvailable = chair.isSelectable && !chair.isOccupied;
        
        return (
          <div
            key={chair.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `calc(50% + ${position.x}px)`,
              top: `calc(50% + ${position.y}px)`
            }}
          >
            <button
              onClick={() => isAvailable && onChairSelect?.(chair.id)}
              disabled={!isAvailable}
              className={`
                w-12 h-12 rounded-full border-2 transition-all duration-200
                ${chair.isSelected 
                  ? 'bg-yellow-500 border-yellow-400 shadow-lg shadow-yellow-500/50' 
                  : chair.isOccupied 
                    ? 'bg-red-600 border-red-500 cursor-not-allowed' 
                    : isAvailable 
                      ? 'bg-green-600 border-green-500 hover:bg-green-500 hover:scale-110 cursor-pointer' 
                      : 'bg-slate-600 border-slate-500 cursor-not-allowed'
                }
                flex items-center justify-center text-white font-bold text-sm
              `}
            >
              {chair.isOccupied ? (
                <span className="text-xs">👤</span>
              ) : (
                chair.id
              )}
            </button>
            
            {/* Chair number label */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-slate-400">
              {chair.id}
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-600 rounded-full"></div>
          <span className="text-slate-300">Disponible</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-600 rounded-full"></div>
          <span className="text-slate-300">Occupée</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-slate-300">Sélectionnée</span>
        </div>
      </div>
    </div>
  );
};

export default ChairSelector;
