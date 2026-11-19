import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { primaryRole, type AppRole } from '@/lib/roles';

type AuthState = { user: User | null; role: AppRole | null; name: string; loading: boolean; refresh: () => Promise<void>; signOut: () => Promise<void> };
const Context = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    const { data } = await supabase.auth.getUser();
    const current = data.user ?? null;
    setUser(current);
    if (current) {
      const [{ data: roles }, { data: profile }] = await Promise.all([
        supabase.from('user_roles').select('role').eq('user_id', current.id),
        supabase.from('profiles').select('full_name').eq('id', current.id).maybeSingle(),
      ]);
      setRole(primaryRole((roles ?? []).map((r) => r.role)));
      setName(profile?.full_name ?? '');
    } else { setRole(null); setName(''); }
    setLoading(false);
  };
  useEffect(() => {
    void refresh();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT' && event !== 'USER_UPDATED') return;
      setTimeout(() => { void refresh(); if (event !== 'SIGNED_OUT') void queryClient.invalidateQueries(); }, 0);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  const signOut = async () => { await queryClient.cancelQueries(); queryClient.clear(); await supabase.auth.signOut(); };
  return <Context.Provider value={{ user, role, name, loading, refresh, signOut }}>{children}</Context.Provider>;
}
export function useAuth() { const value = useContext(Context); if (!value) throw new Error('Auth provider missing'); return value; }
