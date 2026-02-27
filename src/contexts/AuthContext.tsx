import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, options?: { rememberMe?: boolean }) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_PREFS_KEY = 'ibmssp_admin_auth_prefs';
const REMEMBER_ME_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

type AuthPrefs = {
  rememberMe: boolean;
  lastLoginAt: number;
};

function readAuthPrefs(): AuthPrefs | null {
  try {
    const raw = localStorage.getItem(AUTH_PREFS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthPrefs>;
    if (typeof parsed.lastLoginAt !== 'number') return null;
    return {
      rememberMe: !!parsed.rememberMe,
      lastLoginAt: parsed.lastLoginAt,
    };
  } catch {
    return null;
  }
}

function writeAuthPrefs(prefs: AuthPrefs) {
  localStorage.setItem(AUTH_PREFS_KEY, JSON.stringify(prefs));
}

function clearAuthPrefs() {
  localStorage.removeItem(AUTH_PREFS_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async (supaUser: User) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', supaUser.id)
      .single();

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', supaUser.id);

    setUser({
      id: supaUser.id,
      email: profile?.email || supaUser.email || '',
      name: profile?.name || supaUser.email?.split('@')[0] || '',
      role: roles?.[0]?.role || 'admin',
    });
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          clearAuthPrefs();
        }

        if (session?.user) {
          const prefs = readAuthPrefs();
          const maxAge = prefs?.rememberMe ? REMEMBER_ME_TTL_MS : SESSION_TTL_MS;
          const isExpired = prefs ? (Date.now() - prefs.lastLoginAt > maxAge) : false;

          if (isExpired) {
            await supabase.auth.signOut();
            setUser(null);
            setIsLoading(false);
            return;
          }

          if (prefs) {
            writeAuthPrefs({ ...prefs, lastLoginAt: Date.now() });
          }

          // Use setTimeout to avoid potential deadlocks with Supabase client
          setTimeout(() => loadProfile(session.user), 0);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const prefs = readAuthPrefs();
        const maxAge = prefs?.rememberMe ? REMEMBER_ME_TTL_MS : SESSION_TTL_MS;
        const isExpired = prefs ? (Date.now() - prefs.lastLoginAt > maxAge) : false;

        if (isExpired) {
          supabase.auth.signOut();
          setUser(null);
        } else {
          if (prefs) writeAuthPrefs({ ...prefs, lastLoginAt: Date.now() });
          loadProfile(session.user);
        }
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (
    email: string,
    password: string,
    options?: { rememberMe?: boolean }
  ): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return false;

      writeAuthPrefs({
        rememberMe: !!options?.rememberMe,
        lastLoginAt: Date.now(),
      });
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    clearAuthPrefs();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
