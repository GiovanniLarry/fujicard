import productsHandler from '../api_logic/products.js';
import categoriesHandler from '../api_logic/categories.js';
import currenciesHandler from '../api_logic/currencies.js';
import healthHandler from '../api_logic/health.js';
import ordersHandler from '../api_logic/orders.js';
import cartHandler from '../api_logic/cart.js';
import cryptoWalletsHandler from '../api_logic/crypto-wallets.js';

export default async function handler(req, res) {
    try {
        const url = req.url || '';

        // Ensure sub-handlers receive the right context
        if (url.includes('/products')) return await productsHandler(req, res);
        if (url.includes('/categories')) return await categoriesHandler(req, res);
        if (url.includes('/currencies')) return await currenciesHandler(req, res);
        if (url.includes('/health')) return await healthHandler(req, res);
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
