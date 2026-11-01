import pg from 'pg';

const { Pool } = pg;

let pool;

if (!pool) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn('Warning: DATABASE_URL is not set!');
  }
  pool = new Pool({
    connectionString,
    ssl: connectionString && (connectionString.includes('localhost') || connectionString.includes('127.0.0.1')) ? false : {
      rejectUnauthorized: false
    }
  });
}

export const query = (text, params) => pool.query(text, params);

export const initDatabase = async () => {
  // 1. Create Users Table
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      username VARCHAR(50) PRIMARY KEY,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(100) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'kasir'
    )
  `);

  // 2. Create Products Table
  await query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      category VARCHAR(100),
      type VARCHAR(10) NOT NULL DEFAULT 'single',
      price INTEGER,
      variants JSONB,
      created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)
    )
  `);

  // 3. Create Transactions Table
  await query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id VARCHAR(50) PRIMARY KEY,
      timestamp BIGINT NOT NULL,
      items JSONB NOT NULL,
      total INTEGER NOT NULL,
      payment INTEGER NOT NULL,
      change INTEGER NOT NULL,
      customer_name VARCHAR(200) DEFAULT '',
      cashier_username VARCHAR(50) REFERENCES users(username),
      cashier_name VARCHAR(100)
    )
  `);

  // 4. Seed Users
  const usersRes = await query('SELECT COUNT(*) FROM users');
  const userCount = parseInt(usersRes.rows[0].count, 10);
  if (userCount === 0) {
    const bcrypt = await import('bcryptjs');
    const adminPasswordHash = await bcrypt.default.hash('admin123', 10);
    const kasirPasswordHash = await bcrypt.default.hash('kasir123', 10);

    await query(
      'INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4)',
      ['admin', adminPasswordHash, 'Administrator', 'admin']
    );
    await query(
      'INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4)',
      ['kasir', kasirPasswordHash, 'Kasir Utama', 'kasir']
    );
    console.log('Database seeded with default users');
  }

  // 5. Seed Products
  const productsRes = await query('SELECT COUNT(*) FROM products');
  const productCount = parseInt(productsRes.rows[0].count, 10);
  if (productCount === 0) {
    const seedProducts = [
      { name: 'Minyak Goreng Sinco', category: 'Sembako', type: 'multi', variants: [{ name: '1L Eceran', price: 15000 }, { name: '2L Eceran', price: 29000 }, { name: '1 Dus (12L)', price: 170000 }] },
      { name: 'Gula Pasir Gulaku 1kg', category: 'Sembako', type: 'single', price: 17500 },
      { name: 'Beras Pandan Wangi 5kg', category: 'Sembako', type: 'single', price: 78000 },
      { name: 'Tepung Terigu Segitiga Biru 1kg', category: 'Sembako', type: 'single', price: 13500 },
      { name: 'Indomie Goreng', category: 'Makanan & Mie', type: 'single', price: 3500 },
      { name: 'Indomie Ayam Bawang', category: 'Makanan & Mie', type: 'single', price: 3200 },
      { name: 'Teh Pucuk Harum 350ml', category: 'Minuman', type: 'single', price: 4000 },
      { name: 'Aqua Mineral', category: 'Minuman', type: 'multi', variants: [{ name: '600ml Botol', price: 3500 }, { name: '1.5L Botol', price: 6500 }, { name: '1 Dus Botol 600ml', price: 68000 }] },
      { name: 'Sabun Mandi Lifebuoy Merah', category: 'Sabun & Cuci', type: 'single', price: 4500 },
      { name: 'Deterjen Rinso Cair 800ml', category: 'Sabun & Cuci', type: 'single', price: 21000 }
    ];

    for (const prod of seedProducts) {
      if (prod.type === 'single') {
        await query(
          'INSERT INTO products (name, category, type, price, created_at) VALUES ($1, $2, $3, $4, $5)',
          [prod.name, prod.category, prod.type, prod.price, Date.now()]
        );
      } else {
        await query(
          'INSERT INTO products (name, category, type, variants, created_at) VALUES ($1, $2, $3, $4, $5)',
          [prod.name, prod.category, prod.type, JSON.stringify(prod.variants), Date.now()]
        );
      }
    }
    console.log('Database seeded with default products');
  }
};
