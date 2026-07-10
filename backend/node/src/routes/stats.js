const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// GET /api/stats/:userId — return stats row or default zeros
router.get('/api/stats/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const { rows } = await pool.query(
      'SELECT * FROM player_stats WHERE user_id = $1',
      [userId],
    );

    if (rows.length === 0) {
      return res.json({
        games_played: 0,
        games_won: 0,
        current_streak: 0,
        max_streak: 0,
        guess_distribution: [0, 0, 0, 0, 0, 0],
        win_percentage: 0,
      });
    }

    const s = rows[0];
    res.json({
      games_played: s.games_played,
      games_won: s.games_won,
      current_streak: s.current_streak,
      max_streak: s.max_streak,
      guess_distribution: s.guess_distribution,
      win_percentage:
        s.games_played > 0
          ? Math.round((s.games_won / s.games_played) * 100)
          : 0,
    });
  } catch (err) {
    console.error('GET /api/stats/:userId failed:', err.message);
    res.status(500).json({ error: 'Database unavailable' });
  }
});

// POST /api/stats/record — upsert a game result
router.post('/api/stats/record', async (req, res) => {
  const { userId, didWin, guessCount } = req.body;

  if (typeof userId !== 'string' || !userId.trim() || userId.length > 255) {
    return res.status(400).json({ error: 'Invalid or missing userId (max 255 characters)' });
  }

  if (typeof didWin !== 'boolean') {
    return res.status(400).json({ error: 'didWin must be a boolean' });
  }

  if (didWin && (!Number.isInteger(guessCount) || guessCount < 1 || guessCount > 6)) {
    return res.status(400).json({ error: 'guessCount must be an integer between 1 and 6' });
  }

  try {
    // Ensure a row exists so the subsequent UPDATE always has something to modify
    await pool.query(
      `INSERT INTO player_stats (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
      [userId],
    );

    if (didWin) {
      // Atomic array element modification via subscript syntax to prevent race conditions
      const { rows: updated } = await pool.query(
        `UPDATE player_stats SET
          games_played = games_played + 1,
          games_won = games_won + 1,
          current_streak = current_streak + 1,
          max_streak = GREATEST(max_streak, current_streak + 1),
          guess_distribution[$2] = guess_distribution[$2] + 1
        WHERE user_id = $1
        RETURNING *`,
        [userId, guessCount],
      );

      const s = updated[0];
      return res.json({
        games_played: s.games_played,
        games_won: s.games_won,
        current_streak: s.current_streak,
        max_streak: s.max_streak,
        guess_distribution: s.guess_distribution,
        win_percentage: s.games_played > 0 ? Math.round((s.games_won / s.games_played) * 100) : 0,
      });
    } else {
      const { rows } = await pool.query(
        `UPDATE player_stats SET
          games_played = games_played + 1,
          current_streak = 0
        WHERE user_id = $1
        RETURNING *`,
        [userId],
      );

      const s = rows[0];
      return res.json({
        games_played: s.games_played,
        games_won: s.games_won,
        current_streak: s.current_streak,
        max_streak: s.max_streak,
        guess_distribution: s.guess_distribution,
        win_percentage: s.games_played > 0 ? Math.round((s.games_won / s.games_played) * 100) : 0,
      });
    }
  } catch (err) {
    console.error('POST /api/stats/record failed:', err.message);
    return res.status(500).json({ error: 'Database unavailable' });
  }
});

module.exports = router;
