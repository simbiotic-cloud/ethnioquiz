import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // GET /api/stats — return all stats
    if (req.method === 'GET') {
      const [visitors, gamesPlayed, gamesPerCat] = await Promise.all([
        redis.get('stats:visitors') || 0,
        redis.get('stats:games_played') || 0,
        redis.hgetall('stats:games_per_cat') || {},
      ]);

      return res.json({
        visitors: Number(visitors) || 0,
        gamesPlayed: Number(gamesPlayed) || 0,
        gamesPerCat: gamesPerCat || {},
      });
    }

    // POST /api/stats — { action: 'visit' | 'game_played', game?: string }
    if (req.method === 'POST') {
      const { action, game } = req.body;

      if (action === 'visit') {
        const count = await redis.incr('stats:visitors');
        return res.json({ ok: true, visitors: count });
      }

      if (action === 'game_played' && game) {
        const [total] = await Promise.all([
          redis.incr('stats:games_played'),
          redis.hincrby('stats:games_per_cat', game, 1),
        ]);
        return res.json({ ok: true, total });
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
