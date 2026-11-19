import { useAuth } from '@/lib/auth';
export type DemoProfile = 'administrador' | 'cliente' | 'emprendedor';
/** Bridges the older panels to the real signed-in role; access comes from server roles only. */
export function useDemoAccess() {
  const { role, name, signOut } = useAuth();
  const profile: DemoProfile | null = role === 'admin' ? 'administrador' : role;
  return { profile, name, enter: (_p: DemoProfile, _n: string) => {}, exit: () => { void signOut(); } };
}
