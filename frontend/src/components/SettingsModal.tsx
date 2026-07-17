import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { X, Users, ExternalLink } from "lucide-react";
import { useHighContrast } from "../hooks/useHighContrast";
import { useHardMode } from "../hooks/useHardMode";
import { useDarkMode } from "../hooks/useDarkMode";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Switch = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) => (
  <button
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onChange}
    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
      checked ? "bg-foreground" : "bg-muted-foreground/30"
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-sm ring-0 transition-transform duration-200 ${
        checked ? "translate-x-4" : "translate-x-0"
      }`}
    />
  </button>
);

const SettingRow = ({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground dark:text-zinc-400">
        {description}
      </p>
    </div>
    <Switch checked={checked} onChange={onChange} label={title} />
  </div>
);

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { isHighContrast, toggle: toggleHighContrast } = useHighContrast();
  const { enabled: hardModeEnabled, toggle: toggleHardMode } = useHardMode();
  const { isDark, toggleDark } = useDarkMode();
  const location = useLocation();
  // The footer (which normally carries these) is hidden on the game screen —
  // see App.tsx — so Settings is the only place left to reach them from there.
  const isGameScreen = location.pathname === "/game";

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/50" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm dark:bg-[#13141F] dark:border-[#1E1F2F] dark:text-[#F4F6F9]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>

        <div className="mt-6 space-y-5">
          <SettingRow
            title="High Contrast"
            description="Use colorblind-friendly tile colors."
            checked={isHighContrast}
            onChange={toggleHighContrast}
          />
          <SettingRow
            title="Hard Mode"
            description="Revealed hints must be used in later guesses. Applies to your next game, not one already in progress."
            checked={hardModeEnabled}
            onChange={toggleHardMode}
          />
          <SettingRow
            title="Dark Mode"
            description="Switch to a low-light color theme."
            checked={isDark}
            onChange={toggleDark}
          />
        </div>

        {isGameScreen && (
          <div className="mt-6 space-y-4 border-t border-border/60 pt-5">
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              <Link
                to="/team"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 font-medium transition-colors hover:bg-foreground/[0.12] hover:text-foreground cursor-pointer"
            >
              <Users className="h-4 w-4" />
              Meet the Team
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
            </div>
            <p className="text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()}
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default SettingsModal;
