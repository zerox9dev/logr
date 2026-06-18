"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthError, User } from "@supabase/supabase-js";
import { auth } from "@/api";

interface AuthState {
  user: User | null;
  loading: boolean;
  signInWithGoogle: (next?: string) => Promise<{ error: AuthError | null }>;
  signInWithMagicLink: (email: string, next?: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async (next?: string) => {
    const { error } = await auth.signInWithGoogle(next);
    return { error };
  };

  const signInWithMagicLink = async (email: string, next?: string) => {
    const { error } = await auth.signInWithMagicLink(email, next);
    return { error };
  };

  const signOut = async () => {
    const { error } = await auth.signOut();
    if (error) console.error(error);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithMagicLink, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
