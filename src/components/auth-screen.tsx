import { useState } from 'react';
import { Crown, Store, UserRound, MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { signupRole } from '@/lib/roles';

const input = 'w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring';
export function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'sent'>('login');
  const [role, setRole] = useState<'cliente' | 'emprendedor'>('cliente');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [name, setName] = useState(''); const [business, setBusiness] = useState('');
  const [busy, setBusy] = useState(false); const [sentText, setSentText] = useState('');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message.includes('confirm') ? 'Primero confirma tu correo con el enlace que te enviamos.' : 'Correo o contraseña incorrectos.');
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { full_name: name.trim(), role: signupRole(role), business_name: business.trim() } } });
        if (error) throw new Error(error.message);
        setSentText(`Te enviamos un enlace a ${email}. Ábrelo para activar tu cuenta y luego inicia sesión.`); setMode('sent');
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw new Error(error.message);
        setSentText(`Te enviamos un enlace a ${email} para crear una nueva contraseña.`); setMode('sent');
      }
    } catch (error) { toast.error(error instanceof Error ? error.message : 'No se pudo continuar'); }
    setBusy(false);
  };
  return <div className="grid min-h-screen place-items-center bg-background px-5 py-10">
    <div className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-premium">
      <div className="mb-6 text-center"><Crown className="mx-auto size-9 text-gold" /><h1 className="serif-title mt-2 text-3xl font-bold text-primary">BiAn <span className="text-gold">♡</span> Beauty</h1><p className="mt-1 text-sm text-muted-foreground">Tu belleza, tu tiempo, tu poder.</p></div>
      {mode === 'sent' ? <div className="space-y-4 text-center"><MailCheck className="mx-auto size-10 text-primary" /><p className="text-sm">{sentText}</p><Button className="w-full" onClick={() => setMode('login')}>Volver a iniciar sesión</Button></div> :
      <form className="space-y-4" onSubmit={submit}>
        <h2 className="serif-title text-xl font-bold">{mode === 'login' ? 'Inicia sesión' : mode === 'signup' ? 'Crea tu cuenta' : 'Recupera tu contraseña'}</h2>
        {mode === 'signup' && <>
          <div className="grid grid-cols-2 gap-2">{([['cliente', 'Soy clienta', UserRound], ['emprendedor', 'Soy emprendedora', Store]] as const).map(([value, label, Icon]) => <Button key={value} type="button" variant={role === value ? 'default' : 'outline'} onClick={() => setRole(value)}><Icon />{label}</Button>)}</div>
          <label className="block space-y-1 text-sm">Tu nombre<input className={input} required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
          {role === 'emprendedor' && <label className="block space-y-1 text-sm">Nombre de tu negocio<input className={input} required value={business} onChange={(e) => setBusiness(e.target.value)} /></label>}
        </>}
        <label className="block space-y-1 text-sm">Correo electrónico<input type="email" className={input} required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
        {mode !== 'forgot' && <label className="block space-y-1 text-sm">Contraseña<input type="password" minLength={6} className={input} required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>}
        <Button className="w-full" type="submit" disabled={busy}>{mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Crear cuenta' : 'Enviar enlace'}</Button>
        <div className="flex flex-wrap justify-between gap-2 text-sm">
          {mode === 'login' ? <><button type="button" className="text-primary underline" onClick={() => setMode('signup')}>Crear cuenta</button><button type="button" className="text-muted-foreground underline" onClick={() => setMode('forgot')}>Olvidé mi contraseña</button></> : <button type="button" className="text-primary underline" onClick={() => setMode('login')}>Ya tengo cuenta</button>}
        </div>
      </form>}
    </div>
  </div>;
}
