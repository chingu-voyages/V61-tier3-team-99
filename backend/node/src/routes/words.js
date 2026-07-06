const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// Cheap liveness check that doesn't touch the database.
router.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.get('/api/word/random', async (req, res) => {
  const length = req.query.length === undefined ? 5 : Number(req.query.length);
  if (!Number.isInteger(length) || length < 3 || length > 10) {
    return res
      .status(400)
      .json({ error: 'length must be an integer between 3 and 10' });
  }

  try {
    // random() over the ~2.3k answer rows is plenty fast at this scale.
    const { rows } = await pool.query(
      'SELECT word FROM words WHERE length = $1 AND is_answer = true ORDER BY random() LIMIT 1',
      [length],
    );
    if (rows.length === 0) {
      return res.status(404).json({
        error: `No answer words of length ${length} — has the database been seeded? (npm run db:seed)`,
      });
    }
    res.json({ word: rows[0].word, length });
  } catch (err) {
    console.error('GET /api/word/random failed:', err.message);
    res.status(500).json({ error: 'Database unavailable' });
  }
});

module.exports = router;
