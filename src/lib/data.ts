export type AssetClass = "Ações" | "FIIs" | "ETFs" | "Cripto";

export interface Asset {
  ticker: string;
  name: string;
  cls: AssetClass;
  price: number;
  dayChange: number;
  weekChange: number;
  dy?: number;
  pvp?: number;
  pl?: number;
  extra?: Record<string, string>;
  owned?: boolean; // possui ou apenas acompanha
}

export const CLASSES: AssetClass[] = ["Ações", "FIIs", "ETFs", "Cripto"];

export const CLASS_COLOR: Record<AssetClass, string> = {
  Ações: "var(--chart-1)",
  FIIs: "var(--chart-2)",
  ETFs: "var(--chart-4)",
  Cripto: "var(--chart-5)",
};

export const INITIAL_ASSETS: Asset[] = [
  { ticker: "PETR4", name: "Petrobras PN", cls: "Ações", owned: true, price: 37.84, dayChange: 1.42, weekChange: 3.1, dy: 12.4, pvp: 1.12, pl: 4.6, extra: { ROE: "24,1%", "Dív. Líq/EBITDA": "1,1x", "Margem Líq.": "18,2%" } },
  { ticker: "ITUB4", name: "Itaú Unibanco PN", cls: "Ações", owned: true, price: 34.1, dayChange: -0.38, weekChange: 1.2, dy: 6.8, pvp: 1.88, pl: 8.9, extra: { ROE: "21,4%", "Índice Basileia": "13,8%" } },
  { ticker: "WEGE3", name: "WEG ON", cls: "Ações", price: 41.25, dayChange: -1.9, weekChange: -4.3, dy: 1.6, pvp: 9.4, pl: 31.2, extra: { ROE: "31,0%", "Margem Líq.": "16,9%" } },
  { ticker: "MXRF11", name: "Maxi Renda FII", cls: "FIIs", owned: true, price: 9.71, dayChange: 0.21, weekChange: -0.6, dy: 12.9, pvp: 1.01, extra: { Segmento: "Papel", "Nº cotistas": "1,1 mi", "Último rend.": "R$ 0,10" } },
  { ticker: "HGLG11", name: "CSHG Logística", cls: "FIIs", owned: true, price: 162.9, dayChange: 0.64, weekChange: 1.8, dy: 8.6, pvp: 0.98, extra: { Segmento: "Logística", Vacância: "4,2%", Imóveis: "24" } },
  { ticker: "KNRI11", name: "Kinea Renda Imob.", cls: "FIIs", price: 134.2, dayChange: -0.45, weekChange: -1.4, dy: 7.9, pvp: 0.91, extra: { Segmento: "Híbrido", Vacância: "6,8%", Imóveis: "21" } },
  { ticker: "IVVB11", name: "iShares S&P 500", cls: "ETFs", owned: true, price: 342.7, dayChange: 0.88, weekChange: 2.4, extra: { "Taxa adm.": "0,23%", Índice: "S&P 500", Patrimônio: "R$ 7,9 bi" } },
  { ticker: "BOVA11", name: "iShares Ibovespa", cls: "ETFs", price: 128.4, dayChange: 0.32, weekChange: 0.9, extra: { "Taxa adm.": "0,10%", Índice: "Ibovespa" } },
  { ticker: "BTC", name: "Bitcoin", cls: "Cripto", price: 352800, dayChange: 2.74, weekChange: 6.9, extra: { "Market cap": "US$ 1,3 tri", "Máx. 52s": "R$ 398 mil", Dominância: "54%" } },
];

export const brl = (n: number, opts: Intl.NumberFormatOptions = {}) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", ...opts });

export function priceHistory(a: Asset) {
  let seed = a.ticker.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const pts: { d: string; p: number }[] = [];
  let p = a.price * 0.82;
  for (let i = 0; i < 30; i++) {
    p = p * (1 + (rnd() - 0.45) * 0.04);
    pts.push({ d: `${i + 1}`, p });
  }
  const k = a.price / (pts[pts.length - 1]?.p ?? a.price);
  return pts.map((x) => ({ ...x, p: +(x.p * k).toFixed(2) }));
}

export function dividendHistory(a: Asset) {
  if (!a.dy) return [];
  const monthly = (a.price * a.dy) / 100 / 12;
  return ["Mai", "Jun", "Jul", "Ago", "Set", "Out"].map((m, i) => ({
    m,
    v: +(monthly * (0.85 + ((i * 37) % 30) / 100)).toFixed(2),
  }));
}

export type NewsTag = "Resultados" | "Dividendos" | "Fato relevante" | "Emissão" | "Imóveis" | "Gestão" | "Vacância" | "Mercado";
export type Relevance = "Alta" | "Média" | "Baixa";

