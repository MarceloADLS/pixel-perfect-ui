import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Page, Change, TickerBadge } from "@/components/app/ui";
import { usePortfolio } from "@/lib/portfolio";
import { CLASSES, CLASS_COLOR, type AssetClass } from "@/lib/data";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/ativos")({
  head: () => ({
    meta: [
      { title: "Meus ativos — Lume" },
      { name: "description", content: "Cadastre ações, FIIs, ETFs e cripto que você possui ou quer acompanhar." },
      { property: "og:title", content: "Meus ativos — Lume" },
      { property: "og:description", content: "Cadastre ações, FIIs, ETFs e cripto que você possui ou quer acompanhar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Ativos,
});

function Ativos() {
  const { assets, add, remove } = usePortfolio();
  const [filter, setFilter] = useState<AssetClass | "Todos">("Todos");
  const [open, setOpen] = useState(false);
  const list = filter === "Todos" ? assets : assets.filter((a) => a.cls === filter);

  return (
    <Page
      title="Meus ativos"
      subtitle={`${assets.length} acompanhados`}
      right={
        <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition active:scale-95">
          <Plus className="h-4 w-4" /> Adicionar
        </button>
      }
    >
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {(["Todos", ...CLASSES] as const).map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${filter === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {c}
          </button>
        ))}
      </div>

      <ul className="mt-4 space-y-3">
        {list.map((a) => (
          <li key={a.ticker} className="card-premium flex items-center gap-3 p-4 animate-rise">
            <Link to="/ativo/$ticker" params={{ ticker: a.ticker }} className="flex min-w-0 flex-1 items-center gap-3">
              <TickerBadge ticker={a.ticker} color={CLASS_COLOR[a.cls]} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-semibold">
                  {a.ticker}
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{a.owned ? "Possuo" : "Acompanho"}</span>
                </p>
                <p className="truncate text-xs text-muted-foreground">{a.name}</p>
              </div>
              <div className="text-right text-xs">
                <Change v={a.dayChange} />
                <p className="mt-0.5 text-muted-foreground">{a.dy != null ? `DY ${a.dy.toFixed(1)}%` : a.cls}</p>
              </div>
            </Link>
            <button aria-label={`Remover ${a.ticker}`} onClick={() => { remove(a.ticker); toast(`${a.ticker} removido`); }} className="rounded-full p-2 text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
        {list.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Nenhum ativo nesta categoria.</p>}
      </ul>

      <AddSheet open={open} onOpenChange={setOpen} onAdd={(t, cls, owned) => {
        add({ ticker: t, name: t, cls, owned, price: 0, dayChange: 0, weekChange: 0 });
        toast.success(`${t} adicionado`);
        setOpen(false);
      }} />
    </Page>
  );
}

function AddSheet({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (t: string, c: AssetClass, owned: boolean) => void }) {
  const [ticker, setTicker] = useState("");
  const [cls, setCls] = useState<AssetClass>("Ações");
  const [owned, setOwned] = useState(true);
  const chip = (on: boolean) => `rounded-full border px-3 py-1.5 text-xs font-medium ${on ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-3xl border-border bg-popover">
        <SheetHeader><SheetTitle>Adicionar ativo</SheetTitle></SheetHeader>
        <form className="space-y-4 px-4 pb-6" onSubmit={(e) => {
          e.preventDefault();
          if (!ticker.trim()) { toast.error("Informe o código do ativo"); return; }
          onAdd(ticker.trim().toUpperCase(), cls, owned);
          setTicker("");
        }}>
          <input className="w-full rounded-2xl border border-input bg-secondary px-4 py-3 text-sm outline-none transition focus:border-primary" placeholder="Código (ex: BBAS3, XPML11)" value={ticker} onChange={(e) => setTicker(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            {CLASSES.map((c) => <button type="button" key={c} onClick={() => setCls(c)} className={chip(cls === c)}>{c}</button>)}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setOwned(true)} className={chip(owned)}>Já possuo</button>
            <button type="button" onClick={() => setOwned(false)} className={chip(!owned)}>Só acompanhar</button>
          </div>
          <button className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground shadow-glow transition active:scale-[0.98]">Adicionar</button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
