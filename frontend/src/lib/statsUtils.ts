const STATS_API = "http://localhost:5001/api/stats";

const getAnonymousUserId = (): string => {
  let anonymousId = localStorage.getItem("anonymous_user_id");
  if (!anonymousId) {
    anonymousId = "guest_" + Math.random().toString(36).substring(2, 11);
    localStorage.setItem("anonymous_user_id", anonymousId);
  }
  return anonymousId;
};

export const saveGameResult = async (didWin: boolean, guessCount: number) => {
  try {
    await fetch(`${STATS_API}/record`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: getAnonymousUserId(),
        didWin,
        guessCount,
      }),
    });
  } catch (error) {
    console.error("Error saving stats to database:", error);
  }
};

export { getAnonymousUserId };
