import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { House, LogIn, LogOut, Settings, Sun, Moon } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useHighContrast } from "../hooks/useHighContrast";
import { useDarkMode } from "../hooks/useDarkMode";
import { Button } from "./ui/button";
import HowToPlayModal from "./HowToPlayModal";
import SettingsModal from "./SettingsModal";

const Header = () => {
  const { user, loading, configured, signInWithGithub, signOut } = useAuth();
  const { isHighContrast } = useHighContrast();
  const { isDark, toggleDark } = useDarkMode();
  const location = useLocation();
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  // The home page shows "Wordle-ish" bigger in its own hero, so the header
  // only needs it on every other page.
  const isHome = location.pathname === "/";

  return (
    <header
      className={`w-full border-b ${
        isHighContrast
          ? "border-border bg-background"
          : "border-border/60 bg-background/60 backdrop-blur-md backdrop-saturate-150"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-center px-4 relative">
        <div className="absolute left-4 flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" asChild>
            <Link to="/" aria-label="Home">
              <House className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
        </div>
        {!isHome && (
          <Link to="/" className="cursor-pointer">
            <h1 className="text-xl font-bold tracking-widest uppercase hover:bg-foreground/[0.12] hover:text-foreground transition-colors rounded-lg px-2 py-1 -mx-2 -my-1">
              Wordle-ish
            </h1>
          </Link>
        )}
        {/* Column 3: Right Actions (Scales down gracefully on mobile) */}
        <div className="absolute right-4 flex items-center gap-0.5 sm:gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9"
            onClick={() => setShowSettings(true)}
            aria-label="Settings"
          >
            <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant={isDark ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9"
            onClick={toggleDark}
            aria-pressed={isDark}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
          {!loading && configured && (
            <>
              {user ? (
                <Button variant="ghost" size="sm" className="h-8 px-2 sm:h-9 sm:px-3" onClick={signOut}>
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden md:inline ml-1 text-xs sm:text-sm">Sign out</span>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="h-8 px-2 sm:h-9 sm:px-3" onClick={signInWithGithub}>
                  <LogIn className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden md:inline ml-1 text-xs sm:text-sm">Sign in</span>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      <HowToPlayModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onOpenHowToPlay={() => setShowHelp(true)}
      />
    </header>
  );
};

export default Header;
