
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:border-gray-300/90 hover:shadow-xl dark:bg-dark-secondary/50 dark:border-white/10 dark:hover:border-white/20 dark:shadow-2xl ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
