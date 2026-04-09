export interface InspectionRecord {
  equipamento: string;
  modelo: string;
  fabricacao: string;
  anoFabricacao: string;
  tag: string;
  capacidadeElevacao: string;
  cargaTeste: string;
  motivoInspecao: string;
  pecasSubstituidas: string;
  defeito: string;
  obs: string;
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
