import { createContext, useState, useCallback, type ReactNode } from "react";

interface HighContrastContextValue {
  isHighContrast: boolean;
  toggle: () => void;
}

export const HighContrastContext =
  createContext<HighContrastContextValue | null>(null);

const STORAGE_KEY = "highContrastMode";

const getInitial = (): boolean => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === "true";
  } catch {}
  try {
    return window.matchMedia("(prefers-contrast: more)").matches;
  } catch {
    return false;
  }
};

const setStored = (value: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {}
};

export const HighContrastProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isHighContrast, setHighContrast] = useState(getInitial);

  const toggle = useCallback(() => {
    setHighContrast((prev) => {
      const next = !prev;
      setStored(next);
      return next;
    });
  }, []);

  return (
    <HighContrastContext.Provider value={{ isHighContrast, toggle }}>
      {children}
    </HighContrastContext.Provider>
  );
};
