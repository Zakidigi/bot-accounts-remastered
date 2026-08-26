const MESES_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const DIAS_SEMANA_PT = ["D", "S", "T", "Q", "Q", "S", "S"];

export function mesLabel(ano: number, mes: number): string {
  return `${MESES_PT[mes]} de ${ano}`;
}

export { MESES_PT, DIAS_SEMANA_PT };

export function anoMesDeString(anoMes?: string): { ano: number; mes: number } {
  const hoje = new Date();
  if (anoMes && /^\d{4}-\d{2}$/.test(anoMes)) {
    const [ano, mes] = anoMes.split("-").map(Number);
    return { ano, mes: mes - 1 };
  }
  return { ano: hoje.getFullYear(), mes: hoje.getMonth() };
}

export function anoMesParaString(ano: number, mes: number): string {
  return `${ano}-${String(mes + 1).padStart(2, "0")}`;
}

export function diasDoMes(ano: number, mes: number): string[] {
  const total = new Date(ano, mes + 1, 0).getDate();
  return Array.from({ length: total }, (_, i) => {
    const dia = i + 1;
    return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
  });
}

export function primeiroDiaSemana(ano: number, mes: number): number {
  return new Date(ano, mes, 1).getDay();
}

export function mesAnterior(ano: number, mes: number): { ano: number; mes: number } {
  return mes === 0 ? { ano: ano - 1, mes: 11 } : { ano, mes: mes - 1 };
}

export function proximoMes(ano: number, mes: number): { ano: number; mes: number } {
  return mes === 11 ? { ano: ano + 1, mes: 0 } : { ano, mes: mes + 1 };
}

export function dataDeHoje(): string {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
}

export function formatarDataCurta(data: string): string {
  const [, mes, dia] = data.split("-");
  return `${dia}/${mes}`;
}
