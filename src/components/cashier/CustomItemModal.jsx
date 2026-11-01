import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useApp } from '../../stores/AppContext';

// Format angka ke format Rupiah dengan titik ribuan (display only)
const formatDisplayRupiah = (val) => {
  const num = val.replace(/\D/g, '');
  if (!num) return '';
  return Number(num).toLocaleString('id-ID');
};

export const CustomItemModal = ({ onClose }) => {
  const { addCustomItemToCart } = useApp();
  const [name, setName] = useState('');
  const [priceDisplay, setPriceDisplay] = useState('');
  const [priceRaw, setPriceRaw] = useState('');

  const handlePriceChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setPriceRaw(raw);
    setPriceDisplay(raw ? Number(raw).toLocaleString('id-ID') : '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const parsedPrice = parseFloat(priceRaw) || 0;
    if (parsedPrice <= 0) return;
    addCustomItemToCart(name, parsedPrice);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">➕ Tambah Barang Manual</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                Nama Barang
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Misal: Ember Plastik, Sapu Lidi"
                required
                autoFocus
                style={{
                  padding: '10px var(--space-md)', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)', outline: 'none',
                  fontSize: '1rem', fontFamily: 'var(--font-body)'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                Harga Barang (Rp)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                  fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.95rem'
                }}>Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={priceDisplay}
                  onChange={handlePriceChange}
                  placeholder="0"
                  required
                  style={{
                    padding: '10px var(--space-md)', paddingLeft: '36px',
                    borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                    outline: 'none', fontSize: '1rem', fontFamily: 'var(--font-mono)',
                    fontWeight: 600, width: '100%'
                  }}
                />
              </div>
              {priceRaw && (
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {Number(priceRaw).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                </span>
              )}
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
            <button type="submit" className="btn btn-primary">
              <Plus size={16} /> Tambah ke Keranjang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomItemModal;
