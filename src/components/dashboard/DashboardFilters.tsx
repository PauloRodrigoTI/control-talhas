import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { InspectionRecord, DashboardFilters as Filters } from "@/types/inspection";

interface Props {
  data: InspectionRecord[];
  filters: Filters;
  onChange: (f: Filters) => void;
}

function unique(arr: string[]) {
  return [...new Set(arr.filter(Boolean))].sort();
}

export function DashboardFilters({ data, filters, onChange }: Props) {
  const set = (key: keyof Filters, val: string) => onChange({ ...filters, [key]: val === "__all__" ? "" : val });

  const selects: { key: keyof Filters; label: string; options: string[] }[] = [
    { key: "equipamento", label: "Equipamento", options: unique(data.map((d) => d.equipamento)) },
    { key: "modelo", label: "Modelo", options: unique(data.map((d) => d.modelo)) },
    { key: "motivoInspecao", label: "Motivo da Inspeção", options: unique(data.map((d) => d.motivoInspecao)) },
    { key: "colaborador", label: "Colaborador", options: unique(data.map((d) => d.colaborador)) },
    { key: "mes", label: "Mês", options: unique(data.map((d) => String(d.mes))) },
    { key: "status", label: "Status", options: ["Apto", "Não Apto", "Sucata"] },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {selects.map((s) => (
        <Select key={s.key} value={filters[s.key] || "__all__"} onValueChange={(v) => set(s.key, v)}>
          <SelectTrigger className="bg-card text-sm">
            <SelectValue placeholder={s.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos — {s.label}</SelectItem>
            {s.options.map((o) => (
              <SelectItem key={o} value={o}>{o}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}
