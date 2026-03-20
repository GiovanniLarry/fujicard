# Fuji Card Shop

Full-stack e-commerce application for trading cards with React frontend and Node.js backend, now configured for Vercel serverless deployment.

## Features

- 🛒 Shopping cart functionality
- 💳 Multiple payment methods (Paystack, Crypto)
- 👥 User authentication & admin dashboard
- 📦 Product management
- 📊 Order tracking
- 🔔 Real-time notifications

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express (serverless functions)
- **Database**: Supabase
- **Deployment**: Vercel (full-stack)

## Environment Variables

Required for deployment:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
```

## Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - Get all products
- `POST /api/admin/products` - Add product (admin)
- `PUT /api/admin/products/[id]` - Update product (admin)
- `DELETE /api/admin/products/[id]` - Delete product (admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/admin/categories` - Add category (admin)
- `DELETE /api/admin/categories/[id]` - Delete category (admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order

### Admin
- `GET /api/admin/stats` - Dashboard stats
- `GET /api/admin/users` - Get users
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/notifications` - Get notifications
- `GET /api/admin/paystack-config` - Get Paystack config
- `PUT /api/admin/paystack-config` - Update Paystack config

### Crypto Wallets
- `GET /api/crypto-wallets` - Get wallet addresses
- `PUT /api/admin/crypto-wallets/[symbol]` - Update wallet (admin)
