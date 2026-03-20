import productsHandler from './_logic/products.js';
import categoriesHandler from './_logic/categories.js';
import currenciesHandler from './_logic/currencies.js';
import healthHandler from './_logic/health.js';
import ordersHandler from './_logic/orders.js';
import cartHandler from './_logic/cart.js';
import cryptoWalletsHandler from './_logic/crypto-wallets.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-session-id');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { route } = req.query;
        console.log(`[Shop Router] Route-Param: ${route}, URL: ${req.url}`);

        if (route === 'health') {
            return res.status(200).json({
                status: 'ok',
                time: new Date().toISOString(),
                env: {
                    has_url: !!process.env.SUPABASE_URL,
                    has_key: !!(process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY)
                }
            });
        }

        if (route === 'products') return await productsHandler(req, res);
        if (route === 'categories') return await categoriesHandler(req, res);
        if (route === 'currencies') return await currenciesHandler(req, res);
        if (route === 'orders') return await ordersHandler(req, res);
        if (route === 'cart') return await cartHandler(req, res);
        if (route === 'crypto-wallets') return await cryptoWalletsHandler(req, res);

        // Fallback or missed routes
        return res.status(404).json({
            error: 'Shop endpoint not found',
            debug: { route, url: req.url, query: req.query }
        });
    } catch (error) {
        console.error('[Shop Router] CRASH:', error);
        return res.status(500).json({
            error: 'Internal Server Error (api/[route].js)',
            message: error.message,
            stack: error.stack
        });
    }
}
