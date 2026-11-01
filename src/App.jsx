import React from 'react';
import { AppProvider, useApp } from './stores/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Toast } from './components/shared/Toast';
import { CashierPage } from './pages/CashierPage';
import { ProductPage } from './pages/ProductPage';
import { HistoryPage } from './pages/HistoryPage';
import { ReportPage } from './pages/ReportPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { Store } from 'lucide-react';
import './App.css';

const AppContent = () => {
  const { activeTab, loading, currentUser } = useApp();

  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', width: '100vw', height: '100vh',
        backgroundColor: 'var(--color-bg-main)', gap: 'var(--space-md)',
      }}>
        <Store size={64} style={{ color: 'var(--color-primary)' }} />
        <h3 style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Memuat KIOS BU SRIBEKTI...</h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Menyiapkan database kasir offline</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <LoginPage />
        <Toast />
      </>
    );
  }

  const renderPage = () => {
    const isAdmin = currentUser?.role === 'admin';
    const adminPages = ['dashboard', 'product', 'report', 'users'];
    const targetTab = (!isAdmin && adminPages.includes(activeTab)) ? 'cashier' : activeTab;

    switch (targetTab) {
      case 'dashboard': return <DashboardPage />;
      case 'product': return <ProductPage />;
      case 'history': return <HistoryPage />;
      case 'report': return <ReportPage />;
      case 'users': return <UsersPage />;
      default: return <CashierPage />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="page-container">{renderPage()}</main>
      <Toast />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
