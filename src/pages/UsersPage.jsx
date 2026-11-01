import React, { useState, useEffect } from 'react';
import { useApp } from '../stores/AppContext';
import { Search, Plus, Edit2, Trash2, X, AlertTriangle, UserCheck, Shield } from 'lucide-react';
import { getAllUsers, saveUser, deleteUser } from '../utils/db';
import './UsersPage.css';

export const UsersPage = () => {
  const { currentUser, showToast } = useApp();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data || []);
    } catch (e) {
      console.error(e);
      showToast('Gagal mengambil data pengguna', 'error');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (u.username || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleSaveUser = async (userData) => {
    try {
      await saveUser({
        ...userData,
        username: userData.username.toLowerCase().trim()
      });
      await fetchUsers();
      showToast(editingUser ? 'Pengguna berhasil diperbarui' : 'Pengguna berhasil ditambahkan');
    } catch (e) {
      console.error(e);
      showToast('Gagal menyimpan pengguna', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (showDeleteConfirm) {
      // Prevent deleting self
      if (showDeleteConfirm === currentUser.username) {
        showToast('Anda tidak dapat menghapus akun Anda sendiri', 'error');
        setShowDeleteConfirm(null);
        return;
      }
      
      try {
        await deleteUser(showDeleteConfirm);
        await fetchUsers();
        showToast('Pengguna berhasil dihapus', 'warning');
      } catch (e) {
        console.error(e);
        showToast('Gagal menghapus pengguna', 'error');
      }
      setShowDeleteConfirm(null);
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-secondary)' }}>
        <Shield size={48} style={{ marginBottom: '16px', color: 'var(--color-danger)' }} />
        <h3>Akses Ditolak</h3>
        <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
      </div>
    );
  }

  return (
    <div className="users-page-container">
      <div className="page-header">
        <h2>Manajemen Pengguna</h2>
        <div className="header-actions">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Cari pengguna..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => { setEditingUser(null); setShowModal(true); }}>
            <Plus size={18} /> Tambah Pengguna
          </button>
        </div>
      </div>
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Nama Lengkap</th>
              <th>Hak Akses</th>
              <th style={{ textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.username}>
                <td style={{ fontWeight: 600 }}>{u.username}</td>
                <td>{u.name}</td>
                <td>
                  <span className={`role-badge ${u.role === 'admin' ? 'role-admin' : 'role-kasir'}`}>
                    {u.role === 'admin' ? 'Admin (Full Access)' : 'Kasir (Limited)'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="action-buttons">
                    <button className="icon-btn edit-btn" onClick={() => handleEdit(u)} title="Edit Pengguna">
                      <Edit2 size={16} />
                    </button>
                    {u.username !== currentUser.username && (
                      <button className="icon-btn delete-btn" onClick={() => setShowDeleteConfirm(u.username)} title="Hapus Pengguna">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="4" className="empty-state">Belum ada pengguna</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && <UserModal user={editingUser} onClose={() => setShowModal(false)} onSave={handleSaveUser} existingUsers={users.map(u => u.username)} />}
      
      {showDeleteConfirm && (
        <div className="modal-backdrop">
          <div className="modal-content animate-scale-in" style={{ width: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)' }}>
                <AlertTriangle size={20} /> Konfirmasi Hapus
              </h3>
            </div>
            <div className="modal-body">
              <p>Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Batal</button>
              <button className="btn btn-danger" onClick={handleDeleteConfirm}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const UserModal = ({ user, onClose, onSave, existingUsers }) => {
  const [formData, setFormData] = useState(user ? { ...user, password: user.password || '' } : { username: '', name: '', password: '', role: 'kasir' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user && existingUsers.includes(formData.username)) {
      setError('Username sudah digunakan');
      return;
    }
    if (formData.password.length < 3) {
      setError('Password minimal 3 karakter');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{user ? 'Edit Pengguna' : 'Tambah Pengguna'}</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {error && <div style={{ color: 'var(--color-danger)', fontSize: '0.9rem', padding: '8px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>{error}</div>}
            
            <div>
              <label className="form-label">Username</label>
              <input type="text" name="username" className="form-input" value={formData.username} onChange={handleChange} placeholder="Misal: kasir2" required disabled={!!user} />
              {!!user && <small style={{ color: 'var(--color-text-muted)' }}>Username tidak dapat diubah</small>}
            </div>
            
            <div>
              <label className="form-label">Nama Lengkap</label>
              <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} placeholder="Nama Lengkap" required />
            </div>
            
            <div>
              <label className="form-label">Password</label>
              <input type="text" name="password" className="form-input" value={formData.password} onChange={handleChange} placeholder="Masukkan password" required />
            </div>

            <div>
              <label className="form-label">Hak Akses</label>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <button
                  type="button"
                  className={`btn ${formData.role === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '10px', fontWeight: 600 }}
                  onClick={() => setFormData({ ...formData, role: 'admin' })}
                >
                  Admin (Full)
                </button>
                <button
                  type="button"
                  className={`btn ${formData.role === 'kasir' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '10px', fontWeight: 600 }}
                  onClick={() => setFormData({ ...formData, role: 'kasir' })}
                >
                  Kasir (Terbatas)
                </button>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
            <button type="submit" className="btn btn-primary">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
};
