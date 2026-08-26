import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { obterLojaIdDaSessao } from "@/lib/session";
import { obterCalendarioDoMes } from "@/lib/dados-calendario";
import { obterUrlBase } from "@/lib/url";
import {
  anoMesDeString,
  anoMesParaString,
  diasDoMes,
  mesAnterior,
  mesLabel,
  primeiroDiaSemana,
  proximoMes,
  dataDeHoje,
  DIAS_SEMANA_PT,
} from "@/lib/mes";
import PainelCalendario from "./painel-calendario";

export default async function PainelPagina({ searchParams }: PageProps<"/painel">) {
  const lojaId = await obterLojaIdDaSessao();
  if (!lojaId) redirect("/entrar");

  const loja = await prisma.loja.findUnique({ where: { id: lojaId } });
  if (!loja) redirect("/entrar");

  const params = await searchParams;
  const mesParam = typeof params.mes === "string" ? params.mes : undefined;
  const { ano, mes } = anoMesDeString(mesParam);

  const calendario = await obterCalendarioDoMes(lojaId, ano, mes, loja.capacidade);
  const dias = diasDoMes(ano, mes);
  const offset = primeiroDiaSemana(ano, mes);
  const celulasVazias = Array.from({ length: offset }, (_, i) => `vazia-${i}`);

  const anterior = mesAnterior(ano, mes);
  const proximo = proximoMes(ano, mes);
  const hrefAnterior = `/painel?mes=${anoMesParaString(anterior.ano, anterior.mes)}`;
  const hrefProximo = `/painel?mes=${anoMesParaString(proximo.ano, proximo.mes)}`;

  const diasDetalhe = Object.fromEntries(calendario.entries());
  const hoje = dataDeHoje();
  const dataInicial = dias.includes(hoje) ? hoje : dias[0];

  const urlBase = await obterUrlBase();
  const publicUrl = `${urlBase}/${loja.slug}`;

  return (
    <div className="flex flex-col gap-6">
      {params.bemvinda === "1" && (
        <div className="flex flex-col gap-2 rounded-2xl bg-accent-soft p-4">
          <p className="font-bold text-ink">A sua loja está pronta! 🎉</p>
          <p className="text-sm text-ink">
            Este é o link para as suas clientes verem os dias livres:
          </p>
          <p className="rounded-xl bg-card px-3 py-2 text-sm font-bold text-accent break-all">
            {publicUrl}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link
          href={hrefAnterior}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-card border border-line text-xl font-bold"
          aria-label="Mês anterior"
        >
          ‹
        </Link>
        <h1 className="text-xl font-extrabold">{mesLabel(ano, mes)}</h1>
        <Link
          href={hrefProximo}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-card border border-line text-xl font-bold"
          aria-label="Próximo mês"
        >
          ›
        </Link>
      </div>

      <div className="flex items-center justify-center gap-4 text-sm font-bold text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-livre" /> Livre
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-quase" /> Quase cheio
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-lotado" /> Lotado
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-ink-soft">
        {DIAS_SEMANA_PT.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <PainelCalendario
        celulasVazias={celulasVazias.length}
        dias={dias}
        diasDetalhe={diasDetalhe}
        dataInicial={dataInicial}
        capacidade={loja.capacidade}
        hoje={hoje}
      />
    </div>
  );
}
