import express from 'express';
import { supabase } from '../config/supabase.js';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer config — saves files directly to client/public as <coin>-qr.png
const qrStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = path.join(__dirname, '../../client/public');
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const coin = (req.body.coin || 'btc').toLowerCase();
        cb(null, `${coin}-qr.png`);
    }
});
const uploadQR = multer({ storage: qrStorage, limits: { fileSize: 5 * 1024 * 1024 } });

// In-memory wallet config (persists until server restart; extend with DB if needed)
let cryptoWalletConfig = {
    BTC: { address: 'bc1qhupxlhjaddepp62pdrlj682yhlt203qzu5spap', trustLink: 'https://link.trustwallet.com/send?address=bc1qhupxlhjaddepp62pdrlj682yhlt203qzu5spap&asset=c0' },
    ETH: { address: '0x8101625364B48146ea92E1FEeB48fd90c852a215', trustLink: 'https://link.trustwallet.com/send?address=0x8101625364B48146ea92E1FEeB48fd90c852a215&asset=c60' },
    USDT: { address: '0x8101625364B48146ea92E1FEeB48fd90c852a215', trustLink: 'https://link.trustwallet.com/send?asset=c60_t0xdAC17F958D2ee523a2206206994597C13D831ec7&address=0x8101625364B48146ea92E1FEeB48fd90c852a215' },
    USDC: { address: '0x8101625364B48146ea92E1FEeB48fd90c852a215', trustLink: 'https://link.trustwallet.com/send?address=0x8101625364B48146ea92E1FEeB48fd90c852a215&asset=c60_t0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
    LTC: { address: 'ltc1qhncs35rmy3kdcnj62vxnswa9ajgnk8f6yksn66', trustLink: 'https://link.trustwallet.com/send?asset=c2&address=ltc1qhncs35rmy3kdcnj62vxnswa9ajgnk8f6yksn66' }
};

let paystackConfig = {
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
    secretKey: process.env.PAYSTACK_SECRET_KEY || ''
};

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fujicard-secret-key-2024-change-in-production';

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err || user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized as admin' });
        }
        req.user = user;
        next();
    });
};

// Apply middleware to all admin routes
router.use(authenticateAdmin);

// Get global stats
router.get('/stats', async (req, res) => {
    try {
        const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
        const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });

        res.json({
            users: userCount || 0,
            products: productCount || 0,
            orders: orderCount || 0
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ error: 'Server error fetching stats' });
    }
});

// Add a new product
router.post('/products', async (req, res) => {
    try {
        const newProduct = req.body;

        // Ensure you use the right category_id - for now assume client sends it or map name -> id
        if (newProduct.category_name) {
            const { data: catData } = await supabase.from('categories').select('id').eq('name', newProduct.category_name).single();
            if (catData) newProduct.category_id = catData.id;
            delete newProduct.category_name;
        }

        const { data, error } = await supabase.from('products').insert([newProduct]).select().single();
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: 'Failed to add product' });
    }
});

// Bulk update stock for sold-out products
router.put('/products/bulk-stock', async (req, res) => {
    try {
        const { productIds, stockToAdd } = req.body;
        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ error: 'No products selected' });
        }

        const addedStock = parseInt(stockToAdd, 10);
        if (isNaN(addedStock) || addedStock <= 0) {
            return res.status(400).json({ error: 'Invalid stock number' });
        }

        const errors = [];
        // Update each product's stock
        await Promise.all(productIds.map(async (pid) => {
            const { data: product, error: fetchErr } = await supabase
                .from('products')
                .select('stock')
                .eq('id', pid)
                .single();

            if (fetchErr || !product) {
                errors.push(`Product ${pid}: fetch failed - ${fetchErr?.message}`);
                return;
            }

            const currentStock = product.stock ?? 0;
            const { error: updateErr } = await supabase
                .from('products')
                .update({ stock: currentStock + addedStock, updated_at: new Date().toISOString() })
                .eq('id', pid);

            if (updateErr) {
                errors.push(`Product ${pid}: update failed - ${updateErr.message}`);
            }
        }));

        if (errors.length > 0) {
            console.error('Bulk stock update partial errors:', errors);
            return res.status(500).json({ error: 'Some products failed to update', details: errors });
        }

        res.json({ message: 'Stock updated successfully' });
    } catch (error) {
        console.error('Bulk stock update error:', error);
        res.status(500).json({ error: 'Failed to update stock in bulk', details: error.message });
    }
});

