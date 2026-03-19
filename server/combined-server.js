import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// Proxy API requests to backend FIRST
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api'
  }
}));

// Serve static files from dist
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

// Handle React Router - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✅ Combined server running!`);
  console.log(`📦 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API Proxy: http://localhost:${PORT}/api → http://localhost:5000/api\n`);
});
