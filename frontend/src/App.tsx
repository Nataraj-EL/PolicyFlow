import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './features/dashboard/Dashboard';
import { Contacts } from './features/contacts/Contacts';
import { Vehicles } from './features/vehicles/Vehicles';
import { Policies } from './features/policies/Policies';
import { Claims } from './features/claims/Claims';
import { Calculator } from './features/calculator/Calculator';
import { Search } from './features/search/Search';

// Create TanStack Query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/policies" element={<Policies />} />
              <Route path="/claims" element={<Claims />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/search" element={<Search />} />
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </Router>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
