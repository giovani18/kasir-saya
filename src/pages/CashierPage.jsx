import React, { useState, useEffect } from 'react';
import { useApp } from '../stores/AppContext';
import { formatRupiah } from '../utils/format';
import { Search, Plus, Minus, Trash2, ShoppingBag, X } from 'lucide-react';
import { CustomItemModal } from '../components/cashier/CustomItemModal';
import { CheckoutModal } from '../components/cashier/CheckoutModal';
import { DetailTransactionModal } from '../components/shared/DetailTransactionModal';
import './CashierPage.css';

export const CashierPage = () => {
  const { products, categories, cart, totalCart, addToCart, updateCartQty, removeFromCart, clearCart } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [completedTx, setCompletedTx] = useState(null);

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleProductClick = (product) => {
    if (product.type === 'multi') {
      setSelectedProduct(product);
    } else {
      addToCart(product);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        document.getElementById('cashier-search')?.focus();
      } else if (e.key === 'Escape') {
        setSearch('');
        document.getElementById('cashier-search')?.blur();
      } else if (e.key === 'F9' && cart.length > 0) {
        e.preventDefault();
        setShowCheckoutModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

  return (
    <div className="cashier-container">
      <div className="cashier-main">
        <div className="cashier-header">
          <div className="search-bar" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} className="search-icon" style={{ position: 'absolute', left: '12px' }} />
            <input 
              id="cashier-search"
              type="text" 
              placeholder="Cari barang... (F2)" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              style={{ paddingLeft: '38px', paddingRight: search ? '38px' : '12px', width: '100%' }}
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: '12px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex' }}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button className="btn btn-secondary custom-item-btn" onClick={() => setShowCustomModal(true)}>
            <Plus size={18} /> Manual
          </button>
        </div>
        
        <div className="category-pills">
          {categories.map(cat => (
            <button key={cat} className={`pill ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>

        <div className="product-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card animate-scale-in" onClick={() => handleProductClick(product)}>
              <div className="product-info">
                <div className="product-name">{product.name}</div>
                <div className="product-price">
                  {product.type === 'single' ? formatRupiah(product.price) : `${product.variants.length} Varian`}
                </div>
              </div>
              {/* Fix 2: Button + disetiap produk */}
              <button className="add-btn" title="Tambahkan"><Plus size={16} /></button>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="empty-state">Tidak ada produk ditemukan</div>
          )}
        </div>
      </div>

      <div className="cart-sidebar">
        <div className="cart-header">
          <h3>Keranjang</h3>
          {cart.length > 0 && <button className="clear-btn" onClick={clearCart}><Trash2 size={16} /></button>}
        </div>
        
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <ShoppingBag size={48} />
              <p>Belum ada barang</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.uniqueId} className="cart-item">
                <div className="item-details">
                  <div className="item-name">{item.name}</div>
                  {item.variantName && <div className="item-variant">{item.variantName}</div>}
                  <div className="item-price">{formatRupiah(item.price)}</div>
                </div>
                <div className="item-actions">
                  <button onClick={() => updateCartQty(item.uniqueId, item.qty - 1)}><Minus size={14} /></button>
                  <span className="item-qty">{item.qty}</span>
                  <button onClick={() => updateCartQty(item.uniqueId, item.qty + 1)}><Plus size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="cart-footer">
          <div className="cart-total">
            <span>Total</span>
            <span className="total-amount">{formatRupiah(totalCart)}</span>
          </div>
          <button className="btn btn-primary checkout-btn" disabled={cart.length === 0} onClick={() => setShowCheckoutModal(true)}>
            Bayar Sekarang (F9)
          </button>
        </div>
      </div>

      {showCustomModal && <CustomItemModal onClose={() => setShowCustomModal(false)} />}
      {showCheckoutModal && (
        <CheckoutModal
          onClose={() => setShowCheckoutModal(false)}
          onSuccess={(tx) => {
            setShowCheckoutModal(false);
            setCompletedTx(tx);
          }}
        />
      )}
      {completedTx && (
        <DetailTransactionModal
          transaction={completedTx}
          onClose={() => setCompletedTx(null)}
        />
      )}
      
      {selectedProduct && (
        <div className="modal-backdrop" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Pilih Varian: {selectedProduct.name}</h3>
              <button className="modal-close" onClick={() => setSelectedProduct(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {selectedProduct.variants.map((v, i) => (
                  <button key={i} className="btn btn-secondary" style={{ justifyContent: 'space-between', padding: 'var(--space-md)' }} onClick={() => { addToCart(selectedProduct, v); setSelectedProduct(null); }}>
                    <span style={{ fontWeight: 600 }}>{v.name}</span>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{formatRupiah(v.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
