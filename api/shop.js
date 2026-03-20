import productsHandler from '../api_logic/products.js';
import categoriesHandler from '../api_logic/categories.js';
import currenciesHandler from '../api_logic/currencies.js';
import healthHandler from '../api_logic/health.js';
import ordersHandler from '../api_logic/orders.js';
import cartHandler from '../api_logic/cart.js';
import cryptoWalletsHandler from '../api_logic/crypto-wallets.js';

export default async function handler(req, res) {
    // 1. Centralized CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-session-id');

    // 2. Preflight
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const url = req.url || '';
        console.log(`[Shop Router] URL: ${url}`);

        // 3. Robust Health Check (Direct)
        if (url.includes('/health')) {
            return res.status(200).json({
                status: 'ok',
                time: new Date().toISOString(),
                env: {
                    has_url: !!process.env.SUPABASE_URL,
                    has_key: !!(process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY)
                }
            });
        }

        // 4. Sub-handlers
        if (url.includes('/products')) return await productsHandler(req, res);
        if (url.includes('/categories')) return await categoriesHandler(req, res);
        if (url.includes('/currencies')) return await currenciesHandler(req, res);
        if (url.includes('/orders')) return await ordersHandler(req, res);
        if (url.includes('/cart')) return await cartHandler(req, res);
        if (url.includes('/crypto-wallets')) return await cryptoWalletsHandler(req, res);

        return res.status(404).json({
            error: 'Shop endpoint not found',
            debug: { url, method: req.method }
        });
    } catch (error) {
        console.error('[Shop Router] CRASH:', error);
        return res.status(500).json({
            error: 'Internal Server Error (api/shop.js)',
            message: error.message,
            stack: error.stack
        });
    }
}
