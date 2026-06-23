import {
  useCallback,
  useEffect,
  useState,
  useMemo,
} from "react";
import { Maximize, FileDown, BarChart3, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ChartTalhasCriticas,
} from "@/components/dashboard/Charts";
import { MaintenanceTable } from "@/components/dashboard/MaintenanceTable";
import { FileUpload } from "@/components/dashboard/FileUpload";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { parseExcelFile } from "@/utils/parseExcel";
import type { InspectionRecord } from "@/types/inspection";
import { TalhaDetails } from "@/components/dashboard/TalhaDetails";
import { CriticalAlerts } from "@/components/dashboard/CriticalAlerts";
import { TalhaHealth } from "@/components/dashboard/TalhaHealth";
import { ExecutiveKPIs } from "@/components/dashboard/ExecutiveKPIs";
import { TopTalhas } from "@/components/dashboard/TopTalhas";
import { ReliabilityCenter } from "@/components/dashboard/ReliabilityCenter";

export default function Index() {
  const { data, setData, loading, loadFromDb, saveToDb } = useInspections();
  const { toast } = useToast();
  const [equipamentoFiltro, setEquipamentoFiltro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [colaboradorFiltro, setColaboradorFiltro] = useState("");
  const [mesFiltro, setMesFiltro] = useState("");
  const [selectedTalha, setSelectedTalha] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const equipamentoOk = !equipamentoFiltro || item.equipamento === equipamentoFiltro;
      const statusOk = !statusFiltro || item.status === statusFiltro;
      const colaboradorOk = !colaboradorFiltro || item.colaborador === colaboradorFiltro;
      const mesOk = !mesFiltro || item.mes === mesFiltro;
      return equipamentoOk && statusOk && colaboradorOk && mesOk;
    });
  }, [data, equipamentoFiltro, statusFiltro, colaboradorFiltro, mesFiltro]);

  const activeFiltersCount = [equipamentoFiltro, statusFiltro, colaboradorFiltro, mesFiltro].filter(Boolean).length;

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

  const handleFullscreen = () => document.documentElement.requestFullscreen?.();
  const handleExportPDF = () => window.print();

  const clearFilters = () => {
    setEquipamentoFiltro("");
    setStatusFiltro("");
    setColaboradorFiltro("");
    setMesFiltro("");
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
              <h1 className="text-lg font-bold md:text-xl tracking-tight">
                Controle de Inspeção de Talhas
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                Dashboard de manutenção e inspeção industrial
              </p>
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
            {/* Filters — using Shadcn Select */}
            <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Filtros
                </span>
                {activeFiltersCount > 0 && (
                  <>
                    <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {activeFiltersCount} ativo{activeFiltersCount !== 1 ? "s" : ""}
                    </span>
                    <button
                      onClick={clearFilters}
                      className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                    >
                      Limpar filtros
                    </button>
                  </>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Equipamento */}
                <Select value={equipamentoFiltro || "_all"} onValueChange={(v) => setEquipamentoFiltro(v === "_all" ? "" : v)}>
                  <SelectTrigger className="text-sm h-9">
                    <SelectValue placeholder="Todos Equipamentos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">Todos Equipamentos</SelectItem>
                    {[...new Set(data.map((d) => d.equipamento))].sort().map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status */}
                <Select value={statusFiltro || "_all"} onValueChange={(v) => setStatusFiltro(v === "_all" ? "" : v)}>
                  <SelectTrigger className="text-sm h-9">
                    <SelectValue placeholder="Todos Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">Todos Status</SelectItem>
                    <SelectItem value="Apto">Apto</SelectItem>
                    <SelectItem value="Não Apto">Não Apto</SelectItem>
                    <SelectItem value="Sucata">Sucata</SelectItem>
                  </SelectContent>
                </Select>

                {/* Colaborador */}
                <Select value={colaboradorFiltro || "_all"} onValueChange={(v) => setColaboradorFiltro(v === "_all" ? "" : v)}>
                  <SelectTrigger className="text-sm h-9">
                    <SelectValue placeholder="Todos Colaboradores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">Todos Colaboradores</SelectItem>
                    {[...new Set(data.map((d) => d.colaborador))].sort().map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Mês */}
                <Select value={mesFiltro || "_all"} onValueChange={(v) => setMesFiltro(v === "_all" ? "" : v)}>
                  <SelectTrigger className="text-sm h-9">
                    <SelectValue placeholder="Todos Meses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">Todos Meses</SelectItem>
                    {[...new Set(data.map((d) => d.mes))].map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* KPIs */}
            <KPICards data={filteredData} />
            <ReliabilityCenter data={filteredData} />
            <ExecutiveKPIs data={filteredData} />
            <TalhaHealth data={filteredData} />
            <TopTalhas data={filteredData} />
            <CriticalAlerts data={filteredData} />

            {/* Evolução Mensal — full width */}
            <ChartEvolucaoMensal data={filteredData} />

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <ChartInspecoesPorEquipamento data={filteredData} />
              </div>
              <ChartStatusPizza data={filteredData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ChartMotivo data={filteredData} />
              <ChartColaborador data={filteredData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ChartDefeitos data={filteredData} />
              <ChartTalhasCriticas data={filteredData} />
            </div>

            {/* Histórico Completo */}
            <MaintenanceTable data={filteredData} onSelectTalha={setSelectedTalha} />

            {/* Modal de Detalhes da Talha */}
            {selectedTalha && (
              <TalhaDetails
                equipamento={selectedTalha}
                data={data}
                onClose={() => setSelectedTalha(null)}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
