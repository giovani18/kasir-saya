import React, { useRef } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { formatRupiah, formatDate } from '../../utils/format';
import { printReceipt } from '../../utils/print';
import html2canvas from 'html2canvas';

export const DetailTransactionModal = ({ transaction, onClose }) => {
  const receiptRef = useRef();

  const handleDownloadPNG = async () => {
    if (!receiptRef.current) return;
    try {
      // Temporarily modify styles for clean output
      const element = receiptRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2, // high quality
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Struk-${transaction.id}.png`;
      link.click();
    } catch (error) {
      console.error('Gagal mengunduh struk:', error);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content animate-scale-in" style={{ width: '400px', maxWidth: '95%' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Detail Transaksi</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body" style={{ backgroundColor: 'var(--color-bg-elevated)', padding: 'var(--space-md)' }}>
          {/* Struk Card */}
          <div
            ref={receiptRef}
            style={{
              backgroundColor: '#ffffff',
              padding: '24px var(--space-md)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--color-border)',
              color: '#000000',
              fontFamily: 'Courier New, Courier, monospace',
              fontSize: '0.9rem',
              lineHeight: '1.4'
            }}
          >
            <div style={{ textAlign: 'center', paddingBottom: 'var(--space-md)', borderBottom: '1px dashed #cbd5e1' }}>
              <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-body)', color: 'var(--color-text-primary)', marginBottom: '4px' }}>KIOS BU SRIBEKTI</h4>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'var(--font-body)' }}>{formatDate(transaction.timestamp)}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>ID: {transaction.id}</div>
              {transaction.customerName && (
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)', marginTop: '8px', borderTop: '1px dotted #e2e8f0', paddingTop: '6px' }}>
                  Pembeli: {transaction.customerName}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: 'var(--space-md)', borderBottom: '1px dashed #cbd5e1', marginTop: 'var(--space-md)' }}>
              {transaction.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <div style={{ flex: 1, paddingRight: '8px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>
                      {item.name} {item.variantName && item.variantName !== 'Custom' ? `(${item.variantName})` : ''}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {item.qty} x {formatRupiah(item.price)}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {formatRupiah(item.price * item.qty)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.9rem', marginTop: 'var(--space-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontFamily: 'var(--font-body)', fontSize: '0.95rem' }}>
                <span>Total Belanja</span>
                <span>{formatRupiah(transaction.total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Bayar</span>
                <span>{formatRupiah(transaction.payment)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                <span>Kembalian</span>
                <span>{formatRupiah(transaction.change)}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)', fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'var(--font-body)', borderTop: '1px dashed #cbd5e1', paddingTop: '12px' }}>
              Terima Kasih! Selamat Berbelanja 🙏
            </div>
          </div>
        </div>
        <div className="modal-footer" style={{ justifyContent: 'center', gap: 'var(--space-sm)' }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => printReceipt(transaction)}>
            <Printer size={16} /> Cetak Struk
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleDownloadPNG}>
            <Download size={16} /> Simpan Struk
          </button>
        </div>
      </div>
    </div>
  );
};
