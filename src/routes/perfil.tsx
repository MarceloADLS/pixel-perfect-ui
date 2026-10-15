import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, User, Shield, Lock, Moon, Sun, Gauge } from "lucide-react";
import { Page, Section } from "@/components/app/ui";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil — Lume Investimentos" },
      { name: "description", content: "Dados, notificações, perfil de risco, segurança e privacidade." },
      { property: "og:title", content: "Perfil — Lume Investimentos" },
      { property: "og:description", content: "Dados, notificações, perfil de risco, segurança e privacidade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Perfil,
});

const RISKS = ["Conservador", "Moderado", "Arrojado"] as const;

function Perfil() {
  const { theme, setTheme } = useTheme();
  const [risk, setRisk] = useState<(typeof RISKS)[number]>("Moderado");
  const [notif, setNotif] = useState({ news: true, results: true, dividends: true, indicators: false, price: true });
  const labels: Record<keyof typeof notif, string> = {
    news: "Notícias relevantes", results: "Divulgação de resultados", dividends: "Pagamento de dividendos", indicators: "Mudança em indicadores", price: "Alterações de preço",
  };

  return (
    <Page title="Perfil">
      <div className="card-premium flex items-center gap-4 p-4 animate-rise">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">MA</div>
        <div className="flex-1">
          <p className="font-semibold">Marcelo Augusto</p>
          <p className="text-xs text-muted-foreground">marcelo@email.com · Investidor desde 2021</p>
        </div>
      </div>

      <Section title="Perfil de risco">
        <div className="card-premium p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Gauge className="h-4 w-4" /> Como você se define?</div>
          <div className="mt-3 grid grid-cols-3 gap-1 rounded-full bg-secondary p-1">
            {RISKS.map((r) => (
              <button key={r} onClick={() => setRisk(r)} className={`rounded-full py-2 text-xs font-semibold transition ${risk === r ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{r}</button>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Notificações">
        <div className="card-premium divide-y divide-border">
          {(Object.keys(notif) as (keyof typeof notif)[]).map((k) => (
            <label key={k} className="flex items-center justify-between p-4 text-sm">
              {labels[k]}
              <Switch checked={notif[k]} onCheckedChange={(v) => setNotif({ ...notif, [k]: v })} />
            </label>
          ))}
        </div>
      </Section>

      <Section title="Conta">
        <div className="card-premium divide-y divide-border">
          <Row icon={User} label="Dados do usuário" />
          <div className="flex items-center gap-3 p-4 text-sm">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary"><Moon className="h-4 w-4" /></span>
            <span className="flex-1">Tema</span>
            <div className="flex gap-1 rounded-full bg-secondary p-1" role="group" aria-label="Tema">
              <Button size="sm" variant={theme === "light" ? "default" : "ghost"} aria-pressed={theme === "light"} onClick={() => setTheme("light")} className="rounded-full px-3"><Sun />Claro</Button>
              <Button size="sm" variant={theme === "dark" ? "default" : "ghost"} aria-pressed={theme === "dark"} onClick={() => setTheme("dark")} className="rounded-full px-3"><Moon />Escuro</Button>
            </div>
          </div>
          <Row icon={Lock} label="Segurança" value="Biometria ativa" />
          <Row icon={Shield} label="Privacidade" />
        </div>
      </Section>

      <p className="mt-8 text-center text-[11px] leading-relaxed text-muted-foreground">
        As informações apresentadas têm caráter informativo e não constituem recomendação de investimento.
      </p>
    </Page>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof User; label: string; value?: string }) {
  return (
    <button className="flex w-full items-center gap-3 p-4 text-left text-sm transition hover:bg-secondary/50">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary"><Icon className="h-4 w-4" /></span>
      <span className="flex-1">{label}</span>
      {value && <span className="text-xs text-muted-foreground">{value}</span>}
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
