import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const MAX_PER_GAME = 50;

  try {
    // GET /api/rankings?game=japan_vs_china
    if (req.method === 'GET') {
      const { game } = req.query;
      if (game) {
        // Get rankings for a specific game
        const entries = await redis.zrange(`ranks:${game}`, 0, MAX_PER_GAME - 1, { rev: true, withScores: true });
        // entries = [member, score, member, score, ...]
        const rankings = [];
        for (let i = 0; i < entries.length; i += 2) {
          const data = JSON.parse(entries[i]);
          rankings.push({ name: data.name, score: entries[i + 1], date: data.date });
        }
        return res.json({ rankings });
      } else {
        // Get all game IDs that have rankings
        const keys = await redis.keys('ranks:*');
        const all = {};
        for (const key of keys) {
          const gameId = key.replace('ranks:', '');
          const entries = await redis.zrange(key, 0, 9, { rev: true, withScores: true });
          all[gameId] = [];
          for (let i = 0; i < entries.length; i += 2) {
            const data = JSON.parse(entries[i]);
            all[gameId].push({ name: data.name, score: entries[i + 1], date: data.date });
          }
        }
        return res.json({ rankings: all });
      }
    }

    // POST /api/rankings — { game, name, score }
    if (req.method === 'POST') {
      const { game, name, score } = req.body;
      if (!game || !name || score === undefined) {
        return res.status(400).json({ error: 'Missing game, name, or score' });
      }

      const member = JSON.stringify({ name, date: Date.now(), id: Math.random().toString(36).substr(2, 8) });
      await redis.zadd(`ranks:${game}`, { score: Number(score), member });

      // Trim to top MAX_PER_GAME
      const count = await redis.zcard(`ranks:${game}`);
      if (count > MAX_PER_GAME) {
        await redis.zremrangebyrank(`ranks:${game}`, 0, count - MAX_PER_GAME - 1);
      }

      // Get current position
      const rank = await redis.zrevrank(`ranks:${game}`, member);

      return res.json({ ok: true, position: rank !== null ? rank + 1 : null });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Rankings error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
