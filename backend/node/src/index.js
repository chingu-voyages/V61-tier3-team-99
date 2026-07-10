require('dotenv').config();
const express = require('express');
const cors = require('cors');
const wordsRouter = require('./routes/words');

const app = express();

app.use(
  cors({
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim()),
  }),
);
app.use(express.json());

app.use(wordsRouter);

// macOS AirPlay Receiver squats on port 5000, so default to 5001
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
