import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  LayoutDashboard, CalendarDays, Scissors, Users, Wallet, Megaphone, MessageCircle, Store,
  LogOut, Plus, Trash2, Check, X, TrendingUp, Star, Crown, Sparkles, Clock, Target, Send, Lightbulb,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BiAn Beauty Emprendedora — Gestiona tu negocio de belleza" },
      { name: "description", content: "Agenda, servicios, clientas, finanzas y promociones para emprendedoras de belleza." },
      { property: "og:title", content: "BiAn Beauty Emprendedora" },
      { property: "og:description", content: "Tu negocio de belleza, tu tiempo, tu poder." },
    ],
  }),
  component: App,
});

type Status = "pendiente" | "confirmada" | "completada" | "cancelada";
type Cita = { id: string; clienta: string; servicio: string; fecha: string; hora: string; precio: number; status: Status };
type Servicio = { id: string; nombre: string; categoria: string; precio: number; duracion: number };
type Clienta = { id: string; nombre: string; telefono: string; visitas: number; nota: string };
type Gasto = { id: string; concepto: string; monto: number; fecha: string };
type Promo = { id: string; titulo: string; descuento: number; activa: boolean };
type Msg = { from: "yo" | "ella"; text: string };
type Data = {
  negocio: { nombre: string; duena: string; bio: string; meta: number; abierto: boolean };
  citas: Cita[]; servicios: Servicio[]; clientas: Clienta[]; gastos: Gasto[]; promos: Promo[];
  chats: Record<string, Msg[]>;
};

const today = new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 9);
const money = (n: number) => `$${n.toFixed(2)}`;

const seed: Data = {
  negocio: { nombre: "Gina Magallanes Studio", duena: "Gina Magallanes", bio: "Especialista en keratinas, alisados, manicure y pedicure spa.", meta: 1500, abierto: true },
  servicios: [
    { id: "s1", nombre: "Keratina premium", categoria: "Cabello", precio: 85, duracion: 150 },
    { id: "s2", nombre: "Manicure semipermanente", categoria: "Uñas", precio: 18, duracion: 60 },
    { id: "s3", nombre: "Pedicure spa", categoria: "Uñas", precio: 22, duracion: 60 },
    { id: "s4", nombre: "Maquillaje social", categoria: "Maquillaje", precio: 40, duracion: 75 },
  ],
  citas: [
    { id: "c1", clienta: "Camila Mendoza", servicio: "Keratina premium", fecha: today, hora: "10:00", precio: 85, status: "confirmada" },
    { id: "c2", clienta: "Isabella Castro", servicio: "Pedicure spa", fecha: today, hora: "14:30", precio: 22, status: "pendiente" },
    { id: "c3", clienta: "Valentina Ríos", servicio: "Maquillaje social", fecha: today, hora: "17:00", precio: 40, status: "pendiente" },
    { id: "c4", clienta: "Camila Mendoza", servicio: "Manicure semipermanente", fecha: today, hora: "08:30", precio: 18, status: "completada" },
  ],
  clientas: [
    { id: "k1", nombre: "Camila Mendoza", telefono: "0991234567", visitas: 8, nota: "Prefiere tonos nude" },
    { id: "k2", nombre: "Isabella Castro", telefono: "0987654321", visitas: 3, nota: "Piel sensible" },
    { id: "k3", nombre: "Valentina Ríos", telefono: "0971112233", visitas: 1, nota: "Nueva clienta" },
  ],
  gastos: [
    { id: "g1", concepto: "Productos de keratina", monto: 120, fecha: today },
    { id: "g2", concepto: "Esmaltes", monto: 35, fecha: today },
  ],
  promos: [
    { id: "p1", titulo: "Martes de uñas 2x1", descuento: 50, activa: true },
    { id: "p2", titulo: "Primera visita", descuento: 15, activa: false },
  ],
  chats: {
    "Camila Mendoza": [{ from: "ella", text: "Hola Gina, ¿tienes espacio el sábado?" }],
    "Isabella Castro": [{ from: "ella", text: "¿El pedicure incluye exfoliación?" }],
  },
};

