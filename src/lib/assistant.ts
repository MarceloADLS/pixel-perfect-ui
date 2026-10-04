import { NEWS, type Asset, type AssetClass } from "./data";

const fmt = (n: number, d = 1) => n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
const NOTE = "\n\n_Comparação informativa; não constitui recomendação de compra ou venda._";

function scope(t: string, assets: Asset[]): { list: Asset[]; label: string } {
  const map: [RegExp, AssetClass][] = [[/fii|imobili/, "FIIs"], [/aç(ã|a)o|ações/, "Ações"], [/etf/, "ETFs"], [/cripto/, "Cripto"]];
  for (const [re, c] of map) if (re.test(t)) return { list: assets.filter((a) => a.cls === c), label: `entre os ${c}` };
  return { list: assets, label: "entre os ativos que você acompanha" };
}

function rank(list: Asset[], key: "dy" | "pvp" | "pl", asc: boolean, name: string, label: string, unit = "") {
  const w = list.filter((a) => a[key] != null).sort((a, b) => (asc ? a[key]! - b[key]! : b[key]! - a[key]!));
  if (!w.length) return `Não há dados de ${name} ${label}.`;
  const avg = w.reduce((s, a) => s + a[key]!, 0) / w.length;
  const first = w[0]!;
  return `${asc ? "O menor" : "O maior"} ${name} ${label} é de **${first.ticker}**, com **${fmt(first[key]!, 2)}${unit}**. A média do grupo é **${fmt(avg, 2)}${unit}**.\n\n${w.map((a, i) => `${i + 1}. ${a.ticker} — ${fmt(a[key]!, 2)}${unit}`).join("\n")}${NOTE}`;
}

/** Mocked, neutral assistant: compares indicators only. */
export function answer(q: string, assets: Asset[]): string {
  const t = q.toLowerCase();
  const { list, label } = scope(t, assets);
  const asc = /menor|mais baix/.test(t);

  if (/p\/?vp|vpa/.test(t)) return rank(list, "pvp", asc || !/maior/.test(t), "P/VP", label);
  if (/p\/?l\b|pl\b|lucro/.test(t)) return rank(list, "pl", asc, "P/L", label);
  if (/dividend|yield|dy/.test(t)) return rank(list, "dy", asc, "Dividend Yield", label, "%");
  if (/varia|semana|subiu|caiu/.test(t)) {
    const s = [...list].sort((a, b) => b.weekChange - a.weekChange);
    if (!s.length) return "Nenhum ativo encontrado.";
    return `Variação na semana ${label}:\n\n- Maior alta: **${s[0]!.ticker}** (${fmt(s[0]!.weekChange)}%)\n- Maior queda: **${s.at(-1)!.ticker}** (${fmt(s.at(-1)!.weekChange)}%)\n\n${s.map((a) => `${a.ticker}: ${a.weekChange > 0 ? "+" : ""}${fmt(a.weekChange)}%`).join(" · ")}`;
  }
  if (/not(í|i)cia|fato|relevante|mudan/.test(t)) {
    const set = new Set(list.map((a) => a.ticker));
    const n = NEWS.filter((x) => set.has(x.ticker) && x.relevance === "Alta");
    if (!n.length) return `Sem fatos de alta relevância ${label}.`;
    return `Fatos de alta relevância ${label}:\n\n${n.map((x) => `- **${x.ticker}** · ${x.tag}: ${x.title}`).join("\n")}`;
  }
  return `Posso comparar **P/VP**, **P/L**, **Dividend Yield**, variações e fatos relevantes dos ${assets.length} ativos que você acompanha. Tente: "Qual FII tem o menor P/VP?"`;
}

export const SUGGESTIONS = [
  "Qual FII tem o menor P/VP?",
  "Qual ativo tem o maior Dividend Yield?",
  "Qual ação tem o menor P/L?",
  "Quais ativos variaram mais esta semana?",
  "Quais FIIs tiveram fatos relevantes?",
];
