import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Page, Change, TickerBadge } from "@/components/app/ui";
import { usePortfolio } from "@/lib/portfolio";
import { CLASSES, CLASS_COLOR, brl, cost, pct, summarize, value, type AssetClass } from "@/lib/data";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/carteira")({
  head: () => ({
    meta: [
      { title: "Carteira — Lume Investimentos" },
      { name: "description", content: "Gerencie seus ativos, quantidades, preço médio e lucro." },
      { property: "og:title", content: "Carteira — Lume Investimentos" },
      { property: "og:description", content: "Gerencie seus ativos, quantidades, preço médio e lucro." },
    ],
  }),
  component: Carteira,
});

function Carteira() {
  const { assets, add, remove } = usePortfolio();
  const [filter, setFilter] = useState<AssetClass | "Todos">("Todos");
  const [open, setOpen] = useState(false);
  const s = summarize(assets);
  const list = filter === "Todos" ? assets : assets.filter((a) => a.cls === filter);
  const pnl = s.total - s.invested;

  return (
    <Page
      title="Carteira"
      subtitle={`${assets.length} ativos`}
      right={
        <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition active:scale-95">
          <Plus className="h-4 w-4" /> Ativo
        </button>
      }
    >
      <div className="grid grid-cols-3 gap-2 animate-rise">
        <Mini label="Investido" v={brl(s.invested, { maximumFractionDigits: 0 })} />
        <Mini label="Atual" v={brl(s.total, { maximumFractionDigits: 0 })} />
        <Mini label="Resultado" v={brl(pnl, { maximumFractionDigits: 0 })} tone={pnl >= 0 ? "text-success" : "text-destructive"} />
      </div>

      <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4">
        {(["Todos", ...CLASSES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${filter === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary text-muted-foreground hover:text-foreground"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <ul className="mt-4 space-y-3">
        {list.map((a) => {
          const r = value(a) - cost(a);
          const rp = (r / cost(a)) * 100;
          return (
            <li key={a.ticker} className="card-premium p-4 animate-rise">
              <div className="flex items-center gap-3">
                <Link to="/ativo/$ticker" params={{ ticker: a.ticker }} className="flex min-w-0 flex-1 items-center gap-3">
                  <TickerBadge ticker={a.ticker} color={CLASS_COLOR[a.cls]} />
                  <div className="min-w-0">
                    <p className="font-semibold">{a.ticker} <Change v={a.dayChange} className="ml-1" /></p>
                    <p className="truncate text-xs text-muted-foreground">{a.name}</p>
                  </div>
                </Link>
                <button
                  aria-label={`Remover ${a.ticker}`}
                  onClick={() => { remove(a.ticker); toast(`${a.ticker} removido da carteira`); }}
                  className="rounded-full p-2 text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                <Cell l="Qtd." v={a.qty.toLocaleString("pt-BR")} />
                <Cell l="Preço médio" v={brl(a.avgPrice)} />
                <Cell l="Posição" v={brl(value(a), { maximumFractionDigits: 0 })} />
                <Cell l="L/P" v={pct(rp, 1)} tone={r >= 0 ? "text-success" : "text-destructive"} />
              </div>
              {a.dividendsReceived > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">Dividendos recebidos: <span className="font-semibold text-foreground">{brl(a.dividendsReceived)}</span></p>
              )}
            </li>
          );
        })}
        {list.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Nenhum ativo nesta classe.</p>}
      </ul>

      <AddSheet open={open} onOpenChange={setOpen} onAdd={(a) => { add(a); toast.success(`${a.ticker} adicionado`); setOpen(false); }} />
    </Page>
  );
}

function Mini({ label, v, tone }: { label: string; v: string; tone?: string }) {
  return (
    <div className="card-premium p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={`tabular mt-0.5 text-sm font-semibold ${tone ?? ""}`}>{v}</p>
    </div>
  );
}
function Cell({ l, v, tone }: { l: string; v: string; tone?: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{l}</p>
      <p className={`tabular font-semibold ${tone ?? ""}`}>{v}</p>
    </div>
  );
}

function AddSheet({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (a: import("@/lib/data").Asset) => void }) {
  const [ticker, setTicker] = useState("");
  const [cls, setCls] = useState<AssetClass>("Ações");
  const [qty, setQty] = useState("");
  const [avg, setAvg] = useState("");
  const input = "w-full rounded-2xl border border-input bg-secondary px-4 py-3 text-sm outline-none transition focus:border-primary";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-3xl border-border bg-popover">
        <SheetHeader><SheetTitle>Adicionar ativo</SheetTitle></SheetHeader>
        <form
          className="space-y-3 px-4 pb-6"
          onSubmit={(e) => {
            e.preventDefault();
            const q = parseFloat(qty.replace(",", "."));
            const p = parseFloat(avg.replace(",", "."));
            if (!ticker || !q || !p) { toast.error("Preencha todos os campos"); return; }
            onAdd({ ticker: ticker.toUpperCase(), name: ticker.toUpperCase(), cls, qty: q, avgPrice: p, price: p, dayChange: 0, weekChange: 0, dividendsReceived: 0 });
            setTicker(""); setQty(""); setAvg("");
          }}
        >
          <input className={input} placeholder="Código (ex: BBAS3)" value={ticker} onChange={(e) => setTicker(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            {CLASSES.map((c) => (
              <button type="button" key={c} onClick={() => setCls(c)} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${cls === c ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}>{c}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className={input} inputMode="decimal" placeholder="Quantidade" value={qty} onChange={(e) => setQty(e.target.value)} />
            <input className={input} inputMode="decimal" placeholder="Preço médio (R$)" value={avg} onChange={(e) => setAvg(e.target.value)} />
          </div>
          <button className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground shadow-glow transition active:scale-[0.98]">Adicionar à carteira</button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
