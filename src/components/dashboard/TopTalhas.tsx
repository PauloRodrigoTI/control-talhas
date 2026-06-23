import { ShieldAlert } from "lucide-react";
import type { InspectionRecord } from "@/types/inspection";

interface Props {
  data: InspectionRecord[];
}

export function TopTalhas({ data }: Props) {
  const ranking = Object.entries(
    data.reduce((acc, item) => {
      if (item.status === "Não Apto" || item.status === "Sucata") {
        acc[item.equipamento] = (acc[item.equipamento] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxValue = ranking[0]?.[1] ?? 1;

  const rankColors = [
    "bg-[hsl(0,75%,50%)]",
    "bg-[hsl(0,65%,55%)]",
    "bg-[hsl(15,70%,52%)]",
    "bg-[hsl(22,65%,55%)]",
    "bg-[hsl(30,60%,58%)]",
  ];

  return (
    <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="p-2 rounded-lg bg-[hsl(0,75%,50%,0.1)]">
          <ShieldAlert className="h-4 w-4 text-[hsl(0,75%,50%)]" />
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide">Top 5 Talhas Críticas</h2>
          <p className="text-xs text-muted-foreground">Maior número de reprovações</p>
        </div>
      </div>

      {ranking.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Nenhuma talha crítica encontrada.
        </p>
      ) : (
        <div className="space-y-3">
          {ranking.map(([equipamento, count], index) => {
            const percentage = (count / maxValue) * 100;
            return (
              <div key={equipamento} className="flex items-center gap-3">
                {/* Rank number */}
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold ${rankColors[index]}`}
                >
                  {index + 1}
                </div>

                {/* Name + bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">{equipamento}</span>
                    <span className="text-sm font-bold text-[hsl(0,75%,50%)] ml-2 flex-shrink-0">
                      {count}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-border/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${rankColors[index]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
