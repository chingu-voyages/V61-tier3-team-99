import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { fetchGameHistory, type GameHistoryEntry } from "../lib/gameHistory";
import GameHistoryItem from "../components/GameHistoryItem";

const PAGE_SIZE = 50;
type FilterTab = "all" | "hourly" | "infinity";

const HistoryPage = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<FilterTab>("all");

  useEffect(() => {
    let cancelled = false;
    fetchGameHistory(user, PAGE_SIZE, 0).then((data) => {
      if (cancelled) return;
      setHistory(data);
      setHasMore(data.length === PAGE_SIZE);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [user]);

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const more = await fetchGameHistory(user, PAGE_SIZE, history.length);
    setHistory((prev) => [...prev, ...more]);
    setHasMore(more.length === PAGE_SIZE);
    setLoadingMore(false);
  };

  const filtered = useMemo(() => {
    if (filter === "all") return history;
    return history.filter((e) => e.mode === filter);
  }, [history, filter]);

  const tabs: { label: string; value: FilterTab }[] = [
    { label: "All", value: "all" },
    { label: "Infinity", value: "infinity" },
    { label: "Hourly", value: "hourly" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="text-center text-2xl font-bold tracking-widest uppercase">
        Game History
      </h1>

      {!loading && history.length > 0 && (
        <div className="flex justify-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-3 py-1.5 text-sm rounded-md cursor-pointer transition-colors ${
                filter === tab.value
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-center text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          {filter === "all"
            ? "No games played yet. Start guessing!"
            : `No ${filter} games played yet.`}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {filtered.map((entry, i) => (
              <GameHistoryItem
                key={entry.id ?? `${entry.word}-${entry.created_at}-${i}`}
                entry={entry}
              />
            ))}
          </div>
          {hasMore && filter === "all" && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default HistoryPage;
