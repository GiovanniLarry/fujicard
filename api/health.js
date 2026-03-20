import healthHandler from './_logic/health.js';
export default async function handler(req, res) {
    return await healthHandler(req, res);
}
