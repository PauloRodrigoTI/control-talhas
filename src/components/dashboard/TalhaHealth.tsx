import { CheckCircle2, AlertTriangle, XCircle, Trash2, Activity } from "lucide-react";
import type { InspectionRecord } from "@/types/inspection";

interface Props {
  data: InspectionRecord[];
}

type HealthStatus = "Saudável" | "Atenção" | "Crítica" | "Sucata";

const STATUS_CONFIG: Record<
  HealthStatus,
  {
    label: string;
    icon: React.ElementType;
    badgeClass: string;
    ringClass: string;
    dotClass: string;
  }
> = {
  Saudável: {
    label: "Saudável",
    icon: CheckCircle2,
    badgeClass: "status-apto",
    ringClass: "border-[hsl(var(--status-apto))]",
    dotClass: "bg-[hsl(var(--status-apto))]",
  },
  Atenção: {
    label: "Atenção",
    icon: AlertTriangle,
    badgeClass: "status-atencao",
    ringClass: "border-[hsl(var(--status-atencao))]",
    dotClass: "bg-[hsl(var(--status-atencao))]",
  },
  Crítica: {
    label: "Crítica",
    icon: XCircle,
    badgeClass: "status-nao-apto",
    ringClass: "border-[hsl(var(--status-nao-apto))]",
    dotClass: "bg-[hsl(var(--status-nao-apto))]",
  },
  Sucata: {
    label: "Sucata",
    icon: Trash2,
    badgeClass: "status-sucata",
    ringClass: "border-[hsl(var(--status-sucata))]",
    dotClass: "bg-[hsl(var(--status-sucata))]",
  },
};

export function TalhaHealth({ data }: Props) {
  const equipamentos = [...new Set(data.map((item) => item.equipamento))];

  const healthData = equipamentos.map((equipamento) => {
    const historico = data.filter((item) => item.equipamento === equipamento);
    const sucata = historico.filter((item) => item.status === "Sucata").length;
    const naoApto = historico.filter((item) => item.status === "Não Apto").length;

    let status: HealthStatus = "Saudável";
    if (sucata > 0) status = "Sucata";
    else if (naoApto >= 3) status = "Crítica";
    else if (naoApto >= 1) status = "Atenção";

    return { equipamento, status, total: historico.length, naoApto, sucata };
  });

  // Summary counts
  const summary = {
    Saudável: healthData.filter((h) => h.status === "Saudável").length,
    Atenção: healthData.filter((h) => h.status === "Atenção").length,
    Crítica: healthData.filter((h) => h.status === "Crítica").length,
    Sucata: healthData.filter((h) => h.status === "Sucata").length,
  };

  return (
    <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide">Saúde das Talhas</h2>
            <p className="text-xs text-muted-foreground">Baseado no histórico de inspeções</p>
          </div>
        </div>

        {/* Summary pills */}
        <div className="hidden md:flex items-center gap-2">
          {(Object.entries(summary) as [HealthStatus, number][]).map(([status, count]) => {
            const cfg = STATUS_CONFIG[status];
            return (
              <div key={status} className="flex items-center gap-1.5 text-xs">
                <div className={`h-2 w-2 rounded-full ${cfg.dotClass}`} />
                <span className="text-muted-foreground">{status}:</span>
                <span className="font-semibold">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
        {healthData.map((item) => {
          const cfg = STATUS_CONFIG[item.status];
          const Icon = cfg.icon;
          return (
            <div
              key={item.equipamento}
              className={`border-2 ${cfg.ringClass} rounded-xl p-3.5 hover:shadow-md transition-all duration-200 bg-card`}
            >
              {/* Status icon */}
              <div className="mb-2.5">
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badgeClass}`}>
                  <Icon className="h-2.5 w-2.5" />
                  {cfg.label}
                </span>
              </div>

              {/* Name */}
              <h3 className="font-semibold text-sm truncate leading-tight">
                {item.equipamento}
              </h3>

              {/* Stats */}
              <p className="text-[10px] text-muted-foreground mt-1">
                {item.total} inspeção{item.total !== 1 ? "ões" : ""}
                {item.naoApto > 0 && ` · ${item.naoApto} reprov.`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
