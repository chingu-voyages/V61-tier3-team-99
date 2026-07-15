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
        <div className="absolute right-4 flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHelp(true)}
            aria-label="How to play"
          >
            <CircleHelp />
          </Button>
          <Button
            variant={isHighContrast ? "secondary" : "ghost"}
            size="icon"
            onClick={toggle}
            aria-pressed={isHighContrast}
            title={isHighContrast ? "Disable high contrast" : "Enable high contrast"}
            aria-label={isHighContrast ? "Disable high contrast mode" : "Enable high contrast mode"}
          >
            <Contrast />
          </Button>
          <Button
            variant={isDark ? "secondary" : "ghost"}
            size="icon"
            onClick={toggleDark}
            aria-pressed={isDark}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun /> : <Moon />}
          </Button>
          {!loading && configured && user && canUseDevMode && (
            <Button
              variant={devModeEnabled ? "secondary" : "ghost"}
              size="icon"
              onClick={toggleDevMode}
              aria-pressed={devModeEnabled}
              title={devModeEnabled ? "Disable Dev Mode" : "Enable Dev Mode"}
              aria-label="Toggle Dev Mode"
            >
              <Bug />
            </Button>
          )}
          {!loading && configured && (
            <>
              {user ? (
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut />
                  Sign out
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={signInWithGithub}>
                  <LogIn />
                  Sign in with GitHub
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
