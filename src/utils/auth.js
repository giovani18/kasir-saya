import { getUserByUsername, seedDatabase } from './db';

const CURRENT_USER_KEY = 'kios_current_user';

export const login = async (username, password) => {
  try {
    if (!username || !password) {
      return { success: false, message: 'Username dan password wajib diisi' };
    }

    // Ensure database and seeds are initialized
    try {
      await seedDatabase();
    } catch (e) {
      console.warn('Seed database warning:', e);
    }

    const cleanUsername = username.toLowerCase().trim();
    const user = await getUserByUsername(cleanUsername);

    if (!user) {
      return { success: false, message: 'Username tidak ditemukan' };
    }

    if (user.password !== password) {
      return { success: false, message: 'Password salah' };
    }

    const sessionUser = {
      username: user.username,
      name: user.name,
      role: user.role
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
    return { success: true, user: sessionUser };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: error.message || 'Terjadi kesalahan sistem' };
  }
};

export const logout = async () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  return { success: true };
};

export const getCurrentUser = () => {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === 'admin';
};

export const checkBackendSession = async () => {
  const user = getCurrentUser();
  return user;
};
