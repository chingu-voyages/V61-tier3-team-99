require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./pool');

const DB_DIR = path.join(__dirname, '..', '..', 'db');
const LENGTHS = [5, 6];

const readWordFile = (filename, length) => {
  const filePath = path.join(DB_DIR, 'words', filename);
  const pattern = new RegExp(`^[a-z]{${length}}$`);
  return fs
    .readFileSync(filePath, 'utf8')
    .split('\n')
    .map((w) => w.trim().toLowerCase())
    .filter((w) => pattern.test(w));
};

const seed = async () => {
  const schema = fs.readFileSync(path.join(DB_DIR, 'schema.sql'), 'utf8');
  await pool.query(schema);

  // Idempotent: re-running never duplicates rows, and is_answer can only be
  // promoted (true wins), so seeding guesses after answers can't demote them.
  const insert = `
    INSERT INTO words (word, length, is_answer)
    SELECT w, $2::int, $3::boolean FROM unnest($1::text[]) AS w
    ON CONFLICT (word)
    DO UPDATE SET is_answer = EXCLUDED.is_answer OR words.is_answer
  `;

  for (const length of LENGTHS) {
    const guesses = readWordFile(`guesses-${length}.txt`, length);
    const answers = readWordFile(`answers-${length}.txt`, length);
    const answerSet = new Set(answers);

    const plainGuesses = guesses.filter((w) => !answerSet.has(w));
    await pool.query(insert, [plainGuesses, length, false]);
    await pool.query(insert, [answers, length, true]);
  }

  const { rows } = await pool.query(
    'SELECT count(*)::int AS total, count(*) FILTER (WHERE is_answer)::int AS answers FROM words',
  );
  console.log(
    `Seeded words table: ${rows[0].total} words total, ${rows[0].answers} answers.`,
  );
};

seed()
  .then(() => pool.end())
  .catch((err) => {
    console.error('Seed failed:', err.message);
    pool.end();
    process.exit(1);
  });
