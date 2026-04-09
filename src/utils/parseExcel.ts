import * as XLSX from "xlsx";
import type { InspectionRecord } from "@/types/inspection";

export function parseExcelFile(file: File): Promise<InspectionRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

        const records: InspectionRecord[] = json.map((row) => {
          const aptoRaw = String(row["APTO P/ USO"] ?? "").trim().toUpperCase();
          const naoAptoRaw = String(row["NÃO APTO"] ?? "").trim().toUpperCase();
          const sucataRaw = String(row["SUCATA"] ?? "").trim().toUpperCase();

          const aptoUso = aptoRaw === "X" || aptoRaw === "SIM";
          const naoApto = naoAptoRaw === "X" || naoAptoRaw === "SIM";
          const sucata = sucataRaw === "X" || sucataRaw === "SIM";

          let status: InspectionRecord["status"] = "Apto";
          if (sucata) status = "Sucata";
          else if (naoApto) status = "Não Apto";
          else if (aptoUso) status = "Apto";

          return {
            equipamento: String(row["EQUIPAMENTO"] ?? ""),
            modelo: String(row["MODELO"] ?? ""),
            fabricacao: String(row["FABRICAÇÃO"] ?? ""),
            anoFabricacao: String(row["ANO DE FABRICAÇÃO"] ?? ""),
            tag: String(row["TAG"] ?? ""),
            capacidadeElevacao: String(row["CAPACIDADE E ELEVAÇÃO"] ?? ""),
            cargaTeste: String(row["CARGA DE TESTE"] ?? ""),
            motivoInspecao: String(row["MOTIVO DA INSPEÇÃO"] ?? ""),
            pecasSubstituidas: String(row["PECAS SUBSTITUIDAS"] ?? ""),
            defeito: String(row["DEFEITO"] ?? ""),
            obs: String(row["OBS"] ?? ""),
            colaborador: String(row["COLABORADOR"] ?? ""),
            qtd: Number(row["QTD"] ?? 1),
            aptoUso,
            naoApto,
            sucata,
            mes: String(row["MÊS"] ?? ""),
            obsChecklist: String(row["OBS. CHECKLIST"] ?? ""),
            status,
          };
        });

        resolve(records);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

const MONTH_NAMES: Record<string, number> = {
  "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6,
  "7": 7, "8": 8, "9": 9, "10": 10, "11": 11, "12": 12,
  "JAN": 1, "FEV": 2, "MAR": 3, "ABR": 4, "MAI": 5, "JUN": 6,
  "JUL": 7, "AGO": 8, "SET": 9, "OUT": 10, "NOV": 11, "DEZ": 12,
  "JANEIRO": 1, "FEVEREIRO": 2, "MARÇO": 3, "ABRIL": 4, "MAIO": 5, "JUNHO": 6,
  "JULHO": 7, "AGOSTO": 8, "SETEMBRO": 9, "OUTUBRO": 10, "NOVEMBRO": 11, "DEZEMBRO": 12,
};

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function getMonthLabel(mes: string): string {
  const key = String(mes).trim().toUpperCase();
  const num = MONTH_NAMES[key];
  if (num) return MONTH_LABELS[num - 1];
  return String(mes);
}

export function getMonthOrder(mes: string): number {
  const key = String(mes).trim().toUpperCase();
  return MONTH_NAMES[key] ?? 99;
}
