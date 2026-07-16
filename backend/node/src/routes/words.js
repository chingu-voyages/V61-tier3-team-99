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

router.get('/api/word/hourly', async (req, res) => {
  const length = req.query.length === undefined ? 5 : Number(req.query.length);
  if (!Number.isInteger(length) || length < 3 || length > 10) {
    return res
      .status(400)
      .json({ error: 'length must be an integer between 3 and 10' });
  }

  // Computed server-side (never trust a client-supplied bucket) so every
  // visitor within the same UTC hour is served the same word.
  const hourBucket = Math.floor(Date.now() / 3_600_000);

  try {
    const countResult = await pool.query(
      'SELECT COUNT(*)::int AS count FROM words WHERE length = $1 AND is_answer = true',
      [length],
    );
    const count = countResult.rows[0].count;
    if (count === 0) {
      return res.status(404).json({
        error: `No answer words of length ${length} — has the database been seeded? (npm run db:seed)`,
      });
    }

    // ORDER BY id (not random()) is what makes this deterministic: the same
    // offset always returns the same row, so hourBucket % count always maps
    // to the same word until the table is reseeded.
    const offset = hourBucket % count;
    const { rows } = await pool.query(
      'SELECT word FROM words WHERE length = $1 AND is_answer = true ORDER BY id LIMIT 1 OFFSET $2',
      [length, offset],
    );
    res.json({ word: rows[0].word, length, hourBucket });
  } catch (err) {
    console.error('GET /api/word/hourly failed:', err.message);
    res.status(500).json({ error: 'Database unavailable' });
  }
});

router.get('/api/word/daily', async (req, res) => {
  const length = req.query.length === undefined ? 5 : Number(req.query.length);
  if (!Number.isInteger(length) || length < 3 || length > 10) {
    return res
      .status(400)
      .json({ error: 'length must be an integer between 3 and 10' });
  }

  // Matches JS's Date.getTimezoneOffset() convention: seconds WEST of UTC,
  // positive when local time is behind UTC. UTC-12 (the westmost real
  // timezone) is +43200; UTC+14 (the eastmost, e.g. Kiribati) is -50400.
  const utcOffsetSeconds = Number(req.query.utcOffsetSeconds);
  if (
    !Number.isInteger(utcOffsetSeconds) ||
    utcOffsetSeconds < -50400 ||
    utcOffsetSeconds > 43200
  ) {
    return res.status(400).json({
      error: 'utcOffsetSeconds must be an integer between -50400 and 43200',
    });
  }

  // Client-supplied because, unlike an hour boundary, local midnight can't
  // be derived from the server's own clock alone -- see
  // supabase/migrations/0006_daily_word.sql for the full tradeoff writeup.
  const dayBucket = Math.floor((Date.now() / 1000 - utcOffsetSeconds) / 86400);

  try {
    const countResult = await pool.query(
      'SELECT COUNT(*)::int AS count FROM words WHERE length = $1 AND is_answer = true',
      [length],
    );
    const count = countResult.rows[0].count;
    if (count === 0) {
      return res.status(404).json({
        error: `No answer words of length ${length} — has the database been seeded? (npm run db:seed)`,
      });
    }

    // ORDER BY id (not random()) is what makes this deterministic: the same
    // offset always returns the same row, so dayBucket % count always maps
    // to the same word until the table is reseeded. JS's % is remainder, not
    // modulo, so it can go negative for a negative dayBucket (e.g. a mocked
    // clock in tests, or a system clock before 1970) -- the extra +count/%
    // count normalizes that back into [0, count).
    const offset = ((dayBucket % count) + count) % count;
    const { rows } = await pool.query(
      'SELECT word FROM words WHERE length = $1 AND is_answer = true ORDER BY id LIMIT 1 OFFSET $2',
      [length, offset],
    );
    res.json({ word: rows[0].word, length, dayBucket });
  } catch (err) {
    console.error('GET /api/word/daily failed:', err.message);
    res.status(500).json({ error: 'Database unavailable' });
  }
});

module.exports = router;
