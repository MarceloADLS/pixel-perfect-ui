import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Eye, EyeOff, CalendarClock, Coins, TrendingUp, ChevronRight, Newspaper, DollarSign, Activity, LineChart as LineIcon, CalendarDays } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Page, Section, Change, TickerBadge } from "@/components/app/ui";
import { AllocationDonut } from "@/components/app/AllocationDonut";
import { usePortfolio } from "@/lib/portfolio";
import { ALERTS, CLASS_COLOR, HISTORY, NEWS, brl, pct, summarize, value } from "@/lib/data";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Início — Lume Investimentos" },
      { name: "description", content: "Seu patrimônio, rentabilidade, dividendos e notícias em um só lugar." },
      { property: "og:title", content: "Início — Lume Investimentos" },
      { property: "og:description", content: "Seu patrimônio, rentabilidade, dividendos e notícias em um só lugar." },
    ],
  }),
  component: Home,
});

const alertIcon = { news: Newspaper, dividend: DollarSign, price: Activity, indicator: LineIcon, results: CalendarDays, event: CalendarDays };

function Home() {
  const { assets } = usePortfolio();
  const s = summarize(assets);
  const [hidden, setHidden] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const top = [...assets].sort((a, b) => value(b) - value(a)).slice(0, 4);
  const mask = (t: string) => (hidden ? "••••••" : t);
  const unread = ALERTS.filter((a) => a.unread).length;

  return (
    <Page>
      <header className="mb-5 flex items-center justify-between animate-rise">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">MA</div>
          <div>
            <p className="text-xs text-muted-foreground">Boa tarde,</p>
            <p className="font-semibold">Marcelo</p>
          </div>
        </div>
        <button onClick={() => setAlertsOpen(true)} aria-label="Alertas" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-secondary transition hover:bg-accent">
          <Bell className="h-5 w-5" />
          {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{unread}</span>}
        </button>
      </header>

      <div className="bg-hero relative overflow-hidden rounded-3xl border border-border p-5 animate-rise">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Patrimônio total
          <button onClick={() => setHidden(!hidden)} aria-label="Ocultar valores">{hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
        </div>
        <p className="tabular mt-1 font-display text-4xl font-semibold">{mask(brl(s.total))}</p>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.dayPnl >= 0 ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
            {s.dayPnl >= 0 ? "+" : ""}{mask(brl(s.dayPnl))} hoje
          </span>
        </div>
        <div className="mt-4 h-28 -mx-2">
          <ResponsiveContainer>
            <AreaChart data={HISTORY}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} interval={2} />
              <Tooltip
                cursor={{ stroke: "var(--border)" }}
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                formatter={(v: number) => [brl(v), "Patrimônio"]}
              />
              <Area type="monotone" dataKey="v" stroke="var(--primary)" strokeWidth={2.5} fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Stat icon={TrendingUp} label="Rentabilidade" value={pct(s.returnPct)} positive={s.returnPct >= 0} />
        <Stat icon={CalendarClock} label="No mês" value={pct(s.monthPct)} positive />
        <Stat icon={Coins} label="Dividendos recebidos" value={mask(brl(s.dividends))} />
        <Stat icon={DollarSign} label="Proventos previstos" value={mask(brl(s.upcoming))} />
      </div>

      <Section title="Distribuição da carteira" action={<Link to="/carteira" className="text-xs font-semibold text-primary">Ver carteira</Link>}>
        <AllocationDonut data={s.byClass} total={s.total} />
      </Section>

      <Section title="Maiores posições">
        <div className="card-premium divide-y divide-border">
          {top.map((a) => (
            <Link key={a.ticker} to="/ativo/$ticker" params={{ ticker: a.ticker }} className="flex items-center gap-3 p-3.5 transition hover:bg-secondary/50">
              <TickerBadge ticker={a.ticker} color={CLASS_COLOR[a.cls]} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{a.ticker}</p>
                <p className="truncate text-xs text-muted-foreground">{a.name}</p>
              </div>
              <div className="text-right">
                <p className="tabular text-sm font-semibold">{mask(brl(value(a)))}</p>
                <p className="text-xs text-muted-foreground">{((value(a) / s.total) * 100).toFixed(1)}%</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Últimas notícias" action={<Link to="/noticias" className="text-xs font-semibold text-primary">Ver todas</Link>}>
        <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4">
          {NEWS.slice(0, 4).map((n) => (
            <Link key={n.id} to="/noticias" className="card-premium w-64 shrink-0 snap-start p-4 transition hover:border-primary/40">
              <div className="flex items-center justify-between text-xs">
                <span className="rounded-full bg-primary/15 px-2 py-0.5 font-semibold text-primary">{n.ticker}</span>
                <span className="text-muted-foreground">{n.date}</span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm font-semibold leading-snug">{n.title}</p>
              <p className="mt-2 text-xs text-muted-foreground">{n.source}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Sheet open={alertsOpen} onOpenChange={setAlertsOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-3xl border-border bg-popover">
          <SheetHeader><SheetTitle>Alertas</SheetTitle></SheetHeader>
          <ul className="space-y-2 px-4 pb-6">
            {ALERTS.map((a) => {
              const I = alertIcon[a.type];
              return (
                <li key={a.id} className="flex gap-3 rounded-2xl bg-secondary/60 p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary"><I className="h-4 w-4" /></span>
                  <div className="flex-1">
                    <div className="flex justify-between gap-2">
                      <p className="text-sm font-semibold">{a.title}</p>
                      <span className="text-[11px] text-muted-foreground">{a.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.body}</p>
                  </div>
                  {a.unread && <span className="mt-1 h-2 w-2 rounded-full bg-primary" />}
                </li>
              );
            })}
          </ul>
        </SheetContent>
      </Sheet>
    </Page>
  );
}

function Stat({ icon: Icon, label, value, positive }: { icon: typeof Coins; label: string; value: string; positive?: boolean }) {
  return (
    <div className="card-premium p-4 animate-rise">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className={`tabular mt-0.5 font-display text-lg font-semibold ${positive ? "text-success" : ""}`}>{value}</p>
    </div>
  );
}

export { Change };