const KEY = "bian-emprendedora-v1";
const TABS = [
  { id: "panel", label: "Mi Panel", icon: LayoutDashboard },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "servicios", label: "Servicios", icon: Scissors },
  { id: "clientas", label: "Clientas", icon: Users },
  { id: "finanzas", label: "Finanzas", icon: Wallet },
  { id: "promos", label: "Promociones", icon: Megaphone },
  { id: "mensajes", label: "Mensajes", icon: MessageCircle },
  { id: "negocio", label: "Mi Negocio", icon: Store },
] as const;
type Tab = (typeof TABS)[number]["id"];

const input = "w-full rounded-2xl border border-input bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const btn = "inline-flex items-center justify-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-mauve-dark";
const card = "rounded-3xl border border-border bg-card p-5 shadow-premium";

function App() {
  const [data, setData] = useState<Data>(seed);
  const [logged, setLogged] = useState(false);
  const [tab, setTab] = useState<Tab>("panel");

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) try { setData(JSON.parse(raw)); } catch {}
    if (sessionStorage.getItem(KEY + "-s")) setLogged(true);
  }, []);
  const update = (fn: (d: Data) => Data) => setData((d) => { const n = fn(d); localStorage.setItem(KEY, JSON.stringify(n)); return n; });

  if (!logged) return <Login data={data} onLogin={(nombre, negocio) => {
    update((d) => ({ ...d, negocio: { ...d.negocio, duena: nombre, nombre: negocio } }));
    sessionStorage.setItem(KEY + "-s", "1"); setLogged(true); toast.success(`¡Bienvenida, ${nombre.split(" ")[0]}! 💼`);
  }} />;

  return (
    <div className="min-h-screen bg-soft">
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand text-primary-foreground"><Crown className="h-5 w-5" /></div>
            <div>
              <p className="serif-title text-lg font-bold leading-none text-mauve-dark">BiAn ♡ Beauty</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold">Modo Emprendedora</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => update((d) => ({ ...d, negocio: { ...d.negocio, abierto: !d.negocio.abierto } }))}
              className={`rounded-full px-3 py-1 text-xs font-bold ${data.negocio.abierto ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
              ● {data.negocio.abierto ? "Abierto a reservas" : "Cerrado"}
            </button>
            <button onClick={() => { sessionStorage.removeItem(KEY + "-s"); setLogged(false); }} className="text-muted-foreground hover:text-primary" aria-label="Salir"><LogOut className="h-5 w-5" /></button>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:flex-row">
        <nav className="flex gap-2 overflow-x-auto md:w-56 md:flex-col md:overflow-visible">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold transition ${tab === t.id ? "bg-primary text-primary-foreground shadow-premium" : "bg-card text-secondary-foreground hover:bg-muted"}`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </nav>
        <main className="min-w-0 flex-1">
          {tab === "panel" && <Panel data={data} go={setTab} />}
          {tab === "agenda" && <Agenda data={data} update={update} />}
          {tab === "servicios" && <Servicios data={data} update={update} />}
          {tab === "clientas" && <Clientas data={data} update={update} />}
          {tab === "finanzas" && <Finanzas data={data} update={update} />}
          {tab === "promos" && <Promos data={data} update={update} />}
          {tab === "mensajes" && <Mensajes data={data} update={update} />}
          {tab === "negocio" && <Negocio data={data} update={update} />}
        </main>
      </div>
    </div>
  );
}

type P = { data: Data; update: (fn: (d: Data) => Data) => void };

function Title({ t, s }: { t: string; s: string }) {
  return <div className="mb-5"><h2 className="serif-title text-2xl font-bold text-mauve-dark">{t}</h2><p className="text-sm text-muted-foreground">{s}</p></div>;
}

