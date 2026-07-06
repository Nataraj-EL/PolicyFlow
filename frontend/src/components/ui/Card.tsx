import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ 
  title, 
  subtitle, 
  actions, 
  children, 
  style, 
  className 
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--border-radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        ...style
      }}
      className={`card-interactive ${className || ''}`}
    >
      {/* Card Header */}
      {(title || subtitle || actions) && (
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
          className="card-header-responsive"
        >
          <div>
            {title && (
              <h3
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  letterSpacing: '-0.01em',
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--color-text-secondary)',
                  marginTop: '2px',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div style={{ display: 'flex', gap: '8px' }}>{actions}</div>}
        </div>
      )}

      {/* Card Body */}
      <div style={{ padding: '24px' }} className="card-body-responsive">{children}</div>

      <style>{`
        .card-interactive:hover {
          box-shadow: var(--shadow-md);
        }
        @media (max-width: 640px) {
          .card-header-responsive {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
            padding: 16px !important;
          }
          .card-header-responsive > div:last-child {
            width: 100%;
          }
          .card-body-responsive {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};
