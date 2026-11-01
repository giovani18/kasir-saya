import { query, initDatabase } from '../../lib/db';
import { authMiddleware } from '../../lib/auth';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  try {
    await initDatabase();
  } catch (err) {
    return res.status(500).json({ error: 'Koneksi database gagal' });
  }

  const user = authMiddleware(req, res, 'admin');
  if (!user) return;

  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ error: 'Username tidak valid' });
  }

  const targetUsername = username.toLowerCase().trim();

  // 1. PUT /api/users/[username] - Update a user's details or password
  if (req.method === 'PUT') {
    try {
      const { name, password, role } = req.body;
      if (!name || !role) {
        return res.status(400).json({ error: 'Nama dan role wajib diisi' });
      }

      let result;
      // If password has changed from placeholder '*****', hash and update it
      if (password && password !== '*****') {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        result = await query(
          'UPDATE users SET name = $1, role = $2, password = $3 WHERE username = $4 RETURNING username, name, role',
          [name, role, hashedPassword, targetUsername]
        );
      } else {
        result = await query(
          'UPDATE users SET name = $1, role = $2 WHERE username = $3 RETURNING username, name, role',
          [name, role, targetUsername]
        );
      }

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
      }

      return res.status(200).json({
        username: result.rows[0].username,
        name: result.rows[0].name,
        role: result.rows[0].role,
        password: '*****'
      });
    } catch (error) {
      console.error('Update user error:', error);
      return res.status(500).json({ error: 'Gagal memperbarui data pengguna' });
    }
  }

  // 2. DELETE /api/users/[username] - Delete a user
  if (req.method === 'DELETE') {
    try {
      // Prevent deleting own account
      if (targetUsername === user.username) {
        return res.status(400).json({ error: 'Anda tidak dapat menghapus akun sendiri' });
      }

      const result = await query('DELETE FROM users WHERE username = $1 RETURNING username', [targetUsername]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
      }

      return res.status(200).json({ success: true, message: 'Pengguna berhasil dihapus' });
    } catch (error) {
      console.error('Delete user error:', error);
      return res.status(500).json({ error: 'Gagal menghapus pengguna' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
