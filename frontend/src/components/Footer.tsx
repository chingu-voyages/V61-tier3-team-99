import { ExternalLink, History, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useHighContrast } from "../hooks/useHighContrast";

const Footer = () => {
  const { isHighContrast } = useHighContrast();

  return (
    <footer
      className={`border-t ${
        isHighContrast
          ? "border-border/70 bg-background"
          : "border-border/60 bg-background/60 backdrop-blur-md backdrop-saturate-150"
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-widest uppercase">
              Wordle-ish
            </h2>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              An open source Wordle clone, with a few extra modes.
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-3 text-sm sm:justify-end">
            <Link
              to="/team"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 font-medium transition-colors hover:bg-foreground/[0.12] hover:text-foreground cursor-pointer"
            >
              <Users className="h-4 w-4" />
              Meet the Team
            </Link>
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 font-medium transition-colors hover:bg-foreground/[0.12] hover:text-foreground cursor-pointer"
            >
              <Trophy className="h-4 w-4" />
              Leaderboard
            </Link>
            <Link
              to="/history"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 font-medium transition-colors hover:bg-foreground/[0.12] hover:text-foreground cursor-pointer"
            >
              <History className="h-4 w-4" />
              History
            </Link>
            <a
              href="https://github.com/chingu-voyages/V61-tier3-team-99"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 font-medium transition-colors hover:bg-foreground/[0.12] hover:text-foreground cursor-pointer"
            >
                <ExternalLink className="h-4 w-4" />
              View on GitHub
            </a>
          </nav>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:justify-between">
          
          <p>© {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;