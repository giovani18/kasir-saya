import { query, initDatabase } from '../../lib/db';
import { authMiddleware } from '../../lib/auth';

export default async function handler(req, res) {
  try {
    await initDatabase();
  } catch (err) {
    return res.status(500).json({ error: 'Koneksi database gagal' });
  }

  const user = authMiddleware(req, res, 'admin');
  if (!user) return;

  const { id } = req.query;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'ID produk tidak valid' });
  }

  const productId = Number(id);

  // 1. PUT /api/products/[id] - Update product details
  if (req.method === 'PUT') {
    try {
      const { name, category, type, price, variants } = req.body;
      if (!name || !type) {
        return res.status(400).json({ error: 'Nama dan tipe produk wajib diisi' });
      }

      let result;
      if (type === 'single') {
        result = await query(
          'UPDATE products SET name = $1, category = $2, type = $3, price = $4, variants = NULL WHERE id = $5 RETURNING *',
          [name, category, type, Number(price) || 0, productId]
        );
      } else {
        result = await query(
          'UPDATE products SET name = $1, category = $2, type = $3, price = NULL, variants = $4 WHERE id = $5 RETURNING *',
          [name, category, type, JSON.stringify(variants || []), productId]
        );
      }

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Produk tidak ditemukan' });
      }

      const row = result.rows[0];
      return res.status(200).json({
        id: row.id,
        name: row.name,
        category: row.category,
        type: row.type,
        price: row.price,
        variants: row.variants,
        createdAt: Number(row.created_at)
      });
    } catch (error) {
      console.error('Update product error:', error);
      return res.status(500).json({ error: 'Gagal memperbarui produk' });
    }
  }

  // 2. DELETE /api/products/[id] - Delete a product
  if (req.method === 'DELETE') {
    try {
      const result = await query('DELETE FROM products WHERE id = $1 RETURNING *', [productId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Produk tidak ditemukan' });
      }
      return res.status(200).json({ success: true, message: 'Produk berhasil dihapus' });
    } catch (error) {
      console.error('Delete product error:', error);
      return res.status(500).json({ error: 'Gagal menghapus produk' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
