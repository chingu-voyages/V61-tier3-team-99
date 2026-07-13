import { createContext } from "react";

export interface HighContrastContextValue {
  isHighContrast: boolean;
  toggle: () => void;
}

export const HighContrastContext =
  createContext<HighContrastContextValue | null>(null);
