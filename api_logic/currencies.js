export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        return res.json({
            rates: {
                GBP: 1,
                USD: 1.27,
                EUR: 1.17,
                JPY: 190.5
            },
            currencies: ['GBP', 'USD', 'EUR', 'JPY']
        });
    }

    res.status(405).json({ error: 'Method not allowed' });
}
