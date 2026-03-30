import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const KEY = 'ethnioquiz_all_entities';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const raw = await redis.get(KEY);
      if (raw) {
        const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return res.json(data);
      }
      return res.json({ entities: {} });
    }

    if (req.method === 'POST') {
      const body = req.body;
      if (!body || !body.entities) {
        return res.status(400).json({ error: 'Missing entities data' });
      }

      // Read existing, merge, write back
      let existing = {};
      try {
        const raw = await redis.get(KEY);
        if (raw) {
          const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
          existing = data.entities || data || {};
        }
      } catch(e) {}

      // Merge: new data always wins
      for (const [id, entity] of Object.entries(body.entities)) {
        existing[id] = typeof entity === 'string' ? JSON.parse(entity) : entity;
      }

      // Write as raw string to prevent Upstash auto-parsing issues
      const payload = JSON.stringify({ entities: existing });
      await redis.set(KEY, payload);

      return res.json({ ok: true, saved: Object.keys(body.entities).length });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Entities error:', err);
    return res.status(500).json({ error: 'Internal error', details: err.message });
  }
}
