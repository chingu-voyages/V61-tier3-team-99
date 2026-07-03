import { createContext } from "react";
import type { User } from "@supabase/supabase-js";

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
