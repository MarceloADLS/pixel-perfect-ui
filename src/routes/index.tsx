import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Newspaper, Activity, LineChart as LineIcon, CalendarDays, Zap } from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { Page, Section } from "@/components/app/ui";
import { usePortfolio } from "@/lib/portfolio";
import { ALERTS, DAILY_FACTS, NEWS } from "@/lib/data";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { RelevanceBadge } from "@/components/app/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Início — Lume" },
      { name: "description", content: "Notícias e fatos do dia sobre os ativos que você acompanha." },
      { property: "og:title", content: "Início — Lume" },
      { property: "og:description", content: "Notícias e fatos do dia sobre os ativos que você acompanha." },
    ],
  }),
  component: Home,
});

const alertIcon = { news: Newspaper, dividend: Zap, price: Activity, indicator: LineIcon, results: CalendarDays, event: Zap };

function Home() {
  const { assets } = usePortfolio();
  const [alertsOpen, setAlertsOpen] = useState(false);
  const set = new Set(assets.map((a) => a.ticker));
  const news = NEWS.filter((n) => set.has(n.ticker));
  const moves = [...assets].sort((a, b) => b.dayChange - a.dayChange).map((a) => ({ t: a.ticker, v: a.dayChange }));
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

      <div className="bg-hero rounded-3xl border border-border p-5 animate-rise">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Resumo do dia</p>
        <h1 className="mt-1 text-2xl font-semibold">{news.filter((n) => n.relevance === "Alta").length} fatos relevantes nos seus {assets.length} ativos</h1>
        <ul className="mt-4 space-y-2.5">
          {DAILY_FACTS.map((f) => (
            <li key={f} className="flex gap-2.5 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <Section title="Destaques recentes" action={<Link to="/noticias" className="text-xs font-semibold text-primary">Ver feed</Link>}>
        <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4">
          {news.slice(0, 5).map((n) => (
            <Link key={n.id} to="/ativo/$ticker" params={{ ticker: n.ticker }} className="card-premium flex w-64 shrink-0 snap-start flex-col p-4 transition hover:border-primary/40">
              <div className="flex items-center justify-between text-xs">
                <span className="rounded-full bg-primary/15 px-2 py-0.5 font-semibold text-primary">{n.ticker}</span>
                <RelevanceBadge r={n.relevance} />
              </div>
              <p className="mt-3 line-clamp-3 text-sm font-semibold leading-snug">{n.title}</p>
              <p className="mt-auto pt-3 text-xs text-muted-foreground">{n.source} · {n.date}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Variação do dia">
        <div className="card-premium h-52 p-3">
          <ResponsiveContainer>
            <BarChart data={moves}>
              <XAxis dataKey="t" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} interval={0} />
              <Tooltip cursor={{ fill: "var(--secondary)" }} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`${v.toFixed(2)}%`, "Hoje"]} />
              <Bar dataKey="v" radius={[6, 6, 6, 6]}>
                {moves.map((m) => <Cell key={m.t} fill={m.v >= 0 ? "var(--success)" : "var(--destructive)"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <Section title="Pergunte à IA">
        <Link to="/ia" className="card-premium flex items-center justify-between p-4 transition hover:border-primary/40">
          <span className="text-sm">"Qual FII tem o menor P/VP?"</span>
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Perguntar</span>
        </Link>
      </Section>

      <Sheet open={alertsOpen} onOpenChange={setAlertsOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-3xl border-border bg-popover">
          <SheetHeader><SheetTitle>Notificações</SheetTitle></SheetHeader>
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
