const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5001";

// Fetches the secret word from the backend. The timeout keeps the worst case
// snappy so callers can fall back to the client-side word list quickly when
// the backend isn't running.
export async function fetchRandomWord(length: number): Promise<string> {
  const res = await fetch(`${API_URL}/api/word/random?length=${length}`, {
    signal: AbortSignal.timeout(2500),
  });
  if (!res.ok) {
    throw new Error(`API responded with ${res.status}`);
  }
  const data: { word: string } = await res.json();
  return data.word;
}

// Fetches the current hour's shared word. The server computes the hour
// bucket (never trust a client-supplied one) so every visitor gets the same
// word, and returns it so the frontend can key localStorage off the
// authoritative bucket instead of a possibly clock-skewed local one.
export async function fetchHourlyWord(
  length: number,
): Promise<{ word: string; hourBucket: number }> {
  const res = await fetch(`${API_URL}/api/word/hourly?length=${length}`, {
    signal: AbortSignal.timeout(2500),
  });
  if (!res.ok) {
    throw new Error(`API responded with ${res.status}`);
  }
  const data: { word: string; hourBucket: number } = await res.json();
  return data;
}
