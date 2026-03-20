import categoriesHandler from './_logic/categories.js';
import productsHandler from './_logic/products.js';
import healthHandler from './_logic/health.js';

export default async function handler(req, res) {
    const { route } = req.query;
    if (route === 'categories') return await categoriesHandler(req, res);
    if (route === 'products') return await productsHandler(req, res);
    if (route === 'health') return await healthHandler(req, res);
    return res.status(404).json({ error: 'Shop endpoint not found', route });
}
