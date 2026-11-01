import React, { useState } from 'react';
import { useApp } from '../stores/AppContext';
import { formatRupiah } from '../utils/format';
import { Search, Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import './ProductPage.css';

export const ProductPage = () => {
  const { products, categories, saveProduct, deleteProduct } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (showDeleteConfirm) {
      await deleteProduct(showDeleteConfirm);
      setShowDeleteConfirm(null);
      setShowDeleteSuccess(true);
      setTimeout(() => setShowDeleteSuccess(false), 2000);
    }
  };

  return (
    <div className="product-page-container">
      <div className="page-header">
        <h2>Manajemen Produk</h2>
        <div className="header-actions">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => { setEditingProduct(null); setShowModal(true); }}>
            <Plus size={18} /> Tambah Produk
          </button>
        </div>
      </div>
      
      {/* Fix 7: Category Pills di Menu Produk */}
      <div className="category-pills" style={{ marginBottom: 'var(--space-md)' }}>
        {categories.map(cat => (
          <button key={cat} className={`pill ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nama Produk</th>
              <th>Kategori</th>
              <th>Harga / Varian</th>
              <th style={{ textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 500 }}>{p.name}</td>
                <td><span className="category-badge">{p.category || '-'}</span></td>
                <td>
                  {p.type === 'single' ? formatRupiah(p.price) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {p.variants.map((v, i) => (
                        <div key={i} style={{ fontSize: '0.85rem' }}>• {v.name}: {formatRupiah(v.price)}</div>
                      ))}
                    </div>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {/* Fix 4: Icon Edit & Delete dipertegas */}
                  <div className="action-buttons">
                    <button className="icon-btn edit-btn" onClick={() => handleEdit(p)} title="Edit Produk">
                      <Edit2 size={16} />
                    </button>
                    <button className="icon-btn delete-btn" onClick={() => setShowDeleteConfirm(p.id)} title="Hapus Produk">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="4" className="empty-state">Belum ada produk</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && <ProductModal product={editingProduct} onClose={() => setShowModal(false)} onSave={saveProduct} />}
      
      {/* Fix 6: Modal konfirmasi hapus & success */}
      {showDeleteConfirm && (
        <div className="modal-backdrop">
          <div className="modal-content animate-scale-in" style={{ width: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)' }}>
                <AlertTriangle size={20} /> Konfirmasi Hapus
              </h3>
            </div>
            <div className="modal-body">
              <p>Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Batal</button>
              <button className="btn btn-danger" onClick={handleDeleteConfirm}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteSuccess && (
        <div className="modal-backdrop">
          <div className="modal-content animate-scale-in" style={{ width: '300px', textAlign: 'center', padding: 'var(--space-xl)' }}>
            <div style={{ margin: '0 auto var(--space-md)', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#dcfce7', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ marginBottom: '8px' }}>Berhasil Dihapus</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Produk telah dihapus dari sistem.</p>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState(product ? { ...product } : { name: '', category: '', type: 'single', price: '', variants: [{ name: '', price: '' }] });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...formData.variants];
    updated[index][field] = value;
    setFormData({ ...formData, variants: updated });
  };

  const addVariant = () => {
    setFormData({ ...formData, variants: [...formData.variants, { name: '', price: '' }] });
  };

  const removeVariant = (index) => {
    const updated = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{product ? 'Edit Produk' : 'Tambah Produk'}</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div>
              <label className="form-label">Nama Produk</label>
              <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} placeholder="Masukkan nama produk..." required />
            </div>
            <div>
              <label className="form-label">Kategori</label>
              <input type="text" name="category" className="form-input" value={formData.category} onChange={handleChange} placeholder="Sembako, Minuman, dll" />
            </div>
            <div>
              <label className="form-label">Tipe Varian</label>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <button
                  type="button"
                  className={`btn ${formData.type === 'single' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '10px', fontWeight: 600 }}
                  onClick={() => setFormData({ ...formData, type: 'single' })}
                >
                  Satu Varian
                </button>
                <button
                  type="button"
                  className={`btn ${formData.type === 'multi' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '10px', fontWeight: 600 }}
                  onClick={() => setFormData({ ...formData, type: 'multi' })}
                >
                  Banyak Varian
                </button>
              </div>
            </div>
            
            {formData.type === 'single' ? (
              <div>
                <label className="form-label">Harga (Rp)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Rp</span>
                  <input type="number" name="price" className="form-input" value={formData.price} onChange={handleChange} placeholder="Contoh: 15000" style={{ paddingLeft: '36px' }} required />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Varian Harga</label>
                {formData.variants.map((v, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '14px 12px',
                    backgroundColor: 'var(--color-bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    position: 'relative'
                  }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Nama Varian</span>
                      <input
                        type="text"
                        placeholder="Misal: 1 Dus / 1 Liter"
                        className="form-input"
                        value={v.name}
                        onChange={e => handleVariantChange(i, 'name', e.target.value)}
                        required
                        style={{ backgroundColor: '#ffffff', padding: '8px 10px', fontSize: '0.95rem' }}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Harga (Rp)</span>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Rp</span>
                        <input
                          type="number"
                          placeholder="0"
                          className="form-input"
                          value={v.price}
                          onChange={e => handleVariantChange(i, 'price', e.target.value)}
                          required
                          style={{ backgroundColor: '#ffffff', padding: '8px 10px', paddingLeft: '32px', fontSize: '0.95rem' }}
                        />
                      </div>
                    </div>
                    {formData.variants.length > 1 && (
                      <button
                        type="button"
                        className="icon-btn delete-btn"
                        style={{ marginTop: '20px', width: '32px', height: '32px', flexShrink: 0 }}
                        onClick={() => removeVariant(i)}
                        title="Hapus Varian"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn"
                  style={{
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    padding: '12px',
                    border: '2px dashed var(--color-primary-light)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-primary-dark)',
                    backgroundColor: 'var(--color-primary-bg)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#dcfce7';
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary-bg)';
                    e.currentTarget.style.borderColor = 'var(--color-primary-light)';
                  }}
                  onClick={addVariant}
                >
                  <Plus size={16} /> Tambah Varian Baru
                </button>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
            <button type="submit" className="btn btn-primary">Simpan Produk</button>
          </div>
        </form>
      </div>
    </div>
  );
};
