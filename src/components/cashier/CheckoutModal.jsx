import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../stores/AppContext';
import { formatRupiah } from '../../utils/format';

export const CheckoutModal = ({ onClose, onSuccess }) => {
  const { totalCart, checkout } = useApp();
  const [customerName, setCustomerName] = useState('');
  const [paymentRaw, setPaymentRaw] = useState('');
  const [paymentDisplay, setPaymentDisplay] = useState('');

  const suggestedAmounts = (() => {
    if (totalCart <= 0) return [50000, 100000];
    let s1, s2;
    if (totalCart <= 10000) { s1 = 10000; s2 = 20000; }
    else if (totalCart <= 20000) { s1 = 20000; s2 = 50000; }
    else if (totalCart <= 50000) { s1 = 50000; s2 = 100000; }
    else {
      s1 = Math.ceil(totalCart / 50000) * 50000;
      if (s1 === totalCart) s1 += 50000;
      s2 = s1 + 50000;
    }
    return [s1, s2];
  })();

  const handlePaymentChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setPaymentRaw(raw);
    setPaymentDisplay(raw ? Number(raw).toLocaleString('id-ID') : '');
  };

  const handleSuggestClick = (amount) => {
    const raw = String(amount);
    setPaymentRaw(raw);
    setPaymentDisplay(Number(raw).toLocaleString('id-ID'));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    const payment = parseFloat(paymentRaw) || 0;
    if (payment < totalCart) return;
    const result = await checkout(payment, customerName);
    if (result) {
      onSuccess(result);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Pembayaran</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleCheckout}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ textAlign: 'center', padding: 'var(--space-md)', backgroundColor: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xs)' }}>Total Belanja</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{formatRupiah(totalCart)}</div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-sm)', fontWeight: 600 }}>Nama Pembeli</label>
              <input
                type="text"
                placeholder="Masukkan nama pembeli..."
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  outline: 'none',
                  fontFamily: 'var(--font-body)'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-sm)', fontWeight: 600 }}>Uang Diterima (Rp)</label>
              <div style={{ position: 'relative', marginBottom: 'var(--space-md)' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 600 }}>Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={paymentDisplay}
                  onChange={handlePaymentChange}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    paddingLeft: '40px',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)', borderColor: 'var(--color-primary-light)' }} onClick={() => handleSuggestClick(totalCart)}>Uang Pas</button>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, fontWeight: 600 }} onClick={() => handleSuggestClick(suggestedAmounts[0])}>{formatRupiah(suggestedAmounts[0])}</button>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, fontWeight: 600 }} onClick={() => handleSuggestClick(suggestedAmounts[1])}>{formatRupiah(suggestedAmounts[1])}</button>
              </div>
            </div>

            {paymentRaw && parseFloat(paymentRaw) >= totalCart && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-md) 0', borderTop: '1px dashed var(--color-border)' }}>
                <span style={{ fontWeight: 600 }}>Kembalian:</span>
                <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.1rem' }}>{formatRupiah(parseFloat(paymentRaw) - totalCart)}</span>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={!paymentRaw || parseFloat(paymentRaw) < totalCart}>Bayar</button>
          </div>
        </form>
      </div>
    </div>
  );
};
