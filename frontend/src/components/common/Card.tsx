import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  onClick,
  interactive = false
}) => {
  const baseClasses = 'rounded-lg p-4 transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-slate-800 border border-slate-700',
    elevated: 'bg-slate-800 border border-slate-700 shadow-lg shadow-slate-900/50',
    outlined: 'bg-transparent border-2 border-slate-600'
  };

  const interactiveClasses = interactive 
    ? 'cursor-pointer hover:bg-slate-700 hover:border-slate-500' 
    : '';

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${interactiveClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
