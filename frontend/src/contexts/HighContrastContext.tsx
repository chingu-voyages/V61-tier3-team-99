import { useState, useCallback, type ReactNode } from "react";
import { HighContrastContext } from "./high-contrast-context";

const STORAGE_KEY = "highContrastMode";

const getInitial = (): boolean => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === "true";
  } catch {
    // localStorage may be unavailable (private browsing, storage blocked)
  }
  try {
    return window.matchMedia("(prefers-contrast: more)").matches;
  } catch {
    // matchMedia may be unavailable in some environments
    return false;
  }
};

const setStored = (value: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // localStorage may be unavailable (private browsing, storage blocked)
  }
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
