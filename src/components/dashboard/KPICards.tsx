import { ClipboardCheck, CheckCircle2, XCircle, Trash2, TrendingUp } from "lucide-react";
import type { InspectionRecord } from "@/types/inspection";

interface KPICardsProps {
  data: InspectionRecord[];
}

const CARDS_CONFIG = [
  { key: "total", label: "Total Inspecionados", icon: ClipboardCheck, gradient: "from-[hsl(215,75%,50%)] to-[hsl(200,80%,55%)]", bg: "bg-[hsl(215,75%,50%,0.08)]", text: "text-primary" },
  { key: "aptos", label: "Equipamentos Aptos", icon: CheckCircle2, gradient: "from-[hsl(152,60%,40%)] to-[hsl(165,55%,48%)]", bg: "bg-[hsl(152,60%,40%,0.08)]", text: "text-status-apto" },
  { key: "naoAptos", label: "Não Aptos", icon: XCircle, gradient: "from-[hsl(0,68%,52%)] to-[hsl(15,75%,56%)]", bg: "bg-[hsl(0,68%,52%,0.08)]", text: "text-status-nao-apto" },
  { key: "sucata", label: "Sucata", icon: Trash2, gradient: "from-[hsl(220,8%,52%)] to-[hsl(220,12%,62%)]", bg: "bg-[hsl(220,8%,52%,0.08)]", text: "text-status-sucata" },
  { key: "conformidade", label: "% Conformidade", icon: TrendingUp, gradient: "from-[hsl(215,75%,50%)] to-[hsl(152,60%,40%)]", bg: "bg-[hsl(215,75%,50%,0.08)]", text: "text-primary" },
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
      {CARDS_CONFIG.map((c) => (
        <div key={c.key} className="card-elevated group relative overflow-hidden p-5">
          {/* Decorative gradient bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${c.gradient} opacity-80`} />
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">{c.label}</p>
              <p className="text-2xl font-bold tracking-tight">{values[c.key]}</p>
            </div>
            <div className={`p-2.5 rounded-xl ${c.bg}`}>
              <c.icon className={`h-5 w-5 ${c.text}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
