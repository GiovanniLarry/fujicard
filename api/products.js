import productsHandler from './_logic/products.js';
export default async function handler(req, res) {
    return await productsHandler(req, res);
}
