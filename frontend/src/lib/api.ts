import { supabase } from "./supabaseClient";

// Fetches a random secret word via the Supabase get_random_word RPC (see
// supabase/migrations/0002_words.sql). The timeout keeps the worst case
// snappy so callers can fall back to the client-side word list quickly when
// Supabase isn't configured/reachable.
export async function fetchRandomWord(length: number): Promise<string> {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase
    .rpc("get_random_word", { p_length: length })
    .abortSignal(AbortSignal.timeout(2500));
  if (error) throw new Error(error.message);
  if (!data) throw new Error(`No answer words of length ${length}`);
  return data;
}

// Fetches the current hour's shared word via the Supabase get_hourly_word
// RPC. The hour bucket is computed from Postgres's own now() inside that
// function -- never trust a client-supplied one -- so every visitor gets the
// same word, and returns it so the frontend can key localStorage off the
// authoritative bucket instead of a possibly clock-skewed local one.
export async function fetchHourlyWord(
  length: number,
): Promise<{ word: string; hourBucket: number }> {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase
    .rpc("get_hourly_word", { p_length: length })
    .abortSignal(AbortSignal.timeout(2500))
    .single();
  if (error) throw new Error(error.message);
  if (!data) throw new Error(`No answer words of length ${length}`);
  // No generated Database types are wired up for this project, so the RPC
  // response comes back untyped -- the shape here matches what
  // get_hourly_word actually returns (verified against the migration).
  const row = data as { word: string; hour_bucket: number };
  return { word: row.word, hourBucket: Number(row.hour_bucket) };
}

// Fetches the current local day's shared word via the Supabase
// get_daily_word RPC. Unlike fetchHourlyWord, this passes the caller's UTC
// offset so the day boundary lands on the caller's local midnight rather
// than a UTC one -- local midnight, unlike an hour boundary, isn't the same
// instant everywhere, so the server has no way to derive it from its own
// clock alone. Worst case a caller misreports its offset to see a boundary
// word slightly early, the same low-stakes category as a skewed client
// clock already tolerated for the Hourly badge -- see
// supabase/migrations/0006_daily_word.sql for the full writeup.
export async function fetchDailyWord(
  length: number,
  utcOffsetSeconds: number,
): Promise<{ word: string; dayBucket: number }> {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase
    .rpc("get_daily_word", {
      p_length: length,
      p_utc_offset_seconds: utcOffsetSeconds,
    })
    .abortSignal(AbortSignal.timeout(2500))
    .single();
  if (error) throw new Error(error.message);
  if (!data) throw new Error(`No answer words of length ${length}`);
  const row = data as { word: string; day_bucket: number };
  return { word: row.word, dayBucket: Number(row.day_bucket) };
}
