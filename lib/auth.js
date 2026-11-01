import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'kios_bu_sribekti_default_secret_key_12345';

export const generateToken = (user) => {
  return jwt.sign(
    { username: user.username, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

export const getUserFromRequest = (req) => {
  // Try req.cookies first (parsed by Vercel)
  if (req.cookies && req.cookies.token) {
    return verifyToken(req.cookies.token);
  }
  // Fallback to manual parsing from headers
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.token;
  if (!token) return null;
  return verifyToken(token);
};

export const authMiddleware = (req, res, requiredRole = null) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized: Harap login terlebih dahulu' });
    return null;
  }
  if (requiredRole && user.role !== requiredRole) {
    res.status(403).json({ error: 'Forbidden: Anda tidak memiliki izin untuk akses ini' });
    return null;
  }
  return user;
};
