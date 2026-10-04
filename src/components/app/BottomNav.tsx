import { Link } from "@tanstack/react-router";
import { Home, PieChart, Bot, Newspaper, User } from "lucide-react";

const items = [
  { to: "/", label: "Início", icon: Home },
  { to: "/ativos", label: "Ativos", icon: PieChart },
  { to: "/ia", label: "IA", icon: Bot },
  { to: "/noticias", label: "Notícias", icon: Newspaper },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-3 pb-3">
      <div className="flex items-center justify-between rounded-3xl border border-border bg-surface/90 px-2 py-2 backdrop-blur-xl">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="group flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 text-[11px] font-medium text-muted-foreground transition-colors data-[status=active]:text-primary"
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-8 w-12 items-center justify-center rounded-full transition-all ${isActive ? "bg-primary/15" : "group-hover:bg-secondary"}`}
                >
                  <Icon className="h-[19px] w-[19px]" strokeWidth={isActive ? 2.4 : 1.8} />
                </span>
                {label}
              </>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
