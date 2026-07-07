import { useContext } from "react";
import { HighContrastContext } from "../contexts/HighContrastContext";

export const useHighContrast = () => {
  const context = useContext(HighContrastContext);
  if (!context) {
    throw new Error(
      "useHighContrast must be used within a HighContrastProvider",
    );
  }
  return context;
};
