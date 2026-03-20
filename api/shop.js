export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { route } = req.query;
        return res.status(200).json({
            message: 'Fujicard API (Isolation Test)',
            status: 'online',
            route: route || 'not provided',
            time: new Date().toISOString(),
            env: {
                has_url: !!process.env.SUPABASE_URL,
                has_key: !!(process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY)
            }
        });
    } catch (error) {
        return res.status(500).json({ error: 'Minimal Handler Crash', message: error.message });
    }
}
