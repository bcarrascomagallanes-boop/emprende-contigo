import { createContext, useContext, useState, type ReactNode } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { CalendarDays, Crown, Heart, Home, MessageCircle, Gift, UserRound, Search, Scissors, Sparkles, Hand, ArrowRight, Clock, Send, Check, Flower2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { experts, services, money, type Service } from '@/lib/customer-catalog';
import hair from '@/assets/beauty-hair.jpg';
import { toast } from 'sonner';

type Booking = { id: number; service: Service; date: string; time: string; name: string; cancelled: boolean };
type Message = { expert: string; text: string };
type CustomerState = { name: string; setName: (name: string) => void; bookings: Booking[]; setBookings: React.Dispatch<React.SetStateAction<Booking[]>>; messages: Message[]; setMessages: React.Dispatch<React.SetStateAction<Message[]>>; book: (service: Service) => void };
const Context = createContext<CustomerState | null>(null);
function useCustomer() { const value = useContext(Context); if (!value) throw new Error('Customer provider missing'); return value; }
const input = 'w-full min-w-0 rounded-lg border border-input bg-card px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, book] = useState<Service | null>(null);
  const [date, setDate] = useState(''); const [time, setTime] = useState('');
  const today = new Date().toLocaleDateString('en-CA');
  return <Context.Provider value={{ name, setName, bookings, setBookings, messages, setMessages, book }}>
    {children}
    <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) book(null); }}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg">
        <DialogTitle className="serif-title text-2xl">Tu próxima cita</DialogTitle>
        <DialogDescription>Reserva de ejemplo: no se envía a la especialista.</DialogDescription>
        {selected && <form className="space-y-4" onSubmit={(event) => {
          event.preventDefault(); if (!name.trim() || !date || !time || date < today) return;
          setBookings((previous) => [...previous, { id: Date.now(), service: selected, date, time, name: name.trim(), cancelled: false }]);
          book(null); setDate(''); setTime(''); toast.success('Tu reserva de ejemplo está lista. Puedes verla en Mis reservas.');
        }}>
          <div className="border-b border-border pb-4"><p className="font-semibold">{selected.name}</p><p className="mt-1 text-sm text-muted-foreground">{experts.find((expert) => expert.id === selected.expert)?.name} · {selected.minutes} min</p><p className="mt-2 text-xl font-bold text-primary">{money(selected.price)}</p></div>
          <label className="block space-y-1 text-sm">Tu nombre<input className={input} required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label>
          <div className="grid grid-cols-2 gap-3"><label className="block space-y-1 text-sm">Fecha<input type="date" className={input} min={today} required value={date} onChange={(event) => setDate(event.target.value)} /></label><label className="block space-y-1 text-sm">Hora<input type="time" className={input} required value={time} onChange={(event) => setTime(event.target.value)} /></label></div>
          <Button className="w-full" type="submit"><Check /> Guardar reserva de ejemplo</Button>
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
  const location = useLocation(); const { name } = useCustomer();
  return <div className="min-h-screen bg-background pb-24 md:pb-8">
    <header className="border-b border-border bg-card"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-5">
      <Link to="/" className="flex items-center gap-3"><Crown className="size-7 text-gold" /><span className="serif-title text-2xl font-bold text-primary">BiAn <span className="text-gold">♡</span> Beauty</span></Link>
      <Button variant="ghost" asChild className="gap-2"><Link to="/perfil"><UserRound /><span className="hidden sm:inline">{name || 'Mi perfil'}</span></Link></Button>
    </div></header>
    <div className="mx-auto hidden max-w-6xl items-center justify-between border-b border-border px-5 py-3 md:flex"><nav className="flex gap-2">{navigation.map((item) => <Button key={item.to} variant={location.pathname === item.to ? 'secondary' : 'ghost'} asChild><Link to={item.to}><item.icon />{item.label}</Link></Button>)}</nav><span className="text-xs text-muted-foreground">Para clientas</span></div>
    <main className="mx-auto max-w-6xl px-5 py-7">{children}</main>
    <nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-card px-1 pb-[env(safe-area-inset-bottom)] md:hidden">{navigation.map((item) => <Button key={item.to} asChild variant="ghost" className={`h-17 flex-col gap-1 px-0 text-[10px] ${location.pathname === item.to ? 'text-primary bg-muted' : 'text-muted-foreground'}`}><Link to={item.to}><item.icon className="size-5" />{item.label}</Link></Button>)}</nav>
  </div>;
}

