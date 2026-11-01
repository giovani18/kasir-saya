import React, { useMemo } from 'react';
import { useApp } from '../stores/AppContext';
import { Store, ShoppingCart, TrendingUp, Package, Users, Receipt, Clock } from 'lucide-react';
import { formatRupiah, formatShortDate } from '../utils/format';
import './DashboardPage.css';

export const DashboardPage = () => {
  const { products, transactions, currentUser } = useApp();

  const { todayRevenue, todayTxCount, lowStockProducts, recentTxs } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTxs = transactions.filter(tx => tx.timestamp >= today.getTime());
    
    const todayRevenue = todayTxs.reduce((sum, tx) => sum + tx.total, 0);
    const todayTxCount = todayTxs.length;

    // We don't have stock management, so we just mock low stock or don't show it.
    // I'll show top products instead
    const productSales = {};
    todayTxs.forEach(tx => {
      tx.items.forEach(item => {
        productSales[item.name] = (productSales[item.name] || 0) + item.qty;
      });
    });
    
    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => ({ name, qty }));

    const recentTxs = transactions.slice(0, 5);

    return { todayRevenue, todayTxCount, topProducts, recentTxs };
  }, [transactions, products]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>Halo, {currentUser?.name || 'Admin'} 👋</h2>
          <p>Berikut ringkasan aktivitas toko Anda hari ini.</p>
        </div>
        <div className="dashboard-date">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon"><TrendingUp size={24} /></div>
          <div className="stat-content">
            <p>Pendapatan Hari Ini</p>
            <h3>{formatRupiah(todayRevenue)}</h3>
          </div>
        </div>
        
        <div className="stat-card stat-info">
          <div className="stat-icon"><Receipt size={24} /></div>
          <div className="stat-content">
            <p>Transaksi Hari Ini</p>
            <h3>{todayTxCount} Transaksi</h3>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon"><Package size={24} /></div>
          <div className="stat-content">
            <p>Total Produk</p>
            <h3>{products.length} Item</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-card">
          <div className="card-header">
            <h3><Clock size={18} /> Transaksi Terakhir</h3>
          </div>
          <div className="card-body">
            {recentTxs.length > 0 ? (
              <div className="tx-list">
                {recentTxs.map(tx => (
                  <div key={tx.id} className="tx-item">
                    <div className="tx-info">
                      <strong>{tx.id}</strong>
                      <span className="tx-time">{formatShortDate(tx.timestamp)}</span>
                    </div>
                    <div className="tx-details">
                      <span>{tx.items.length} macam</span>
                      <strong className="tx-amount">{formatRupiah(tx.total)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">Belum ada transaksi</div>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3><ShoppingCart size={18} /> Terlaris Hari Ini</h3>
          </div>
          <div className="card-body">
            {todayRevenue > 0 && todayTxCount.topProducts ? ( // check if topProducts exist
               <div className="empty-state">No products</div>
            ) : (
              <div className="empty-state">Belum ada penjualan hari ini</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
