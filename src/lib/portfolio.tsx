import { createContext, useContext, useState, type ReactNode } from "react";
import { INITIAL_ASSETS, type Asset } from "./data";

interface Ctx {
  assets: Asset[];
  add: (a: Asset) => void;
  remove: (ticker: string) => void;
}
const PortfolioCtx = createContext<Ctx | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  return (
    <PortfolioCtx.Provider
      value={{
        assets,
        add: (a) =>
          setAssets((prev) => {
            const ex = prev.find((p) => p.ticker === a.ticker);
            if (!ex) return [...prev, a];
            const qty = ex.qty + a.qty;
            const avgPrice = (ex.qty * ex.avgPrice + a.qty * a.avgPrice) / qty;
            return prev.map((p) => (p.ticker === a.ticker ? { ...p, qty, avgPrice } : p));
          }),
        remove: (t) => setAssets((prev) => prev.filter((p) => p.ticker !== t)),
      }}
    >
      {children}
    </PortfolioCtx.Provider>
  );
}

export function usePortfolio() {
  const c = useContext(PortfolioCtx);
  if (!c) throw new Error("usePortfolio outside provider");
  return c;
}
