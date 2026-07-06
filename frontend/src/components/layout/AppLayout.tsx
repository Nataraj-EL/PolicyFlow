import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on navigation change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const getPageTitle = (path: string): string => {
    switch (path) {
      case '/':
        return 'Portfolio Dashboard';
      case '/contacts':
        return 'Customer Contacts';
      case '/vehicles':
        return 'Vehicle Risks';
      case '/policies':
        return 'Insurance Policies';
      case '/claims':
        return 'Claims Registry';
      case '/calculator':
        return 'Premium Calculator';
      case '/search':
        return 'Global Search';
      default:
        return 'PolicyFlow';
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--color-background)' }}>
      {/* Sidebar Panel */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Layout Wrapper */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
        className="main-layout-responsive"
      >
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} pageTitle={getPageTitle(location.pathname)} />

        <main
          style={{
            flex: 1,
            padding: '24px',
            overflowY: 'auto',
          }}
          className="main-content-responsive"
        >
          <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
            {children}
          </div>
        </main>

        <Footer />
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .main-layout-responsive {
            margin-left: 260px;
          }
        }
        @media (max-width: 768px) {
          .main-content-responsive {
            padding: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};
