import { useEffect, useState } from 'react';

export type LightTheme = 'sage' | 'teal';

const STORAGE_KEY = 'lightTheme';

const listeners = new Set<() => void>();

const getInitialTheme = (): LightTheme => {
  if (typeof window === 'undefined') return 'sage';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'teal') return 'teal';
  return 'sage';
};

let globalTheme = getInitialTheme();

function setGlobalTheme(val: LightTheme) {
  globalTheme = val;
  listeners.forEach((listener) => listener());
}

function applyThemeClass(theme: LightTheme) {
  const root = window.document.documentElement;
  root.classList.toggle('theme-teal', theme === 'teal');
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
