import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost'
    ? `http://${window.location.hostname}:5000/api`
    : `http://${window.location.hostname}:5000/api`);

// Debug: Log API URL
console.log('API Service - API URL:', API_URL);
console.log('API Service - Current hostname:', window.location.hostname);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important for CORS with credentials
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const sessionId = localStorage.getItem('sessionId');
  if (sessionId) {
    config.headers['x-session-id'] = sessionId;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  addAddress: (address) => api.post('/auth/addresses', address),
  toggleWishlist: (productId) => api.post(`/auth/wishlist/${productId}`)
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  getFilters: (category) => api.get('/products/filters/options', { params: { category } })
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getOne: (id) => api.get(`/categories/${id}`)
};

// Cart API
export const cartAPI = {
  get: () => {
    console.log('API: Getting cart from:', API_URL);
    return api.get('/cart');
  },
  add: (productId, quantity = 1) => {
    console.log('API: Adding to cart - Product ID:', productId, 'Quantity:', quantity);
    console.log('API: Request URL:', `${API_URL}/cart/add`);
    return api.post('/cart/add', { productId, quantity });
  },
  update: (itemId, quantity) => api.put(`/cart/update/${itemId}`, { quantity }),
  remove: (itemId) => api.delete(`/cart/remove/${itemId}`),
  clear: () => api.delete('/cart/clear'),
  merge: (sessionId) => api.post('/cart/merge', { sessionId })
};

// Orders API
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getOne: (id) => api.get(`/orders/${id}`),
  checkout: (data) => api.post('/orders/checkout', data),
  generatePayfastPayload: (orderId) => api.post('/orders/payfast/generate', { orderId }),
  restoreCart: (orderId) => api.post(`/orders/${orderId}/restore-cart`)
};

// Currency API
export const currencyAPI = {
  getRates: () => api.get('/currencies')
};

export default api;
