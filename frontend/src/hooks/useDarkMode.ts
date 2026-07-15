import { useEffect, useState } from 'react';

// Shared global state and listeners to keep multiple hook instances in sync
const listeners = new Set<() => void>();
let globalIsDark = typeof window !== 'undefined' ? localStorage.getItem('theme') === 'dark' : false;

function setGlobalIsDark(val: boolean) {
  globalIsDark = val;
  listeners.forEach((listener) => listener());
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

  // Update HTML class list and localStorage when state changes
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleDark = () => setGlobalIsDark(!isDark);

  return { isDark, toggleDark };
}
