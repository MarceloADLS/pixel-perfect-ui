import { XMLParser } from "fast-xml-parser";
import type { Asset, News, NewsTag } from "./data";

export const NEWS_SOURCES = [
  { name: "InfoMoney", url: "https://www.infomoney.com.br/feed/", domain: "infomoney.com.br" },
  { name: "UOL Economia", url: "https://rss.uol.com.br/feed/economia.xml", domain: "uol.com.br" },
];

export function plainText(value: unknown): string {
  return String(value ?? "").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#(?:0*39|x27);/gi, "'").replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Math.min(Number(code), 0x10ffff))).replace(/\s+/g, " ").trim();
}

export function safeArticleUrl(value: unknown, domain: string): string | null {
  try {
    const url = new URL(String(value));
    return url.protocol === "https:" && (url.hostname === domain || url.hostname.endsWith(`.${domain}`)) ? url.href : null;
  } catch { return null; }
}

export function parsePublishedAt(value: unknown): string | null {
  const months: Record<string, string> = { jan: "Jan", fev: "Feb", mar: "Mar", abr: "Apr", mai: "May", jun: "Jun", jul: "Jul", ago: "Aug", set: "Sep", out: "Oct", nov: "Nov", dez: "Dec" };
  const normalized = String(value ?? "").replace(/^[^,]+,\s*/, "").replace(/\b(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\b/gi, (m) => months[m.toLowerCase()] ?? m);
  const time = Date.parse(normalized);
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

export function parseFeed(xml: string, source: (typeof NEWS_SOURCES)[number]): News[] {
  const parser = new XMLParser({ ignoreAttributes: true, processEntities: true, isArray: (name) => name === "item" });
  const items = parser.parse(xml)?.rss?.channel?.item;
  if (!Array.isArray(items)) return [];
  return items.flatMap((item: Record<string, unknown>) => {
    const url = safeArticleUrl(item.link, source.domain);
    const title = plainText(item.title);
    const publishedAt = parsePublishedAt(item.pubDate);
    if (!url || !title || !publishedAt) return [];
    const summary = plainText(item.description).replace(/\s*(The post|O post|Leia também:)[\s\S]*$/i, "").slice(0, 700);
    const text = `${title} ${summary}`.toLowerCase();
    const tag: NewsTag = /dividend|provento|rendimento/.test(text) ? "Dividendos" : /resultado|lucro|balanço/.test(text) ? "Resultados" : /fato relevante/.test(text) ? "Fato relevante" : /emissão/.test(text) ? "Emissão" : /vacância/.test(text) ? "Vacância" : "Mercado";
    return [{ id: url, ticker: "", title, summary, source: source.name, date: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }).format(new Date(publishedAt)), tag, relevance: tag === "Mercado" ? "Baixa" as const : "Alta" as const, url, publishedAt }];
  });
}

const aliases: Record<string, string[]> = {
  PETR4: ["petrobras", "petr3"], ITUB4: ["itaú", "itau", "itub3"], WEGE3: ["weg"], MXRF11: ["maxi renda"], HGLG11: ["cshg logística", "pátria log"], KNRI11: ["kinea renda"], IVVB11: ["s&p 500", "s&p500"], BOVA11: ["ibovespa"], BTC: ["bitcoin"],
};
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function matchNewsToAssets(news: News[], assets: Asset[]): News[] {
  return news.flatMap((article) => {
    const text = ` ${normalize(`${article.title} ${article.summary}`).replace(/[^a-z0-9&]+/g, " ")} `;
    const matches = assets.filter((a) => [a.ticker, ...(aliases[a.ticker] ?? []), ...(a.name !== a.ticker ? [a.name.replace(/\s+(PN|ON|FII)$/i, "")] : [])].some((word) => text.includes(` ${normalize(word).replace(/[^a-z0-9&]+/g, " ")} `)));
    const first = matches[0];
    return first ? [{ ...article, ticker: first.ticker, tickers: matches.map((a) => a.ticker), relevance: article.relevance === "Baixa" ? "Média" as const : article.relevance }] : [];
  });
}