export type AssetClass = "Ações" | "FIIs" | "Renda Fixa" | "Exterior" | "Cripto";

export interface Asset {
  ticker: string;
  name: string;
  cls: AssetClass;
  qty: number;
  avgPrice: number;
  price: number;
  dayChange: number; // %
  weekChange: number; // %
  dy?: number; // %
  pvp?: number;
  pl?: number;
  dividendsReceived: number;
  extra?: Record<string, string>;
}

export const CLASSES: AssetClass[] = ["Ações", "FIIs", "Renda Fixa", "Exterior", "Cripto"];

export const CLASS_COLOR: Record<AssetClass, string> = {
  Ações: "var(--chart-1)",
  FIIs: "var(--chart-2)",
  "Renda Fixa": "var(--chart-3)",
  Exterior: "var(--chart-4)",
  Cripto: "var(--chart-5)",
};

export const INITIAL_ASSETS: Asset[] = [
  { ticker: "PETR4", name: "Petrobras PN", cls: "Ações", qty: 80, avgPrice: 31.2, price: 37.84, dayChange: 1.42, weekChange: 3.1, dy: 12.4, pvp: 1.12, pl: 4.6, dividendsReceived: 412.8, extra: { ROE: "24,1%", "Dív. Líq/EBITDA": "1,1x", "Margem Líq.": "18,2%" } },
  { ticker: "ITUB4", name: "Itaú Unibanco PN", cls: "Ações", qty: 60, avgPrice: 27.5, price: 34.1, dayChange: -0.38, weekChange: 1.2, dy: 6.8, pvp: 1.88, pl: 8.9, dividendsReceived: 168.3, extra: { ROE: "21,4%", "Índice Basileia": "13,8%" } },
  { ticker: "WEGE3", name: "WEG ON", cls: "Ações", qty: 25, avgPrice: 38.9, price: 41.25, dayChange: -1.9, weekChange: -4.3, dy: 1.6, pvp: 9.4, pl: 31.2, dividendsReceived: 22.1, extra: { ROE: "31,0%", "Margem Líq.": "16,9%" } },
  { ticker: "MXRF11", name: "Maxi Renda FII", cls: "FIIs", qty: 220, avgPrice: 10.05, price: 9.71, dayChange: 0.21, weekChange: -0.6, dy: 12.9, pvp: 1.01, dividendsReceived: 238.4, extra: { Segmento: "Papel", "Nº cotistas": "1,1 mi", "Último rend.": "R$ 0,10" } },
  { ticker: "HGLG11", name: "CSHG Logística", cls: "FIIs", qty: 9, avgPrice: 158.4, price: 162.9, dayChange: 0.64, weekChange: 1.8, dy: 8.6, pvp: 0.98, dividendsReceived: 99.0, extra: { Segmento: "Logística", Vacância: "4,2%", Imóveis: "24" } },
  { ticker: "KNRI11", name: "Kinea Renda Imob.", cls: "FIIs", qty: 6, avgPrice: 139.0, price: 134.2, dayChange: -0.45, weekChange: -1.4, dy: 7.9, pvp: 0.91, dividendsReceived: 52.0, extra: { Segmento: "Híbrido", Vacância: "6,8%", Imóveis: "21" } },
  { ticker: "TESOURO-IPCA", name: "Tesouro IPCA+ 2035", cls: "Renda Fixa", qty: 1, avgPrice: 2400, price: 2614.5, dayChange: 0.03, weekChange: 0.1, dividendsReceived: 0, extra: { Taxa: "IPCA + 6,4%", Vencimento: "15/05/2035", Liquidez: "D+1" } },
  { ticker: "CDB-INTER", name: "CDB Banco Inter 110% CDI", cls: "Renda Fixa", qty: 1, avgPrice: 1300, price: 1398.2, dayChange: 0.04, weekChange: 0.2, dividendsReceived: 0, extra: { Taxa: "110% CDI", Vencimento: "02/2027", FGC: "Sim" } },
  { ticker: "IVVB11", name: "iShares S&P 500", cls: "Exterior", qty: 6, avgPrice: 290.0, price: 342.7, dayChange: 0.88, weekChange: 2.4, pvp: undefined, dividendsReceived: 0, extra: { "Taxa adm.": "0,23%", Índice: "S&P 500" } },
  { ticker: "BTC", name: "Bitcoin", cls: "Cripto", qty: 0.0045, avgPrice: 310000, price: 352800, dayChange: 2.74, weekChange: 6.9, dividendsReceived: 0, extra: { "Market cap": "US$ 1,3 tri", "Máx. 52s": "R$ 398 mil" } },
];

export const value = (a: Asset) => a.qty * a.price;
export const cost = (a: Asset) => a.qty * a.avgPrice;

export const brl = (n: number, opts: Intl.NumberFormatOptions = {}) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", ...opts });
export const pct = (n: number, d = 2) =>
  `${n > 0 ? "+" : ""}${n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d })}%`;

