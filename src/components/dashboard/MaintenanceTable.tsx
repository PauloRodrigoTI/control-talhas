import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";

import { useMemo, useState } from "react";
import type { InspectionRecord } from "@/types/inspection";

interface Props {
  data: InspectionRecord[];
  onSelectTalha: (equipamento: string) => void;
}

const columnHelper =
  createColumnHelper<InspectionRecord>();

export function MaintenanceTable({
  data,
  onSelectTalha,
}: Props) {
  const [sorting, setSorting] =
    useState<SortingState>([]);

  const [search, setSearch] =
    useState("");

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      JSON.stringify(item)
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [data, search]);

  const columns = [
    columnHelper.accessor(
      "equipamento",
      {
        header: "Equipamento",
      }
    ),

    columnHelper.accessor(
      "tag",
      {
        header: "TAG",
      }
    ),

    columnHelper.accessor(
      "modelo",
      {
        header: "Modelo",
      }
    ),

    columnHelper.accessor(
      "capacidadeElevacao",
      {
        header: "Capacidade",
      }
    ),

    columnHelper.accessor(
      "defeito",
      {
        header: "Defeito",
      }
    ),

    columnHelper.accessor(
      "colaborador",
      {
        header: "Colaborador",
      }
    ),

    columnHelper.accessor(
      "status",
      {
        header: "Status",
      }
    ),
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel:
      getCoreRowModel(),
    getSortedRowModel:
      getSortedRowModel(),
  });

  return (
    <div className="bg-card border rounded-xl p-5 shadow-sm">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">

        <h2 className="text-xl font-bold">
          Histórico de Inspeções
        </h2>

        <input
          placeholder="Pesquisar equipamento, TAG, defeito..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="border rounded-lg p-2 w-full md:w-80"
        />

      </div>

      <div className="overflow-auto rounded-lg border">

        <table className="w-full">

          <thead className="bg-muted">

            {table
              .getHeaderGroups()
              .map((headerGroup) => (
                <tr key={headerGroup.id}>

                  {headerGroup.headers.map(
                    (header) => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="text-left p-4 font-semibold cursor-pointer select-none border-b"
                      >
                        {flexRender(
                          header.column
                            .columnDef
                            .header,
                          header.getContext()
                        )}
                      </th>
                    )
                  )}

                </tr>
              ))}

          </thead>

          <tbody>

            {table
              .getRowModel()
              .rows.map((row) => (

                <tr
                  key={row.id}
                  onClick={() =>
                    onSelectTalha(
                      row.original.equipamento
                    )
                  }
                  className="cursor-pointer hover:bg-primary/5 transition-colors"
                >

                  {row
                    .getVisibleCells()
                    .map((cell) => (

                      <td
                        key={cell.id}
                        className="p-4 border-b"
                      >
                        {flexRender(
                          cell.column
                            .columnDef
                            .cell,
                          cell.getContext()
                        )}
                      </td>

                    ))}

                </tr>

              ))}

          </tbody>

        </table>

      </div>

      <div className="mt-3 text-sm text-muted-foreground">
        Total de registros: {filteredData.length}
      </div>

    </div>
  );
}
