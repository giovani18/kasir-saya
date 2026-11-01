/**
 * API fetch wrapper with offline fallback.
 * Routes /api calls to local IndexedDB/auth handlers so there are zero 404 network errors.
 */
import { 
  getAllProducts, 
  saveProduct, 
  deleteProduct, 
  getAllTransactions, 
  saveTransaction, 
  getAllUsers, 
  saveUser, 
  deleteUser 
} from './db';
import { login, logout, getCurrentUser } from './auth';

export const apiFetch = async (url, options = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : null;

  // 1. Auth routes
  if (url === '/api/auth/login' && method === 'POST') {
    const res = await login(body?.username, body?.password);
    if (!res.success) throw new Error(res.message);
    return res;
  }
  if (url === '/api/auth/logout' && method === 'POST') {
    return logout();
  }
  if (url === '/api/auth/me') {
    return { user: getCurrentUser() };
  }

  // 2. Products routes
  if (url === '/api/products') {
    if (method === 'GET') return getAllProducts();
    if (method === 'POST') return saveProduct(body);
  }
  if (url.startsWith('/api/products/')) {
    const id = url.split('/api/products/')[1];
    if (method === 'PUT') return saveProduct({ ...body, id: Number(id) });
    if (method === 'DELETE') return deleteProduct(id);
  }

  // 3. Transactions routes
  if (url === '/api/transactions') {
    if (method === 'GET') return getAllTransactions();
    if (method === 'POST') return saveTransaction(body);
  }

  // 4. Users routes
  if (url === '/api/users') {
    if (method === 'GET') return getAllUsers();
    if (method === 'POST') return saveUser(body);
  }
  if (url.startsWith('/api/users/')) {
    const username = url.split('/api/users/')[1];
    if (method === 'PUT') return saveUser({ ...body, username });
    if (method === 'DELETE') return deleteUser(username);
  }

  return { success: true };
};
