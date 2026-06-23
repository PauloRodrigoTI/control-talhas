import type { InspectionRecord } from "@/types/inspection";

interface Props {
  data: InspectionRecord[];
}

export function TalhaHealth({
  data,
}: Props) {
  const equipamentos = [
    ...new Set(
      data.map(
        (item) => item.equipamento
      )
    ),
  ];

  const healthData = equipamentos.map(
    (equipamento) => {
      const historico = data.filter(
        (item) =>
          item.equipamento ===
          equipamento
      );

      const sucata =
        historico.filter(
          (item) =>
            item.status === "Sucata"
        ).length;

      const naoApto =
        historico.filter(
          (item) =>
            item.status ===
            "Não Apto"
        ).length;

      let status = "Saudável";
      let emoji = "🟢";

      if (sucata > 0) {
        status = "Sucata";
        emoji = "⚫";
      } else if (naoApto >= 3) {
        status = "Crítica";
        emoji = "🔴";
      } else if (naoApto >= 1) {
        status = "Atenção";
        emoji = "🟡";
      }

      return {
        equipamento,
        status,
        emoji,
      };
    }
  );

  return (
    <div className="bg-card border rounded-xl p-5">

      <div className="flex items-center justify-between mb-5">

        <h2 className="text-xl font-bold">
          Saúde das Talhas
        </h2>

        <span className="text-sm text-muted-foreground">
          Status baseado no histórico
        </span>

      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">

        {healthData.map(
          (item) => (
            <div
              key={
                item.equipamento
              }
              className="border rounded-xl p-4 hover:shadow-md transition-all"
            >
              <div className="text-3xl mb-2">
                {item.emoji}
              </div>

              <h3 className="font-semibold text-sm truncate">
                {
                  item.equipamento
                }
              </h3>

              <p className="text-xs text-muted-foreground mt-1">
                {item.status}
              </p>
            </div>
          )
        )}

      </div>

    </div>
  );
}