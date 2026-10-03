import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles as _unused } from "lucide-react";
import { Page } from "@/components/app/ui";
import { NEWS, type News } from "@/lib/data";
import { usePortfolio } from "@/lib/portfolio";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

void _unused;

export const Route = createFileRoute("/noticias")({
  head: () => ({
    meta: [
      { title: "Notícias — Lume Investimentos" },
      { name: "description", content: "Notícias e fatos relevantes dos ativos da sua carteira." },
      { property: "og:title", content: "Notícias — Lume Investimentos" },
      { property: "og:description", content: "Notícias e fatos relevantes dos ativos da sua carteira." },
    ],
  }),
  component: Noticias,
});

function Noticias() {
  const { assets } = usePortfolio();
  const owned = new Set(assets.map((a) => a.ticker));
  const [tk, setTk] = useState<string>("Todos");
  const [open, setOpen] = useState<News | null>(null);
  const mine = NEWS.filter((n) => owned.has(n.ticker));
  const tickers = ["Todos", ...Array.from(new Set(mine.map((n) => n.ticker)))];
  const list = tk === "Todos" ? mine : mine.filter((n) => n.ticker === tk);
  const highlight = mine.find((n) => n.relevant);

  return (
    <Page title="Notícias" subtitle="Sobre os seus ativos">
      {highlight && (
        <button onClick={() => setOpen(highlight)} className="bg-hero w-full rounded-3xl border border-primary/30 p-4 text-left animate-rise">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-foreground" /> Notícia relevante sobre {highlight.ticker}
          </span>
          <p className="mt-3 font-display text-lg font-semibold leading-snug">{highlight.title}</p>
          <p className="mt-2 text-xs text-muted-foreground">{highlight.source} · {highlight.date}</p>
        </button>
      )}

      <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4">
        {tickers.map((t) => (
          <button key={t} onClick={() => setTk(t)} className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${tk === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      <ul className="mt-4 space-y-3">
        {list.map((n) => (
          <li key={n.id}>
            <button onClick={() => setOpen(n)} className="card-premium w-full p-4 text-left transition hover:border-primary/40 animate-rise">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="rounded-full bg-primary/15 px-2 py-0.5 font-bold text-primary">{n.ticker}</span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">{n.tag}</span>
                <span className="ml-auto text-muted-foreground">{n.date}</span>
              </div>
              <p className="mt-2.5 text-sm font-semibold leading-snug">{n.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.summary}</p>
            </button>
          </li>
        ))}
      </ul>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-3xl border-border bg-popover">
          {open && (
            <>
              <SheetHeader>
                <div className="flex gap-2 text-[11px]">
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 font-bold text-primary">{open.ticker}</span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">{open.tag}</span>
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
