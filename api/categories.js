import categoriesHandler from './_logic/categories.js';
export default async function handler(req, res) {
    return await categoriesHandler(req, res);
}
