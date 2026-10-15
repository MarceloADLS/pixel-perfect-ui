import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Page, RelevanceBadge } from "@/components/app/ui";
import { type News, type Relevance } from "@/lib/data";
import { newsQueryOptions, useNews } from "@/lib/news-query";
import { NewsDetails } from "@/components/app/NewsDetails";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/noticias")({
  loader: ({ context }) => context.queryClient.ensureQueryData(newsQueryOptions),
  head: () => ({
    meta: [
      { title: "Notícias — Lume" },
      { name: "description", content: "Feed de notícias filtrado pelos seus ativos, com classificação de relevância." },
      { property: "og:title", content: "Notícias — Lume" },
      { property: "og:description", content: "Feed de notícias filtrado pelos seus ativos, com classificação de relevância." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Noticias,
});

function Noticias() {
  const { news: mine, unavailable } = useNews();
  const queryClient = useQueryClient();
  const [tk, setTk] = useState("Todos");
  const [rel, setRel] = useState<Relevance | "Todas">("Todas");
  const [open, setOpen] = useState<News | null>(null);
  const tickers = ["Todos", ...Array.from(new Set(mine.flatMap((n) => n.tickers ?? [n.ticker])))];
  const list = mine.filter((n) => (tk === "Todos" || (n.tickers ?? [n.ticker]).includes(tk)) && (rel === "Todas" || n.relevance === rel));
  const chip = (on: boolean) => `shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary text-muted-foreground"}`;

  return (
    <Page title="Notícias" subtitle="Filtradas pelos seus ativos" right={<Button variant="ghost" size="icon" aria-label="Atualizar notícias" title="Atualizar notícias" onClick={() => void queryClient.invalidateQueries({ queryKey: newsQueryOptions.queryKey })}><RefreshCw /></Button>}>
      {unavailable.length > 0 && <p role="status" className="mb-3 text-xs text-muted-foreground">{unavailable.join(" e ")}: notícias temporariamente indisponíveis.</p>}
      <div className="grid grid-cols-4 gap-1 rounded-full bg-secondary p-1">
        {(["Todas", "Alta", "Média", "Baixa"] as const).map((r) => (
          <Button key={r} variant="ghost" onClick={() => setRel(r)} className={`h-auto rounded-full px-1 py-1.5 text-xs font-semibold transition ${rel === r ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "text-muted-foreground"}`}>{r}</Button>
        ))}
      </div>

      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
        {tickers.map((t) => <Button variant="ghost" key={t} onClick={() => setTk(t)} className={chip(tk === t)}>{t}</Button>)}
      </div>

      <ul className="mt-4 space-y-3">
        {list.map((n) => (
          <li key={n.id}>
            <Button variant="ghost" onClick={() => setOpen(n)} className={`card-premium block h-auto w-full whitespace-normal p-4 text-left transition hover:border-primary/40 animate-rise ${n.relevance === "Alta" ? "border-primary/30" : ""}`}>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="rounded-full bg-primary/15 px-2 py-0.5 font-bold text-primary">{n.ticker}</span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">{n.tag}</span>
                <span className="ml-auto"><RelevanceBadge r={n.relevance} /></span>
              </div>
              <p className="mt-2.5 text-sm font-semibold leading-snug">{n.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.summary}</p>
              <p className="mt-2 text-[11px] text-muted-foreground">{n.source} · {n.date}</p>
            </Button>
          </li>
        ))}
        {list.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma notícia com esses filtros.</p>}
      </ul>

      <NewsDetails article={open} onClose={() => setOpen(null)} />
    </Page>
  );
}
