import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Relevance } from "@/lib/data";

export function Page({ title, subtitle, right, children }: { title?: string; subtitle?: string; right?: ReactNode; children: ReactNode }) {
  return (
    <main className="mx-auto min-h-screen max-w-md px-4 pb-32 pt-6">
      {title && (
        <header className="mb-5 flex items-end justify-between animate-rise">
          <div>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            <h1 className="text-2xl font-semibold">{title}</h1>
          </div>
          {right}
        </header>
      )}
      {children}
    </main>
  );
}

export function Section({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("mt-7 animate-rise", className)}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Change({ v, className }: { v: number; className?: string }) {
  const up = v >= 0;
  return (
    <span className={cn("tabular text-xs font-semibold", up ? "text-success" : "text-destructive", className)}>
      {up ? "▲" : "▼"} {Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
    </span>
  );
}

export function RelevanceBadge({ r }: { r: Relevance }) {
  const tone = r === "Alta" ? "bg-primary text-primary-foreground" : r === "Média" ? "bg-secondary text-foreground" : "bg-muted text-muted-foreground";
  return <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", tone)}>Relevância {r.toLowerCase()}</span>;
}

export function TickerBadge({ ticker, color }: { ticker: string; color: string }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold text-background" style={{ background: color }}>
      {ticker.replace(/[^A-Z]/g, "").slice(0, 4)}
    </div>
  );
}
