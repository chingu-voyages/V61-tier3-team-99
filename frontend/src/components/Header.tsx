import { Link } from "react-router-dom";
import { House, LogIn, LogOut, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useHighContrast } from "../hooks/useHighContrast";
import { Button } from "./ui/button";

const Header = () => {
  const { user, loading, configured, signInWithGithub, signOut } = useAuth();
  const { isHighContrast, toggle } = useHighContrast();

  return (
    <header className="w-full border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-center px-4 relative">
        <Link to="/" className="absolute left-4 text-foreground/60 hover:text-foreground transition-colors">
          <House size={20} />
        </Link>
        <Link to="/">
          <h1 className="text-xl font-bold tracking-widest uppercase hover:opacity-70 transition-opacity">
            Wordle-ish
          </h1>
        </Link>
        <div className="absolute right-4 flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            title={isHighContrast ? "Disable high contrast" : "Enable high contrast"}
            aria-label={isHighContrast ? "Disable high contrast mode" : "Enable high contrast mode"}
          >
            {isHighContrast ? <Eye /> : <EyeOff />}
          </Button>
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
    </header>
  );
};

export default Header;
