import { AlertTriangle, XCircle, Trash2, CheckCircle2 } from "lucide-react";
import type { InspectionRecord } from "@/types/inspection";

interface Props {
  data: InspectionRecord[];
}

export function CriticalAlerts({ data }: Props) {
  const alertas = data
    .filter((item) => item.status === "Não Apto" || item.status === "Sucata")
    .slice(0, 5);

  const totalCriticas = data.filter(
    (item) => item.status === "Não Apto" || item.status === "Sucata"
  ).length;

  return (
    <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[hsl(var(--status-nao-apto-bg))]">
            <AlertTriangle className="h-4 w-4 text-[hsl(var(--status-nao-apto))]" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide">Alertas Críticos</h2>
            <p className="text-xs text-muted-foreground">Equipamentos fora de operação</p>
          </div>
        </div>

        {totalCriticas > 0 && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[hsl(var(--status-nao-apto-bg))] text-[hsl(var(--status-nao-apto))]">
            {totalCriticas} {totalCriticas === 1 ? "alerta" : "alertas"}
          </span>
        )}
      </div>

      {alertas.length === 0 ? (
        <div className="flex items-center gap-3 py-4 px-4 rounded-xl bg-[hsl(var(--status-apto-bg))]">
          <CheckCircle2 className="h-5 w-5 text-[hsl(var(--status-apto))] flex-shrink-0" />
          <p className="text-sm font-medium text-[hsl(var(--status-apto))]">
            Nenhum equipamento crítico encontrado.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {alertas.map((item, index) => {
            const isSucata = item.status === "Sucata";
            const Icon = isSucata ? Trash2 : XCircle;

            return (
              <div
                key={index}
                className={`rounded-xl border p-4 ${
                  isSucata
                    ? "bg-[hsl(var(--status-sucata-bg))] border-[hsl(var(--status-sucata))/30]"
                    : "bg-[hsl(var(--status-nao-apto-bg))] border-[hsl(var(--status-nao-apto))/30]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: icon + info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`flex-shrink-0 p-1.5 rounded-lg mt-0.5 ${
                        isSucata
                          ? "bg-[hsl(var(--status-sucata))/15]"
                          : "bg-[hsl(var(--status-nao-apto))/15]"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${
                          isSucata
                            ? "text-[hsl(var(--status-sucata))]"
                            : "text-[hsl(var(--status-nao-apto))]"
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{item.equipamento}</h3>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          TAG: {item.tag}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {item.defeito || "Sem descrição de defeito"}
                      </p>
                    </div>
                  </div>

                  {/* Right: status badge */}
                  <span
                    className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                      isSucata ? "status-sucata" : "status-nao-apto"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}

          {totalCriticas > 5 && (
            <p className="text-xs text-muted-foreground text-center pt-1">
              +{totalCriticas - 5} alerta{totalCriticas - 5 !== 1 ? "s" : ""} adicionais
            </p>
          )}
        </div>
      )}
    </div>
  );
}
