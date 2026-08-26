import { prisma } from "@/lib/prisma";
import { PESO_PEDIDO, STATUS_QUE_OCUPAM, statusDoDia, type Porte, type StatusDia } from "@/lib/capacidade";
import { diasDoMes } from "@/lib/mes";

export type PedidoResumo = {
  id: string;
  clienteNome: string;
  clienteTelefone: string;
  porte: Porte;
  descricao: string;
  status: string;
  origem: string;
};

export type DiaCalendario = {
  data: string;
  status: StatusDia;
  carga: number;
  pedidos: PedidoResumo[];
};

export type DiaPublico = { data: string; status: StatusDia };

export async function obterStatusPublicoDoMes(
  lojaId: string,
  ano: number,
  mes: number,
  capacidade: number
): Promise<Map<string, DiaPublico>> {
  const completo = await obterCalendarioDoMes(lojaId, ano, mes, capacidade);
  const publico = new Map<string, DiaPublico>();
  for (const [data, dia] of completo) {
    publico.set(data, { data, status: dia.status });
  }
  return publico;
}

export async function obterCalendarioDoMes(
  lojaId: string,
  ano: number,
  mes: number,
  capacidade: number
): Promise<Map<string, DiaCalendario>> {
  const dias = diasDoMes(ano, mes);
  const primeiro = dias[0];
  const ultimo = dias[dias.length - 1];

  const pedidos = await prisma.pedido.findMany({
    where: { lojaId, data: { gte: primeiro, lte: ultimo } },
    orderBy: { criadoEm: "asc" },
  });

  const mapa = new Map<string, DiaCalendario>();
  for (const data of dias) {
    mapa.set(data, { data, status: "livre", carga: 0, pedidos: [] });
  }

  for (const pedido of pedidos) {
    const dia = mapa.get(pedido.data);
    if (!dia) continue;
    dia.pedidos.push({
      id: pedido.id,
      clienteNome: pedido.clienteNome,
      clienteTelefone: pedido.clienteTelefone,
      porte: pedido.porte as Porte,
      descricao: pedido.descricao,
      status: pedido.status,
      origem: pedido.origem,
    });
    if (STATUS_QUE_OCUPAM.includes(pedido.status)) {
      dia.carga += PESO_PEDIDO[pedido.porte as Porte] ?? 1;
    }
  }

  for (const dia of mapa.values()) {
    dia.status = statusDoDia(dia.carga, capacidade);
  }

  return mapa;
}
