import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
export const Route = createFileRoute('/reset-password')({
  head: () => ({ meta: [{ title: 'Nueva contraseña · BiAn Beauty' }, { name: 'description', content: 'Crea una nueva contraseña para tu cuenta de BiAn Beauty.' }, { property: 'og:title', content: 'Nueva contraseña · BiAn Beauty' }, { property: 'og:description', content: 'Crea una nueva contraseña para tu cuenta.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: ResetPassword,
});
function ResetPassword() {
  const [password, setPassword] = useState(''); const navigate = useNavigate();
  return <div className="grid min-h-screen place-items-center bg-background px-5"><form className="w-full max-w-md space-y-4 rounded-3xl border border-border bg-card p-7" onSubmit={async (e) => { e.preventDefault(); const { error } = await supabase.auth.updateUser({ password }); if (error) { toast.error('El enlace venció. Pide uno nuevo.'); return; } toast.success('Contraseña actualizada'); navigate({ to: '/', replace: true }); }}>
    <h1 className="serif-title text-2xl font-bold">Nueva contraseña</h1>
    <input type="password" minLength={6} required aria-label="Nueva contraseña" className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
    <Button className="w-full" type="submit">Guardar</Button>
  </form></div>;
}
