import React, { type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  ...props
}) => {
  const baseClasses = 'tw-inline-flex tw-items-center tw-justify-center tw-font-semibold tw-rounded-md tw-transition-all tw-duration-200 tw-ease-in-out focus:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-offset-2 focus-visible:tw-ring-border-focus disabled:tw-cursor-not-allowed';

  const variantClasses = {
    primary: 'tw-bg-interactive-default tw-text-white hover:tw-bg-interactive-hover active:tw-bg-interactive-active disabled:tw-bg-background-secondary disabled:tw-text-text-disabled tw-shadow-sm',
    secondary: 'tw-bg-background-tertiary tw-text-text-primary hover:tw-bg-border-default active:tw-bg-gray-300 disabled:tw-bg-background-secondary disabled:tw-text-text-disabled',
    outline: 'tw-bg-transparent tw-border-2 tw-border-interactive-default tw-text-interactive-default hover:tw-bg-interactive-default/10 active:tw-bg-interactive-default/20 disabled:tw-border-border-default disabled:tw-text-text-disabled',
    ghost: 'tw-bg-transparent tw-text-interactive-default hover:tw-bg-interactive-default/10 active:tw-bg-interactive-default/20 disabled:tw-text-text-disabled',
    danger: 'tw-bg-error tw-text-white hover:tw-bg-red-600 active:tw-bg-red-700 disabled:tw-bg-background-secondary disabled:tw-text-text-disabled tw-shadow-sm',
  };

  const sizeClasses = {
    sm: 'tw-h-8 tw-px-3 tw-text-sm',
    md: 'tw-h-10 tw-px-4 tw-text-sm',
    lg: 'tw-h-12 tw-px-6 tw-text-base',
  };
  
  const iconSizeClasses = {
    sm: 'tw-w-4 tw-h-4',
    md: 'tw-w-5 tw-h-5',
    lg: 'tw-w-6 tw-h-6',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${loading ? 'tw-pointer-events-none' : ''}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className={`tw-animate-spin -tw-ml-1 tw-mr-3 tw-h-5 tw-w-5 ${variant === 'primary' || variant === 'danger' ? 'tw-text-white' : 'tw-text-interactive-default'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="tw-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="tw-opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {icon && !loading && <span className={`${children ? 'tw-mr-2' : ''} ${iconSizeClasses[size]}`}>{icon}</span>}
      <span className={loading ? 'tw-opacity-0' : 'tw-opacity-100'}>{children}</span>
    </button>
  );
};

export default Button;
