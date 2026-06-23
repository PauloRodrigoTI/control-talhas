import { Timer, Hammer, Activity, ShieldCheck } from "lucide-react";
import type { InspectionRecord } from "@/types/inspection";

interface Props {
  data: InspectionRecord[];
}

interface ExecutiveCard {
  titulo: string;
  valor: string | number;
  descricao: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  hint?: string;
}

export function ExecutiveKPIs({ data }: Props) {
  const totalInspecoes = data.length;
  const falhas = data.filter(
    (item) => item.status === "Não Apto" || item.status === "Sucata"
  ).length;

  const mtbf =
    falhas > 0 ? (totalInspecoes / falhas).toFixed(1) : totalInspecoes;
  const mttr = falhas > 0 ? (falhas * 2).toFixed(1) : "0";
  const disponibilidade =
    totalInspecoes > 0
      ? (((totalInspecoes - falhas) / totalInspecoes) * 100).toFixed(1)
      : "0";
  const confiabilidade = disponibilidade;

  const dispNum = parseFloat(disponibilidade);
  const dispColor =
    dispNum >= 80
      ? "text-[hsl(var(--status-apto))]"
      : dispNum >= 60
      ? "text-[hsl(var(--status-atencao))]"
      : "text-[hsl(var(--status-nao-apto))]";
  const dispBg =
    dispNum >= 80
      ? "bg-[hsl(var(--status-apto-bg))]"
      : dispNum >= 60
      ? "bg-[hsl(var(--status-atencao-bg))]"
      : "bg-[hsl(var(--status-nao-apto-bg))]";

  const cards: ExecutiveCard[] = [
    {
      titulo: "MTBF",
      valor: mtbf,
      descricao: "Tempo médio entre falhas",
      icon: Timer,
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
      hint: "Quanto maior, melhor",
    },
    {
      titulo: "MTTR",
      valor: mttr,
      descricao: "Tempo médio de reparo",
      icon: Hammer,
      colorClass: "text-[hsl(var(--status-atencao))]",
      bgClass: "bg-[hsl(var(--status-atencao-bg))]",
      hint: "Estimativa baseada em falhas",
    },
    {
      titulo: "Disponibilidade",
      valor: `${disponibilidade}%`,
      descricao: "Equipamentos operacionais",
      icon: Activity,
      colorClass: dispColor,
      bgClass: dispBg,
      hint: dispNum >= 80 ? "Acima da meta" : "Abaixo da meta",
    },
    {
      titulo: "Confiabilidade",
      valor: `${confiabilidade}%`,
      descricao: "Probabilidade de operação contínua",
      icon: ShieldCheck,
      colorClass: dispColor,
      bgClass: dispBg,
      hint: "Baseada em histórico de inspeções",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const dispVal =
          typeof card.valor === "string" && card.valor.endsWith("%")
            ? parseFloat(card.valor)
            : null;

        return (
          <div
            key={card.titulo}
            className="bg-card border border-border/60 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            {/* Top row: title + icon */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                {card.titulo}
              </p>
              <div
                className={`p-1.5 rounded-lg ${card.bgClass} transition-transform duration-200 group-hover:scale-110`}
              >
                <Icon className={`h-4 w-4 ${card.colorClass}`} />
              </div>
            </div>

            {/* Value */}
            <p className={`text-3xl font-bold tracking-tight ${card.colorClass}`}>
              {card.valor}
            </p>

            {/* Description */}
            <p className="text-xs text-muted-foreground mt-1">{card.descricao}</p>

            {/* Progress bar for percentage metrics */}
            {dispVal !== null && (
              <div className="mt-3">
                <div className="h-1.5 w-full bg-border/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700`}
                    style={{
                      width: `${Math.min(dispVal, 100)}%`,
                      background: `hsl(var(${
                        dispVal >= 80
                          ? "--status-apto"
                          : dispVal >= 60
                          ? "--status-atencao"
                          : "--status-nao-apto"
                      }))`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Hint */}
            {card.hint && (
              <p className="text-[10px] text-muted-foreground mt-2 italic">
                {card.hint}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
