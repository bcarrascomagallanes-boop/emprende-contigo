import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
export type DemoProfile = 'administrador' | 'cliente' | 'emprendedor';
export function parseDemoProfile(value: string | null): DemoProfile | null {
  return value === 'administrador' || value === 'cliente' || value === 'emprendedor' ? value : null;
}
const Context = createContext<{ profile: DemoProfile | null; name: string; enter: (profile: DemoProfile, name: string) => void; exit: () => void } | null>(null);
export function DemoAccessProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<DemoProfile | null>(null);
  const [name, setName] = useState('');
  useEffect(() => {
    setProfile(parseDemoProfile(sessionStorage.getItem('bian-demo-profile')));
    setName(sessionStorage.getItem('bian-demo-name') || '');
  }, []);
  const enter = (next: DemoProfile, nextName: string) => {
    setProfile(next); setName(nextName);
    sessionStorage.setItem('bian-demo-profile', next); sessionStorage.setItem('bian-demo-name', nextName);
  };
  const exit = () => { setProfile(null); setName(''); sessionStorage.removeItem('bian-demo-profile'); sessionStorage.removeItem('bian-demo-name'); sessionStorage.removeItem('bian-emprendedora-v1-s'); };
  return <Context.Provider value={{ profile, name, enter, exit }}>{children}</Context.Provider>;
}
export function useDemoAccess() { const value = useContext(Context); if (!value) throw new Error('Demo access provider missing'); return value; }