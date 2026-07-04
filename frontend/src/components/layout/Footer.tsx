import React from 'react';

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        padding: '20px 24px',
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.85rem',
        color: 'var(--color-text-secondary)',
      }}
      className="footer-responsive"
    >
      <div>
        <span>&copy; {year} <strong>PolicyFlow Core</strong>. PwC Guidewire Academy Project.</span>
      </div>
      <div style={{ display: 'flex', gap: '16px' }}>
        <span>Client: <strong>React 18 + Vite</strong></span>
        <span style={{ color: 'var(--color-border)' }}>|</span>
        <span>Server: <strong>Spring Boot 3 + Gosu Core</strong></span>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .footer-responsive {
            flex-direction: row !important;
            gap: 0 !important;
          }
        }
      `}</style>
    </footer>
  );
};
