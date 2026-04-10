import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { InspectionRecord, DashboardFilters as Filters } from "@/types/inspection";

interface Props {
  data: InspectionRecord[];
  filters: Filters;
  onChange: (f: Filters) => void;
}

const INITIAL_FILTERS: Filters = {
  equipamento: "",
  modelo: "",
  motivoInspecao: "",
  colaborador: "",
  mes: "",
  status: "",
};

function unique(arr: string[]) {
  return [...new Set(arr.filter(Boolean))].sort();
}

export function DashboardFilters({ data, filters, onChange }: Props) {
  const set = (key: keyof Filters, val: string) => onChange({ ...filters, [key]: val === "__all__" ? "" : val });

  const hasActiveFilter = Object.values(filters).some(Boolean);

  const selects: { key: keyof Filters; label: string; options: string[] }[] = [
    { key: "equipamento", label: "Equipamento", options: unique(data.map((d) => d.equipamento)) },
    { key: "modelo", label: "Modelo", options: unique(data.map((d) => d.modelo)) },
    { key: "motivoInspecao", label: "Motivo da Inspeção", options: unique(data.map((d) => d.motivoInspecao)) },
    { key: "colaborador", label: "Colaborador", options: unique(data.map((d) => d.colaborador)) },
    { key: "mes", label: "Mês", options: unique(data.map((d) => String(d.mes))) },
    { key: "status", label: "Status", options: ["Apto", "Não Apto", "Sucata"] },
  ];

  return (
    <div className="flex items-end gap-3">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 flex-1">
        {selects.map((s) => (
          <Select key={s.key} value={filters[s.key] || "__all__"} onValueChange={(v) => set(s.key, v)}>
            <SelectTrigger className="bg-card text-sm">
              <SelectValue placeholder={s.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{s.label}</SelectItem>
              {s.options.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>
      {hasActiveFilter && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(INITIAL_FILTERS)}
          className="gap-1.5 text-xs shrink-0 h-10"
        >
          <X className="h-3.5 w-3.5" /> Limpar
        </Button>
      )}
    </div>
  );
}
