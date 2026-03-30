import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const PREFIX = 'ent_v3:';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const keys = await redis.keys(PREFIX + '*');
      const entities = {};
      for (const key of keys) {
        const id = key.replace(PREFIX, '');
        const raw = await redis.get(key);
        if (raw) {
          entities[id] = typeof raw === 'string' ? JSON.parse(raw) : raw;
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
        const val = typeof entity === 'string' ? entity : JSON.stringify(entity);
        await redis.set(PREFIX + id, val);
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
