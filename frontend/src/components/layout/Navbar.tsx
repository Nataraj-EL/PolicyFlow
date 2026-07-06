import React from 'react';
import { Menu } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
  pageTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick, pageTitle }) => {
  return (
    <header
      style={{
        height: '70px',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Mobile Menu & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onMenuClick}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
          }}
          className="lg-hidden"
        >
          <Menu size={24} />
        </button>
        <h1
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--color-text)',
            letterSpacing: '-0.02em',
          }}
        >
          {pageTitle}
        </h1>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .lg-hidden {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
