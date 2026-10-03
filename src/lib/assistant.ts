import { CLASSES, NEWS, brl, summarize, value, type Asset } from "./data";

const fmt = (n: number, d = 1) => n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });

/** Mocked, neutral, data-driven assistant (no buy/sell recommendations). */
export function answer(q: string, assets: Asset[]): string {
  const t = q.toLowerCase();
  const s = summarize(assets);
  const dist = s.byClass.map((c) => `${fmt(c.pct, 0)}% ${c.cls}`).join(", ");

  if (/dividend|yield|dy/.test(t)) {
    const w = assets.filter((a) => a.dy).sort((a, b) => (b.dy ?? 0) - (a.dy ?? 0));
    if (!w.length) return "Nenhum ativo da carteira possui Dividend Yield registrado.";
    const avg = w.reduce((x, a) => x + (a.dy ?? 0), 0) / w.length;
    return `O maior Dividend Yield da sua carteira é de **${w[0]!.ticker}**, com **${fmt(w[0]!.dy!)}%**, enquanto a média dos ativos com proventos é de **${fmt(avg)}%**.\n\nRanking:\n${w.slice(0, 5).map((a, i) => `${i + 1}. ${a.ticker} — ${fmt(a.dy!)}%`).join("\n")}\n\n_Informação para análise; não constitui recomendação._`;
  }
  if (/risco|concentr/.test(t)) {
    const top = [...assets].sort((a, b) => value(b) - value(a)).slice(0, 3);
    const lines = top.map((a) => `- **${a.ticker}**: ${fmt((value(a) / s.total) * 100)}% da carteira`).join("\n");
    const big = s.byClass.sort((a, b) => b.pct - a.pct)[0];
    return `Os ativos com maior participação são:\n${lines}\n\nPor classe, a maior exposição está em **${big!.cls}** (${fmt(big!.pct)}%). Ativos mais voláteis na semana: ${[...assets].sort((a, b) => Math.abs(b.weekChange) - Math.abs(a.weekChange)).slice(0, 2).map((a) => `${a.ticker} (${fmt(a.weekChange)}%)`).join(" e ")}.`;
  }
  if (/fii|imobili/.test(t)) {
    const fiis = new Set(assets.filter((a) => a.cls === "FIIs").map((a) => a.ticker));
    const n = NEWS.filter((x) => fiis.has(x.ticker));
    if (!n.length) return "Não encontrei eventos recentes para os FIIs da sua carteira.";
    return `Eventos recentes nos seus FIIs:\n\n${n.map((x) => `- **${x.ticker}** · ${x.tag}: ${x.title} (${x.date})`).join("\n")}`;
  }
  if (/varia|semana|subiu|caiu/.test(t)) {
    const sorted = [...assets].sort((a, b) => b.weekChange - a.weekChange);
    return `Variação na semana:\n\n- Maior alta: **${sorted[0]!.ticker}** (${fmt(sorted[0]!.weekChange)}%)\n- Maior queda: **${sorted.at(-1)!.ticker}** (${fmt(sorted.at(-1)!.weekChange)}%)\n\n${sorted.map((a) => `${a.ticker}: ${a.weekChange > 0 ? "+" : ""}${fmt(a.weekChange)}%`).join(" · ")}`;
  }
  if (/distribu|aloca|classe/.test(t)) {
    return `Sua carteira está distribuída em ${dist}.\n\n${CLASSES.filter((c) => !s.byClass.find((b) => b.cls === c)).map((c) => `Não há posições em ${c}.`).join(" ")}`.trim();
  }
  return `Seu patrimônio atual é de **${brl(s.total)}**, com rentabilidade acumulada de **${fmt(s.returnPct)}%** e variação de **${brl(s.dayPnl)}** hoje. A carteira está distribuída em ${dist}.`;
}

export const SUGGESTIONS = [
  "Como está minha carteira hoje?",
  "Qual ativo tem o maior Dividend Yield?",
  "Quais ativos concentram mais risco?",
  "Quais FIIs tiveram mudanças relevantes?",
  "Quais ativos variaram mais esta semana?",
];
