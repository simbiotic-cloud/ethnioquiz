import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // GET /api/entities — return all entities
    if (req.method === 'GET') {
      const data = await redis.get('eq3_entities');
      if (data) {
        return res.json(typeof data === 'string' ? JSON.parse(data) : data);
      }
      return res.json({ entities: {} });
    }

    // POST /api/entities — save all entities (from admin)
    if (req.method === 'POST') {
      const body = req.body;
      if (!body || !body.entities) {
        return res.status(400).json({ error: 'Missing entities data' });
      }
      await redis.set('eq3_entities', JSON.stringify(body));
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Entities error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
