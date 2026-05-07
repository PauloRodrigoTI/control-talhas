import { useCallback, useEffect } from "react";
import { Maximize, FileDown, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useInspections } from "@/hooks/useInspections";
import { KPICards } from "@/components/dashboard/KPICards";
import {
  ChartInspecoesPorEquipamento,
  ChartStatusPizza,
  ChartMotivo,
  ChartEvolucaoMensal,
  ChartDefeitos,
  ChartColaborador,
} from "@/components/dashboard/Charts";

import { FileUpload } from "@/components/dashboard/FileUpload";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { parseExcelFile } from "@/utils/parseExcel";
import type { InspectionRecord } from "@/types/inspection";

export default function Index() {
  const { data, setData, loading, loadFromDb, saveToDb } = useInspections();
  const { toast } = useToast();

  // Load data from database on mount
  useEffect(() => {
    loadFromDb();
  }, [loadFromDb]);

  const syncAndSave = useCallback(async (records: InspectionRecord[]) => {
    setData(records);
    const saved = await saveToDb(records);
    if (saved) {
      toast({ title: "Dados atualizados", description: `${records.length} registros salvos no banco de dados.` });
    } else {
      toast({ title: "Dados carregados", description: `${records.length} registros (erro ao salvar).`, variant: "destructive" });
    }
  }, [toast, setData, saveToDb]);

  const handleFile = useCallback(async (file: File) => {
    try {
      const records = await parseExcelFile(file);
      await syncAndSave(records);
    } catch {
      toast({ title: "Erro ao importar", description: "Verifique o formato da planilha.", variant: "destructive" });
    }
  }, [toast, syncAndSave]);

  const handleFullscreen = () => {
    document.documentElement.requestFullscreen?.();
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-card/95 border-b border-border shadow-sm px-4 py-3 md:px-8 print:border-none print:relative">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-md">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold md:text-xl tracking-tight">Controle de Inspeção de Talhas</h1>
              <p className="text-xs text-muted-foreground font-medium">Dashboard de manutenção e inspeção industrial</p>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <ThemeToggle />
            <FileUpload onFile={handleFile} hasData={data.length > 0} />
            {data.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2 text-xs font-semibold">
                  <FileDown className="h-3.5 w-3.5" /> Exportar PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleFullscreen} className="gap-2 text-xs font-semibold">
                  <Maximize className="h-3.5 w-3.5" /> Apresentação
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="rounded-2xl bg-gradient-to-br from-[hsl(215,75%,50%,0.08)] to-[hsl(200,80%,55%,0.05)] p-8 mb-6">
              <BarChart3 className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Nenhuma planilha carregada</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Importe um arquivo Excel (.xlsx) para visualizar o dashboard completo com gráficos e indicadores
            </p>
            <FileUpload onFile={handleFile} hasData={false} />
          </div>
        ) : (
          <>
            {/* KPIs */}
            <KPICards data={data} />

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ChartInspecoesPorEquipamento data={data} />
              <ChartStatusPizza data={data} />
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ChartMotivo data={data} />
              <ChartEvolucaoMensal data={data} />
            </div>

            {/* Charts row 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ChartDefeitos data={data} />
              <ChartColaborador data={data} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
