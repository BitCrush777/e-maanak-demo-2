import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { api } from '../services/api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'OWNER' | 'OFFICER' | 'ADMIN';
  status: string;
}

const DEMO_USERS: Record<string, User> = {
  OWNER: {
    id: 'demo-owner-id',
    email: 'owner@emaanak.demo',
    fullName: 'Sovereign Agro Logistics Ltd.',
    role: 'OWNER',
    status: 'ACTIVE',
  },
  OFFICER: {
    id: 'demo-officer-id',
    email: 'officer@emaanak.demo',
    fullName: 'Inspector Rajesh Kumar',
    role: 'OFFICER',
    status: 'ACTIVE',
  },
  ADMIN: {
    id: 'demo-admin-id',
    email: 'admin@emaanak.demo',
    fullName: 'Admin - Legal Metrology Division',
    role: 'ADMIN',
    status: 'ACTIVE',
  },
};

interface AuthContextType {
  user: User | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signInAsDemo: (role: 'OWNER' | 'OFFICER' | 'ADMIN') => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for demo user first
    const savedDemoUser = localStorage.getItem('emaanak_demo_user');
    if (savedDemoUser) {
      try {
        const parsed = JSON.parse(savedDemoUser);
        setUser(parsed);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('emaanak_demo_user');
      }
    }

    // Otherwise check Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.access_token) {
        localStorage.setItem('access_token', session.access_token);
        loadProfile();
      } else {
        setLoading(false);
      }
    });

    // Listen for Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.access_token) {
        localStorage.setItem('access_token', session.access_token);
        await loadProfile();
      } else if (!localStorage.getItem('emaanak_demo_user')) {
        localStorage.removeItem('access_token');
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile() {
    try {
      const result = await api.getProfile();
      if (result.data) {
        setUser(result.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    // Check if it's one of the demo accounts
    if (email === 'owner@emaanak.demo') {
      signInAsDemo('OWNER');
      return {};
    }
    if (email === 'officer@emaanak.demo') {
      signInAsDemo('OFFICER');
      return {};
    }
    if (email === 'admin@emaanak.demo') {
      signInAsDemo('ADMIN');
      return {};
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      return {};
    } catch (err: any) {
      return { error: { message: err.message || 'Authentication failed.' } };
    }
  }

  function signInAsDemo(role: 'OWNER' | 'OFFICER' | 'ADMIN') {
    const demoUser = DEMO_USERS[role];
    setUser(demoUser);
    localStorage.setItem('emaanak_demo_user', JSON.stringify(demoUser));
    localStorage.setItem('access_token', `demo-token-${role.toLowerCase()}`);
    setLoading(false);
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Ignore Supabase signout error in demo mode
    }
    await api.logout();
    localStorage.removeItem('access_token');
    localStorage.removeItem('emaanak_demo_user');
    setUser(null);
    setSession(null);
  }

  async function refreshProfile() {
    await loadProfile();
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signInAsDemo,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