// Update an existing product
router.put('/products/:id', async (req, res) => {
    try {
        const updateData = req.body;

        if (updateData.category_name) {
            const { data: catData } = await supabase.from('categories').select('id').eq('name', updateData.category_name).single();
            if (catData) updateData.category_id = catData.id;
            delete updateData.category_name;
        }

        // Clean fields we shouldn't update manually here
        delete updateData.id;
        delete updateData.categories;
        delete updateData.created_at;
        delete updateData.updated_at;

        // Map any boolean strings back to bool
        if (updateData.featured !== undefined) updateData.featured = updateData.featured === 'true' || updateData.featured === true;
        if (updateData.promo !== undefined) updateData.promo = updateData.promo === 'true' || updateData.promo === true;

        console.log(`[Admin] Updating product ${req.params.id} with data:`, updateData);

        const { data, error } = await supabase.from('products').update(updateData).eq('id', req.params.id).select();
        if (error) throw error;
        res.json(data && data.length > 0 ? data[0] : { message: 'Updated' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete a product
router.delete('/products/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('products').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});


// Category Management
router.post('/categories', async (req, res) => {
    try {
        const { name } = req.body;
        const { data, error } = await supabase.from('categories').insert([{ name }]).select().single();
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ error: 'Failed to add category' });
    }
});

router.delete('/categories/:id', async (req, res) => {
    try {
        // Can't delete category if it has products attached (FK constraint) unless CASCADE
        const { error } = await supabase.from('categories').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category. Ensure no products are left inside it.' });
    }
});

// Get all users
router.get('/users', async (req, res) => {
    try {
        const { data, error } = await supabase.from('users').select('id, username, email, created_at, is_banned').order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Update user ban status
router.put('/users/:id/ban', async (req, res) => {
    try {
        const { is_banned } = req.body;
        const { error } = await supabase.from('users').update({ is_banned }).eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: 'User status updated successfully' });
    } catch (error) {
        console.error('Error banning user:', error);
        res.status(500).json({ error: 'Failed to update user status' });
    }
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('users').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Delete ALL users (nuclear option — admin confirmed)
router.delete('/users', async (req, res) => {
    try {
        const { error } = await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // neq trick to delete all rows
        if (error) throw error;
        res.json({ message: 'All users deleted successfully' });
    } catch (error) {
        console.error('Error deleting all users:', error);
        res.status(500).json({ error: 'Failed to delete all users', details: error.message });
    }
});

// Delete ALL orders
router.delete('/orders', async (req, res) => {
    try {
        const { error } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) throw error;
        res.json({ message: 'All orders deleted successfully' });
    } catch (error) {
        console.error('Error deleting all orders:', error);
        res.status(500).json({ error: 'Failed to delete all orders', details: error.message });
    }
});

// Get all orders for tracking
router.get('/orders', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                users ( username, email )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

// Get recent transactions for notifications
router.get('/notifications', async (req, res) => {
    try {
        // Fetch the 10 most recent orders with their associated users if any
        const { data, error } = await supabase
            .from('orders')
            .select(`
                id,
                order_number,
                total,
                currency,
                payment_method,
                created_at,
                user_id,
                users ( username, email )
            `)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        // Format the notifications
        const notifications = data.map(order => ({
            id: order.id,
            order_number: order.order_number,
            amount: order.total,
            currency: order.currency,
            method: order.payment_method || 'Unknown',
            time: order.created_at,
            customer: order.users ? order.users.username : 'Guest Checkout',
            email: order.users ? order.users.email : 'N/A',
            isRead: false // In a real app we would store read status in DB
        }));

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

// Get current crypto wallet config (public)
router.get('/crypto-wallets', async (req, res) => {
    res.json(cryptoWalletConfig);
});

// Update a single coin's wallet address and trust link
router.put('/crypto-wallets/:symbol', authenticateAdmin, async (req, res) => {
    const { symbol } = req.params;
    const { address, trustLink } = req.body;
    if (!cryptoWalletConfig[symbol]) return res.status(404).json({ error: 'Unknown coin symbol' });
    cryptoWalletConfig[symbol] = { ...cryptoWalletConfig[symbol], address, trustLink };
    res.json({ message: `${symbol} wallet updated`, config: cryptoWalletConfig[symbol] });
});

// Upload a new QR code image for a coin
router.post('/crypto-wallets/qr', authenticateAdmin, uploadQR.single('qr'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ message: 'QR code uploaded successfully', filename: req.file.filename });
});

// Get current Paystack config (admin only)
router.get('/paystack-config', authenticateAdmin, async (req, res) => {
    res.json(paystackConfig);
});

// Update Paystack config
router.put('/paystack-config', authenticateAdmin, async (req, res) => {
    const { publicKey, secretKey } = req.body;
    paystackConfig = { publicKey, secretKey };
    res.json({ message: 'Paystack settings updated', config: paystackConfig });
});

export default router;
