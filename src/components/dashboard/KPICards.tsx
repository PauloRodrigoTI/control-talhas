import { ClipboardCheck, CheckCircle2, XCircle, Trash2, TrendingUp } from "lucide-react";
import type { InspectionRecord } from "@/types/inspection";

interface KPICardsProps {
  data: InspectionRecord[];
}

const CARDS_CONFIG = [
  { key: "total",        label: "Total Inspecionados", icon: ClipboardCheck, accent: "primary",       barColor: "bg-primary" },
  { key: "aptos",        label: "Equipamentos Aptos",  icon: CheckCircle2,   accent: "status-apto",    barColor: "bg-[hsl(var(--status-apto))]" },
  { key: "naoAptos",     label: "Não Aptos",           icon: XCircle,        accent: "status-nao-apto",barColor: "bg-[hsl(var(--status-nao-apto))]" },
  { key: "sucata",       label: "Sucata",              icon: Trash2,         accent: "status-sucata",  barColor: "bg-[hsl(var(--status-sucata))]" },
  { key: "conformidade", label: "% Conformidade",      icon: TrendingUp,     accent: "accent",         barColor: "bg-accent" },
] as const;

export function KPICards({ data }: KPICardsProps) {
  const total = data.length;
  const aptos = data.filter((d) => d.status === "Apto").length;
  const naoAptos = data.filter((d) => d.status === "Não Apto").length;
  const sucata = data.filter((d) => d.status === "Sucata").length;
  const conformidade = total > 0 ? ((aptos / total) * 100).toFixed(1) : "0";

  const values: Record<string, string | number> = { total, aptos, naoAptos, sucata, conformidade: `${conformidade}%` };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {CARDS_CONFIG.map((c) => {
        const colorVar = `hsl(var(--${c.accent}))`;
        return (
          <div
            key={c.key}
            className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5"
          >
            <div className={`absolute top-0 left-0 right-0 h-1 ${c.barColor}`} />
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 min-w-0">
                <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</p>
                <p className="text-3xl font-bold tracking-tight leading-none">{values[c.key]}</p>
              </div>
              <div
                className="p-2.5 rounded-xl flex-shrink-0"
                style={{ backgroundColor: `color-mix(in hsl, ${colorVar} 12%, transparent)` }}
              >
                <c.icon className="h-5 w-5" style={{ color: colorVar }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
