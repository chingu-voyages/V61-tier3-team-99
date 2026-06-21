import { ExternalLink, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/70 bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-widest uppercase">
              MatrixWord
            </h2>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Matte tech aesthetics for focused wordplay and calm momentum.
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-3 text-sm sm:justify-end">
            <Link
              to="/team"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 font-medium transition-colors hover:bg-muted"
            >
              <Users className="h-4 w-4" />
              Meet the Team
            </Link>
            <a
              href="https://github.com/chingu-voyages/V61-tier3-team-99"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 font-medium transition-colors hover:bg-muted"
            >
                <ExternalLink className="h-4 w-4" />
              View on GitHub
            </a>
          </nav>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:justify-between">
          <p>How to Play · Privacy Policy · Support · Leaderboards</p>
          <p>© 2024 MatrixWord. Matte Tech Aesthetics.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;