import React, { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const isClickable = !!onClick;
  const baseClasses = 'tw-bg-background-secondary tw-border tw-border-border-default tw-rounded-lg tw-shadow-sm tw-transition-all tw-duration-200 tw-ease-in-out';
  const clickableClasses = isClickable ? 'tw-cursor-pointer hover:tw-border-interactive-default hover:tw-shadow-lg hover:-tw-translate-y-1' : '';

  return (
    <div className={`${baseClasses} ${clickableClasses} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
