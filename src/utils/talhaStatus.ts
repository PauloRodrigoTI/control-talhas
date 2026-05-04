import type { InspectionRecord } from "@/types/inspection";

export type TalhaStatus = "Apto" | "Atenção" | "Vencido" | "Sucata";

const INSPECTION_VALIDITY_DAYS = 30;
const ATTENTION_DAYS = 7;

export function parseInspectionDate(raw: string): Date | null {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!s) return null;

  // Excel serial number
  if (/^\d+(\.\d+)?$/.test(s)) {
    const n = Number(s);
    if (n > 1000 && n < 80000) {
      const ms = (n - 25569) * 86400 * 1000;
      const d = new Date(ms);
      if (!isNaN(d.getTime())) return d;
    }
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (m) {
    let [, dd, mm, yy] = m;
    let year = Number(yy);
    if (year < 100) year += 2000;
    const d = new Date(year, Number(mm) - 1, Number(dd));
    if (!isNaN(d.getTime())) return d;
  }

  // ISO
  const iso = new Date(s);
  if (!isNaN(iso.getTime())) return iso;
  return null;
}

export function daysUntilExpiry(lastInspection: Date, today = new Date()): number {
  const next = new Date(lastInspection);
  next.setDate(next.getDate() + INSPECTION_VALIDITY_DAYS);
  const diff = next.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function nextInspectionDate(lastInspection: Date): Date {
  const next = new Date(lastInspection);
  next.setDate(next.getDate() + INSPECTION_VALIDITY_DAYS);
  return next;
}

export function formatDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("pt-BR");
}

export interface TalhaGroup {
  tag: string;
  records: InspectionRecord[];
  latest: InspectionRecord;
  lastDate: Date | null;
  nextDate: Date | null;
  daysLeft: number | null;
  status: TalhaStatus;
  capacidade: string;
  equipamento: string;
  modelo: string;
}

export function groupByTag(data: InspectionRecord[]): TalhaGroup[] {
  const groups = new Map<string, InspectionRecord[]>();
  for (const r of data) {
    const tag = (r.tag || "—").trim() || "—";
    if (!groups.has(tag)) groups.set(tag, []);
    groups.get(tag)!.push(r);
  }

  const result: TalhaGroup[] = [];
  for (const [tag, records] of groups) {
    const sorted = [...records].sort((a, b) => {
      const da = parseInspectionDate(a.dataTeste)?.getTime() ?? 0;
      const db = parseInspectionDate(b.dataTeste)?.getTime() ?? 0;
      return db - da;
    });
    const latest = sorted[0];
    const lastDate = parseInspectionDate(latest.dataTeste);
    const nextDate = lastDate ? nextInspectionDate(lastDate) : null;
    const daysLeft = lastDate ? daysUntilExpiry(lastDate) : null;

    let status: TalhaStatus;
    if (latest.status === "Sucata") {
      status = "Sucata";
    } else if (latest.status === "Não Apto") {
      status = "Vencido";
    } else if (daysLeft === null) {
      status = "Apto";
    } else if (daysLeft < 0) {
      status = "Vencido";
    } else if (daysLeft <= ATTENTION_DAYS) {
      status = "Atenção";
    } else {
      status = "Apto";
    }

    result.push({
      tag,
      records: sorted,
      latest,
      lastDate,
      nextDate,
      daysLeft,
      status,
      capacidade: latest.capacidadeElevacao,
      equipamento: latest.equipamento,
      modelo: latest.modelo,
    });
  }

  return result.sort((a, b) => a.tag.localeCompare(b.tag));
}
