import { useEffect, useState } from 'react';

const STORAGE_KEY = 'theme';

// Shared global state and listeners to keep multiple hook instances in sync
const listeners = new Set<() => void>();

// Falls back to the OS/browser color scheme only when the user hasn't made
// an explicit choice yet — once they toggle, localStorage always wins.
const getInitialIsDark = (): boolean => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) return stored === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

let globalIsDark = getInitialIsDark();

function setGlobalIsDark(val: boolean) {
  globalIsDark = val;
  listeners.forEach((listener) => listener());
}

// Keeps following the OS theme live as long as the user hasn't made an
// explicit choice — stops the moment they toggle, since toggleDark's
// localStorage write below makes the "stored" check above start winning.
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (localStorage.getItem(STORAGE_KEY) !== null) return;
    setGlobalIsDark(e.matches);
  });
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState(globalIsDark);

  // Subscribe this hook instance to global updates
  useEffect(() => {
    const listener = () => setIsDark(globalIsDark);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  // Keeps the <html> class in sync with the current state. Deliberately
  // does not persist here — persisting on every change (including ones
  // driven by the system-preference listener above) would "lock in" a
  // value the user never actually chose, defeating that listener the
  // moment it fires once. Persistence only happens on an explicit toggle.
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleDark = () => {
    const next = !isDark;
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    setGlobalIsDark(next);
  };

  return { isDark, toggleDark };
}
