import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { obterLojaIdDaSessao } from "@/lib/session";
import { formatarWhatsappVisivel } from "@/lib/whatsapp";
import { obterUrlBase } from "@/lib/url";
import ConfiguracoesForm from "./configuracoes-form";

export default async function ConfiguracoesPagina() {
  const lojaId = await obterLojaIdDaSessao();
  if (!lojaId) redirect("/entrar");

  const loja = await prisma.loja.findUnique({ where: { id: lojaId } });
  if (!loja) redirect("/entrar");

  const urlBase = await obterUrlBase();

  return (
    <ConfiguracoesForm
      nome={loja.nome}
      whatsappVisivel={formatarWhatsappVisivel(loja.whatsapp)}
      capacidade={loja.capacidade}
      urlPublica={`${urlBase}/${loja.slug}`}
    />
  );
}
