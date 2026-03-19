import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import categoryRoutes from './routes/categories.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', /^http:\/\/192\.168\.\d+\.\d+:517[3-4]$/, /^http:\/\/10\.\d+\.\d+\.\d+:517[3-4]$/, /^http:\/\/172\.\d+\.\d+\.\d+:517[3-4]$/, /^http:\/\/127\.0\.0\.1:\d+$/, /^http:\/\/localhost:\d+$/],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);

// Currency rates (simplified)
app.get('/api/currencies', (req, res) => {
  res.json({
    rates: {
      GBP: 1,
      USD: 1.27,
      EUR: 1.17,
      JPY: 190.5
    },
    currencies: ['GBP', 'USD', 'EUR', 'JPY']
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Fuji Card Shop API is running' });
});

// Note: Static files are served by Vite dev server during development
// Only serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

  // Handle React Router - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
