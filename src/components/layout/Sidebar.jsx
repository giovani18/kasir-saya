import React from 'react';
import { useApp } from '../../stores/AppContext';
import { ShoppingCart, Package, History, BarChart3, Store, ChevronLeft, ChevronRight, LayoutDashboard, Users, LogOut, User } from 'lucide-react';
import { logout } from '../../utils/auth';

export const Sidebar = () => {
  const { activeTab, setActiveTab, sidebarExpanded, setSidebarExpanded, currentUser, setCurrentUser } = useApp();
  
  const handleLogout = () => {
    logout();
    setCurrentUser(null);
  };

  const isAdmin = currentUser?.role === 'admin';

  const navItems = [
    ...(isAdmin ? [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    { id: 'cashier', label: 'Kasir', icon: ShoppingCart },
    ...(isAdmin ? [{ id: 'product', label: 'Produk', icon: Package }] : []),
    { id: 'history', label: 'Riwayat', icon: History },
    ...(isAdmin ? [{ id: 'report', label: 'Laporan', icon: BarChart3 }] : []),
    ...(isAdmin ? [{ id: 'users', label: 'Pengguna', icon: Users }] : []),
  ];
  return (
    <aside className={`sidebar ${sidebarExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo-icon"><Store size={24} /></div>
        <span className="sidebar-title">BU SRIBEKTI</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button key={id} className={`nav-item ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)} title={!sidebarExpanded ? label : undefined}>
            <Icon className="nav-icon" size={20} />
            <span className="nav-label">{label}</span>
          </button>
        ))}
      </nav>
      
      <div style={{ padding: 'var(--space-sm)', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', overflow: 'hidden' }}>
        <div style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={18} />
        </div>
        <div style={{ display: sidebarExpanded ? 'flex' : 'none', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.name || 'Kasir'}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{currentUser?.role || 'User'}</span>
        </div>
        <button onClick={handleLogout} title="Keluar" style={{ display: sidebarExpanded ? 'flex' : 'none', background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '4px' }}>
          <LogOut size={16} />
        </button>
      </div>

      <div className="sidebar-footer">
        <button className="toggle-btn" onClick={() => setSidebarExpanded(!sidebarExpanded)}>
          {sidebarExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
    </aside>
  );
};
