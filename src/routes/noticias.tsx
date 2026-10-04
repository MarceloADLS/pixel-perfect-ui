import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, RelevanceBadge } from "@/components/app/ui";
import { NEWS, type News, type Relevance } from "@/lib/data";
import { usePortfolio } from "@/lib/portfolio";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/noticias")({
  head: () => ({
    meta: [
      { title: "Notícias — Lume" },
      { name: "description", content: "Feed de notícias filtrado pelos seus ativos, com classificação de relevância." },
      { property: "og:title", content: "Notícias — Lume" },
      { property: "og:description", content: "Feed de notícias filtrado pelos seus ativos, com classificação de relevância." },
    ],
  }),
  component: Noticias,
});

function Noticias() {
  const { assets } = usePortfolio();
  const owned = new Set(assets.map((a) => a.ticker));
  const [tk, setTk] = useState("Todos");
  const [rel, setRel] = useState<Relevance | "Todas">("Todas");
  const [open, setOpen] = useState<News | null>(null);
  const mine = NEWS.filter((n) => owned.has(n.ticker));
  const tickers = ["Todos", ...Array.from(new Set(mine.map((n) => n.ticker)))];
  const list = mine.filter((n) => (tk === "Todos" || n.ticker === tk) && (rel === "Todas" || n.relevance === rel));
  const chip = (on: boolean) => `shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary text-muted-foreground"}`;

  return (
    <Page title="Notícias" subtitle="Filtradas pelos seus ativos">
      <div className="grid grid-cols-4 gap-1 rounded-full bg-secondary p-1">
        {(["Todas", "Alta", "Média", "Baixa"] as const).map((r) => (
          <button key={r} onClick={() => setRel(r)} className={`rounded-full py-1.5 text-xs font-semibold transition ${rel === r ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{r}</button>
        ))}
      </div>

      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
        {tickers.map((t) => <button key={t} onClick={() => setTk(t)} className={chip(tk === t)}>{t}</button>)}
      </div>

      <ul className="mt-4 space-y-3">
        {list.map((n) => (
          <li key={n.id}>
            <button onClick={() => setOpen(n)} className={`card-premium w-full p-4 text-left transition hover:border-primary/40 animate-rise ${n.relevance === "Alta" ? "border-primary/30" : ""}`}>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="rounded-full bg-primary/15 px-2 py-0.5 font-bold text-primary">{n.ticker}</span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">{n.tag}</span>
                <span className="ml-auto"><RelevanceBadge r={n.relevance} /></span>
              </div>
              <p className="mt-2.5 text-sm font-semibold leading-snug">{n.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.summary}</p>
              <p className="mt-2 text-[11px] text-muted-foreground">{n.source} · {n.date}</p>
            </button>
          </li>
        ))}
        {list.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma notícia com esses filtros.</p>}
      </ul>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-3xl border-border bg-popover">
          {open && (
            <>
              <SheetHeader>
                <div className="flex gap-2 text-[11px]">
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 font-bold text-primary">{open.ticker}</span>
                  <RelevanceBadge r={open.relevance} />
                </div>
                <SheetTitle className="text-left text-lg leading-snug">{open.title}</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-8">
                <p className="text-sm leading-relaxed text-muted-foreground">{open.summary}</p>
                <p className="mt-4 text-xs text-muted-foreground">Fonte: <span className="text-foreground">{open.source}</span> · {open.date}</p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Page>
  );
}
