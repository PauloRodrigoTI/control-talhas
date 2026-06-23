import type { InspectionRecord } from "@/types/inspection";

interface Props {
  data: InspectionRecord[];
}

export function ReliabilityCenter({
  data,
}: Props) {

  const totalTalhas =
    new Set(
      data.map(
        d => d.equipamento
      )
    ).size;

  const aptas =
    data.filter(
      d => d.status === "Apto"
    ).length;

  const naoAptas =
    data.filter(
      d => d.status === "Não Apto"
    ).length;

  const defeitos =
    data.filter(
      d =>
        d.defeito &&
        d.defeito !== "N/A"
    ).length;

  const pecas =
    data.filter(
      d =>
        d.pecasSubstituidas === "SIM"
    ).length;

  const fabricantes =
    new Set(
      data.map(
        d => d.fabricante
      )
    ).size;

  const cards = [
    {
      titulo: "Talhas",
      valor: totalTalhas,
    },
    {
      titulo: "Aptas",
      valor: aptas,
    },
    {
      titulo: "Defeitos",
      valor: defeitos,
    },
    {
      titulo: "Peças Trocadas",
      valor: pecas,
    },
    {
      titulo: "Fabricantes",
      valor: fabricantes,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">

      {cards.map(card => (

        <div
          key={card.titulo}
          className="bg-card border rounded-xl p-5"
        >
          <p className="text-sm text-muted-foreground">
            {card.titulo}
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {card.valor}
          </h2>
        </div>

      ))}

    </div>
  );
}
