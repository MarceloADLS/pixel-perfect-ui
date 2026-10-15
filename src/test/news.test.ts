import { describe, expect, it } from "vitest";
import { INITIAL_ASSETS } from "@/lib/data";
import { matchNewsToAssets, NEWS_SOURCES, parseFeed, parsePublishedAt, safeArticleUrl } from "@/lib/news";

const xml = `<rss><channel><item><title>Petrobras e Itaú anunciam resultados</title><link>https://www.infomoney.com.br/mercados/noticia-real/</link><pubDate>Thu, 15 Oct 2026 12:00:00 GMT</pubDate><description><![CDATA[<p>Lucro informado pelas companhias.</p><script>alert(1)</script>]]></description></item></channel></rss>`;

describe("Publisher news", () => {
  it("keeps the real publisher summary and original article URL", () => {
    const [article] = parseFeed(xml, NEWS_SOURCES[0]);
    expect(article?.source).toBe("InfoMoney");
    expect(article?.summary).toBe("Lucro informado pelas companhias.");
    expect(article?.url).toBe("https://www.infomoney.com.br/mercados/noticia-real/");
  });
  it("rejects non-publisher and unsafe links", () => {
    expect(safeArticleUrl("javascript:alert(1)", "uol.com.br")).toBeNull();
    expect(safeArticleUrl("https://uol.com.br.evil.example/article", "uol.com.br")).toBeNull();
    expect(safeArticleUrl("https://economia.uol.com.br/noticias/article.htm", "uol.com.br")).toBe("https://economia.uol.com.br/noticias/article.htm");
  });
  it("matches a genuine article to every followed asset it mentions", () => {
    const matched = matchNewsToAssets(parseFeed(xml, NEWS_SOURCES[0]), INITIAL_ASSETS);
    expect(matched).toHaveLength(1);
    expect(matched[0]?.tickers).toEqual(["PETR4", "ITUB4"]);
    expect(matchNewsToAssets(parseFeed(xml, NEWS_SOURCES[0]), INITIAL_ASSETS.filter((a) => a.ticker === "BTC"))).toEqual([]);
  });
  it("parses UOL Portuguese publication dates without inventing dates", () => {
    expect(parsePublishedAt("Qui, 15 Out 2026 09:00:00 -0300")).toBe("2026-10-15T12:00:00.000Z");
    expect(parsePublishedAt("invalid")).toBeNull();
  });
  it("returns no fabricated fallback articles for an empty feed", () => {
    expect(parseFeed("<rss><channel /></rss>", NEWS_SOURCES[0])).toEqual([]);
  });
});