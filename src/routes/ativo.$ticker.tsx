import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, Bot } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Page, Section, Change, RelevanceBadge } from "@/components/app/ui";
import { usePortfolio } from "@/lib/portfolio";
import { CLASS_COLOR, NEWS, brl, dividendHistory, priceHistory, type Asset } from "@/lib/data";

export const Route = createFileRoute("/ativo/$ticker")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.ticker} — Lume` },
      { name: "description", content: `Indicadores, notícias e análise informativa de ${params.ticker}.` },
      { property: "og:title", content: `${params.ticker} — Lume` },
      { property: "og:description", content: `Indicadores, notícias e análise informativa de ${params.ticker}.` },
    ],
  }),
  component: Ativo,
});

const fmt = (n: number, d = 2) => n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });

function insights(a: Asset, all: Asset[]) {
  const peers = all.filter((x) => x.cls === a.cls && x.ticker !== a.ticker);
  const out: string[] = [];
  const cmp = (k: "dy" | "pvp" | "pl", name: string, unit = "") => {
    const v = a[k];
    const p = peers.filter((x) => x[k] != null);
    if (v == null || !p.length) return;
    const avg = p.reduce((s, x) => s + x[k]!, 0) / p.length;
    out.push(`${name} de ${fmt(v)}${unit}, frente à média de ${fmt(avg)}${unit} dos outros ${a.cls} que você acompanha.`);
  };
  cmp("dy", "Dividend Yield", "%");
  cmp("pvp", "P/VP");
  cmp("pl", "P/L");
  out.push(`Variação de ${a.weekChange > 0 ? "+" : ""}${fmt(a.weekChange, 1)}% na semana.`);
  if (a.extra?.Vacância) out.push(`Vacância atual reportada: ${a.extra.Vacância}.`);
  return out;
}

function Ativo() {
  const { ticker } = Route.useParams();
  const router = useRouter();
  const { assets } = usePortfolio();
  const a = assets.find((x) => x.ticker === ticker);
  const hist = useMemo(() => (a && a.price ? priceHistory(a) : []), [a]);

  if (!a) {
    return (
      <Page title="Ativo não encontrado">
        <Link to="/ativos" className="text-primary">Voltar para meus ativos</Link>
      </Page>
    );
  }
  const divs = dividendHistory(a);
  const color = CLASS_COLOR[a.cls];
  const news = NEWS.filter((n) => n.ticker === a.ticker);

  const indicators: [string, string][] = [];
  if (a.dy != null) indicators.push(["Dividend Yield", `${fmt(a.dy, 1)}%`]);
  if (a.pvp != null) indicators.push(["P/VP", fmt(a.pvp)]);
  if (a.pl != null) indicators.push(["P/L", fmt(a.pl, 1)]);
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

      {a.price > 0 ? (
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
      ) : (
        <div className="card-premium p-5 text-sm text-muted-foreground">Dados de mercado deste ativo serão exibidos em breve.</div>
      )}

      {indicators.length > 0 && (
        <Section title={`Indicadores de ${a.cls}`}>
          <div className="card-premium grid grid-cols-2 gap-px overflow-hidden bg-border">
            {indicators.map(([k, v]) => (
              <div key={k} className="bg-card p-4">
                <p className="text-xs text-muted-foreground">{k}</p>
                <p className="tabular mt-0.5 font-semibold">{v}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {a.price > 0 && (
        <Section title="Análise da IA">
          <div className="bg-hero rounded-3xl border border-border p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Bot className="h-4 w-4 text-primary" /> Comparação informativa</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {insights(a, assets).map((t) => <li key={t} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />{t}</li>)}
            </ul>
            <p className="mt-3 text-[11px] text-muted-foreground">Não constitui recomendação de compra ou venda.</p>
          </div>
        </Section>
      )}

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

      <Section title="Notícias relacionadas">
        {news.length ? (
          <div className="space-y-2">
            {news.map((n) => (
              <div key={n.id} className="card-premium p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{n.source} · {n.date}</span>
                  <RelevanceBadge r={n.relevance} />
                </div>
                <p className="mt-2 text-sm font-semibold">{n.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{n.summary}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-muted-foreground">Sem notícias recentes.</p>}
      </Section>
    </Page>
  );
}
