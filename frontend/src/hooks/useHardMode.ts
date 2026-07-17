import { useContext } from "react";
import { HardModeContext } from "../contexts/hard-mode-context";

export const useHardMode = () => {
  const context = useContext(HardModeContext);
  if (!context) {
    throw new Error("useHardMode must be used within a HardModeProvider");
  }
  return context;
};
