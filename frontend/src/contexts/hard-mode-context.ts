import { createContext } from "react";

export interface HardModeContextValue {
  enabled: boolean;
  toggle: () => void;
}

export const HardModeContext = createContext<HardModeContextValue | null>(null);
