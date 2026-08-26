"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { criarSessao } from "@/lib/session";
import { schemaEntrar } from "@/lib/validacao";
import { normalizarWhatsapp } from "@/lib/whatsapp";

export type EstadoEntrar = {
  erro?: string;
};

export async function entrarAction(
  _estadoAnterior: EstadoEntrar,
  formData: FormData
): Promise<EstadoEntrar> {
  const dados = {
    identificador: String(formData.get("identificador") ?? ""),
    pin: String(formData.get("pin") ?? ""),
  };

  const resultado = schemaEntrar.safeParse(dados);
  if (!resultado.success) {
    return { erro: resultado.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const identificadorLimpo = resultado.data.identificador.trim().toLowerCase();
  const comoWhatsapp = normalizarWhatsapp(resultado.data.identificador);

  const loja = await prisma.loja.findFirst({
    where: {
      OR: [{ slug: identificadorLimpo }, { whatsapp: comoWhatsapp }],
    },
  });

  if (!loja) {
    return { erro: "Não encontramos essa loja. Confira o nome ou o WhatsApp." };
  }

  const pinCorreto = await bcrypt.compare(resultado.data.pin, loja.pinHash);
  if (!pinCorreto) {
    return { erro: "PIN incorreto. Tente novamente." };
  }

  await criarSessao(loja.id);
  redirect("/painel");
}
