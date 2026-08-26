import { customAlphabet } from "nanoid";
import { prisma } from "./prisma";

const sufixo = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 4);

function slugBase(nome: string): string {
  const limpo = nome
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return limpo || "loja";
}

export async function gerarSlugUnico(nome: string): Promise<string> {
  const base = slugBase(nome);
  let candidato = base;
  let tentativas = 0;
  while (await prisma.loja.findUnique({ where: { slug: candidato } })) {
    candidato = `${base}-${sufixo()}`;
    tentativas += 1;
    if (tentativas > 5) break;
  }
  return candidato;
}
