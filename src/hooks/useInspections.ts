import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { InspectionRecord } from "@/types/inspection";

function toDbRecord(r: InspectionRecord) {
  return {
    equipamento: r.equipamento,
    modelo: r.modelo,
    fabricacao: r.fabricacao,
    ano_fabricacao: r.anoFabricacao,
    tag: r.tag,
    capacidade_elevacao: r.capacidadeElevacao,
    carga_teste: r.cargaTeste,
    motivo_inspecao: r.motivoInspecao,
    pecas_substituidas: r.pecasSubstituidas,
    defeito: r.defeito,
    obs: r.obs,
    colaborador: r.colaborador,
    qtd: r.qtd,
    apto_uso: r.aptoUso,
    nao_apto: r.naoApto,
    sucata: r.sucata,
    mes: r.mes,
    obs_checklist: r.obsChecklist,
    status: r.status,
  };
}

function fromDbRow(row: any): InspectionRecord {
  return {
    equipamento: row.equipamento,
    modelo: row.modelo,
    fabricacao: row.fabricacao,
    anoFabricacao: row.ano_fabricacao,
    tag: row.tag,
    capacidadeElevacao: row.capacidade_elevacao,
    cargaTeste: row.carga_teste,
    motivoInspecao: row.motivo_inspecao,
    pecasSubstituidas: row.pecas_substituidas,
    defeito: row.defeito,
    obs: row.obs,
    colaborador: row.colaborador,
    qtd: row.qtd,
    aptoUso: row.apto_uso,
    naoApto: row.nao_apto,
    sucata: row.sucata,
    mes: row.mes,
    obsChecklist: row.obs_checklist,
    status: row.status,
  };
}

export function useInspections() {
  const [data, setData] = useState<InspectionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadFromDb = useCallback(async () => {
    setLoading(true);
    const { data: rows, error } = await supabase
      .from("inspections")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Erro ao carregar dados", description: error.message, variant: "destructive" });
    } else if (rows && rows.length > 0) {
      setData(rows.map(fromDbRow));
    }
    setLoading(false);
  }, [toast]);

  const saveToDb = useCallback(async (records: InspectionRecord[]) => {
    // Clear existing data and insert new
    await supabase.from("inspections").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    
    // Insert in batches of 500
    const dbRecords = records.map(toDbRecord);
    for (let i = 0; i < dbRecords.length; i += 500) {
      const batch = dbRecords.slice(i, i + 500);
      const { error } = await supabase.from("inspections").insert(batch);
      if (error) {
        toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
        return false;
      }
    }
    return true;
  }, [toast]);

  return { data, setData, loading, loadFromDb, saveToDb };
}
