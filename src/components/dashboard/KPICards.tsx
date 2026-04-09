import { ClipboardCheck, CheckCircle2, XCircle, Trash2, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { InspectionRecord } from "@/types/inspection";

interface KPICardsProps {
  data: InspectionRecord[];
}

export function KPICards({ data }: KPICardsProps) {
  const total = data.length;
  const aptos = data.filter((d) => d.status === "Apto").length;
  const naoAptos = data.filter((d) => d.status === "Não Apto").length;
  const sucata = data.filter((d) => d.status === "Sucata").length;
  const conformidade = total > 0 ? ((aptos / total) * 100).toFixed(1) : "0";

  const cards = [
    { label: "Total Inspecionados", value: total, icon: ClipboardCheck, color: "text-primary" },
    { label: "Aptos", value: aptos, icon: CheckCircle2, color: "text-status-apto" },
    { label: "Não Aptos", value: naoAptos, icon: XCircle, color: "text-status-nao-apto" },
    { label: "Sucata", value: sucata, icon: Trash2, color: "text-status-sucata" },
    { label: "% Conformidade", value: `${conformidade}%`, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-muted ${c.color}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
