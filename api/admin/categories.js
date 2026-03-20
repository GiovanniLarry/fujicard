import categoriesHandler from '../_logic/admin-categories.js';
import categoriesIdHandler from '../_logic/admin-categories-byId.js';
export default async function handler(req, res) {
    if (req.query.id) return await categoriesIdHandler(req, res);
    return await categoriesHandler(req, res);
}