export function summarize(assets: Asset[]) {
  const total = assets.reduce((s, a) => s + value(a), 0);
  const invested = assets.reduce((s, a) => s + cost(a), 0);
  const dividends = assets.reduce((s, a) => s + a.dividendsReceived, 0);
  const dayPnl = assets.reduce((s, a) => s + value(a) * (a.dayChange / 100), 0);
  const byClass = CLASSES.map((c) => {
    const v = assets.filter((a) => a.cls === c).reduce((s, a) => s + value(a), 0);
    return { cls: c, value: v, pct: total ? (v / total) * 100 : 0 };
  }).filter((c) => c.value > 0);
  return {
    total,
    invested,
    dividends,
    dayPnl,
    returnPct: invested ? ((total - invested) / invested) * 100 : 0,
    monthPct: 2.34,
    upcoming: 187.6,
    byClass,
  };
}

export const HISTORY = [
  { m: "Nov", v: 12100 }, { m: "Dez", v: 12850 }, { m: "Jan", v: 13300 }, { m: "Fev", v: 13180 },
  { m: "Mar", v: 14020 }, { m: "Abr", v: 14650 }, { m: "Mai", v: 15200 }, { m: "Jun", v: 15010 },
  { m: "Jul", v: 15980 }, { m: "Ago", v: 16720 }, { m: "Set", v: 17690 }, { m: "Out", v: 18452 },
];

export function priceHistory(a: Asset) {
  let seed = a.ticker.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const pts: { d: string; p: number }[] = [];
  let p = a.price * 0.82;
  for (let i = 0; i < 30; i++) {
    p = p * (1 + (rnd() - 0.45) * 0.04);
    pts.push({ d: `${i + 1}`, p });
  }
  const k = a.price / pts[pts.length - 1].p;
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

export interface News {
  id: string;
  ticker: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  tag: NewsTag;
  relevant?: boolean;
}

export const NEWS: News[] = [
  { id: "n1", ticker: "PETR4", title: "Petrobras divulga resultado do 3º trimestre com lucro de R$ 32,6 bi", summary: "A companhia reportou lucro líquido acima do consenso, impulsionado pela produção recorde no pré-sal. O conselho aprovou distribuição de R$ 17 bi em dividendos intermediários.", source: "Valor Econômico", date: "03 out · 09:12", tag: "Resultados", relevant: true },
  { id: "n2", ticker: "HGLG11", title: "HGLG11 anuncia aquisição de galpão logístico em Cajamar (SP)", summary: "O fundo comunicou a compra de um ativo de 48 mil m² por R$ 210 milhões, com cap rate estimado de 8,3% e contrato atípico de 10 anos.", source: "Fato relevante · B3", date: "02 out · 18:40", tag: "Imóveis", relevant: true },
  { id: "n3", ticker: "MXRF11", title: "MXRF11 confirma rendimento de R$ 0,10 por cota em outubro", summary: "O valor representa dividend yield mensal de aproximadamente 1,03% sobre a cota atual. Data com: 30/09; pagamento em 14/10.", source: "Comunicado ao mercado", date: "01 out · 19:05", tag: "Dividendos" },
  { id: "n4", ticker: "KNRI11", title: "KNRI11 reporta aumento de vacância física para 6,8%", summary: "A saída de um locatário do edifício Botafogo Corporate elevou a vacância. A gestão informa negociações em andamento com novos inquilinos.", source: "Relatório gerencial", date: "30 set · 10:20", tag: "Vacância", relevant: true },
  { id: "n5", ticker: "ITUB4", title: "Itaú aprova recompra de até 75 milhões de ações", summary: "O programa terá duração de 18 meses e representa cerca de 1,5% das ações preferenciais em circulação.", source: "InfoMoney", date: "29 set · 16:02", tag: "Fato relevante" },
  { id: "n6", ticker: "WEGE3", title: "WEG anuncia nova fábrica de transformadores no México", summary: "Investimento estimado em US$ 60 milhões amplia capacidade para atender demanda da América do Norte.", source: "Exame", date: "28 set · 08:45", tag: "Mercado" },
  { id: "n7", ticker: "MXRF11", title: "MXRF11 aprova 13ª emissão de cotas", summary: "A oferta pode captar até R$ 600 milhões com preço de R$ 9,62 por cota, incluindo custos. Direito de preferência até 15/10.", source: "Fato relevante · B3", date: "27 set · 20:10", tag: "Emissão" },
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
  { id: "a1", type: "news", title: "Notícia relevante sobre Petrobras", body: "Resultado do 3T acima do consenso.", time: "agora", unread: true },
  { id: "a2", type: "dividend", title: "MXRF11 paga R$ 22,00 em 14/10", body: "Rendimento de R$ 0,10 × 220 cotas.", time: "2h", unread: true },
  { id: "a3", type: "price", title: "WEGE3 caiu 4,3% na semana", body: "Maior variação negativa da sua carteira.", time: "5h", unread: true },
  { id: "a4", type: "indicator", title: "KNRI11: vacância subiu para 6,8%", body: "Indicador variou +2,1 p.p. no mês.", time: "3d" },
  { id: "a5", type: "results", title: "ITUB4 divulga resultados em 05/11", body: "Evento adicionado ao seu calendário.", time: "4d" },
];
