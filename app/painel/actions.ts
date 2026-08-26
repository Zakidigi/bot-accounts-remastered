"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { encerrarSessao, obterLojaIdDaSessao } from "@/lib/session";
import {
  schemaPedidoManual,
  schemaCapacidade,
  schemaPerfil,
} from "@/lib/validacao";
import { normalizarWhatsapp } from "@/lib/whatsapp";

async function exigirLojaId(): Promise<string> {
  const lojaId = await obterLojaIdDaSessao();
  if (!lojaId) redirect("/entrar");
  return lojaId;
}

export type EstadoForm = { erro?: string; sucesso?: boolean };

export async function sairAction() {
  await encerrarSessao();
  redirect("/");
}

export async function criarPedidoAction(
  _estadoAnterior: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const lojaId = await exigirLojaId();

  const resultado = schemaPedidoManual.safeParse({
    clienteNome: formData.get("clienteNome"),
    clienteTelefone: formData.get("clienteTelefone"),
    data: formData.get("data"),
    porte: formData.get("porte"),
    descricao: formData.get("descricao") ?? "",
  });

  if (!resultado.success) {
    return { erro: resultado.error.issues[0]?.message ?? "Dados inválidos" };
  }

  await prisma.pedido.create({
    data: {
      lojaId,
      clienteNome: resultado.data.clienteNome,
      clienteTelefone: normalizarWhatsapp(resultado.data.clienteTelefone),
      data: resultado.data.data,
      porte: resultado.data.porte,
      descricao: resultado.data.descricao,
      origem: "painel",
      status: "confirmado",
    },
  });

  revalidatePath("/painel");
  return { sucesso: true };
}

export async function atualizarStatusPedidoAction(pedidoId: string, status: string) {
  const lojaId = await exigirLojaId();
  await prisma.pedido.updateMany({
    where: { id: pedidoId, lojaId },
    data: { status },
  });
  revalidatePath("/painel");
}

export async function excluirPedidoAction(pedidoId: string) {
  const lojaId = await exigirLojaId();
  await prisma.pedido.deleteMany({ where: { id: pedidoId, lojaId } });
  revalidatePath("/painel");
}

export async function atualizarCapacidadeAction(
  _estadoAnterior: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const lojaId = await exigirLojaId();
  const resultado = schemaCapacidade.safeParse({ capacidade: formData.get("capacidade") });
  if (!resultado.success) {
    return { erro: resultado.error.issues[0]?.message ?? "Valor inválido" };
  }
  await prisma.loja.update({
    where: { id: lojaId },
    data: { capacidade: resultado.data.capacidade },
  });
  revalidatePath("/painel");
  revalidatePath("/painel/configuracoes");
  return { sucesso: true };
}

export async function atualizarPerfilAction(
  _estadoAnterior: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const lojaId = await exigirLojaId();
  const resultado = schemaPerfil.safeParse({
    nome: formData.get("nome"),
    whatsapp: formData.get("whatsapp"),
  });
  if (!resultado.success) {
    return { erro: resultado.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const whatsapp = normalizarWhatsapp(resultado.data.whatsapp);
  const outraLojaComMesmoWhatsapp = await prisma.loja.findFirst({
    where: { whatsapp, NOT: { id: lojaId } },
  });
  if (outraLojaComMesmoWhatsapp) {
    return { erro: "Já existe outra loja com este WhatsApp." };
  }

  await prisma.loja.update({
    where: { id: lojaId },
    data: { nome: resultado.data.nome, whatsapp },
  });
  revalidatePath("/painel");
  revalidatePath("/painel/configuracoes");
  return { sucesso: true };
}
