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

      // Merge: read existing, merge new on top, write back
      let existing = {};
      const raw = await redis.get(KEY);
      if (raw) {
        const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        existing = data.entities || {};
      }

      // Merge new entities (new data wins)
      for (const [id, entity] of Object.entries(body.entities)) {
        existing[id] = entity;
      }

      // Write back as single key
      await redis.set(KEY, JSON.stringify({ entities: existing }));

      return res.json({ ok: true, saved: Object.keys(body.entities).length });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Entities error:', err);
    return res.status(500).json({ error: 'Internal error', details: err.message });
  }
}
