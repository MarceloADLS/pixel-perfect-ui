import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { CLASS_COLOR, brl, type AssetClass } from "@/lib/data";

export function AllocationDonut({ data, total }: { data: { cls: AssetClass; value: number; pct: number }[]; total: number }) {
  return (
    <div className="card-premium flex items-center gap-4 p-4">
      <div className="relative h-36 w-36 shrink-0">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={48} outerRadius={68} paddingAngle={3} stroke="none" cornerRadius={6}>
              {data.map((d) => <Cell key={d.cls} fill={CLASS_COLOR[d.cls]} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] text-muted-foreground">Total</span>
          <span className="tabular text-xs font-semibold">{brl(total, { maximumFractionDigits: 0 })}</span>
        </div>
      </div>
      <ul className="flex-1 space-y-2">
        {data.map((d) => (
          <li key={d.cls} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: CLASS_COLOR[d.cls] }} />
              {d.cls}
            </span>
            <span className="tabular font-semibold">{d.pct.toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
