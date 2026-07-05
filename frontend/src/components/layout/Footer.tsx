import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        padding: '20px 24px',
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.85rem',
        color: 'var(--color-text-secondary)',
      }}
    >
      <div>
        <span>&copy; 2026 NATARAJ EL. ALL RIGHTS RESERVED.</span>
      </div>
    </footer>
  );
};
