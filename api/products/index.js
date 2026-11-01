import { query, initDatabase } from '../../lib/db';
import { authMiddleware } from '../../lib/auth';

export default async function handler(req, res) {
  try {
    await initDatabase();
  } catch (err) {
    console.error('Database connection failed', err);
    return res.status(500).json({ error: 'Koneksi database gagal' });
  }

  // 1. GET /api/products - Get all products
  if (req.method === 'GET') {
    const user = authMiddleware(req, res);
    if (!user) return;

    try {
      const result = await query('SELECT * FROM products ORDER BY created_at DESC');
      // Format rows: PostgreSQL column names are usually lowercase.
      // E.g. created_at -> need to map to createdAt or make it consistent.
      // Wait, let's look at the database schema. In PostgreSQL:
      // id, name, category, type, price, variants, created_at
      // Let's map created_at to createdAt so that the frontend can read it!
      const products = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        category: row.category,
        type: row.type,
        price: row.price,
        variants: row.variants,
        createdAt: Number(row.created_at)
      }));
      return res.status(200).json(products);
    } catch (error) {
      console.error('Fetch products error:', error);
      return res.status(500).json({ error: 'Gagal mengambil data produk' });
    }
  }

  // 2. POST /api/products - Create a new product
  if (req.method === 'POST') {
    const user = authMiddleware(req, res, 'admin');
    if (!user) return;

    try {
      const { name, category, type, price, variants } = req.body;
      if (!name || !type) {
        return res.status(400).json({ error: 'Nama dan tipe produk wajib diisi' });
      }

      let result;
      if (type === 'single') {
        result = await query(
          'INSERT INTO products (name, category, type, price, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [name, category, type, Number(price) || 0, Date.now()]
        );
      } else {
        result = await query(
          'INSERT INTO products (name, category, type, variants, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [name, category, type, JSON.stringify(variants || []), Date.now()]
        );
      }

      const row = result.rows[0];
      return res.status(201).json({
        id: row.id,
        name: row.name,
        category: row.category,
        type: row.type,
        price: row.price,
        variants: row.variants,
        createdAt: Number(row.created_at)
      });
    } catch (error) {
      console.error('Create product error:', error);
      return res.status(500).json({ error: 'Gagal menambahkan produk' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
