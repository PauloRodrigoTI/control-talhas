import * as XLSX from "xlsx";
import type { InspectionRecord } from "@/types/inspection";

function findHeaderRow(sheet: XLSX.WorkSheet): number {
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
  for (let r = range.s.r; r <= Math.min(range.s.r + 10, range.e.r); r++) {
    const cell = sheet[XLSX.utils.encode_cell({ r, c: 0 })];
    const val = String(cell?.v ?? "").trim().toUpperCase();
    if (val === "EQUIPAMENTO") return r;
  }
  return 0;
}

function normalize(s: string): string {
  return s.trim().toUpperCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function matchCol(normalized: string, candidates: string[]): boolean {
  return candidates.some((c) => normalized.includes(c));
}

export function parseExcelFile(file: File): Promise<InspectionRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const headerRow = findHeaderRow(sheet);
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
          defval: "",
          range: headerRow,
        });

        const sampleKeys = json.length > 0 ? Object.keys(json[0]) : [];
        const colMap: Record<string, string> = {};
        for (const key of sampleKeys) {
          const n = normalize(key);
          if (n === "EQUIPAMENTO") colMap.equipamento = key;
          else if (n === "MODELO") colMap.modelo = key;
          else if (
            n === "FABRICANTE"
          )
            colMap.fabricante = key;
          else if (matchCol(n, ["ANO DE FABRICACAO", "ANO"])) colMap.anoFabricacao = key;
          else if (n === "TAG") colMap.tag = key;
          else if (matchCol(n, ["CAPACIDADE"])) colMap.capacidadeElevacao = key;
          else if (matchCol(n, ["CARGA DE TESTE", "CARGA"])) colMap.cargaTeste = key;
          else if (matchCol(n, ["DATA DE TESTE", "DATA TESTE"])) colMap.dataTeste = key;
          else if (matchCol(n, ["MOTIVO"])) colMap.motivoInspecao = key;
          else if (n === "PECAS SUBSTITUIDAS" || matchCol(n, ["PECAS SUBSTITUIDAS"])) colMap.pecasSubstituidas = key;
          else if (matchCol(n, ["SE SIM", "SE SIM, QUAL", "SE SIM QUAL"])) colMap.seSimQual = key;
          else if (matchCol(n, ["DEFEITO"])) colMap.defeito = key;
          else if (matchCol(n, ["OQUE FOI FEITO", "O QUE FOI FEITO"])) colMap.oqueFoiFeito = key;
          else if (matchCol(n, ["COLABORADOR"])) colMap.colaborador = key;
          else if (n === "QTD" || matchCol(n, ["QUANTIDADE"])) colMap.qtd = key;
          else if (matchCol(n, ["APTO PARA USO", "APTO P/ USO", "APTO"])) colMap.aptoParaUso = key;
          else if (matchCol(n, ["NAO APTO"])) colMap.naoApto = key;
          else if (matchCol(n, ["SUCATA"])) colMap.sucata = key;
          else if (n === "MES") colMap.mes = key;
          else if (matchCol(n, ["OBS. CHECKLIST", "OBS CHECKLIST"])) colMap.obsChecklist = key;
          else if (n === "OBS" || n === "OBSERVACOES") colMap.obs = key;
        }

        const g = (row: Record<string, unknown>, field: string) =>
          String(row[colMap[field] ?? ""] ?? "").trim();

        const records: InspectionRecord[] = json
          .filter((row) => g(row, "equipamento") !== "")
          .map((row) => {
            let status: InspectionRecord["status"] = "Apto";
            let aptoUso = false;
            let naoApto = false;
            let sucata = false;

            if (colMap.aptoParaUso) {
              const raw = g(row, "aptoParaUso").toUpperCase();
              if (raw === "SUCATA") {
                sucata = true;
                status = "Sucata";
              } else if (raw === "NÃO" || raw === "NAO" || raw === "N") {
                naoApto = true;
                status = "Não Apto";
              } else if (raw === "SIM" || raw === "S" || raw === "X") {
                aptoUso = true;
                status = "Apto";
              }
            }

            if (colMap.sucata) {
              const raw = g(row, "sucata").toUpperCase();
              if (raw === "X" || raw === "SIM") { sucata = true; status = "Sucata"; }
            }
            if (colMap.naoApto) {
              const raw = g(row, "naoApto").toUpperCase();
              if (raw === "X" || raw === "SIM") { naoApto = true; status = "Não Apto"; }
            }

            return {
              equipamento:
                `${g(row, "equipamento")} ${g(row, "tag")}`.trim(),
              modelo: g(row, "modelo"),
              fabricante: g(row, "fabricante"),
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
              qtd: Number(row[colMap.qtd ?? ""] ?? 1) || 1,
              aptoUso,
              naoApto,
              sucata,
              mes: g(row, "mes"),
              obsChecklist: g(row, "obsChecklist"),
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
