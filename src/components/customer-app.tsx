import { createContext, useContext, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Crown, Heart, Home, MessageCircle, Gift, UserRound, Search, Scissors, Sparkles, Hand, ArrowRight, Clock, Send, Check, Flower2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { money, useAppointments, useBusinesses, useLiveUpdates, useMessages, useOffers, useServices, type Service } from '@/lib/data';
import hair from '@/assets/beauty-hair.jpg';

type CustomerState = { book: (service: Service) => void; chatWith: string | null; setChatWith: (id: string) => void };
const Context = createContext<CustomerState | null>(null);
function useCustomer() { const value = useContext(Context); if (!value) throw new Error('Customer provider missing'); return value; }
const input = 'w-full min-w-0 rounded-lg border border-input bg-card px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

export function CustomerProvider({ children }: { children: ReactNode }) {
  const { user, name } = useAuth(); const queryClient = useQueryClient(); const { data: businesses = [] } = useBusinesses();
  const [selected, book] = useState<Service | null>(null); const [chatWith, setChatWith] = useState<string | null>(null);
  const [date, setDate] = useState(''); const [time, setTime] = useState('');
  const today = new Date().toLocaleDateString('en-CA');
  const business = businesses.find((b) => b.id === selected?.business_id);
  return <Context.Provider value={{ book, chatWith, setChatWith }}>
    {children}
    <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) book(null); }}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg">
        <DialogTitle className="serif-title text-2xl">Tu próxima cita</DialogTitle>
        <DialogDescription>Elige la fecha y la hora. Tu emprendedora la verá en su agenda.</DialogDescription>
        {selected && <form className="space-y-4" onSubmit={async (event) => {
          event.preventDefault(); if (!user || !date || !time || date < today) return;
          const { error } = await supabase.from('appointments').insert({ business_id: selected.business_id, service_id: selected.id, service_name: selected.name, price: selected.price, client_id: user.id, client_name: name || user.email || '', date, time });
          if (error) { toast.error('No se pudo guardar la reserva'); return; }
          void queryClient.invalidateQueries({ queryKey: ['appointments'] });
          book(null); setDate(''); setTime(''); toast.success('Tu reserva fue enviada. Puedes verla en Mis reservas.');
        }}>
          <div className="border-b border-border pb-4"><p className="font-semibold">{selected.name}</p><p className="mt-1 text-sm text-muted-foreground">{business?.owner_name || business?.name} · {selected.minutes} min</p><p className="mt-2 text-xl font-bold text-primary">{money(selected.price)}</p></div>
          <div className="grid grid-cols-2 gap-3"><label className="block space-y-1 text-sm">Fecha<input type="date" className={input} min={today} required value={date} onChange={(e) => setDate(e.target.value)} /></label><label className="block space-y-1 text-sm">Hora<input type="time" className={input} required value={time} onChange={(e) => setTime(e.target.value)} /></label></div>
          <Button className="w-full" type="submit"><Check /> Reservar</Button>
        </form>}
      </DialogContent>
    </Dialog>
  </Context.Provider>;
}

const navigation = [
  { to: '/', label: 'Inicio', icon: Home }, { to: '/reservas', label: 'Mis reservas', icon: CalendarDays },
  { to: '/recompensas', label: 'Recompensas', icon: Gift }, { to: '/mensajes', label: 'Mensajes', icon: MessageCircle },
  { to: '/perfil', label: 'Mi perfil', icon: UserRound },
] as const;
export function CustomerShell({ children }: { children: ReactNode }) {
  const location = useLocation(); const { user, role, name, loading, signOut } = useAuth(); useLiveUpdates();
  if (loading) return null;
  if (!user || role !== 'cliente') return <div className="grid min-h-screen place-items-center bg-background"><Button asChild><Link to="/">Ir al inicio</Link></Button></div>;
  return <div className="min-h-screen bg-background pb-24 md:pb-8">
    <header className="border-b border-border bg-card"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-5">
      <Link to="/" className="flex items-center gap-3"><Crown className="size-7 text-gold" /><span className="serif-title text-2xl font-bold text-primary">BiAn <span className="text-gold">♡</span> Beauty</span></Link>
      <div className="flex items-center gap-2"><Button variant="ghost" asChild className="gap-2"><Link to="/perfil"><UserRound /><span className="hidden sm:inline">{name || 'Mi perfil'}</span></Link></Button><Button variant="outline" size="sm" onClick={() => void signOut()}>Salir</Button></div>
    </div></header>
    <div className="mx-auto hidden max-w-6xl items-center border-b border-border px-5 py-3 md:flex"><nav className="flex gap-2">{navigation.map((item) => <Button key={item.to} variant={location.pathname === item.to ? 'secondary' : 'ghost'} asChild><Link to={item.to}><item.icon />{item.label}</Link></Button>)}</nav></div>
    <main className="mx-auto max-w-6xl px-5 py-7">{children}</main>
    <nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-card px-1 pb-[env(safe-area-inset-bottom)] md:hidden">{navigation.map((item) => <Button key={item.to} asChild variant="ghost" className={`h-17 flex-col gap-1 px-0 text-[10px] ${location.pathname === item.to ? 'text-primary bg-muted' : 'text-muted-foreground'}`}><Link to={item.to}><item.icon className="size-5" />{item.label}</Link></Button>)}</nav>
  </div>;
}

