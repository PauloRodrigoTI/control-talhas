export interface InspectionRecord {
  equipamento: string;
  modelo: string;
  fabricante: string;
  anoFabricacao: string;
  tag: string;
  capacidadeElevacao: string;
  cargaTeste: string;
  dataTeste: string;
  motivoInspecao: string;
  pecasSubstituidas: string;
  seSimQual: string;
  defeito: string;
  oqueFoiFeito: string;
  colaborador: string;
  qtd: number;
  aptoUso: boolean;
  naoApto: boolean;
  sucata: boolean;
  mes: string;
  obsChecklist: string;
  status: "Apto" | "Não Apto" | "Sucata";
}

export interface DashboardFilters {
  equipamento: string;
  modelo: string;
  motivoInspecao: string;
  colaborador: string;
  mes: string;
  status: string;
}
