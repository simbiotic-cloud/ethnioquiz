import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// One-time cleanup: migrate old JSON-format entries to new name-only format
// GET /api/cleanup-ranks?secret=ethnioquiz2026
export default async function handler(req, res) {
  if (req.query.secret !== 'ethnioquiz2026') return res.status(403).json({ error: 'Forbidden' });

  try {
    const keys = await redis.keys('ranks:*');
    const report = {};

    for (const key of keys) {
      const gameId = key.replace('ranks:', '');
      const raw = await redis.zrange(key, 0, -1, { rev: true, withScores: true });

      // Collect best score per player name
      const bestScores = {};
      for (const item of raw) {
        let name, score;
        if (typeof item === 'object' && 'score' in item && 'member' in item) {
          score = Number(item.score);
          try {
            const parsed = JSON.parse(item.member);
            name = parsed.name || item.member;
          } catch (e) {
            name = String(item.member);
          }
        }
        if (name && (!bestScores[name] || score > bestScores[name])) {
          bestScores[name] = score;
        }
      }

      // Delete old key and recreate with clean data
      await redis.del(key);
      for (const [name, score] of Object.entries(bestScores)) {
        await redis.zadd(key, { score, member: name });
      }

      report[gameId] = bestScores;
    }

    return res.json({ ok: true, cleaned: report });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