export function CustomerHome() {
  const { name } = useAuth(); const { book, setChatWith } = useCustomer(); const navigate = useNavigate();
  const { data: businesses = [] } = useBusinesses(); const { data: services = [] } = useServices(); const { data: offers = [] } = useOffers();
  const [category, setCategory] = useState('Todos'); const [search, setSearch] = useState(''); const [chosen, setChosen] = useState('todas'); const [favorites, setFavorites] = useState<string[]>([]);
  const featured = businesses.find((b) => b.featured) ?? businesses[0];
  const owner = (id: string) => businesses.find((b) => b.id === id);
  const filtered = services.filter((s) => (chosen === 'todas' || s.business_id === chosen) && (category === 'Todos' || s.category === category) && `${s.name} ${owner(s.business_id)?.owner_name} ${owner(s.business_id)?.name}`.toLowerCase().includes(search.toLowerCase()));
  const write = (id: string) => { setChatWith(id); void navigate({ to: '/mensajes' }); };
  return <CustomerShell>
    <p className="mb-5 text-sm text-muted-foreground">¡Hola, {name.split(' ')[0] || 'hermosa'}! <span className="text-primary">♡</span></p>
    {featured && <section className="customer-hero relative isolate overflow-hidden">
      <img src={hair} width={1536} height={1024} className="absolute inset-0 -z-10 h-full w-full object-cover object-right" alt="Cabello largo y alisado en un salón de belleza" />
      <div className="max-w-[57%] py-9 pl-5 sm:py-12 sm:pl-9">
        <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase text-primary sm:text-xs"><Crown className="size-4 text-gold" /> Especialista destacada</p>
        <h1 className="serif-title text-3xl font-bold leading-tight text-foreground sm:text-4xl">{featured.owner_name || featured.name}</h1>
        <p className="mt-3 max-w-64 text-xs leading-relaxed text-primary sm:text-sm">{featured.description}</p>
        <div className="mt-5 flex flex-wrap gap-2"><Button onClick={() => { const s = services.find((i) => i.business_id === featured.id); if (s) book(s); }} className="text-xs sm:text-sm">Reservar <ArrowRight /></Button><Button variant="outline" onClick={() => write(featured.id)} className="text-xs sm:text-sm"><MessageCircle /> Escribirle</Button></div>
      </div>
    </section>}
    <section className="mb-8">
      <p className="mb-1 text-[10px] font-bold uppercase text-primary">Elige tu emprendedora</p>
      <div className="flex gap-2 overflow-x-auto pb-2"><Button variant={chosen === 'todas' ? 'default' : 'outline'} onClick={() => setChosen('todas')}>Todas</Button>{businesses.map((b) => <Button key={b.id} className="shrink-0" variant={chosen === b.id ? 'default' : 'outline'} onClick={() => setChosen(b.id)}>{b.featured && <Crown className="text-gold" />}{b.name}</Button>)}</div>
    </section>
    {offers.length > 0 && <section className="mb-8"><h2 className="serif-title mb-3 text-2xl font-bold">Ofertas para ti</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{offers.filter((o) => chosen === 'todas' || o.business_id === chosen).map((o) => <article key={o.id} className="rounded-lg border border-border bg-card p-4"><p className="flex items-center gap-2 text-xs font-bold text-primary"><Tag className="size-4" />{o.discount}% de descuento</p><h3 className="serif-title mt-1 text-lg font-bold">{o.title}</h3><p className="text-xs text-muted-foreground">{o.description}</p><p className="mt-2 text-xs">{owner(o.business_id)?.name}</p></article>)}</div></section>}
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><h2 className="serif-title text-2xl font-bold">¿Qué te gustaría hoy?</h2><div className="relative w-full sm:w-72"><Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" /><input aria-label="Buscar servicios" placeholder="Busca un servicio o especialista" className={`${input} pl-10`} value={search} onChange={(e) => setSearch(e.target.value)} /></div></div>
      <div className="mb-6 flex flex-wrap gap-2">{[{ label: 'Todos', icon: Sparkles }, { label: 'Cabello', icon: Scissors }, { label: 'Uñas', icon: Hand }, { label: 'Maquillaje', icon: Flower2 }].map((item) => <Button key={item.label} variant={category === item.label ? 'default' : 'outline'} onClick={() => setCategory(item.label)}><item.icon />{item.label}</Button>)}</div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((s) => <article key={s.id} className="flex flex-col rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between"><span className="text-[10px] font-semibold uppercase text-primary">{s.category}</span><Button variant="ghost" size="icon" aria-label={`Favorito ${s.name}`} onClick={() => setFavorites((p) => p.includes(s.id) ? p.filter((id) => id !== s.id) : [...p, s.id])}><Heart className={favorites.includes(s.id) ? 'fill-primary text-primary' : 'text-muted-foreground'} /></Button></div>
        <h3 className="serif-title mt-2 text-lg font-bold leading-snug">{s.name}</h3><p className="mt-2 text-xs text-muted-foreground">{owner(s.business_id)?.owner_name || owner(s.business_id)?.name}</p>
        <div className="mt-5 flex items-center justify-between"><span className="text-xl font-bold text-primary">{money(s.price)}</span><span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3" />{s.minutes} min</span></div>
        <div className="mt-4 flex gap-2"><Button variant="secondary" className="flex-1" onClick={() => book(s)}>Reservar <ArrowRight /></Button><Button variant="outline" size="icon" aria-label="Escribir a la emprendedora" onClick={() => write(s.business_id)}><MessageCircle /></Button></div>
      </article>)}</div>{filtered.length === 0 && <p className="py-8 text-center text-muted-foreground">No encontramos servicios con esa búsqueda.</p>}
    </section>
  </CustomerShell>;
}

