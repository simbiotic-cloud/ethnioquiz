import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Use a single hash: eq3_ent with field per entity
  const HASH_KEY = 'eq3_ent';

  try {
    if (req.method === 'GET') {
      const all = await redis.hgetall(HASH_KEY);
      const entities = {};
      if (all) {
        for (const [id, val] of Object.entries(all)) {
          try {
            entities[id] = typeof val === 'string' ? JSON.parse(val) : val;
          } catch(e) { entities[id] = val; }
        }
      }
      return res.json({ entities });
    }

    if (req.method === 'POST') {
      const body = req.body;
      if (!body || !body.entities) {
        return res.status(400).json({ error: 'Missing entities data' });
      }

      let saved = 0;
      for (const [id, entity] of Object.entries(body.entities)) {
        await redis.hset(HASH_KEY, { [id]: JSON.stringify(entity) });
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