export function CustomerHome() {
  const { name, book } = useCustomer(); const [category, setCategory] = useState('Todos'); const [search, setSearch] = useState(''); const [profile, setProfile] = useState(false); const [favorites, setFavorites] = useState<string[]>([]);
  const filtered = services.filter((service) => (category === 'Todos' || service.category === category) && `${service.name} ${experts.find((expert) => expert.id === service.expert)?.name}`.toLowerCase().includes(search.toLowerCase()));
  return <CustomerShell>
    <div className="mb-5 flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">¡Hola, {name.split(' ')[0] || 'hermosa'}! <span className="text-primary">♡</span></p><span className="text-[11px] text-muted-foreground">Vista de ejemplo</span></div>
    <section className="customer-hero relative isolate overflow-hidden">
      <img src={hair} width={1536} height={1024} className="absolute inset-0 -z-10 h-full w-full object-cover object-right" alt="Imagen ilustrativa de cabello largo y alisado en un salón" />
      <div className="max-w-[57%] py-9 pl-5 sm:py-12 sm:pl-9">
        <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase text-primary sm:text-xs"><Crown className="size-4 text-gold" /> Especialista destacada</p>
        <h1 className="serif-title text-3xl font-bold leading-tight text-foreground sm:text-4xl">Gina<br />Magallanes</h1>
        <p className="mt-3 max-w-64 text-xs leading-relaxed text-primary sm:text-sm">Keratinas y alisados.<br />Manicure y pedicure spa.</p>
        <div className="mt-5 flex flex-wrap gap-2"><Button onClick={() => book(services[0])} className="text-xs sm:text-sm">Reservar con Gina <ArrowRight /></Button><Button variant="outline" onClick={() => setProfile(true)} className="text-xs sm:text-sm">Ver perfil</Button></div>
      </div>
    </section>
    <div className="mb-8 mt-3 flex items-center gap-2 text-[10px] text-muted-foreground"><Sparkles className="size-3" /> Imagen ilustrativa · Precios de la referencia, por confirmar</div>
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="mb-1 text-[10px] font-bold uppercase text-primary">Un momento para ti</p><h2 className="serif-title text-2xl font-bold">¿Qué te gustaría hoy?</h2></div><div className="relative w-full sm:w-72"><Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" /><input aria-label="Buscar servicios" placeholder="Busca un servicio o especialista" className={`${input} pl-10`} value={search} onChange={(event) => setSearch(event.target.value)} /></div></div>
      <div className="mb-6 flex flex-wrap gap-2">{[{ label: 'Todos', icon: Sparkles }, { label: 'Cabello', icon: Scissors }, { label: 'Uñas', icon: Hand }, { label: 'Maquillaje', icon: Flower2 }].map((item) => <Button key={item.label} variant={category === item.label ? 'default' : 'outline'} onClick={() => setCategory(item.label)}><item.icon />{item.label}</Button>)}</div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((service) => <article key={service.id} className="flex flex-col rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between"><span className="text-[10px] font-semibold uppercase text-primary">{service.category}</span><Button variant="ghost" size="icon" aria-label={`${favorites.includes(service.id) ? 'Quitar' : 'Guardar'} favorito ${service.name}`} onClick={() => setFavorites((previous) => previous.includes(service.id) ? previous.filter((id) => id !== service.id) : [...previous, service.id])}><Heart className={favorites.includes(service.id) ? 'fill-primary text-primary' : 'text-muted-foreground'} /></Button></div>
        <h3 className="serif-title mt-2 text-lg font-bold leading-snug">{service.name}</h3><p className="mt-2 text-xs text-muted-foreground">{experts.find((expert) => expert.id === service.expert)?.name}</p>
        <div className="mt-5 flex items-center justify-between"><span className="text-xl font-bold text-primary">{money(service.price)}</span><span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3" />{service.minutes} min</span></div><Button variant="secondary" className="mt-4" onClick={() => book(service)}>Reservar <ArrowRight /></Button>
      </article>)}</div>{filtered.length === 0 && <p className="py-8 text-center text-muted-foreground">No encontramos servicios con esa búsqueda.</p>}
    </section>
    <Dialog open={profile} onOpenChange={setProfile}><DialogContent className="w-[calc(100%-2rem)] rounded-lg"><div className="flex size-16 items-center justify-center rounded-full bg-secondary text-xl font-bold text-primary">GM</div><DialogTitle className="serif-title text-3xl">Gina Magallanes</DialogTitle><DialogDescription>Especialista destacada en keratinas, alisados, manicure y pedicure.</DialogDescription><p className="text-sm text-muted-foreground">Gina Magallanes Studio</p><div className="space-y-2">{services.filter((service) => service.expert === 'gina').map((service) => <div key={service.id} className="flex items-center justify-between gap-3 border-t border-border py-2"><span className="text-sm">{service.name}</span><Button size="sm" variant="secondary" onClick={() => { setProfile(false); book(service); }}>{money(service.price)}</Button></div>)}</div></DialogContent></Dialog>
  </CustomerShell>;
}

