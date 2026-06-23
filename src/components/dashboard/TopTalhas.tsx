import type { InspectionRecord } from "@/types/inspection";

interface Props {
  data: InspectionRecord[];
}

export function TopTalhas({
  data,
}: Props) {

  const ranking = Object.entries(

    data.reduce(
      (
        acc,
        item
      ) => {

        if (
          item.status ===
            "Não Apto" ||
          item.status ===
            "Sucata"
        ) {

          acc[
            item.equipamento
          ] =
            (
              acc[
                item.equipamento
              ] || 0
            ) + 1;
        }

        return acc;
      },
      {} as Record<
        string,
        number
      >
    )

  )
    .sort(
      (a, b) =>
        b[1] - a[1]
    )
    .slice(0, 5);

  return (
    <div className="bg-card border rounded-xl p-5">

      <h2 className="text-xl font-bold mb-5">
        Top 5 Talhas Críticas
      </h2>

      <div className="space-y-4">

        {ranking.map(
          (
            item,
            index
          ) => (

            <div
              key={item[0]}
              className="flex justify-between border-b pb-2"
            >
              <span>
                #{index + 1}
                {" "}
                {item[0]}
              </span>

              <span className="font-bold text-red-500">
                {item[1]}
              </span>
            </div>

          )
        )}

      </div>

    </div>
  );
}