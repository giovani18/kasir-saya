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

  // 1. GET /api/transactions - Get list of transactions (filtered by user role)
  if (req.method === 'GET') {
    try {
      let result;
      if (user.role === 'admin') {
        result = await query('SELECT * FROM transactions ORDER BY timestamp DESC');
      } else {
        result = await query('SELECT * FROM transactions WHERE cashier_username = $1 ORDER BY timestamp DESC', [user.username]);
      }

      const txs = result.rows.map(row => ({
        id: row.id,
        timestamp: Number(row.timestamp),
        items: row.items,
        total: row.total,
        payment: row.payment,
        change: row.change,
        customerName: row.customer_name,
        cashierUsername: row.cashier_username,
        cashierName: row.cashier_name
      }));

      return res.status(200).json(txs);
    } catch (error) {
      console.error('Fetch transactions error:', error);
      return res.status(500).json({ error: 'Gagal mengambil data transaksi' });
    }
  }

  // 2. POST /api/transactions - Create new transaction
  if (req.method === 'POST') {
    try {
      const { id, timestamp, items, total, payment, change, customerName } = req.body;
      if (!id || !items || total === undefined) {
        return res.status(400).json({ error: 'Data transaksi tidak lengkap' });
      }

      const cashierUsername = user.username;
      const cashierName = user.name || user.username;

      const result = await query(
        'INSERT INTO transactions (id, timestamp, items, total, payment, change, customer_name, cashier_username, cashier_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [
          id,
          timestamp || Date.now(),
          JSON.stringify(items),
          total,
          payment || 0,
          change || 0,
          customerName || '',
          cashierUsername,
          cashierName
        ]
      );

      const row = result.rows[0];
      return res.status(201).json({
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
      console.error('Save transaction error:', error);
      return res.status(500).json({ error: 'Gagal menyimpan transaksi' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
