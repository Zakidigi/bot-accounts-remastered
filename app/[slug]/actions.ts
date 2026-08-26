"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { schemaPedidoPublico } from "@/lib/validacao";
import { normalizarWhatsapp, linkWhatsapp } from "@/lib/whatsapp";
import { PORTE_LABEL, type Porte } from "@/lib/capacidade";
import { formatarDataCurta } from "@/lib/mes";

export type EstadoPedidoPublico = {
  erro?: string;
  linkWhatsapp?: string;
};

export async function criarPedidoPublicoAction(
  slug: string,
  _estadoAnterior: EstadoPedidoPublico,
  formData: FormData
): Promise<EstadoPedidoPublico> {
  const loja = await prisma.loja.findUnique({ where: { slug } });
  if (!loja) {
    return { erro: "Loja não encontrada." };
  }

  const resultado = schemaPedidoPublico.safeParse({
    clienteNome: formData.get("clienteNome"),
    clienteTelefone: formData.get("clienteTelefone"),
    data: formData.get("data"),
    porte: formData.get("porte"),
    descricao: formData.get("descricao") ?? "",
  });

  if (!resultado.success) {
    return { erro: resultado.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const clienteTelefone = normalizarWhatsapp(resultado.data.clienteTelefone);

  await prisma.pedido.create({
    data: {
      lojaId: loja.id,
      clienteNome: resultado.data.clienteNome,
      clienteTelefone,
      data: resultado.data.data,
      porte: resultado.data.porte,
      descricao: resultado.data.descricao,
      origem: "publico",
      status: "pendente",
    },
  });

  revalidatePath("/painel");
  revalidatePath(`/${slug}`);

  const porteTexto = PORTE_LABEL[resultado.data.porte as Porte];
  const mensagem = [
    `Olá! Sou ${resultado.data.clienteNome} e gostaria de fazer uma encomenda.`,
    `Data: ${formatarDataCurta(resultado.data.data)}`,
    `Tamanho: ${porteTexto}`,
    resultado.data.descricao ? `Detalhes: ${resultado.data.descricao}` : undefined,
    "(Enviado pelo AgendaCheia)",
  ]
    .filter(Boolean)
    .join("\n");

  return { linkWhatsapp: linkWhatsapp(loja.whatsapp, mensagem) };
}
