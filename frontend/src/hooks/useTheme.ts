import { useEffect, useState } from 'react';

export type LightTheme = 'sage' | 'teal' | 'coral' | 'rose' | 'ocean';

const STORAGE_KEY = 'lightTheme';

const listeners = new Set<() => void>();

const getInitialTheme = (): LightTheme => {
  if (typeof window === 'undefined') return 'teal';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && ['sage', 'teal', 'coral', 'rose', 'ocean'].includes(stored)) {
    return stored as LightTheme;
  }
  return 'teal';
};

let globalTheme = getInitialTheme();

function setGlobalTheme(val: LightTheme) {
  globalTheme = val;
  listeners.forEach((listener) => listener());
}

const THEME_CLASSES: Record<LightTheme, string> = {
  sage: '',
  teal: 'theme-teal',
  coral: 'theme-coral',
  rose: 'theme-rose',
  ocean: 'theme-ocean',
};

function applyThemeClass(theme: LightTheme) {
  const root = window.document.documentElement;
  Object.values(THEME_CLASSES).forEach((cls) => {
    if (cls) root.classList.remove(cls);
  });
  const cls = THEME_CLASSES[theme];
  if (cls) root.classList.add(cls);
}

export function useTheme() {
  const [theme, setThemeState] = useState(globalTheme);

  useEffect(() => {
    const listener = () => setThemeState(globalTheme);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  const setTheme = (t: LightTheme) => {
    localStorage.setItem(STORAGE_KEY, t);
    setGlobalTheme(t);
  };

  return { theme, setTheme };
}
