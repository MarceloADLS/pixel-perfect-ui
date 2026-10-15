import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getNews } from "./news.functions";
import { matchNewsToAssets } from "./news";
import { usePortfolio } from "./portfolio";

export const newsQueryOptions = queryOptions({ queryKey: ["publisher-news"], queryFn: () => getNews(), staleTime: 5 * 60 * 1000, refetchInterval: 5 * 60 * 1000 });

export function useNews() {
  const { assets } = usePortfolio();
  const { data } = useSuspenseQuery(newsQueryOptions);
  return { news: matchNewsToAssets(data.articles, assets), unavailable: data.unavailable };
}