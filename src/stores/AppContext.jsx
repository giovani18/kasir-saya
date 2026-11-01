import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  seedDatabase, 
  getAllProducts, 
  saveProduct as dbSaveProduct, 
  deleteProduct as dbDeleteProduct, 
  getAllTransactions, 
  saveTransaction as dbSaveTransaction 
} from '../utils/db';
import { checkBackendSession } from '../utils/auth';
import { generateTransactionId } from '../utils/format';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('cashier');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Auth state
  const [currentUser, setCurrentUser] = useState(null);

  // Initialize database and check session
  useEffect(() => {
    const init = async () => {
      try {
        await seedDatabase();
        const session = await checkBackendSession();
        if (session) {
          setCurrentUser(session);
          if (session.role === 'admin') {
            setActiveTab('dashboard');
          } else {
            setActiveTab('cashier');
          }
        }
      } catch (err) {
        console.error(err);
        showToast('Gagal memuat database lokal', 'error');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Fetch data automatically when currentUser changes (login/logout/restore)
  useEffect(() => {
    if (currentUser) {
      refreshProducts();
      refreshTransactions();
    } else {
      setProducts([]);
      setTransactions([]);
    }
  }, [currentUser]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const refreshProducts = async () => {
    try {
      const list = await getAllProducts();
      setProducts(list || []);
    } catch (e) {
      console.error('refreshProducts error:', e);
    }
  };

  const saveProduct = async (productData) => {
    try {
      await dbSaveProduct(productData);
      await refreshProducts();
      showToast(productData.id ? 'Produk berhasil diperbarui' : 'Produk berhasil ditambahkan');
    } catch (e) {
      console.error(e);
      showToast('Gagal menyimpan produk', 'error');
    }
  };

  const deleteProduct = async (id) => {
    try {
      await dbDeleteProduct(id);
      await refreshProducts();
      showToast('Produk berhasil dihapus', 'warning');
    } catch (e) {
      console.error(e);
      showToast('Gagal menghapus produk', 'error');
    }
  };

  const refreshTransactions = async () => {
    try {
      const list = await getAllTransactions();
      // Sort newest first
      const sorted = (list || []).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setTransactions(sorted);
    } catch (e) {
      console.error('refreshTransactions error:', e);
    }
  };

  const addToCart = (product, variant = null) => {
    setCart(prevCart => {
      const isMulti = product.type === 'multi';
      const variantName = isMulti && variant ? variant.name : null;
      const price = isMulti && variant ? variant.price : product.price;
      const uniqueId = isMulti ? `${product.id}-${variantName}` : `${product.id}-single`;
      const idx = prevCart.findIndex(i => i.uniqueId === uniqueId);
      if (idx > -1) {
        setTimeout(() => showToast(`Qty ${product.name} ditambah`), 0);
        return prevCart.map((item, i) =>
          i === idx ? { ...item, qty: item.qty + 1 } : item
        );
      }
      setTimeout(() => showToast(`${product.name} masuk keranjang`), 0);
      return [...prevCart, { uniqueId, productId: product.id, name: product.name, variantName, price, qty: 1 }];
    });
  };

  const addCustomItemToCart = (name, price) => {
    setCart(prev => {
      setTimeout(() => showToast(`"${name}" ditambahkan`), 0);
      return [...prev, { uniqueId: `custom-${Date.now()}`, productId: null, name, variantName: 'Custom', price, qty: 1 }];
    });
  };

  const removeFromCart = (uniqueId) => {
    setCart(prev => {
      const item = prev.find(i => i.uniqueId === uniqueId);
      if (item) setTimeout(() => showToast(`${item.name} dihapus`, 'warning'), 0);
      return prev.filter(i => i.uniqueId !== uniqueId);
    });
  };

  const updateCartQty = (uniqueId, qty) => {
    if (qty <= 0) { removeFromCart(uniqueId); return; }
    setCart(prev => prev.map(i => i.uniqueId === uniqueId ? { ...i, qty } : i));
  };

  const clearCart = () => { setCart([]); setTimeout(() => showToast('Keranjang dikosongkan', 'warning'), 0); };

  const totalCart = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

  const checkout = async (paymentAmount, customerName = '') => {
    if (paymentAmount < totalCart) { showToast('Uang pembayaran kurang', 'error'); return null; }
    const transaction = {
      id: generateTransactionId(),
      timestamp: Date.now(),
      items: [...cart],
      total: totalCart,
      payment: paymentAmount,
      change: paymentAmount - totalCart,
      customerName: customerName.trim(),
      cashier_username: currentUser?.username || 'kasir',
      cashier_name: currentUser?.name || 'Kasir'
    };
    try {
      const savedTx = await dbSaveTransaction(transaction);
      setCart([]);
      await refreshTransactions();
      showToast('Transaksi berhasil!');
      return savedTx;
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan transaksi', 'error');
      return null;
    }
  };

  const categories = ['Semua', ...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <AppContext.Provider value={{
      products, categories, transactions, cart, totalCart,
      activeTab, sidebarExpanded, toast, loading,
      currentUser, setCurrentUser,
      setActiveTab, setSidebarExpanded, showToast,
      saveProduct, deleteProduct, addToCart, addCustomItemToCart,
      removeFromCart, updateCartQty, clearCart, checkout,
      refreshProducts, refreshTransactions
    }}>
      {children}
    </AppContext.Provider>
  );
};