export interface News {
  id: string;
  ticker: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  tag: NewsTag;
  relevance: Relevance;
  url?: string;
  publishedAt?: string;
  tickers?: string[];
}

export const NEWS: News[] = [
  { id: "n1", ticker: "PETR4", title: "Petrobras divulga resultado do 3º trimestre com lucro de R$ 32,6 bi", summary: "A companhia reportou lucro líquido acima do consenso, impulsionado pela produção recorde no pré-sal. O conselho aprovou distribuição de R$ 17 bi em dividendos intermediários.", source: "Valor Econômico", date: "Hoje · 09:12", tag: "Resultados", relevance: "Alta" },
  { id: "n2", ticker: "HGLG11", title: "HGLG11 anuncia aquisição de galpão logístico em Cajamar (SP)", summary: "O fundo comunicou a compra de um ativo de 48 mil m² por R$ 210 milhões, com cap rate estimado de 8,3% e contrato atípico de 10 anos.", source: "Fato relevante · B3", date: "Hoje · 08:40", tag: "Imóveis", relevance: "Alta" },
  { id: "n8", ticker: "BTC", title: "Bitcoin supera R$ 350 mil com entrada recorde em ETFs", summary: "Fluxo líquido semanal para ETFs à vista ultrapassou US$ 2 bi, segundo dados de mercado.", source: "CoinDesk", date: "Hoje · 07:55", tag: "Mercado", relevance: "Média" },
  { id: "n3", ticker: "MXRF11", title: "MXRF11 confirma rendimento de R$ 0,10 por cota em outubro", summary: "O valor representa dividend yield mensal de aproximadamente 1,03% sobre a cota atual. Data com: 30/09; pagamento em 14/10.", source: "Comunicado ao mercado", date: "Ontem · 19:05", tag: "Dividendos", relevance: "Média" },
  { id: "n4", ticker: "KNRI11", title: "KNRI11 reporta aumento de vacância física para 6,8%", summary: "A saída de um locatário do edifício Botafogo Corporate elevou a vacância. A gestão informa negociações em andamento com novos inquilinos.", source: "Relatório gerencial", date: "30 set · 10:20", tag: "Vacância", relevance: "Alta" },
  { id: "n5", ticker: "ITUB4", title: "Itaú aprova recompra de até 75 milhões de ações", summary: "O programa terá duração de 18 meses e representa cerca de 1,5% das ações preferenciais em circulação.", source: "InfoMoney", date: "29 set · 16:02", tag: "Fato relevante", relevance: "Média" },
  { id: "n6", ticker: "WEGE3", title: "WEG anuncia nova fábrica de transformadores no México", summary: "Investimento estimado em US$ 60 milhões amplia capacidade para atender demanda da América do Norte.", source: "Exame", date: "28 set · 08:45", tag: "Mercado", relevance: "Baixa" },
  { id: "n9", ticker: "IVVB11", title: "S&P 500 renova máxima histórica após dados de inflação nos EUA", summary: "O índice subiu 0,9% no dia; o ETF IVVB11 acompanha a variação somada ao câmbio.", source: "Reuters", date: "28 set · 18:00", tag: "Mercado", relevance: "Baixa" },
  { id: "n7", ticker: "MXRF11", title: "MXRF11 aprova 13ª emissão de cotas", summary: "A oferta pode captar até R$ 600 milhões com preço de R$ 9,62 por cota. Direito de preferência até 15/10.", source: "Fato relevante · B3", date: "27 set · 20:10", tag: "Emissão", relevance: "Alta" },
];

export const DAILY_FACTS = [
  "Petrobras divulgou lucro acima do consenso no 3T.",
  "HGLG11 comunicou aquisição de galpão em Cajamar.",
  "Bitcoin acumula alta de 6,9% na semana.",
  "WEGE3 tem a maior queda semanal entre seus ativos (−4,3%).",
];

export interface Alert {
  id: string;
  type: "news" | "results" | "dividend" | "indicator" | "event" | "price";
  title: string;
  body: string;
  time: string;
  unread?: boolean;
}

export const ALERTS: Alert[] = [
  { id: "a1", type: "news", title: "Fato relevante: Petrobras", body: "Resultado do 3T acima do consenso.", time: "agora", unread: true },
  { id: "a2", type: "event", title: "HGLG11 adquiriu novo imóvel", body: "Galpão logístico de 48 mil m².", time: "1h", unread: true },
  { id: "a3", type: "price", title: "WEGE3 caiu 4,3% na semana", body: "Maior variação negativa entre seus ativos.", time: "5h", unread: true },
  { id: "a4", type: "indicator", title: "KNRI11: vacância subiu para 6,8%", body: "Indicador variou +2,1 p.p. no mês.", time: "3d" },
  { id: "a5", type: "results", title: "ITUB4 divulga resultados em 05/11", body: "Evento adicionado à sua agenda.", time: "4d" },
];
