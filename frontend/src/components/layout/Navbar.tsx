import React from 'react';
import { Menu, Activity, ShieldCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/apiClient';

interface NavbarProps {
  onMenuClick: () => void;
  pageTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick, pageTitle }) => {
  // Query backend health status dynamically
  const { data: healthData, isError } = useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.get('/api/health').then(res => res.data),
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const isUp = healthData?.status === 'UP' && !isError;

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

      {/* Backend Status indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '20px',
            backgroundColor: isUp ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
            border: `1px solid ${isUp ? 'rgba(46, 125, 50, 0.2)' : 'rgba(198, 40, 40, 0.2)'}`,
            fontSize: '0.85rem',
            fontWeight: 600,
            color: isUp ? 'var(--color-success)' : 'var(--color-error)',
            transition: 'all 0.3s ease',
          }}
        >
          <Activity size={14} className={isUp ? 'animate-pulse' : ''} />
          <span>API Status: {isUp ? 'UP' : 'OFFLINE'}</span>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @media (min-width: 1024px) {
          .lg-hidden {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
