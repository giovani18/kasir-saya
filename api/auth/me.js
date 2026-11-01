import { getUserFromRequest } from '../../lib/auth';
import { initDatabase } from '../../lib/db';

export default async function handler(req, res) {
  try {
    await initDatabase();
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(200).json({ user: null });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.error('Session restore error:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan sistem' });
  }
}
