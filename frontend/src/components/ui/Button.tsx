import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  children,
  style,
  disabled,
  ...props
}) => {
  const getStyles = () => {
    const base: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '0.625rem 1.25rem',
      fontSize: '0.925rem',
      fontWeight: 600,
      borderRadius: 'var(--border-radius-md)',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      border: '1px solid transparent',
      outline: 'none',
      minHeight: '40px',
      userSelect: 'none',
      ...style
    };

    if (disabled || isLoading) {
      return {
        ...base,
        opacity: 0.6,
        cursor: 'not-allowed',
        backgroundColor: 'var(--color-muted)',
        color: 'var(--color-text-secondary)',
        borderColor: 'var(--color-border)',
      };
    }

    switch (variant) {
      case 'primary':
        return {
          ...base,
          backgroundColor: 'var(--color-brand)',
          color: '#ffffff',
        };
      case 'secondary':
        return {
          ...base,
          backgroundColor: 'var(--color-muted)',
          color: 'var(--color-text)',
          borderColor: 'var(--color-border)',
        };
      case 'danger':
        return {
          ...base,
          backgroundColor: 'var(--color-error)',
          color: '#ffffff',
        };
      case 'outline':
        return {
          ...base,
          backgroundColor: 'transparent',
          color: 'var(--color-brand)',
          borderColor: 'var(--color-brand)',
        };
      default:
        return base;
    }
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={getStyles()}
      className={`btn-interactive btn-${variant}`}
      {...props}
    >
      {isLoading && (
        <span
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      )}
      {children}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .btn-interactive:active {
          transform: scale(0.98);
        }
        .btn-primary:not(:disabled):hover {
          background-color: var(--color-brand-hover) !important;
          box-shadow: 0 0 0 3px rgba(161, 70, 28, 0.15);
        }
        .btn-secondary:not(:disabled):hover {
          background-color: var(--color-border) !important;
        }
        .btn-danger:not(:disabled):hover {
          opacity: 0.9 !important;
          box-shadow: 0 0 0 3px rgba(198, 40, 40, 0.15);
        }
        .btn-outline:not(:disabled):hover {
          background-color: var(--color-brand-light) !important;
        }
      `}</style>
    </button>
  );
};
