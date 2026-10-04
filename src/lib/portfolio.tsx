import { createContext, useContext, useState, type ReactNode } from "react";
import { INITIAL_ASSETS, type Asset } from "./data";

interface Ctx {
  assets: Asset[];
  add: (a: Asset) => void;
  remove: (ticker: string) => void;
}
const WatchCtx = createContext<Ctx | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  return (
    <WatchCtx.Provider
      value={{
        assets,
        add: (a) => setAssets((prev) => (prev.some((p) => p.ticker === a.ticker) ? prev : [...prev, a])),
        remove: (t) => setAssets((prev) => prev.filter((p) => p.ticker !== t)),
      }}
    >
      {children}
    </WatchCtx.Provider>
  );
}

export function usePortfolio() {
  const c = useContext(WatchCtx);
  if (!c) throw new Error("usePortfolio outside provider");
  return c;
}