function Heading({ title, subtitle }: { title: string; subtitle: string }) { return <div className="mb-7"><h1 className="serif-title text-3xl font-bold">{title}</h1><p className="mt-2 text-sm text-muted-foreground">{subtitle}</p></div>; }
export function CustomerBookings() {
  const { bookings, setBookings } = useCustomer();
  return <CustomerShell><Heading title="Mis reservas" subtitle="Tus próximos momentos de belleza." /><p className="mb-4 text-xs text-muted-foreground">Reservas de ejemplo, no enviadas al salón.</p>{bookings.length === 0 ? <div className="py-12 text-center"><CalendarDays className="mx-auto mb-4 size-10 text-secondary" /><p className="mb-5 text-muted-foreground">Todavía no tienes reservas.</p><Button asChild><Link to="/">Buscar un servicio <ArrowRight /></Link></Button></div> : <div className="space-y-4">{bookings.map((booking) => <article key={booking.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-5"><div><span className={`text-xs font-semibold ${booking.cancelled ? 'text-destructive' : 'text-primary'}`}>{booking.cancelled ? 'Cancelada' : 'Pendiente · ejemplo'}</span><h2 className="serif-title mt-1 text-xl font-bold">{booking.service.name}</h2><p className="mt-1 text-sm text-muted-foreground">{experts.find((expert) => expert.id === booking.service.expert)?.name} · {booking.date} · {booking.time}</p><p className="mt-2 font-bold text-primary">{money(booking.service.price)}</p></div>{!booking.cancelled && <Button variant="outline" onClick={() => { setBookings((previous) => previous.map((item) => item.id === booking.id ? { ...item, cancelled: true } : item)); toast.success('Reserva de ejemplo cancelada'); }}>Cancelar</Button>}</article>)}</div>}</CustomerShell>;
}
export function CustomerRewards() {
  return <CustomerShell><Heading title="Mis recompensas" subtitle="Un detalle más para consentirte." /><div className="flex flex-wrap items-center gap-6 border-y border-border py-8"><Crown className="size-12 text-gold" /><div><p className="serif-title text-3xl font-bold text-primary">150 puntos</p><p className="mt-1 text-sm text-muted-foreground">Saldo ilustrativo · Nivel Bronce</p></div></div><h2 className="serif-title mb-4 mt-8 text-xl font-bold">Detalles que te encantarán</h2><div className="grid gap-4 sm:grid-cols-2">{[{ name: 'Mascarilla capilar nutritiva', points: 300 }, { name: 'Diseño de cejas con hilo', points: 500 }].map((reward) => <article key={reward.name} className="rounded-lg border border-border bg-card p-6"><Gift className="mb-4 size-7 text-primary" /><h3 className="serif-title text-xl font-bold">{reward.name}</h3><p className="my-3 text-sm text-muted-foreground">{reward.points} puntos</p><Button disabled variant="secondary">Próximamente</Button></article>)}</div><p className="mt-5 text-xs text-muted-foreground">Beneficios de ejemplo; sujetos a confirmación del negocio.</p></CustomerShell>;
}
export function CustomerMessages() {
  const { messages, setMessages } = useCustomer(); const [expert, setExpert] = useState('gina'); const [text, setText] = useState('');
  return <CustomerShell><Heading title="Mis mensajes" subtitle="Conversa con tu especialista." /><div className="grid gap-6 md:grid-cols-[220px_1fr]"><aside className="flex gap-2 overflow-x-auto md:flex-col">{experts.map((item) => <Button key={item.id} className="shrink-0 justify-start" variant={expert === item.id ? 'secondary' : 'ghost'} onClick={() => setExpert(item.id)}><MessageCircle />{item.name}</Button>)}</aside><section className="min-w-0 border border-border bg-card p-5"><h2 className="serif-title text-xl font-bold">{experts.find((item) => item.id === expert)?.name}</h2><p className="mt-1 text-xs text-muted-foreground">Conversación de ejemplo. Los mensajes no se envían.</p><div className="flex min-h-64 flex-col justify-end gap-3 py-5">{messages.filter((message) => message.expert === expert).map((message, index) => <p key={index} className="ml-auto max-w-[85%] break-words rounded-lg bg-muted px-4 py-3 text-sm">{message.text}</p>)}</div><form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); if (!text.trim()) return; setMessages((previous) => [...previous, { expert, text: text.trim() }]); setText(''); }}><input aria-label="Tu mensaje" className={input} value={text} onChange={(event) => setText(event.target.value)} placeholder="Escribe tu mensaje…" /><Button type="submit" size="icon" className="h-11 w-11 shrink-0" aria-label="Guardar mensaje de ejemplo"><Send /></Button></form></section></div></CustomerShell>;
}
export function CustomerProfile() {
  const { name, setName } = useCustomer(); const [draft, setDraft] = useState(name);
  return <CustomerShell><Heading title="Mi perfil" subtitle="Tu espacio en BiAn Beauty." /><form className="max-w-lg space-y-5" onSubmit={(event) => { event.preventDefault(); setName(draft.trim()); toast.success('Nombre actualizado'); }}><div className="flex size-20 items-center justify-center rounded-full bg-secondary text-2xl font-bold text-primary">{name ? name.slice(0, 1).toUpperCase() : <UserRound className="size-8" />}</div><label className="block space-y-2 text-sm font-semibold">Tu nombre<input className={input} required value={draft} onChange={(event) => setDraft(event.target.value)} autoComplete="name" /></label><Button type="submit">Guardar cambios</Button><p className="text-xs leading-relaxed text-muted-foreground">Esta es una vista de ejemplo sin cuenta ni inicio de sesión. Los cambios, mensajes y reservas se reinician al recargar.</p></form></CustomerShell>;
}