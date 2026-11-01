import React, { useState } from 'react';
import { useApp } from '../stores/AppContext';
import { formatRupiah, formatDate } from '../utils/format';
import { Eye } from 'lucide-react';
import { DetailTransactionModal } from '../components/shared/DetailTransactionModal';
import './HistoryPage.css';

export const HistoryPage = () => {
  const { transactions, currentUser } = useApp();
  const [selectedTx, setSelectedTx] = useState(null);

  const isAdmin = currentUser?.role === 'admin';
  const filteredTransactions = transactions.filter(tx => {
    if (isAdmin) return true;
    return tx.cashierUsername === currentUser?.username;
  });

  return (
    <div className="history-page-container">
      <div className="page-header">
        <h2>Riwayat Transaksi</h2>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID Transaksi</th>
              <th>Waktu</th>
              <th>Nama Pembeli</th>
              <th>Item</th>
              <th>Total</th>
              {isAdmin && <th>Kasir</th>}
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(tx => (
              <tr key={tx.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>{tx.id}</td>
                <td>{formatDate(tx.timestamp)}</td>
                <td style={{ fontWeight: 500 }}>{tx.customerName || '-'}</td>
                <td>{tx.items.length} macam</td>
                <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{formatRupiah(tx.total)}</td>
                {isAdmin && <td>{tx.cashierName || tx.cashierUsername || '-'}</td>}
                <td style={{ textAlign: 'center' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setSelectedTx(tx)}>
                    <Eye size={16} /> Lihat
                  </button>
                </td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr><td colSpan={isAdmin ? 7 : 6} className="empty-state">Belum ada transaksi</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedTx && (
        <DetailTransactionModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </div>
  );
};
