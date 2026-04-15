import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Cloud, RefreshCw, FileSpreadsheet, Loader2 } from "lucide-react";
import type { InspectionRecord } from "@/types/inspection";

interface ExcelFile {
  id: string;
  name: string;
  lastModified: string;
}

interface Worksheet {
  id: string;
  name: string;
}

interface Props {
  onSync: (records: InspectionRecord[]) => void;
}

function normalize(s: string): string {
  return s.trim().toUpperCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function matchCol(normalized: string, candidates: string[]): boolean {
  return candidates.some((c) => normalized.includes(c));
}

function parseRows(values: any[][]): InspectionRecord[] {
  if (!values || values.length < 2) return [];
  const headers = values[0].map((h: any) => String(h));

  const colMap: Record<string, number> = {};
  headers.forEach((h, i) => {
    const n = normalize(h);
    if (n === "EQUIPAMENTO") colMap.equipamento = i;
    else if (n === "MODELO") colMap.modelo = i;
    else if (matchCol(n, ["FABRICACAO"]) && !n.includes("ANO")) colMap.fabricacao = i;
    else if (matchCol(n, ["ANO DE FABRICACAO", "ANO"])) colMap.anoFabricacao = i;
    else if (n === "TAG") colMap.tag = i;
    else if (matchCol(n, ["CAPACIDADE"])) colMap.capacidadeElevacao = i;
    else if (matchCol(n, ["CARGA DE TESTE", "CARGA"])) colMap.cargaTeste = i;
    else if (matchCol(n, ["DATA DE TESTE", "DATA TESTE"])) colMap.dataTeste = i;
    else if (matchCol(n, ["MOTIVO"])) colMap.motivoInspecao = i;
    else if (n === "PECAS SUBSTITUIDAS" || matchCol(n, ["PECAS SUBSTITUIDAS"])) colMap.pecasSubstituidas = i;
    else if (matchCol(n, ["SE SIM", "SE SIM, QUAL", "SE SIM QUAL"])) colMap.seSimQual = i;
    else if (matchCol(n, ["DEFEITO"])) colMap.defeito = i;
    else if (matchCol(n, ["OQUE FOI FEITO", "O QUE FOI FEITO"])) colMap.oqueFoiFeito = i;
    else if (matchCol(n, ["COLABORADOR"])) colMap.colaborador = i;
    else if (n === "QTD" || matchCol(n, ["QUANTIDADE"])) colMap.qtd = i;
    else if (matchCol(n, ["APTO PARA USO", "APTO P/ USO", "APTO"])) colMap.aptoParaUso = i;
    else if (matchCol(n, ["NAO APTO"])) colMap.naoApto = i;
    else if (matchCol(n, ["SUCATA"])) colMap.sucata = i;
    else if (n === "MES") colMap.mes = i;
    else if (matchCol(n, ["OBS. CHECKLIST", "OBS CHECKLIST"])) colMap.obsChecklist = i;
  });

  const g = (row: any[], field: string) => {
    const idx = colMap[field];
    return idx !== undefined ? String(row[idx] ?? "").trim() : "";
  };

  return values.slice(1)
    .filter((row) => g(row, "equipamento") !== "")
    .map((row) => {
      let status: InspectionRecord["status"] = "Apto";
      let aptoUso = false;
      let naoApto = false;
      let sucata = false;

      if (colMap.aptoParaUso !== undefined) {
        const raw = g(row, "aptoParaUso").toUpperCase();
        if (raw === "SUCATA") { sucata = true; status = "Sucata"; }
        else if (raw === "NÃO" || raw === "NAO" || raw === "N") { naoApto = true; status = "Não Apto"; }
        else if (raw === "SIM" || raw === "S" || raw === "X") { aptoUso = true; status = "Apto"; }
      }
      if (colMap.sucata !== undefined) {
        const raw = g(row, "sucata").toUpperCase();
        if (raw === "X" || raw === "SIM") { sucata = true; status = "Sucata"; }
      }
      if (colMap.naoApto !== undefined) {
        const raw = g(row, "naoApto").toUpperCase();
        if (raw === "X" || raw === "SIM") { naoApto = true; status = "Não Apto"; }
      }

      return {
        equipamento: g(row, "equipamento"),
        modelo: g(row, "modelo"),
        fabricacao: g(row, "fabricacao"),
        anoFabricacao: g(row, "anoFabricacao"),
        tag: g(row, "tag"),
        capacidadeElevacao: g(row, "capacidadeElevacao"),
        cargaTeste: g(row, "cargaTeste"),
        dataTeste: g(row, "dataTeste"),
        motivoInspecao: g(row, "motivoInspecao"),
        pecasSubstituidas: g(row, "pecasSubstituidas"),
        seSimQual: g(row, "seSimQual"),
        defeito: g(row, "defeito"),
        oqueFoiFeito: g(row, "oqueFoiFeito"),
        colaborador: g(row, "colaborador"),
        qtd: Number(row[colMap.qtd ?? -1] ?? 1) || 1,
        aptoUso,
        naoApto,
        sucata,
        mes: g(row, "mes"),
        obsChecklist: g(row, "obsChecklist"),
        status,
      };
    });
}

export function ExcelOnlineSync({ onSync }: Props) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<ExcelFile[]>([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingSheets, setLoadingSheets] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const invoke = useCallback(async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("sync-excel", { body });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  }, []);

  const loadFiles = useCallback(async () => {
    setLoadingFiles(true);
    try {
      const data = await invoke({ action: "list-files" });
      setFiles(data.files || []);
      if (data.files?.length === 0) {
        toast({ title: "Nenhum arquivo encontrado", description: "Nenhuma planilha .xlsx encontrada no OneDrive." });
      }
    } catch (err: any) {
      toast({ title: "Erro ao listar arquivos", description: err.message, variant: "destructive" });
    }
    setLoadingFiles(false);
  }, [invoke, toast]);

  const loadWorksheets = useCallback(async (itemId: string) => {
    setLoadingSheets(true);
    try {
      const data = await invoke({ action: "list-worksheets", itemId });
      setWorksheets(data.sheets || []);
      if (data.sheets?.length > 0) setSelectedSheet(data.sheets[0].name);
    } catch (err: any) {
      toast({ title: "Erro ao listar abas", description: err.message, variant: "destructive" });
    }
    setLoadingSheets(false);
  }, [invoke, toast]);

  const handleFileSelect = (fileId: string) => {
    setSelectedFile(fileId);
    setSelectedSheet("");
    setWorksheets([]);
    if (fileId) loadWorksheets(fileId);
  };

  const handleSync = async () => {
    if (!selectedFile || !selectedSheet) return;
    setSyncing(true);
    try {
      const data = await invoke({ action: "read-data", itemId: selectedFile, worksheetName: selectedSheet });
      const records = parseRows(data.values);
      if (records.length === 0) {
        toast({ title: "Sem dados", description: "A planilha não contém registros válidos.", variant: "destructive" });
      } else {
        onSync(records);
        toast({ title: "Sincronizado!", description: `${records.length} registros importados do Excel Online.` });
        setOpen(false);
      }
    } catch (err: any) {
      toast({ title: "Erro ao sincronizar", description: err.message, variant: "destructive" });
    }
    setSyncing(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v && files.length === 0) loadFiles(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-xs">
          <Cloud className="h-3.5 w-3.5" /> Excel Online
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Sincronizar com Excel Online
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Arquivo Excel</label>
            {loadingFiles ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Buscando arquivos...
              </div>
            ) : (
              <div className="flex gap-2">
                <Select value={selectedFile} onValueChange={handleFileSelect}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione um arquivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {files.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={loadFiles} disabled={loadingFiles}>
                  <RefreshCw className={`h-4 w-4 ${loadingFiles ? "animate-spin" : ""}`} />
                </Button>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Aba da planilha</label>
              {loadingSheets ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Carregando abas...
                </div>
              ) : (
                <Select value={selectedSheet} onValueChange={setSelectedSheet}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma aba" />
                  </SelectTrigger>
                  <SelectContent>
                    {worksheets.map((s) => (
                      <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <Button
            className="w-full gap-2"
            onClick={handleSync}
            disabled={!selectedFile || !selectedSheet || syncing}
          >
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cloud className="h-4 w-4" />}
            {syncing ? "Sincronizando..." : "Sincronizar Agora"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Os dados serão importados e salvos no banco de dados automaticamente.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
