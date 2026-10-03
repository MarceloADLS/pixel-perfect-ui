import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Page, Section, Change } from "@/components/app/ui";
import { usePortfolio } from "@/lib/portfolio";
import { CLASS_COLOR, NEWS, brl, cost, dividendHistory, pct, priceHistory, summarize, value } from "@/lib/data";

export const Route = createFileRoute("/ativo/$ticker")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.ticker} — Lume Investimentos` },
      { name: "description", content: `Cotação, indicadores, dividendos e histórico de ${params.ticker}.` },
      { property: "og:title", content: `${params.ticker} — Lume Investimentos` },
      { property: "og:description", content: `Cotação, indicadores, dividendos e histórico de ${params.ticker}.` },
    ],
  }),
  component: Ativo,
});

function Ativo() {
  const { ticker } = Route.useParams();
  const router = useRouter();
  const { assets } = usePortfolio();
  const a = assets.find((x) => x.ticker === ticker);
  const hist = useMemo(() => (a ? priceHistory(a) : []), [a]);

  if (!a) {
    return (
      <Page title="Ativo não encontrado">
        <Link to="/carteira" className="text-primary">Voltar para a carteira</Link>
      </Page>
    );
  }
  const s = summarize(assets);
  const share = (value(a) / s.total) * 100;
  const ret = ((value(a) - cost(a)) / cost(a)) * 100;
  const divs = dividendHistory(a);
  const color = CLASS_COLOR[a.cls];
  const news = NEWS.filter((n) => n.ticker === a.ticker);

  const indicators: [string, string][] = [];
  if (a.dy != null) indicators.push(["Dividend Yield", `${a.dy.toFixed(1)}%`]);
  if (a.pvp != null) indicators.push(["P/VP", a.pvp.toFixed(2)]);
  if (a.pl != null) indicators.push(["P/L", a.pl.toFixed(1)]);
  Object.entries(a.extra ?? {}).forEach((e) => indicators.push(e));

  return (
    <Page>
      <header className="mb-4 flex items-center gap-3 animate-rise">
        <button onClick={() => router.history.back()} aria-label="Voltar" className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"><ArrowLeft className="h-5 w-5" /></button>
        <div>
          <h1 className="text-xl font-semibold">{a.ticker}</h1>
          <p className="text-xs text-muted-foreground">{a.name} · {a.cls}</p>
        </div>
      </header>

      <div className="card-premium p-5 animate-rise">
        <p className="text-sm text-muted-foreground">Cotação</p>
        <div className="flex items-end gap-3">
          <p className="tabular font-display text-3xl font-semibold">{brl(a.price)}</p>
          <Change v={a.dayChange} className="mb-1.5" />
        </div>
        <div className="-mx-2 mt-3 h-40">
          <ResponsiveContainer>
            <AreaChart data={hist}>
              <defs>
                <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis hide domain={["dataMin", "dataMax"]} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [brl(v), "Preço"]} labelFormatter={(l) => `Dia ${l}`} />
              <Area type="monotone" dataKey="p" stroke={color} strokeWidth={2.2} fill="url(#ga)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-[11px] text-muted-foreground">Últimos 30 dias</p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Box l="Rentabilidade" v={pct(ret, 1)} tone={ret >= 0 ? "text-success" : "text-destructive"} />
        <Box l="Na carteira" v={`${share.toFixed(1)}%`} />
        <Box l="Posição" v={brl(value(a), { maximumFractionDigits: 0 })} />
      </div>

      <Section title="Indicadores">
        <div className="card-premium grid grid-cols-2 gap-px overflow-hidden bg-border">
          {indicators.map(([k, v]) => (
            <div key={k} className="bg-card p-4">
              <p className="text-xs text-muted-foreground">{k}</p>
              <p className="tabular mt-0.5 font-semibold">{v}</p>
            </div>
          ))}
        </div>
        {a.dy != null && (
          <p className="mt-3 rounded-2xl bg-secondary/60 p-3 text-xs leading-relaxed text-muted-foreground">
            Este ativo apresenta Dividend Yield de <b className="text-foreground">{a.dy.toFixed(1)}%</b>, enquanto a média dos ativos com proventos da sua carteira é de{" "}
            <b className="text-foreground">{avgDy(assets).toFixed(1)}%</b>. Informação para análise, não é recomendação.
          </p>
        )}
      </Section>

      {divs.length > 0 && (
        <Section title="Histórico de proventos (por cota)">
          <div className="card-premium h-44 p-3">
            <ResponsiveContainer>
              <BarChart data={divs}>
                <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <Tooltip cursor={{ fill: "var(--secondary)" }} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [brl(v), "Provento"]} />
                <Bar dataKey="v" fill={color} radius={[8, 8, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      )}

      {news.length > 0 && (
        <Section title="Notícias do ativo">
          <div className="space-y-2">
            {news.map((n) => (
              <div key={n.id} className="card-premium p-4">
                <p className="text-xs text-muted-foreground">{n.source} · {n.date}</p>
                <p className="mt-1 text-sm font-semibold">{n.title}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </Page>
  );
}

function avgDy(assets: import("@/lib/data").Asset[]) {
  const w = assets.filter((x) => x.dy);
  return w.reduce((s, x) => s + (x.dy ?? 0), 0) / (w.length || 1);
}

function Box({ l, v, tone }: { l: string; v: string; tone?: string }) {
  return (
    <div className="card-premium p-3">
      <p className="text-[11px] text-muted-foreground">{l}</p>
      <p className={`tabular mt-0.5 text-sm font-semibold ${tone ?? ""}`}>{v}</p>
    </div>
  );
}
