import productsHandler from '../_logic/admin-products.js';
import productsIdHandler from '../_logic/admin-products-byId.js';
export default async function handler(req, res) {
    if (req.query.id) return await productsIdHandler(req, res);
    return await productsHandler(req, res);
}
