import { createServerFn } from "@tanstack/react-start";
import { NEWS_SOURCES, parseFeed, decodeFeed } from "./news";
import type { News } from "./data";

type FeedResult = { articles: News[]; unavailable: string[] };
let cached: { expires: number; result: FeedResult } | undefined;

// Public, read-only publisher feeds. No user data or caller-controlled URLs.
export const getNews = createServerFn({ method: "GET" }).handler(async (): Promise<FeedResult> => {
  if (cached && cached.expires > Date.now()) return cached.result;
  const results = await Promise.all(NEWS_SOURCES.map(async (source) => {
    try {
      const response = await fetch(source.url, { signal: AbortSignal.timeout(10000), headers: { Accept: "application/rss+xml, application/xml, text/xml" } });
      if (!response.ok) throw new Error("Publisher unavailable");
      const articles = parseFeed(decodeFeed(await response.arrayBuffer(), response.headers.get("content-type") ?? ""), source);
      return { articles, unavailable: articles.length ? [] : [source.name] };
    } catch { return { articles: [] as News[], unavailable: [source.name] }; }
  }));
  const articles = Array.from(new Map(results.flatMap((r) => r.articles).map((n) => [n.id, n])).values()).sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
  const result = { articles, unavailable: results.flatMap((r) => r.unavailable) };
  if (articles.length) cached = { expires: Date.now() + 5 * 60 * 1000, result };
  return result;
});