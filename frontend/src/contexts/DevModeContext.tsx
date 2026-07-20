import { useState, useCallback, type ReactNode } from "react";
import { DevModeContext } from "./dev-mode-context";

const STORAGE_KEY = "devMode";

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

export const DevModeProvider = ({ children }: { children: ReactNode }) => {
  const [enabled, setEnabled] = useState(getInitial);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      setStored(next);
      return next;
    });
  }, []);

  return (
    <DevModeContext.Provider value={{ enabled, toggle }}>
      {children}
    </DevModeContext.Provider>
  );
};