function Login({ data, onLogin }: { data: Data; onLogin: (n: string, b: string) => void }) {
  const [n, setN] = useState(data.negocio.duena);
  const [b, setB] = useState(data.negocio.nombre);
  return (
    <div className="grid min-h-screen place-items-center bg-soft px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-3xl bg-brand text-primary-foreground shadow-premium"><Crown className="h-8 w-8" /></div>
          <h1 className="serif-title text-4xl font-black text-mauve-dark">BiAn ♡ Beauty</h1>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.3em] text-gold">Para Emprendedoras</p>
          <p className="mt-3 text-sm text-muted-foreground">Tu negocio, tu tiempo, tu poder.</p>
        </div>
        <form className={`${card} space-y-4`} onSubmit={(e) => { e.preventDefault(); if (n.trim() && b.trim()) onLogin(n.trim(), b.trim()); }}>
          <label className="block text-xs font-bold uppercase tracking-wider text-primary">Tu nombre
            <input className={`${input} mt-1`} value={n} onChange={(e) => setN(e.target.value)} required /></label>
          <label className="block text-xs font-bold uppercase tracking-wider text-primary">Nombre de tu negocio
            <input className={`${input} mt-1`} value={b} onChange={(e) => setB(e.target.value)} required /></label>
          <button className={`${btn} w-full py-3.5`}><Sparkles className="h-4 w-4" /> Entrar a mi negocio</button>
          <p className="text-center text-[11px] text-muted-foreground">Tus datos se guardan en este dispositivo.</p>
        </form>
      </div>
    </div>
  );
}

function useStats(data: Data) {
  return useMemo(() => {
    const done = data.citas.filter((c) => c.status === "completada");
    const ingresos = done.reduce((s, c) => s + c.precio, 0);
    const gastos = data.gastos.reduce((s, g) => s + g.monto, 0);
    const hoy = data.citas.filter((c) => c.fecha === today && c.status !== "cancelada").sort((a, b) => a.hora.localeCompare(b.hora));
    const pendientes = data.citas.filter((c) => c.status === "pendiente").length;
    const porServicio: Record<string, number> = {};
    done.forEach((c) => (porServicio[c.servicio] = (porServicio[c.servicio] || 0) + c.precio));
    return { ingresos, gastos, ganancia: ingresos - gastos, hoy, pendientes, porServicio };
  }, [data]);
}

