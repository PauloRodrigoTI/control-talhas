import type { InspectionRecord } from "@/types/inspection";

interface Props {
  data: InspectionRecord[];
}

export function ExecutiveKPIs({
  data,
}: Props) {

  const totalInspecoes =
    data.length;

  const falhas =
    data.filter(
      (item) =>
        item.status === "Não Apto" ||
        item.status === "Sucata"
    ).length;

  const mtbf =
    falhas > 0
      ? (
          totalInspecoes /
          falhas
        ).toFixed(1)
      : totalInspecoes;

  const mttr =
    falhas > 0
      ? (
          falhas * 2
        ).toFixed(1)
      : "0";

  const disponibilidade =
    totalInspecoes > 0
      ? (
          ((totalInspecoes -
            falhas) /
            totalInspecoes) *
          100
        ).toFixed(1)
      : "0";

  const confiabilidade =
    disponibilidade;

  const cards = [
    {
      titulo: "MTBF",
      valor: mtbf,
      descricao:
        "Tempo médio entre falhas",
    },
    {
      titulo: "MTTR",
      valor: mttr,
      descricao:
        "Tempo médio de reparo",
    },
    {
      titulo: "Disponibilidade",
      valor: `${disponibilidade}%`,
      descricao:
        "Equipamentos operacionais",
    },
    {
      titulo: "Confiabilidade",
      valor: `${confiabilidade}%`,
      descricao:
        "Probabilidade de operação",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

      {cards.map((card) => (
        <div
          key={card.titulo}
          className="bg-card border rounded-xl p-5 shadow-sm"
        >
          <p className="text-sm text-muted-foreground">
            {card.titulo}
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {card.valor}
          </h2>

          <p className="text-xs text-muted-foreground mt-2">
            {card.descricao}
          </p>
        </div>
      ))}

    </div>
  );
}