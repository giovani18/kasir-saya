import React, { useState } from 'react';
import { Store, User, Lock, Loader2 } from 'lucide-react';
import { useApp } from '../stores/AppContext';
import { login } from '../utils/auth';
import './LoginPage.css';

export const LoginPage = () => {
  const { setCurrentUser, showToast, setActiveTab } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    
    setLoading(true);
    
    try {
      const result = await login(username, password);
      
      if (result.success) {
        showToast(`Selamat datang, ${result.user.name}!`);
        setCurrentUser(result.user);
        setActiveTab(result.user.role === 'admin' ? 'dashboard' : 'cashier');
      } else {
        showToast(result.message, 'error');
      }
    } catch (err) {
      showToast('Gagal terhubung ke database', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background"></div>
      
      <div className="login-card animate-scale-in">
        <div className="login-header">
          <div className="login-logo">
            <Store size={32} />
          </div>
          <h2>KIOS BU SRIBEKTI</h2>
          <p>Sistem Manajemen Kasir</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Username</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary login-btn"
            disabled={loading || !username || !password}
          >
            {loading ? <Loader2 size={18} className="spin" /> : 'Masuk ke Sistem'}
          </button>
        </form>
        
        <div className="login-footer">
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '12px', padding: '8px 12px', background: 'rgba(0,0,0,0.03)', borderRadius: '6px', lineHeight: '1.5' }}>
            <span style={{ fontWeight: 600, display: 'block', marginBottom: '2px' }}>Akun Bawaan Sistem:</span>
            <span>Admin: <code>admin</code> / <code>admin123</code></span><br />
            <span>Kasir: <code>kasir</code> / <code>kasir123</code></span>
          </div>
          <p>Butuh bantuan? Hubungi Administrator</p>
        </div>
      </div>
    </div>
  );
};
