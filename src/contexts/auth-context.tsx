"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserAction, signOutAction } from "@/actions/auth";
import type { PbUser } from "@/lib/pocketbase";

interface AuthState {
  user: PbUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<PbUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void getCurrentUserAction().then((current) => {
      if (!active) return;
      setUser(current);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const signOut = useCallback(async () => {
    await signOutAction();
    setUser(null);
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
