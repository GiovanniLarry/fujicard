const categoriesHandler = require('./_logic/categories.js');
const productsHandler = require('./_logic/products.js');
const healthHandler = require('./_logic/health.js');

module.exports = async function handler(req, res) {
    const { route } = req.query;
    if (route === 'categories') return await categoriesHandler(req, res);
    if (route === 'products') return await productsHandler(req, res);
    if (route === 'health') return await healthHandler(req, res);
    return res.status(404).json({ error: 'Shop endpoint not found', route });
};
