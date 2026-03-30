// API route to verify Stripe purchases by email
// In production, this would call the Stripe API to check payment history
// For now, we use a simple Redis-based receipt system

import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // POST /api/restore — { email } → check if email has purchases
    if (req.method === 'POST') {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email required' });

      const normalizedEmail = email.toLowerCase().trim();

      // Check stored purchases for this email
      const purchases = await redis.hgetall(`purchases:${normalizedEmail}`);

      if (purchases && Object.keys(purchases).length > 0) {
        return res.json({
          found: true,
          purchases: Object.entries(purchases).map(([product, data]) => {
            const d = typeof data === 'string' ? JSON.parse(data) : data;
            return { product, date: d.date, amount: d.amount };
          })
        });
      }

      return res.json({ found: false, purchases: [] });
    }

    // This endpoint is also called by Stripe webhook or after successful payment
    // POST /api/restore?action=register — { email, product }
    if (req.method === 'PUT') {
      const { email, product, amount } = req.body;
      if (!email || !product) return res.status(400).json({ error: 'Email and product required' });

      const normalizedEmail = email.toLowerCase().trim();
      await redis.hset(`purchases:${normalizedEmail}`, {
        [product]: JSON.stringify({ date: Date.now(), amount: amount || 0 })
      });

      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Restore error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
