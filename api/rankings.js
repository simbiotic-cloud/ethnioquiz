import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

function parseEntry(member, score) {
  try {
    // Old format: JSON string {"name":"x","date":123}
    const data = typeof member === 'string' ? JSON.parse(member) : member;
    if (data.name) return { name: data.name, score: Number(score), date: data.date || 0 };
  } catch (e) {}
  // New format: member IS the name string
  return { name: String(member), score: Number(score), date: 0 };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const MAX_PER_GAME = 50;

  try {
    if (req.method === 'GET') {
      const { game } = req.query;

      if (game) {
        const raw = await redis.zrange(`ranks:${game}`, 0, MAX_PER_GAME - 1, { rev: true, withScores: true });
        const rankings = [];

        // Upstash returns [{score, member}, ...] or [member, score, ...]
        if (Array.isArray(raw)) {
          for (const item of raw) {
            if (typeof item === 'object' && item !== null && 'score' in item && 'member' in item) {
              rankings.push(parseEntry(item.member, item.score));
            }
          }
          // Fallback: interleaved [member, score, member, score]
          if (rankings.length === 0) {
            for (let i = 0; i < raw.length; i += 2) {
              if (i + 1 < raw.length) rankings.push(parseEntry(raw[i], raw[i + 1]));
            }
          }
        }

        rankings.sort((a, b) => b.score - a.score);
        return res.json({ rankings });

      } else {
        const keys = await redis.keys('ranks:*');
        const all = {};
        for (const key of keys) {
          const gameId = key.replace('ranks:', '');
          const raw = await redis.zrange(key, 0, 9, { rev: true, withScores: true });
          all[gameId] = [];
          if (Array.isArray(raw)) {
            for (const item of raw) {
              if (typeof item === 'object' && item !== null && 'score' in item && 'member' in item) {
                all[gameId].push(parseEntry(item.member, item.score));
              }
            }
            if (all[gameId].length === 0) {
              for (let i = 0; i < raw.length; i += 2) {
                if (i + 1 < raw.length) all[gameId].push(parseEntry(raw[i], raw[i + 1]));
              }
            }
          }
          all[gameId].sort((a, b) => b.score - a.score);
        }
        return res.json({ rankings: all });
      }
    }

    if (req.method === 'POST') {
      const { game, name, score } = req.body;
      if (!game || !name || score === undefined) {
        return res.status(400).json({ error: 'Missing game, name, or score' });
      }

      // Use name as the member key — this ensures only 1 entry per player
      // zadd with GT flag: only update if new score is GREATER than existing
      const member = name;
      const numScore = Number(score);

      // Check current best for this player
      const currentScore = await redis.zscore(`ranks:${game}`, member);

      if (currentScore === null || numScore > Number(currentScore)) {
        // New player or new best — update
        await redis.zadd(`ranks:${game}`, { score: numScore, member });
      }

      const count = await redis.zcard(`ranks:${game}`);
      if (count > MAX_PER_GAME) {
        await redis.zremrangebyrank(`ranks:${game}`, 0, count - MAX_PER_GAME - 1);
      }

      const rank = await redis.zrevrank(`ranks:${game}`, member);
      return res.json({ ok: true, position: rank !== null ? rank + 1 : null });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Rankings error:', err);
    return res.status(500).json({ error: 'Internal error', details: err.message });
  }
}
