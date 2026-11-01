import { query, initDatabase } from '../../lib/db';
import { authMiddleware } from '../../lib/auth';

export default async function handler(req, res) {
  try {
    await initDatabase();
  } catch (err) {
    return res.status(500).json({ error: 'Koneksi database gagal' });
  }

  const user = authMiddleware(req, res);
  if (!user) return;

  const { id } = req.query;

  // 1. GET /api/transactions/[id] - Get details of a single transaction
  if (req.method === 'GET') {
    try {
      const result = await query('SELECT * FROM transactions WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
      }

      const row = result.rows[0];
      // Kasir can only view their own transactions
      if (user.role !== 'admin' && row.cashier_username !== user.username) {
        return res.status(403).json({ error: 'Forbidden: Anda tidak memiliki izin untuk melihat transaksi ini' });
      }

      return res.status(200).json({
        id: row.id,
        timestamp: Number(row.timestamp),
        items: row.items,
        total: row.total,
        payment: row.payment,
        change: row.change,
        customerName: row.customer_name,
        cashierUsername: row.cashier_username,
        cashierName: row.cashier_name
      });
    } catch (error) {
      console.error('Fetch transaction by id error:', error);
      return res.status(500).json({ error: 'Gagal mengambil detail transaksi' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
