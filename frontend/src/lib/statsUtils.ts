const STATS_API = `${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/stats`;

let memoryId: string | null = null;

const getAnonymousUserId = (): string => {
  try {
    let anonymousId = localStorage.getItem("anonymous_user_id");
    if (!anonymousId) {
      anonymousId = "guest_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("anonymous_user_id", anonymousId);
    }
    return anonymousId;
  } catch (e) {
    console.warn("localStorage unavailable, falling back to in-memory ID", e);
    if (!memoryId) {
      memoryId = "guest_" + Math.random().toString(36).substring(2, 11);
    }
    return memoryId;
  }
};

export const saveGameResult = async (didWin: boolean, guessCount: number) => {
  try {
    const res = await fetch(`${STATS_API}/record`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: getAnonymousUserId(),
        didWin,
        guessCount,
      }),
    });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (error) {
    console.error("Error saving stats to database:", error);
    return null;
  }
};

export { getAnonymousUserId };
