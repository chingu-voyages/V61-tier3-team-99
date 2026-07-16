import { useState, useCallback, type ReactNode } from "react";
import { HardModeContext } from "./hard-mode-context";

const STORAGE_KEY = "hardMode";

const getInitial = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    // localStorage may be unavailable (private browsing, storage blocked)
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

export const HardModeProvider = ({ children }: { children: ReactNode }) => {
  const [enabled, setEnabled] = useState(getInitial);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      setStored(next);
      return next;
    });
  }, []);

  return (
    <HardModeContext.Provider value={{ enabled, toggle }}>
      {children}
    </HardModeContext.Provider>
  );
};
