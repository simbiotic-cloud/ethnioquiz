import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // GET /api/entities — rebuild from individual keys
    if (req.method === 'GET') {
      const keys = await redis.keys('entity:*');
      const entities = {};
      for (const key of keys) {
        const id = key.replace('entity:', '');
        const data = await redis.get(key);
        if (data) {
          entities[id] = typeof data === 'string' ? JSON.parse(data) : data;
        }
      }
      return res.json({ entities });
    }

    // POST /api/entities — save each entity as separate key
    if (req.method === 'POST') {
      const body = req.body;
      if (!body || !body.entities) {
        return res.status(400).json({ error: 'Missing entities data' });
      }

      let saved = 0;
      for (const [id, entity] of Object.entries(body.entities)) {
        await redis.set(`entity:${id}`, JSON.stringify(entity));
        saved++;
      }

      return res.json({ ok: true, saved });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Entities error:', err);
    return res.status(500).json({ error: 'Internal error', details: err.message });
  }
}
