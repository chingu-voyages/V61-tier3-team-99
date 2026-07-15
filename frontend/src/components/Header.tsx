import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { House, LogIn, LogOut, Contrast, CircleHelp, Bug, Sun, Moon } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useHighContrast } from "../hooks/useHighContrast";
import { useDevMode } from "../hooks/useDevMode";
import { useDarkMode } from "../hooks/useDarkMode";
import { isDevModeAllowed } from "../config/devMode";
import { Button } from "./ui/button";
import HowToPlayModal from "./HowToPlayModal";

const Header = () => {
  const { user, loading, configured, signInWithGithub, signOut } = useAuth();
  const { isHighContrast, toggle } = useHighContrast();
  const { enabled: devModeEnabled, toggle: toggleDevMode } = useDevMode();
  const { isDark, toggleDark } = useDarkMode();
  const canUseDevMode = isDevModeAllowed(user?.user_metadata?.user_name);
  const location = useLocation();
  const [showHelp, setShowHelp] = useState(false);
  // The home page shows "Wordle-ish" bigger in its own hero, so the header
  // only needs it on every other page.
  const isHome = location.pathname === "/";

  return (
    <header className="w-full border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-center px-4 relative">
        <Link to="/" className="absolute left-4 text-foreground/60 hover:text-foreground transition-colors">
          <House size={20} />
        </Link>
        {!isHome && (
          <Link to="/">
            <h1 className="text-xl font-bold tracking-widest uppercase hover:opacity-70 transition-opacity">
              Wordle-ish
            </h1>
          </Link>
        )}
        {/* Column 3: Right Actions (Scales down gracefully on mobile) */}
        <div className="flex items-center justify-end gap-0.5 sm:gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9"
            onClick={() => setShowHelp(true)}
            aria-label="How to play"
          >
            <CircleHelp className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant={isHighContrast ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9"
            onClick={toggle}
            aria-pressed={isHighContrast}
            title={isHighContrast ? "Disable high contrast" : "Enable high contrast"}
            aria-label={isHighContrast ? "Disable high contrast mode" : "Enable high contrast mode"}
          >
            <Contrast className="h-4 w-4 sm:h-5 sm:w-5" />
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
          {!loading && configured && user && canUseDevMode && (
            <Button
              variant={devModeEnabled ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9"
              onClick={toggleDevMode}
              aria-pressed={devModeEnabled}
              title={devModeEnabled ? "Disable Dev Mode" : "Enable Dev Mode"}
              aria-label="Toggle Dev Mode"
            >
              <Bug className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          )}
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
    </header>
  );
};

export default Header;
