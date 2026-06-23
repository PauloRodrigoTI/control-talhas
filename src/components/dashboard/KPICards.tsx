import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Trash2,
  TrendingUp,
  AlertTriangle,
  Wrench,
  Factory,
} from "lucide-react";
import type { InspectionRecord } from "@/types/inspection";

interface KPICardsProps {
  data: InspectionRecord[];
}

interface KPICard {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  textClass: string;
  progress?: number;
  suffix?: string;
  description?: string;
}

export function KPICards({ data }: KPICardsProps) {
  const total = data.length;
  const aptos = data.filter((d) => d.status === "Apto").length;
  const naoAptos = data.filter((d) => d.status === "Não Apto").length;
  const sucata = data.filter((d) => d.status === "Sucata").length;
  const conformidade = total > 0 ? ((aptos / total) * 100).toFixed(1) : "0";
  const equipamentos = new Set(data.map((d) => d.equipamento)).size;
  const defeitos = data.filter((d) => d.defeito?.trim()).length;
  const criticas = data.filter(
    (d) => d.status === "Não Apto" || d.status === "Sucata"
  ).length;

  const cards: KPICard[] = [
    {
      title: "Inspeções",
      value: total,
      icon: ClipboardCheck,
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
      textClass: "text-primary",
      description: "Total registradas",
    },
    {
      title: "Aptas",
      value: aptos,
      icon: CheckCircle2,
      colorClass: "text-[hsl(var(--status-apto))]",
      bgClass: "bg-[hsl(var(--status-apto-bg))]",
      textClass: "text-[hsl(var(--status-apto))]",
      progress: total > 0 ? (aptos / total) * 100 : 0,
      description: "Equipamentos ok",
    },
    {
      title: "Não Aptas",
      value: naoAptos,
      icon: XCircle,
      colorClass: "text-[hsl(var(--status-nao-apto))]",
      bgClass: "bg-[hsl(var(--status-nao-apto-bg))]",
      textClass: "text-[hsl(var(--status-nao-apto))]",
      progress: total > 0 ? (naoAptos / total) * 100 : 0,
      description: "Requer atenção",
    },
    {
      title: "Sucata",
      value: sucata,
      icon: Trash2,
      colorClass: "text-[hsl(var(--status-sucata))]",
      bgClass: "bg-[hsl(var(--status-sucata-bg))]",
      textClass: "text-[hsl(var(--status-sucata))]",
      progress: total > 0 ? (sucata / total) * 100 : 0,
      description: "Fora de uso",
    },
    {
      title: "Conformidade",
      value: `${conformidade}%`,
      icon: TrendingUp,
      colorClass:
        parseFloat(conformidade) >= 80
          ? "text-[hsl(var(--status-apto))]"
          : parseFloat(conformidade) >= 60
          ? "text-[hsl(var(--status-atencao))]"
          : "text-[hsl(var(--status-nao-apto))]",
      bgClass:
        parseFloat(conformidade) >= 80
          ? "bg-[hsl(var(--status-apto-bg))]"
          : parseFloat(conformidade) >= 60
          ? "bg-[hsl(var(--status-atencao-bg))]"
          : "bg-[hsl(var(--status-nao-apto-bg))]",
      textClass:
        parseFloat(conformidade) >= 80
          ? "text-[hsl(var(--status-apto))]"
          : "text-[hsl(var(--status-nao-apto))]",
      progress: parseFloat(conformidade),
      description: "Taxa de aprovação",
    },
    {
      title: "Talhas",
      value: equipamentos,
      icon: Factory,
      colorClass: "text-[hsl(var(--chart-6))]",
      bgClass: "bg-[hsl(262,60%,55%,0.1)]",
      textClass: "text-[hsl(var(--chart-6))]",
      description: "Equipamentos únicos",
    },
    {
      title: "Defeitos",
      value: defeitos,
      icon: Wrench,
      colorClass: "text-[hsl(var(--status-atencao))]",
      bgClass: "bg-[hsl(var(--status-atencao-bg))]",
      textClass: "text-[hsl(var(--status-atencao))]",
      progress: total > 0 ? (defeitos / total) * 100 : 0,
      description: "Com defeito registrado",
    },
    {
      title: "Críticas",
      value: criticas,
      icon: AlertTriangle,
      colorClass: "text-[hsl(var(--status-vencido))]",
      bgClass: "bg-[hsl(var(--status-vencido-bg))]",
      textClass: "text-[hsl(var(--status-vencido))]",
      progress: total > 0 ? (criticas / total) * 100 : 0,
      description: "Não apta + sucata",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-card border border-border/60 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            {/* Icon + Title row */}
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold leading-tight">
                {card.title}
              </p>
              <div className={`p-1.5 rounded-lg ${card.bgClass} transition-transform duration-200 group-hover:scale-110`}>
                <Icon className={`h-4 w-4 ${card.colorClass}`} />
              </div>
            </div>

            {/* Value */}
            <p className={`text-2xl font-bold tracking-tight ${card.textClass}`}>
              {card.value}
            </p>

            {/* Description */}
            {card.description && (
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                {card.description}
              </p>
            )}

            {/* Progress bar */}
            {card.progress !== undefined && (
              <div className="mt-3">
                <div className="h-1 w-full bg-border/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${card.bgClass.replace("bg-", "bg-").replace("/10", "")}`}
                    style={{
                      width: `${Math.min(card.progress, 100)}%`,
                      background: `hsl(var(${
                        card.title === "Aptas" || card.title === "Conformidade" && parseFloat(String(card.value)) >= 80
                          ? "--status-apto"
                          : card.title === "Não Aptas" || card.title === "Críticas"
                          ? "--status-nao-apto"
                          : card.title === "Sucata"
                          ? "--status-sucata"
                          : card.title === "Defeitos"
                          ? "--status-atencao"
                          : "--chart-1"
                      }))`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
