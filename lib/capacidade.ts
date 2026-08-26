export type Porte = "P" | "M" | "G";

export const PESO_PEDIDO: Record<Porte, number> = {
  P: 1,
  M: 2,
  G: 3,
};

export const PORTE_LABEL: Record<Porte, string> = {
  P: "Pequeno",
  M: "Médio",
  G: "Grande",
};

export type StatusDia = "livre" | "quase" | "lotado";

export function statusDoDia(cargaOcupada: number, capacidade: number): StatusDia {
  if (capacidade <= 0) return "lotado";
  if (cargaOcupada >= capacidade) return "lotado";
  if (cargaOcupada >= capacidade * 0.7) return "quase";
  return "livre";
}

export const STATUS_LABEL: Record<StatusDia, string> = {
  livre: "Livre",
  quase: "Quase cheio",
  lotado: "Lotado",
};

/** Pedidos com estes status ocupam capacidade do dia. "recusado" não conta. */
export const STATUS_QUE_OCUPAM = ["pendente", "confirmado", "concluido"];

export type PresetCapacidade = {
  chave: string;
  titulo: string;
  descricao: string;
  capacidade: number;
};

export const PRESETS_CAPACIDADE: PresetCapacidade[] = [
  {
    chave: "sozinha",
    titulo: "Trabalho sozinha",
    descricao: "Dá conta de até 3 encomendas médias por dia",
    capacidade: 3,
  },
  {
    chave: "ajudante",
    titulo: "Tenho uma ajudante",
    descricao: "Dá conta de até 5 encomendas médias por dia",
    capacidade: 5,
  },
  {
    chave: "atelie",
    titulo: "Tenho uma equipe",
    descricao: "Dá conta de até 8 encomendas médias por dia",
    capacidade: 8,
  },
];
