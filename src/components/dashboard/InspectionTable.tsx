import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Search } from "lucide-react";
import type { InspectionRecord } from "@/types/inspection";

interface Props {
  data: InspectionRecord[];
}

type SortKey = keyof InspectionRecord;

const STATUS_CLASSES: Record<string, string> = {
  "Apto": "status-apto",
  "Não Apto": "status-nao-apto",
  "Sucata": "status-sucata",
};

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "tag", label: "TAG" },
  { key: "equipamento", label: "Equipamento" },
  { key: "modelo", label: "Modelo" },
  { key: "capacidadeElevacao", label: "Capacidade" },
  { key: "motivoInspecao", label: "Motivo" },
  { key: "defeito", label: "Defeito" },
  { key: "pecasSubstituidas", label: "Peças" },
  { key: "colaborador", label: "Colaborador" },
  { key: "mes", label: "Mês" },
  { key: "status", label: "Status" },
];

export function InspectionTable({ data }: Props) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("tag");
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = data;
    if (q) {
      result = data.filter((d) =>
        Object.values(d).some((v) => String(v).toLowerCase().includes(q))
      );
    }
    return [...result].sort((a, b) => {
      const va = String(a[sortKey]).toLowerCase();
      const vb = String(b[sortKey]).toLowerCase();
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [data, search, sortKey, sortAsc]);

  return (
    <div className="space-y-3">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar na tabela..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card"
        />
      </div>
      <div className="rounded-lg border overflow-auto max-h-[500px]">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {COLUMNS.map((col) => (
                <TableHead
                  key={col.key}
                  className="cursor-pointer select-none whitespace-nowrap text-xs"
                  onClick={() => handleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown className="h-3 w-3" />
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row, i) => (
              <TableRow key={i} className="text-sm">
                <TableCell className="font-medium">{row.tag}</TableCell>
                <TableCell>{row.equipamento}</TableCell>
                <TableCell>{row.modelo}</TableCell>
                <TableCell>{row.capacidadeElevacao}</TableCell>
                <TableCell>{row.motivoInspecao}</TableCell>
                <TableCell>{row.defeito}</TableCell>
                <TableCell>{row.pecasSubstituidas}</TableCell>
                <TableCell>{row.colaborador}</TableCell>
                <TableCell>{row.mes}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={`${STATUS_CLASSES[row.status]} text-xs font-medium`}>
                    {row.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={COLUMNS.length} className="text-center text-muted-foreground py-8">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} registro(s)</p>
    </div>
  );
}
