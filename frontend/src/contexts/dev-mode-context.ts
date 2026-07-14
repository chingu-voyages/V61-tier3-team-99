import { createContext } from "react";

export interface DevModeContextValue {
  enabled: boolean;
  toggle: () => void;
}

export const DevModeContext = createContext<DevModeContextValue | null>(null);
