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
