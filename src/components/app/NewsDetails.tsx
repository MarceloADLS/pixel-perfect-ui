import { ExternalLink } from "lucide-react";
import type { News } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { RelevanceBadge } from "./ui";

export function ArticleLink({ article }: { article: News }) {
  if (!article.url) return null;
  return <Button asChild variant="outline" size="sm" className="mt-4"><a href={article.url} target="_blank" rel="noopener noreferrer">Ler no {article.source}<ExternalLink /></a></Button>;
}

export function NewsDetails({ article, onClose }: { article: News | null; onClose: () => void }) {
  return <Sheet open={!!article} onOpenChange={(open) => { if (!open) onClose(); }}>
    <SheetContent side="bottom" className="mx-auto max-h-[85dvh] max-w-md overflow-y-auto rounded-t-3xl border-border bg-popover">
      {article && <>
        <SheetHeader>
          <div className="flex items-center gap-2 text-[11px]"><span className="font-bold">{article.tickers?.join(" · ") || article.ticker}</span><RelevanceBadge r={article.relevance} /></div>
          <SheetTitle className="text-left text-lg leading-snug">{article.title}</SheetTitle>
          <SheetDescription className="text-left">{article.source} · {article.date}</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-8"><p className="text-sm leading-relaxed text-muted-foreground">{article.summary || "Resumo não disponibilizado pela fonte."}</p><ArticleLink article={article} /></div>
      </>}
    </SheetContent>
  </Sheet>;
}