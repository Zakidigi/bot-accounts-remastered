"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { criarSessao } from "@/lib/session";
import { gerarSlugUnico } from "@/lib/slug";
import { schemaCriarLoja } from "@/lib/validacao";
import { PRESETS_CAPACIDADE } from "@/lib/capacidade";
import { normalizarWhatsapp } from "@/lib/whatsapp";

export type EstadoCriarLoja = {
  erro?: string;
  campos?: Record<string, string>;
};

export async function criarLojaAction(
  _estadoAnterior: EstadoCriarLoja,
  formData: FormData
): Promise<EstadoCriarLoja> {
  const dados = {
    nome: String(formData.get("nome") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    pin: String(formData.get("pin") ?? ""),
    presetCapacidade: String(formData.get("presetCapacidade") ?? "sozinha"),
  };

  const resultado = schemaCriarLoja.safeParse(dados);
  if (!resultado.success) {
    return { erro: resultado.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const preset = PRESETS_CAPACIDADE.find((p) => p.chave === resultado.data.presetCapacidade);
  const whatsapp = normalizarWhatsapp(resultado.data.whatsapp);

  const jaExiste = await prisma.loja.findUnique({ where: { whatsapp } });
  if (jaExiste) {
    return { erro: "Já existe uma loja com este WhatsApp. Tente entrar." };
  }

  const slug = await gerarSlugUnico(resultado.data.nome);
  const pinHash = await bcrypt.hash(resultado.data.pin, 10);

  const loja = await prisma.loja.create({
    data: {
      nome: resultado.data.nome,
      slug,
      whatsapp,
      pinHash,
      capacidade: preset?.capacidade ?? 3,
    },
  });

  await criarSessao(loja.id);
  redirect("/painel?bemvinda=1");
}
