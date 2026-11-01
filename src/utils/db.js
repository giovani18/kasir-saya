import { openDB } from 'idb';

const DB_NAME = 'kios_bu_sribekti_db';
const DB_VERSION = 2;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains('products')) {
        const productStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
        productStore.createIndex('category', 'category', { unique: false });
      }
      if (!db.objectStoreNames.contains('transactions')) {
        const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
        transactionStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'username' });
      }
    },
  });
};

export const seedDatabase = async () => {
  const db = await initDB();

  // 1. Seed Products if empty
  const tx = db.transaction('products', 'readonly');
  const store = tx.objectStore('products');
  const count = await store.count();
  await tx.done;

  if (count === 0) {
    const writeTx = db.transaction('products', 'readwrite');
    const writeStore = writeTx.objectStore('products');
    const seedProducts = [
      { name: 'Minyak Goreng Sinco', category: 'Sembako', type: 'multi', variants: [{ name: '1L Eceran', price: 15000 }, { name: '2L Eceran', price: 29000 }, { name: '1 Dus (12L)', price: 170000 }], createdAt: Date.now() },
      { name: 'Gula Pasir Gulaku 1kg', category: 'Sembako', type: 'single', price: 17500, createdAt: Date.now() },
      { name: 'Beras Pandan Wangi 5kg', category: 'Sembako', type: 'single', price: 78000, createdAt: Date.now() },
      { name: 'Tepung Terigu Segitiga Biru 1kg', category: 'Sembako', type: 'single', price: 13500, createdAt: Date.now() },
      { name: 'Indomie Goreng', category: 'Makanan & Mie', type: 'single', price: 3500, createdAt: Date.now() },
      { name: 'Indomie Ayam Bawang', category: 'Makanan & Mie', type: 'single', price: 3200, createdAt: Date.now() },
      { name: 'Teh Pucuk Harum 350ml', category: 'Minuman', type: 'single', price: 4000, createdAt: Date.now() },
      { name: 'Aqua Mineral', category: 'Minuman', type: 'multi', variants: [{ name: '600ml Botol', price: 3500 }, { name: '1.5L Botol', price: 6500 }, { name: '1 Dus Botol 600ml', price: 68000 }], createdAt: Date.now() },
      { name: 'Sabun Mandi Lifebuoy Merah', category: 'Sabun & Cuci', type: 'single', price: 4500, createdAt: Date.now() },
      { name: 'Deterjen Rinso Cair 800ml', category: 'Sabun & Cuci', type: 'single', price: 21000, createdAt: Date.now() }
    ];

    for (const prod of seedProducts) {
      await writeStore.add(prod);
    }
    await writeTx.done;
  }

  // 2. Seed Default Users if empty
  const userTx = db.transaction('users', 'readonly');
  const userStore = userTx.objectStore('users');
  const userCount = await userStore.count();
  await userTx.done;

  if (userCount === 0) {
    const writeUserTx = db.transaction('users', 'readwrite');
    const writeUserStore = writeUserTx.objectStore('users');
    const defaultUsers = [
      { username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
      { username: 'kasir', password: 'kasir123', role: 'kasir', name: 'Kasir Utama' }
    ];
    for (const u of defaultUsers) {
      await writeUserStore.put(u);
    }
    await writeUserTx.done;
  }
};

// --- Product Operations ---
export const getAllProducts = async () => {
  const db = await initDB();
  return db.getAll('products');
};

export const saveProduct = async (product) => {
  const db = await initDB();
  if (product.id) {
    return db.put('products', product);
  } else {
    const newProduct = { ...product, createdAt: Date.now() };
    return db.add('products', newProduct);
  }
};

export const deleteProduct = async (id) => {
  const db = await initDB();
  return db.delete('products', Number(id));
};

// --- Transaction Operations ---
export const getAllTransactions = async () => {
  const db = await initDB();
  return db.getAll('transactions');
};

export const saveTransaction = async (transaction) => {
  const db = await initDB();
  await db.put('transactions', transaction);
  return transaction;
};

// --- User Operations ---
export const getAllUsers = async () => {
  const db = await initDB();
  const users = await db.getAll('users');
  if (!users || users.length === 0) {
    return [
      { username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
      { username: 'kasir', password: 'kasir123', role: 'kasir', name: 'Kasir Utama' }
    ];
  }
  return users;
};

export const saveUser = async (user) => {
  const db = await initDB();
  return db.put('users', user);
};

export const deleteUser = async (username) => {
  const db = await initDB();
  return db.delete('users', username);
};

export const getUserByUsername = async (username) => {
  const db = await initDB();
  const user = await db.get('users', username.toLowerCase().trim());
  if (user) return user;
  
  // Fallback defaults
  if (username.toLowerCase().trim() === 'admin') {
    return { username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' };
  }
  if (username.toLowerCase().trim() === 'kasir') {
    return { username: 'kasir', password: 'kasir123', role: 'kasir', name: 'Kasir Utama' };
  }
  return null;
};
