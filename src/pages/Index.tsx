import { useState, useMemo, useCallback } from "react";
import { Maximize, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { KPICards } from "@/components/dashboard/KPICards";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import {
  ChartInspecoesPorEquipamento,
  ChartStatusPizza,
  ChartMotivo,
  ChartEvolucaoMensal,
  ChartDefeitos,
} from "@/components/dashboard/Charts";
import { InspectionTable } from "@/components/dashboard/InspectionTable";
import { FileUpload } from "@/components/dashboard/FileUpload";
import { parseExcelFile } from "@/utils/parseExcel";
import type { InspectionRecord, DashboardFilters as Filters } from "@/types/inspection";

const INITIAL_FILTERS: Filters = {
  equipamento: "",
  modelo: "",
  motivoInspecao: "",
  colaborador: "",
  mes: "",
  status: "",
};

export default function Index() {
  const [data, setData] = useState<InspectionRecord[]>([]);
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const { toast } = useToast();

  const handleFile = useCallback(async (file: File) => {
    try {
      const records = await parseExcelFile(file);
      setData(records);
      setFilters(INITIAL_FILTERS);
      toast({ title: "Planilha importada", description: `${records.length} registros carregados.` });
    } catch {
      toast({ title: "Erro ao importar", description: "Verifique o formato da planilha.", variant: "destructive" });
    }
  }, [toast]);

  const filtered = useMemo(() => {
    return data.filter((d) => {
      if (filters.equipamento && d.equipamento !== filters.equipamento) return false;
      if (filters.modelo && d.modelo !== filters.modelo) return false;
      if (filters.motivoInspecao && d.motivoInspecao !== filters.motivoInspecao) return false;
      if (filters.colaborador && d.colaborador !== filters.colaborador) return false;
      if (filters.mes && String(d.mes) !== filters.mes) return false;
      if (filters.status && d.status !== filters.status) return false;
      return true;
    });
  }, [data, filters]);

  const handleFullscreen = () => {
    document.documentElement.requestFullscreen?.();
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-4 py-3 md:px-6 print:border-none">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold md:text-2xl">Controle de Inspeção de Talhas</h1>
            <p className="text-sm text-muted-foreground">Dashboard de manutenção e inspeção industrial</p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <FileUpload onFile={handleFile} hasData={data.length > 0} />
            {data.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2">
                  <FileDown className="h-4 w-4" /> PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleFullscreen} className="gap-2">
                  <Maximize className="h-4 w-4" /> Apresentação
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 space-y-6">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <FileDown className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-1">Nenhuma planilha carregada</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Importe um arquivo Excel (.xlsx) para visualizar o dashboard
            </p>
            <FileUpload onFile={handleFile} hasData={false} />
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="print:hidden">
              <DashboardFilters data={data} filters={filters} onChange={setFilters} />
            </div>

            {/* KPIs */}
            <KPICards data={filtered} />

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartInspecoesPorEquipamento data={filtered} />
              <ChartStatusPizza data={filtered} />
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartMotivo data={filtered} />
              <ChartEvolucaoMensal data={filtered} />
            </div>

            {/* Charts row 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartDefeitos data={filtered} />
            </div>

            {/* Table */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Registro de Inspeções</h2>
              <InspectionTable data={filtered} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
