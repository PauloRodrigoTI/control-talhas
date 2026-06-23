import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, ClipboardList } from "lucide-react";
import type { InspectionRecord } from "@/types/inspection";

interface Props {
  data: InspectionRecord[];
  onSelectTalha: (equipamento: string) => void;
}

const STATUS_BADGE: Record<string, string> = {
  "Apto": "status-apto",
  "Não Apto": "status-nao-apto",
  "Sucata": "status-sucata",
};

const columnHelper = createColumnHelper<InspectionRecord>();

export function MaintenanceTable({ data, onSelectTalha }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const columns = [
    columnHelper.accessor("equipamento", { header: "Equipamento" }),
    columnHelper.accessor("tag", { header: "TAG" }),
    columnHelper.accessor("modelo", { header: "Modelo" }),
    columnHelper.accessor("capacidadeElevacao", { header: "Capacidade" }),
    columnHelper.accessor("defeito", { header: "Defeito" }),
    columnHelper.accessor("colaborador", { header: "Colaborador" }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const val = info.getValue() as string;
        const badgeClass = STATUS_BADGE[val] || "";
        return (
          <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeClass}`}>
            {val}
          </span>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10">
            <ClipboardList className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide">Histórico de Inspeções</h2>
            <p className="text-xs text-muted-foreground">
              {filteredData.length} registro{filteredData.length !== 1 ? "s" : ""}
              {search && " encontrado" + (filteredData.length !== 1 ? "s" : "")}
            </p>
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            placeholder="Pesquisar equipamento, TAG, defeito..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-lg border border-border/60">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-muted/50">
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none border-b border-border/60 hover:text-foreground transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="opacity-50">
                            {sorted === "asc" ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : sorted === "desc" ? (
                              <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-10 text-muted-foreground text-sm"
                >
                  Nenhum registro encontrado.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  onClick={() => onSelectTalha(row.original.equipamento)}
                  className={`cursor-pointer hover:bg-primary/5 transition-colors ${
                    i % 2 === 0 ? "bg-card" : "bg-muted/20"
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 border-b border-border/40">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
