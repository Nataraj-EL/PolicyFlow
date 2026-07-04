import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  FileText, 
  AlertTriangle, 
  Calculator, 
  Search,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Contacts', path: '/contacts', icon: Users },
    { name: 'Vehicles', path: '/vehicles', icon: Car },
    { name: 'Policies', path: '/policies', icon: FileText },
    { name: 'Claims', path: '/claims', icon: AlertTriangle },
    { name: 'Premium Calculator', path: '/calculator', icon: Calculator },
    { name: 'Global Search', path: '/search', icon: Search },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(38, 30, 26, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 40,
          }}
          className="animate-fade-in"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          width: '260px',
          backgroundColor: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          zIndex: 50,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
        }}
        // Enable large screen default visible
        className="sidebar-responsive"
      >
        {/* Brand Header */}
        <div
          style={{
            height: '70px',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-brand-light)',
              color: 'var(--color-brand)',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--color-border)',
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--color-text)',
              letterSpacing: '-0.02em',
            }}
          >
            PolicyFlow
          </span>
        </div>

        {/* Menu Navigation */}
        <nav
          style={{
            flex: 1,
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            overflowY: 'auto',
          }}
        >
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: isActive ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                backgroundColor: isActive ? 'var(--color-brand-light)' : 'transparent',
                border: isActive ? '1px solid var(--color-border)' : '1px solid transparent',
                transition: 'all 0.15s ease',
              })}
              className={({ isActive }) => isActive ? '' : 'sidebar-item-hover'}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <style>{`
        .sidebar-item-hover:hover {
          background-color: var(--color-muted);
          color: var(--color-text);
        }
        @media (min-width: 1024px) {
          .sidebar-responsive {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  );
};
