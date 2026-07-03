import { useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => !!supabase);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const signInWithGithub = async () => {
    if (!supabase) {
      console.warn("Supabase is not configured — set VITE_SUPABASE_URL/VITE_SUPABASE_PUBLISHABLE_KEY.");
      return;
    }
    await supabase.auth.signInWithOAuth({ provider: "github" });
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGithub, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
