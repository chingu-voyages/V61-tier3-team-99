import { Link } from "react-router-dom";
import { House } from "lucide-react";

const Header = () => {
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
      </div>
    </header>
  );
};

export default Header;
