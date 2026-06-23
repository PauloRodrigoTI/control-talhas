import { AlertTriangle } from "lucide-react";
import type { InspectionRecord } from "@/types/inspection";

interface Props {
    data: InspectionRecord[];
}

export function CriticalAlerts({
    data,
}: Props) {
    const alertas = data
        .filter(
            item =>
                item.status === "Não Apto" ||
                item.status === "Sucata"
        )
        .slice(0, 5);

    if (alertas.length === 0) {
        return (
            <div className="bg-card border rounded-xl p-5">
                <h2 className="font-bold text-lg">
                    Alertas Críticos
                </h2>

                <p className="text-green-600 mt-3">
                    Nenhum equipamento crítico encontrado.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-card border rounded-xl p-5">

            <div className="flex items-center gap-2 mb-4">

                <AlertTriangle className="h-5 w-5 text-red-500" />

                <h2 className="font-bold text-lg">
                    Alertas Críticos
                </h2>

            </div>

            <div className="space-y-3">

                {alertas.map((item, index) => (
                    <div
                        key={index}
                        className={`
              border rounded-lg p-4
              ${item.status === "Sucata"
                                ? "bg-zinc-500/10 border-zinc-500/30"
                                : "bg-red-500/10 border-red-500/30"
                            }
            `}
                    >
                        <div className="flex justify-between">

                            <div>

                                <h3 className="font-semibold">
                                    {item.equipamento}
                                </h3>

                                <p className="text-sm text-muted-foreground">
                                    TAG: {item.tag}
                                </p>

                                <p className="text-sm mt-2">
                                    {item.defeito || "Sem descrição"}
                                </p>

                            </div>

                            <div>

                                <span
                                    className={`
                    px-3 py-1 rounded-full text-xs font-bold

                    ${item.status === "Sucata"
                                            ? "bg-zinc-700 text-white"
                                            : "bg-red-600 text-white"
                                        }
                  `}
                                >
                                    {item.status}
                                </span>

                            </div>

                        </div>
                    </div>
                ))}

            </div>

        </div>
    );
}