import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Bot } from "lucide-react";
import { usePortfolio } from "@/lib/portfolio";
import { answer, SUGGESTIONS } from "@/lib/assistant";

export const Route = createFileRoute("/ia")({
  head: () => ({
    meta: [
      { title: "Indicadores IA — Lume Investimentos" },
      { name: "description", content: "Pergunte sobre sua carteira e receba análises neutras baseadas nos seus dados." },
      { property: "og:title", content: "Indicadores IA — Lume Investimentos" },
      { property: "og:description", content: "Pergunte sobre sua carteira e receba análises neutras baseadas nos seus dados." },
    ],
  }),
  component: IA,
});

type Msg = { role: "user" | "ai"; text: string };

function Rich({ text }: { text: string }) {
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {text.split("\n").map((line, i) => (
        <p key={i} className={line.startsWith("- ") ? "pl-3" : ""}>
          {line.split(/(\*\*[^*]+\*\*|_[^_]+_)/).map((p, j) =>
            p.startsWith("**") ? <b key={j} className="text-foreground">{p.slice(2, -2)}</b> : p.startsWith("_") ? <em key={j} className="text-xs text-muted-foreground">{p.slice(1, -1)}</em> : p,
          )}
        </p>
      ))}
    </div>
  );
}

function IA() {
  const { assets } = usePortfolio();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const ta = useRef<HTMLInputElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);
  useEffect(() => { ta.current?.focus(); }, []);

  const send = (q: string) => {
    if (!q.trim() || typing) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { role: "ai", text: answer(q, assets) }]);
      setTyping(false);
      ta.current?.focus();
    }, 900);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-48 pt-6">
      <header className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow"><Bot className="h-6 w-6" /></div>
        <div>
          <h1 className="text-xl font-semibold">Indicadores</h1>
          <p className="text-xs text-muted-foreground">Indicadores comparados de forma neutra</p>
        </div>
      </header>

      {msgs.length === 0 && (
        <div className="bg-hero mt-4 rounded-3xl border border-border p-5 animate-rise">
          <p className="font-display text-lg font-semibold">Olá, Marcelo 👋</p>
          <p className="mt-1 text-sm text-muted-foreground">Pergunte sobre P/VP, Dividend Yield, P/L ou variações dos ativos que você acompanha. Eu comparo dados — sem recomendar compra ou venda.</p>
        </div>
      )}

      <div className="mt-4 flex-1 space-y-4">
        {msgs.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="ml-auto max-w-[85%] rounded-3xl rounded-br-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground animate-rise">{m.text}</div>
          ) : (
            <div key={i} className="flex gap-2.5 animate-rise">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary"><Bot className="h-4 w-4" /></div>
              <div className="text-muted-foreground"><Rich text={m.text} /></div>
            </div>
          ),
        )}
        {typing && (
          <div className="flex gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-primary"><Bot className="h-4 w-4" /></div>
            <div className="flex items-center gap-1 pt-2">
              {[0, 1, 2].map((d) => <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${d * 120}ms` }} />)}
            </div>
          </div>
        )}
        <div ref={end} />
      </div>

      <div className="fixed inset-x-0 bottom-[88px] z-30 mx-auto max-w-md px-4">
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 rounded-full border border-border bg-surface/95 p-1.5 pl-5 backdrop-blur-xl">
          <input ref={ta} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Pergunte sobre indicadores…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          <button aria-label="Enviar" disabled={!input.trim() || typing} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition disabled:opacity-40 active:scale-90">
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>
        <div className="no-scrollbar -mx-4 mt-2 flex gap-2 overflow-x-auto px-4">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)} className="shrink-0 rounded-full border border-border bg-secondary/90 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur transition hover:text-foreground">{s}</button>
          ))}
        </div>
      </div>
    </main>
  );
}
