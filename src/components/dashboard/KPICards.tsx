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

export function KPICards({
  data,
}: KPICardsProps) {
  const total = data.length;

  const aptos = data.filter(
    (d) => d.status === "Apto"
  ).length;

  const naoAptos = data.filter(
    (d) => d.status === "Não Apto"
  ).length;

  const sucata = data.filter(
    (d) => d.status === "Sucata"
  ).length;

  const conformidade =
    total > 0
      ? ((aptos / total) * 100).toFixed(1)
      : "0";

  const equipamentos =
    new Set(
      data.map((d) => d.equipamento)
    ).size;

  const defeitos = data.filter(
    (d) => d.defeito?.trim()
  ).length;

  const criticas = data.filter(
    (d) =>
      d.status === "Não Apto" ||
      d.status === "Sucata"
  ).length;

  const cards = [
    {
      title: "Inspeções",
      value: total,
      icon: ClipboardCheck,
    },
    {
      title: "Aptos",
      value: aptos,
      icon: CheckCircle2,
    },
    {
      title: "Não Aptos",
      value: naoAptos,
      icon: XCircle,
    },
    {
      title: "Sucata",
      value: sucata,
      icon: Trash2,
    },
    {
      title: "Conformidade",
      value: `${conformidade}%`,
      icon: TrendingUp,
    },
    {
      title: "Talhas",
      value: equipamentos,
      icon: Factory,
    },
    {
      title: "Defeitos",
      value: defeitos,
      icon: Wrench,
    },
    {
      title: "Críticas",
      value: criticas,
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase">
                {card.title}
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {card.value}
              </h2>
            </div>

            <card.icon className="h-8 w-8 text-primary" />
          </div>
        </div>
      ))}
    </div>
  );
}