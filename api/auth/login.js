import { query, initDatabase } from '../../lib/db';
import { generateToken } from '../../lib/auth';
import bcrypt from 'bcryptjs';
import cookie from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Auto-init/seed database on login attempt
    await initDatabase();

    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi' });
    }

    const result = await query('SELECT * FROM users WHERE username = $1', [username.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Username tidak ditemukan' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Password salah' });
    }

    const sessionData = {
      username: user.username,
      name: user.name,
      role: user.role
    };

    const token = generateToken(sessionData);

    // Set token in HttpOnly cookie
    res.setHeader('Set-Cookie', cookie.serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    }));

    return res.status(200).json({ success: true, user: sessionData });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan sistem' });
  }
}