function Heading({ title, subtitle }: { title: string; subtitle: string }) { return <div className="mb-7"><h1 className="serif-title text-3xl font-bold">{title}</h1><p className="mt-2 text-sm text-muted-foreground">{subtitle}</p></div>; }
export function CustomerBookings() {
  const { user } = useAuth(); const queryClient = useQueryClient(); const { data: businesses = [] } = useBusinesses();
  const { data: bookings = [] } = useAppointments({ clientId: user?.id });
  return <CustomerShell><Heading title="Mis reservas" subtitle="Tus próximos momentos de belleza." />{bookings.length === 0 ? <div className="py-12 text-center"><CalendarDays className="mx-auto mb-4 size-10 text-secondary" /><p className="mb-5 text-muted-foreground">Todavía no tienes reservas.</p><Button asChild><Link to="/">Buscar un servicio <ArrowRight /></Link></Button></div> : <div className="space-y-4">{bookings.map((b) => <article key={b.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-5"><div><span className={`text-xs font-semibold capitalize ${b.status === 'cancelada' ? 'text-destructive' : 'text-primary'}`}>{b.status}</span><h2 className="serif-title mt-1 text-xl font-bold">{b.service_name}</h2><p className="mt-1 text-sm text-muted-foreground">{businesses.find((x) => x.id === b.business_id)?.name} · {b.date} · {b.time}</p><p className="mt-2 font-bold text-primary">{money(b.price)}</p></div>{b.status !== 'cancelada' && b.status !== 'completada' && <Button variant="outline" onClick={async () => { const { error } = await supabase.from('appointments').update({ status: 'cancelada' }).eq('id', b.id); if (error) { toast.error('No se pudo cancelar'); return; } void queryClient.invalidateQueries({ queryKey: ['appointments'] }); toast.success('Reserva cancelada'); }}>Cancelar</Button>}</article>)}</div>}</CustomerShell>;
}
export function CustomerRewards() {
  const { user } = useAuth(); const { data: bookings = [] } = useAppointments({ clientId: user?.id });
  const points = bookings.filter((b) => b.status === 'completada').length * 50;
  return <CustomerShell><Heading title="Mis recompensas" subtitle="Ganas 50 puntos por cada cita completada." /><div className="flex flex-wrap items-center gap-6 border-y border-border py-8"><Crown className="size-12 text-gold" /><div><p className="serif-title text-3xl font-bold text-primary">{points} puntos</p><p className="mt-1 text-sm text-muted-foreground">{points >= 500 ? 'Nivel Oro' : points >= 200 ? 'Nivel Plata' : 'Nivel Bronce'}</p></div></div><h2 className="serif-title mb-4 mt-8 text-xl font-bold">Detalles que te encantarán</h2><div className="grid gap-4 sm:grid-cols-2">{[{ name: 'Mascarilla capilar nutritiva', points: 300 }, { name: 'Diseño de cejas con hilo', points: 500 }].map((r) => <article key={r.name} className="rounded-lg border border-border bg-card p-6"><Gift className="mb-4 size-7 text-primary" /><h3 className="serif-title text-xl font-bold">{r.name}</h3><p className="my-3 text-sm text-muted-foreground">{r.points} puntos</p><Button disabled={points < r.points} variant="secondary">{points >= r.points ? 'Pídelo en tu próxima cita' : `Te faltan ${r.points - points}`}</Button></article>)}</div></CustomerShell>;
}
export function CustomerMessages() {
  const { user, name } = useAuth(); const { chatWith, setChatWith } = useCustomer(); const queryClient = useQueryClient();
  const { data: businesses = [] } = useBusinesses(); const { data: messages = [] } = useMessages({ clientId: user?.id });
  const expert = chatWith ?? businesses[0]?.id; const [text, setText] = useState('');
  const current = businesses.find((b) => b.id === expert);
  return <CustomerShell><Heading title="Mis mensajes" subtitle="Conversa con tu emprendedora." /><div className="grid gap-6 md:grid-cols-[240px_1fr]"><aside className="flex gap-2 overflow-x-auto md:flex-col">{businesses.map((b) => <Button key={b.id} className="shrink-0 justify-start" variant={expert === b.id ? 'secondary' : 'ghost'} onClick={() => setChatWith(b.id)}>{b.featured ? <Crown className="text-gold" /> : <MessageCircle />}{b.name}</Button>)}</aside><section className="min-w-0 border border-border bg-card p-5"><h2 className="serif-title text-xl font-bold">{current?.name}</h2><div className="flex min-h-64 flex-col justify-end gap-3 py-5">{messages.filter((m) => m.business_id === expert).map((m) => <p key={m.id} className={`max-w-[85%] break-words rounded-lg px-4 py-3 text-sm ${m.sender_id === user?.id ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted'}`}>{m.body}</p>)}</div><form className="flex gap-2" onSubmit={async (e) => { e.preventDefault(); if (!text.trim() || !user || !expert) return; const { error } = await supabase.from('messages').insert({ business_id: expert, client_id: user.id, client_name: name || user.email || '', sender_id: user.id, body: text.trim() }); if (error) { toast.error('No se pudo enviar'); return; } setText(''); void queryClient.invalidateQueries({ queryKey: ['messages'] }); }}><input aria-label="Tu mensaje" className={input} value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe tu mensaje…" /><Button type="submit" size="icon" className="h-11 w-11 shrink-0" aria-label="Enviar mensaje"><Send /></Button></form></section></div></CustomerShell>;
}
export function CustomerProfile() {
  const { user, name, refresh } = useAuth(); const [draft, setDraft] = useState(name);
  return <CustomerShell><Heading title="Mi perfil" subtitle={user?.email ?? ''} /><form className="max-w-lg space-y-5" onSubmit={async (e) => { e.preventDefault(); if (!user) return; const { error } = await supabase.from('profiles').update({ full_name: draft.trim() }).eq('id', user.id); if (error) { toast.error('No se pudo guardar'); return; } await refresh(); toast.success('Nombre actualizado'); }}><div className="flex size-20 items-center justify-center rounded-full bg-secondary text-2xl font-bold text-primary">{name ? name.slice(0, 1).toUpperCase() : <UserRound className="size-8" />}</div><label className="block space-y-2 text-sm font-semibold">Tu nombre<input className={input} required value={draft} onChange={(e) => setDraft(e.target.value)} autoComplete="name" /></label><Button type="submit">Guardar cambios</Button></form></CustomerShell>;
}
