import type { InspectionRecord } from "@/types/inspection";

interface Props {
  equipamento: string;
  data: InspectionRecord[];
  onClose: () => void;
}

export function TalhaDetails({
  equipamento,
  data,
  onClose,
}: Props) {
  const historico = data.filter(
    (item) =>
      item.equipamento === equipamento
  );

  const aptos = historico.filter(
    (d) => d.status === "Apto"
  ).length;

  const naoAptos = historico.filter(
    (d) => d.status === "Não Apto"
  ).length;

  const sucata = historico.filter(
    (d) => d.status === "Sucata"
  ).length;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">

      <div className="bg-card w-full max-w-5xl rounded-xl p-6 max-h-[90vh] overflow-auto">

        <div className="flex justify-between mb-6">

          <h2 className="text-2xl font-bold">
            {equipamento}
          </h2>

          <button
            onClick={onClose}
            className="border rounded px-3 py-1"
          >
            Fechar
          </button>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

          <div className="border rounded p-4">
            <h3>Total</h3>
            <p className="text-3xl font-bold">
              {historico.length}
            </p>
          </div>

          <div className="border rounded p-4">
            <h3>Apto</h3>
            <p className="text-3xl font-bold text-green-600">
              {aptos}
            </p>
          </div>

          <div className="border rounded p-4">
            <h3>Não Apto</h3>
            <p className="text-3xl font-bold text-red-600">
              {naoAptos}
            </p>
          </div>

          <div className="border rounded p-4">
            <h3>Sucata</h3>
            <p className="text-3xl font-bold text-zinc-600">
              {sucata}
            </p>
          </div>

        </div>

        <div className="space-y-3">

          {historico.map((item, index) => (
            <div
              key={index}
              className="border rounded-lg p-4"
            >
              <div className="flex justify-between">

                <div>

                  <h3 className="font-semibold">
                    {item.dataTeste}
                  </h3>

                  <p>
                    Defeito:
                    {" "}
                    {item.defeito || "Nenhum"}
                  </p>

                  <p>
                    Ação:
                    {" "}
                    {item.oqueFoiFeito || "-"}
                  </p>

                  <p>
                    Colaborador:
                    {" "}
                    {item.colaborador}
                  </p>

                </div>

                <span className="font-bold">
                  {item.status}
                </span>

              </div>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}