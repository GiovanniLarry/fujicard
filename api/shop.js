import productsHandler from '../api_logic/products.js';
import categoriesHandler from '../api_logic/categories.js';
import currenciesHandler from '../api_logic/currencies.js';
import healthHandler from '../api_logic/health.js';
import ordersHandler from '../api_logic/orders.js';
import cartHandler from '../api_logic/cart.js';
import cryptoWalletsHandler from '../api_logic/crypto-wallets.js';

export default async function handler(req, res) {
    const url = req.url || '';

    // Log for debugging (user can check Vercel Logs)
    console.log(`[Shop Router] Handling URL: ${url}`);

    // Check if Supabase vars are set
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.error('[Shop Router] CRITICAL: SUPABASE_URL or SUPABASE_ANON_KEY is missing');
    }

    if (url.includes('/products')) return productsHandler(req, res);
    if (url.includes('/categories')) return categoriesHandler(req, res);
    if (url.includes('/currencies')) return currenciesHandler(req, res);
    if (url.includes('/health')) return healthHandler(req, res);
    if (url.includes('/orders')) return ordersHandler(req, res);
    if (url.includes('/cart')) return cartHandler(req, res);
    if (url.includes('/crypto-wallets')) return cryptoWalletsHandler(req, res);

    // Fallback if URL doesn't match standard Vercel format
    return res.status(404).json({
        error: 'Shop endpoint not found',
        debug: { url, method: req.method }
    });
}
