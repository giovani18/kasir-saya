import { query, initDatabase } from '../../lib/db';
import { authMiddleware } from '../../lib/auth';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  try {
    await initDatabase();
  } catch (err) {
    return res.status(500).json({ error: 'Koneksi database gagal' });
  }

  // Admin access required
  const user = authMiddleware(req, res, 'admin');
  if (!user) return;

  // 1. GET /api/users - List users
  if (req.method === 'GET') {
    try {
      const result = await query('SELECT username, name, role FROM users');
      const users = result.rows.map(u => ({
        username: u.username,
        name: u.name,
        role: u.role,
        password: '*****'
      }));
      return res.status(200).json(users);
    } catch (error) {
      console.error('Fetch users list error:', error);
      return res.status(500).json({ error: 'Gagal mengambil data pengguna' });
    }
  }

  // 2. POST /api/users - Create new user with hashed password
  if (req.method === 'POST') {
    try {
      const { username, name, password, role } = req.body;
      if (!username || !name || !password || !role) {
        return res.status(400).json({ error: 'Semua data pengguna wajib diisi' });
      }

      const cleanUsername = username.toLowerCase().trim();

      // Check existence
      const existCheck = await query('SELECT username FROM users WHERE username = $1', [cleanUsername]);
      if (existCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Username sudah digunakan' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const result = await query(
        'INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4) RETURNING username, name, role',
        [cleanUsername, hashedPassword, name, role]
      );

      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create user error:', error);
      return res.status(500).json({ error: 'Gagal menambahkan pengguna baru' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
