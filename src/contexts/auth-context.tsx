"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserAction, signOutAction } from "@/actions/auth";
import type { PbUser } from "@/lib/pocketbase";

interface AuthState {
  user: PbUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  /** Seeds the signed-in user after a sign-in/sign-up Server Action. This
   *  provider sits in the root layout, so a client-side transition into /app
   *  never remounts it and its one-shot mount effect never re-runs. */
  setUser: (user: PbUser | null) => void;
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
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, signOut, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
