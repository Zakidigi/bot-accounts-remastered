import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { obterStatusPublicoDoMes } from "@/lib/dados-calendario";
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
import PaginaPublicaCalendario from "./pagina-publica-calendario";

export default async function PaginaPublicaLoja({
  params,
  searchParams,
}: PageProps<"/[slug]">) {
  const { slug } = await params;
  const loja = await prisma.loja.findUnique({ where: { slug } });
  if (!loja) notFound();

  const hoje = dataDeHoje();
  const { ano: anoHoje, mes: mesHoje } = anoMesDeString();

  const sp = await searchParams;
  const mesParam = typeof sp.mes === "string" ? sp.mes : undefined;
  let { ano, mes } = anoMesDeString(mesParam);
  if (ano < anoHoje || (ano === anoHoje && mes < mesHoje)) {
    ano = anoHoje;
    mes = mesHoje;
  }

  const calendario = await obterStatusPublicoDoMes(loja.id, ano, mes, loja.capacidade);
  const dias = diasDoMes(ano, mes);
  const offset = primeiroDiaSemana(ano, mes);

  const anterior = mesAnterior(ano, mes);
  const proximo = proximoMes(ano, mes);
  const emMesAtual = ano === anoHoje && mes === mesHoje;
  const hrefAnterior = `/${slug}?mes=${anoMesParaString(anterior.ano, anterior.mes)}`;
  const hrefProximo = `/${slug}?mes=${anoMesParaString(proximo.ano, proximo.mes)}`;

  const diasStatus = Object.fromEntries(
    Array.from(calendario.entries()).map(([data, dia]) => [data, dia.status])
  );

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-8">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🧁</span>
          <div>
            <p className="text-xl font-extrabold leading-tight">{loja.nome}</p>
            <p className="text-sm text-ink-soft">Veja os dias livres para encomendas</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {emMesAtual ? (
            <span className="h-11 w-11" />
          ) : (
            <Link
              href={hrefAnterior}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-card border border-line text-xl font-bold"
              aria-label="Mês anterior"
            >
              ‹
            </Link>
          )}
          <h1 className="text-lg font-extrabold">{mesLabel(ano, mes)}</h1>
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

        <PaginaPublicaCalendario
          slug={slug}
          celulasVazias={offset}
          dias={dias}
          diasStatus={diasStatus}
          hoje={hoje}
        />

        <p className="text-center text-xs text-ink-soft">Feito com AgendaCheia 🧁</p>
      </div>
    </main>
  );
}