function Panel({ data, go }: { data: Data; go: (t: Tab) => void }) {
  const s = useStats(data);
  const pct = Math.min(100, Math.round((s.ingresos / data.negocio.meta) * 100));
  const tips = ["Publica un antes y después hoy: genera confianza.", "Escríbele a tus clientas que no vienen hace un mes.", "Activa una promo en tus días con menos citas.", "Separa siempre tu dinero personal del de tu negocio."];
  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-brand p-6 text-primary-foreground shadow-premium">
        <p className="text-xs font-bold uppercase tracking-widest opacity-80">Panel de tu negocio</p>
        <h1 className="serif-title mt-1 text-3xl font-bold">¡Hola, {data.negocio.duena.split(" ")[0]}! 💼✨</h1>
        <p className="mt-1 text-sm opacity-90">{data.negocio.nombre} · Hoy tienes {s.hoy.length} citas y {s.pendientes} por confirmar.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { l: "Ingresos", v: money(s.ingresos), i: TrendingUp },
          { l: "Ganancia neta", v: money(s.ganancia), i: Wallet },
          { l: "Clientas", v: data.clientas.length, i: Users },
          { l: "Calificación", v: "5.0 ★", i: Star },
        ].map((k) => (
          <div key={k.l} className={card}>
            <k.i className="h-5 w-5 text-secondary" />
            <p className="mt-2 text-2xl font-extrabold text-mauve-dark">{k.v}</p>
            <p className="text-xs font-semibold text-muted-foreground">{k.l}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className={card}>
          <div className="flex items-center justify-between"><h3 className="flex items-center gap-2 font-bold text-primary"><Target className="h-4 w-4" /> Meta del mes</h3><span className="text-sm font-bold text-gold">{pct}%</span></div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted"><div className="h-full bg-gold transition-all" style={{ width: `${pct}%` }} /></div>
          <p className="mt-2 text-xs text-muted-foreground">{money(s.ingresos)} de {money(data.negocio.meta)} · ¡Faltan {money(Math.max(0, data.negocio.meta - s.ingresos))}!</p>
          <div className="mt-5 rounded-2xl bg-muted p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary"><Lightbulb className="h-4 w-4 text-gold" /> Tip emprendedora</p>
            <p className="mt-1 text-sm">{tips[new Date().getDate() % tips.length]}</p>
          </div>
        </div>
        <div className={card}>
          <div className="mb-3 flex items-center justify-between"><h3 className="flex items-center gap-2 font-bold text-primary"><Clock className="h-4 w-4" /> Citas de hoy</h3><button onClick={() => go("agenda")} className="text-xs font-bold text-secondary-foreground hover:underline">Ver agenda</button></div>
          {s.hoy.length === 0 && <p className="text-sm text-muted-foreground">No tienes citas hoy.</p>}
          <ul className="space-y-2">{s.hoy.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-2xl bg-muted px-4 py-2.5 text-sm">
              <span><b className="text-mauve-dark">{c.hora}</b> · {c.clienta}<span className="block text-xs text-muted-foreground">{c.servicio}</span></span>
              <StatusBadge s={c.status} />
            </li>))}</ul>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ s }: { s: Status }) {
  const m: Record<Status, string> = { pendiente: "bg-accent text-accent-foreground", confirmada: "bg-secondary text-secondary-foreground", completada: "bg-success/15 text-success", cancelada: "bg-destructive/10 text-destructive" };
  return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${m[s]}`}>{s}</span>;
}

function Agenda({ data, update }: P) {
  const [f, setF] = useState({ clienta: "", servicio: data.servicios[0]?.nombre ?? "", fecha: today, hora: "09:00" });
  const setStatus = (id: string, status: Status) => {
    update((d) => {
      const c = d.citas.find((x) => x.id === id)!;
      let clientas = d.clientas;
      if (status === "completada") clientas = clientas.map((k) => (k.nombre === c.clienta ? { ...k, visitas: k.visitas + 1 } : k));
      return { ...d, clientas, citas: d.citas.map((x) => (x.id === id ? { ...x, status } : x)) };
    });
    toast.success(`Cita ${status}`);
  };
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const sv = data.servicios.find((s) => s.nombre === f.servicio);
    if (!f.clienta.trim() || !sv) return;
    update((d) => ({
      ...d,
      citas: [...d.citas, { id: uid(), ...f, clienta: f.clienta.trim(), precio: sv.precio, status: "confirmada" }],
      clientas: d.clientas.some((k) => k.nombre === f.clienta.trim()) ? d.clientas : [...d.clientas, { id: uid(), nombre: f.clienta.trim(), telefono: "", visitas: 0, nota: "" }],
    }));
    setF({ ...f, clienta: "" }); toast.success("Cita agendada 📅");
  };
  const sorted = [...data.citas].sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
  return (
    <div>
      <Title t="Mi Agenda" s="Confirma, completa o cancela las reservas de tus clientas." />
      <form onSubmit={add} className={`${card} mb-5 grid gap-3 sm:grid-cols-5`}>
        <input className={`${input} sm:col-span-2`} placeholder="Nombre de la clienta" value={f.clienta} onChange={(e) => setF({ ...f, clienta: e.target.value })} list="clientas" />
        <datalist id="clientas">{data.clientas.map((k) => <option key={k.id} value={k.nombre} />)}</datalist>
        <select className={input} value={f.servicio} onChange={(e) => setF({ ...f, servicio: e.target.value })}>{data.servicios.map((s) => <option key={s.id}>{s.nombre}</option>)}</select>
        <input type="date" className={input} value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} />
        <div className="flex gap-2"><input type="time" className={input} value={f.hora} onChange={(e) => setF({ ...f, hora: e.target.value })} /><button className={btn} aria-label="Agendar"><Plus className="h-4 w-4" /></button></div>
      </form>
      <div className="space-y-3">{sorted.map((c) => (
        <div key={c.id} className={`${card} flex flex-wrap items-center justify-between gap-3`}>
          <div><p className="font-bold text-mauve-dark">{c.clienta} <StatusBadge s={c.status} /></p><p className="text-sm text-muted-foreground">{c.servicio} · {c.fecha} {c.hora} · {money(c.precio)}</p></div>
          <div className="flex gap-2">
            {c.status === "pendiente" && <button onClick={() => setStatus(c.id, "confirmada")} className="rounded-xl bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground">Confirmar</button>}
            {(c.status === "pendiente" || c.status === "confirmada") && <>
              <button onClick={() => setStatus(c.id, "completada")} className="rounded-xl bg-success/15 p-2 text-success" aria-label="Completar"><Check className="h-4 w-4" /></button>
              <button onClick={() => setStatus(c.id, "cancelada")} className="rounded-xl bg-destructive/10 p-2 text-destructive" aria-label="Cancelar"><X className="h-4 w-4" /></button></>}
          </div>
        </div>))}</div>
    </div>
  );
}

function Servicios({ data, update }: P) {
  const [f, setF] = useState({ nombre: "", categoria: "Cabello", precio: "", duracion: "60" });
  return (
    <div>
      <Title t="Mi Catálogo de Servicios" s="Define tus precios y duración. Así te verán tus clientas." />
      <form className={`${card} mb-5 grid gap-3 sm:grid-cols-5`} onSubmit={(e) => {
        e.preventDefault(); const precio = Number(f.precio); if (!f.nombre.trim() || !(precio > 0)) { toast.error("Completa nombre y precio"); return; }
        update((d) => ({ ...d, servicios: [...d.servicios, { id: uid(), nombre: f.nombre.trim(), categoria: f.categoria, precio, duracion: Number(f.duracion) || 60 }] }));
        setF({ ...f, nombre: "", precio: "" }); toast.success("Servicio agregado ✨");
      }}>
        <input className={`${input} sm:col-span-2`} placeholder="Nombre del servicio" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} />
        <select className={input} value={f.categoria} onChange={(e) => setF({ ...f, categoria: e.target.value })}>{["Cabello", "Uñas", "Cuidado personal", "Maquillaje"].map((c) => <option key={c}>{c}</option>)}</select>
        <input className={input} type="number" step="0.01" placeholder="Precio $" value={f.precio} onChange={(e) => setF({ ...f, precio: e.target.value })} />
        <div className="flex gap-2"><input className={input} type="number" placeholder="Min" value={f.duracion} onChange={(e) => setF({ ...f, duracion: e.target.value })} /><button className={btn} aria-label="Agregar"><Plus className="h-4 w-4" /></button></div>
      </form>
      <div className="grid gap-4 sm:grid-cols-2">{data.servicios.map((s) => (
        <div key={s.id} className={card}>
          <div className="flex items-start justify-between"><span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-bold text-primary">{s.categoria}</span>
            <button onClick={() => update((d) => ({ ...d, servicios: d.servicios.filter((x) => x.id !== s.id) }))} className="text-muted-foreground hover:text-destructive" aria-label="Eliminar"><Trash2 className="h-4 w-4" /></button></div>
          <p className="serif-title mt-2 text-lg font-bold text-mauve-dark">{s.nombre}</p>
          <p className="text-sm text-muted-foreground">{s.duracion} min</p>
          <p className="mt-2 text-2xl font-extrabold text-gold">{money(s.precio)}</p>
        </div>))}</div>
    </div>
  );
}

function Clientas({ data, update }: P) {
  const [f, setF] = useState({ nombre: "", telefono: "", nota: "" });
  const nivel = (v: number) => (v >= 8 ? "Oro" : v >= 4 ? "Plata" : "Bronce");
  return (
    <div>
      <Title t="Mis Clientas" s="Conoce a quienes confían en ti y fidelízalas." />
      <form className={`${card} mb-5 grid gap-3 sm:grid-cols-4`} onSubmit={(e) => {
        e.preventDefault(); if (!f.nombre.trim()) return;
        update((d) => ({ ...d, clientas: [...d.clientas, { id: uid(), nombre: f.nombre.trim(), telefono: f.telefono, nota: f.nota, visitas: 0 }] }));
        setF({ nombre: "", telefono: "", nota: "" }); toast.success("Clienta registrada 💖");
      }}>
        <input className={input} placeholder="Nombre" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} />
        <input className={input} placeholder="Teléfono" value={f.telefono} onChange={(e) => setF({ ...f, telefono: e.target.value })} />
        <input className={input} placeholder="Nota (alergias, gustos...)" value={f.nota} onChange={(e) => setF({ ...f, nota: e.target.value })} />
        <button className={btn}><Plus className="h-4 w-4" /> Agregar</button>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[...data.clientas].sort((a, b) => b.visitas - a.visitas).map((k) => (
        <div key={k.id} className={card}>
          <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-brand font-bold text-primary-foreground">{k.nombre[0]}</div>
            <div><p className="font-bold text-mauve-dark">{k.nombre}</p><p className="text-xs text-muted-foreground">{k.telefono || "Sin teléfono"}</p></div></div>
          <div className="mt-3 flex items-center justify-between text-xs"><span className="font-semibold">{k.visitas} visitas</span><span className="rounded-full bg-gold px-2.5 py-0.5 font-bold text-primary-foreground">{nivel(k.visitas)}</span></div>
          {k.nota && <p className="mt-2 rounded-xl bg-muted px-3 py-2 text-xs">📝 {k.nota}</p>}
        </div>))}</div>
    </div>
  );
}

function Finanzas({ data, update }: P) {
  const s = useStats(data);
  const [f, setF] = useState({ concepto: "", monto: "" });
  const max = Math.max(1, ...Object.values(s.porServicio));
  return (
    <div>
      <Title t="Mis Finanzas" s="Controla cuánto ganas, cuánto gastas y qué te deja más." />
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <div className={card}><p className="text-xs font-semibold text-muted-foreground">Ingresos</p><p className="text-2xl font-extrabold text-success">{money(s.ingresos)}</p></div>
        <div className={card}><p className="text-xs font-semibold text-muted-foreground">Gastos</p><p className="text-2xl font-extrabold text-destructive">{money(s.gastos)}</p></div>
        <div className="rounded-3xl bg-brand p-5 text-primary-foreground shadow-premium"><p className="text-xs font-semibold opacity-80">Ganancia neta</p><p className="text-2xl font-extrabold">{money(s.ganancia)}</p></div>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className={card}>
          <h3 className="mb-3 font-bold text-primary">Servicios que más te dejan</h3>
          {Object.keys(s.porServicio).length === 0 && <p className="text-sm text-muted-foreground">Completa citas para ver estadísticas.</p>}
          <div className="space-y-3">{Object.entries(s.porServicio).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
            <div key={k}><div className="flex justify-between text-xs font-semibold"><span>{k}</span><span>{money(v)}</span></div>
              <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-brand" style={{ width: `${(v / max) * 100}%` }} /></div></div>))}</div>
        </div>
        <div className={card}>
          <h3 className="mb-3 font-bold text-primary">Registrar gasto</h3>
          <form className="mb-3 flex gap-2" onSubmit={(e) => {
            e.preventDefault(); const monto = Number(f.monto); if (!f.concepto.trim() || !(monto > 0)) return;
            update((d) => ({ ...d, gastos: [...d.gastos, { id: uid(), concepto: f.concepto.trim(), monto, fecha: today }] })); setF({ concepto: "", monto: "" });
          }}>
            <input className={input} placeholder="Concepto" value={f.concepto} onChange={(e) => setF({ ...f, concepto: e.target.value })} />
            <input className={`${input} w-28`} type="number" step="0.01" placeholder="$" value={f.monto} onChange={(e) => setF({ ...f, monto: e.target.value })} />
            <button className={btn} aria-label="Agregar gasto"><Plus className="h-4 w-4" /></button>
          </form>
          <ul className="space-y-2">{data.gastos.map((g) => (
            <li key={g.id} className="flex items-center justify-between rounded-2xl bg-muted px-4 py-2 text-sm"><span>{g.concepto}</span>
              <span className="flex items-center gap-3 font-bold text-destructive">-{money(g.monto)}<button onClick={() => update((d) => ({ ...d, gastos: d.gastos.filter((x) => x.id !== g.id) }))} className="text-muted-foreground" aria-label="Eliminar"><Trash2 className="h-3.5 w-3.5" /></button></span></li>))}</ul>
        </div>
      </div>
    </div>
  );
}

function Promos({ data, update }: P) {
  const [f, setF] = useState({ titulo: "", descuento: "10" });
  return (
    <div>
      <Title t="Mis Promociones" s="Atrae nuevas clientas y llena tus días tranquilos." />
      <form className={`${card} mb-5 flex flex-wrap gap-3`} onSubmit={(e) => {
        e.preventDefault(); if (!f.titulo.trim()) return;
        update((d) => ({ ...d, promos: [...d.promos, { id: uid(), titulo: f.titulo.trim(), descuento: Number(f.descuento) || 0, activa: true }] }));
        setF({ titulo: "", descuento: "10" }); toast.success("Promoción publicada 📣");
      }}>
        <input className={`${input} flex-1`} placeholder="Ej. Viernes de keratina" value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} />
        <input className={`${input} w-28`} type="number" placeholder="% desc" value={f.descuento} onChange={(e) => setF({ ...f, descuento: e.target.value })} />
        <button className={btn}><Megaphone className="h-4 w-4" /> Publicar</button>
      </form>
      <div className="grid gap-4 sm:grid-cols-2">{data.promos.map((p) => (
        <div key={p.id} className={`${card} ${p.activa ? "" : "opacity-60"}`}>
          <div className="flex items-center justify-between"><span className="rounded-xl bg-gold px-3 py-1 text-lg font-extrabold text-primary-foreground">-{p.descuento}%</span>
            <button onClick={() => update((d) => ({ ...d, promos: d.promos.filter((x) => x.id !== p.id) }))} className="text-muted-foreground hover:text-destructive" aria-label="Eliminar"><Trash2 className="h-4 w-4" /></button></div>
          <p className="serif-title mt-3 text-lg font-bold text-mauve-dark">{p.titulo}</p>
          <button onClick={() => update((d) => ({ ...d, promos: d.promos.map((x) => (x.id === p.id ? { ...x, activa: !x.activa } : x)) }))}
            className="mt-3 text-xs font-bold text-primary hover:underline">{p.activa ? "● Activa — pausar" : "○ Pausada — activar"}</button>
        </div>))}</div>
    </div>
  );
}

function Mensajes({ data, update }: P) {
  const names = data.clientas.map((k) => k.nombre);
  const [sel, setSel] = useState(names[0] ?? "");
  const [txt, setTxt] = useState("");
  const msgs = data.chats[sel] ?? [];
  const quick = ["¡Hola! Sí tengo espacio, ¿qué hora te queda?", "Te confirmo tu cita 💖", "¡Gracias por tu visita! Te espero pronto ✨"];
  const send = (t: string) => { if (!t.trim() || !sel) return; update((d) => ({ ...d, chats: { ...d.chats, [sel]: [...(d.chats[sel] ?? []), { from: "yo", text: t.trim() }] } })); setTxt(""); };
  return (
    <div>
      <Title t="Mensajes con Clientas" s="Responde rápido y cierra más reservas." />
      <div className={`${card} grid gap-4 p-0 md:grid-cols-[220px_1fr]`}>
        <ul className="border-b border-border p-3 md:border-b-0 md:border-r">{names.map((n) => (
          <li key={n}><button onClick={() => setSel(n)} className={`w-full rounded-2xl px-3 py-2.5 text-left text-sm font-semibold ${sel === n ? "bg-muted text-primary" : ""}`}>{n}
            {data.chats[n]?.at(-1)?.from === "ella" && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-gold" />}</button></li>))}</ul>
        <div className="flex min-h-[380px] flex-col p-4">
          <div className="flex-1 space-y-2 overflow-y-auto">{msgs.length === 0 && <p className="text-sm text-muted-foreground">Inicia la conversación con {sel}.</p>}
            {msgs.map((m, i) => <div key={i} className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.from === "yo" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"}`}>{m.text}</div>)}</div>
          <div className="my-3 flex flex-wrap gap-2">{quick.map((q) => <button key={q} onClick={() => send(q)} className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold text-primary hover:bg-muted">{q}</button>)}</div>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); send(txt); }}>
            <input className={input} placeholder="Escribe tu respuesta..." value={txt} onChange={(e) => setTxt(e.target.value)} />
            <button className={btn} aria-label="Enviar"><Send className="h-4 w-4" /></button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Negocio({ data, update }: P) {
  const [f, setF] = useState(data.negocio);
  return (
    <div>
      <Title t="Mi Negocio" s="Así se presenta tu marca ante tus clientas." />
      <div className="grid gap-5 lg:grid-cols-2">
        <form className={`${card} space-y-3`} onSubmit={(e) => { e.preventDefault(); update((d) => ({ ...d, negocio: { ...f, meta: Number(f.meta) || 0 } })); toast.success("Perfil actualizado"); }}>
          <label className="block text-xs font-bold uppercase text-primary">Nombre del negocio<input className={`${input} mt-1`} value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></label>
          <label className="block text-xs font-bold uppercase text-primary">Dueña<input className={`${input} mt-1`} value={f.duena} onChange={(e) => setF({ ...f, duena: e.target.value })} /></label>
          <label className="block text-xs font-bold uppercase text-primary">Descripción<textarea className={`${input} mt-1`} rows={3} value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} /></label>
          <label className="block text-xs font-bold uppercase text-primary">Meta mensual de ingresos ($)<input type="number" className={`${input} mt-1`} value={f.meta} onChange={(e) => setF({ ...f, meta: Number(e.target.value) })} /></label>
          <button className={btn}>Guardar cambios</button>
        </form>
        <div className="rounded-3xl bg-brand p-6 text-primary-foreground shadow-premium">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">Vista previa para clientas</p>
          <div className="mt-4 rounded-3xl bg-card p-5 text-card-foreground">
            <div className="flex items-center gap-3"><div className="grid h-14 w-14 place-items-center rounded-full bg-brand text-xl font-bold text-primary-foreground">{data.negocio.duena[0]}</div>
              <div><p className="serif-title text-xl font-black text-mauve-dark">{data.negocio.nombre}</p><p className="text-xs text-gold">★★★★★ 5.0 · Experta verificada</p></div></div>
            <p className="mt-3 text-sm text-muted-foreground">{data.negocio.bio}</p>
            <div className="mt-3 flex flex-wrap gap-2">{data.servicios.slice(0, 4).map((s) => <span key={s.id} className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-primary">{s.nombre} · {money(s.precio)}</span>)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
