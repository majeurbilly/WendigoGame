import React from 'react';

interface PhaseIndicatorProps {
  phase: 'day' | 'night';
  timeRemaining: number;
  totalTime: number;
  className?: string;
}

const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({
  phase,
  timeRemaining,
  totalTime,
  className = ''
}) => {
  const progress = ((totalTime - timeRemaining) / totalTime) * 100;
  
  const phaseConfig = {
    day: {
      icon: '☀️',
      label: 'Jour',
      bgColor: 'bg-yellow-600',
      textColor: 'text-yellow-100',
      progressColor: 'bg-yellow-400'
    },
    night: {
      icon: '🌙',
      label: 'Nuit',
      bgColor: 'bg-blue-900',
      textColor: 'text-blue-100',
      progressColor: 'bg-blue-400'
    }
  };

  const config = phaseConfig[phase];

  return (
    <div className={`${config.bgColor} rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{config.icon}</span>
          <span className={`font-semibold ${config.textColor}`}>
            Phase {config.label}
          </span>
        </div>
        <span className={`text-sm ${config.textColor}`}>
          {Math.ceil(timeRemaining)}s
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-black/20 rounded-full h-2">
        <div 
          className={`${config.progressColor} h-2 rounded-full transition-all duration-1000 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default PhaseIndicator;
