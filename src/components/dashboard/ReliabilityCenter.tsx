import {
  Cog,
  CheckCircle2,
  Wrench,
  Package,
  Building2,
} from "lucide-react";
import type { InspectionRecord } from "@/types/inspection";

interface Props {
  data: InspectionRecord[];
}

interface ReliabilityCard {
  titulo: string;
  valor: number;
  icon: React.ElementType;
  descricao: string;
  colorClass: string;
  bgClass: string;
}

export function ReliabilityCenter({ data }: Props) {
  const totalTalhas = new Set(data.map((d) => d.equipamento)).size;
  const aptas = data.filter((d) => d.status === "Apto").length;
  const defeitos = data.filter((d) => d.defeito && d.defeito !== "N/A").length;
  const pecas = data.filter((d) => d.pecasSubstituidas === "SIM").length;
  const fabricantes = new Set(data.map((d) => d.fabricante)).size;

  const cards: ReliabilityCard[] = [
    {
      titulo: "Talhas",
      valor: totalTalhas,
      icon: Cog,
      descricao: "Equipamentos únicos",
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
    },
    {
      titulo: "Aptas",
      valor: aptas,
      icon: CheckCircle2,
      descricao: "Em condição operacional",
      colorClass: "text-[hsl(var(--status-apto))]",
      bgClass: "bg-[hsl(var(--status-apto-bg))]",
    },
    {
      titulo: "Defeitos",
      valor: defeitos,
      icon: Wrench,
      descricao: "Registros com defeito",
      colorClass: "text-[hsl(var(--status-atencao))]",
      bgClass: "bg-[hsl(var(--status-atencao-bg))]",
    },
    {
      titulo: "Peças Trocadas",
      valor: pecas,
      icon: Package,
      descricao: "Substituições realizadas",
      colorClass: "text-[hsl(var(--chart-6))]",
      bgClass: "bg-[hsl(262,60%,55%,0.1)]",
    },
    {
      titulo: "Fabricantes",
      valor: fabricantes,
      icon: Building2,
      descricao: "Fornecedores distintos",
      colorClass: "text-[hsl(var(--chart-7))]",
      bgClass: "bg-[hsl(190,70%,42%,0.1)]",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.titulo}
            className="bg-card border border-border/60 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group"
          >
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
            <p className={`text-3xl font-bold tracking-tight ${card.colorClass}`}>
              {card.valor}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1 truncate">
              {card.descricao}
            </p>
          </div>
        );
      })}
    </div>
  );
}
