"use client";

import { useActionState, useEffect, useState } from "react";
import type { DiaCalendario } from "@/lib/dados-calendario";
import { PORTE_LABEL, type Porte } from "@/lib/capacidade";
import { formatarDataCurta } from "@/lib/mes";
import { formatarWhatsappVisivel, linkWhatsapp } from "@/lib/whatsapp";
import { Botao, Campo, Entrada, SeloStatus } from "@/components/ui";
import {
  atualizarStatusPedidoAction,
  criarPedidoAction,
  excluirPedidoAction,
  type EstadoForm,
} from "./actions";

const CORES_CELULA: Record<DiaCalendario["status"], string> = {
  livre: "bg-livre-bg text-livre",
  quase: "bg-quase-bg text-quase",
  lotado: "bg-lotado-bg text-lotado",
};

const PORTES: Porte[] = ["P", "M", "G"];

export default function PainelCalendario({
  celulasVazias,
  dias,
  diasDetalhe,
  dataInicial,
  capacidade,
  hoje,
}: {
  celulasVazias: number;
  dias: string[];
  diasDetalhe: Record<string, DiaCalendario>;
  dataInicial: string;
  capacidade: number;
  hoje: string;
}) {
  const [selecionada, setSelecionada] = useState(dataInicial);
  const [mostrarForm, setMostrarForm] = useState(false);

  const diaSelecionado = diasDetalhe[selecionada];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: celulasVazias }, (_, i) => (
          <div key={`vazia-${i}`} />
        ))}
        {dias.map((data) => {
          const dia = diasDetalhe[data];
          const numero = Number(data.split("-")[2]);
          const ativo = data === selecionada;
          const passado = data < hoje;
          return (
            <button
              key={data}
              onClick={() => {
                setSelecionada(data);
                setMostrarForm(false);
              }}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-bold transition ${CORES_CELULA[dia?.status ?? "livre"]} ${ativo ? "ring-2 ring-accent ring-offset-1" : ""} ${passado ? "opacity-50" : ""}`}
            >
              {numero}
              {dia && dia.pedidos.length > 0 && (
                <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-current" />
              )}
            </button>
          );
        })}
      </div>

      {diaSelecionado && (
        <div className="flex flex-col gap-4 rounded-3xl border border-line bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-extrabold">Dia {formatarDataCurta(selecionada)}</p>
              <p className="text-sm text-ink-soft">
                {diaSelecionado.carga} de {capacidade} de capacidade
              </p>
            </div>
            <SeloStatus status={diaSelecionado.status} />
          </div>

          <div className="flex flex-col gap-3">
            {diaSelecionado.pedidos.length === 0 && (
              <p className="text-sm text-ink-soft">Nenhuma encomenda neste dia ainda.</p>
            )}
            {diaSelecionado.pedidos.map((pedido) => (
              <div key={pedido.id} className="flex flex-col gap-2 rounded-2xl bg-paper-alt p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">{pedido.clienteNome}</p>
                    <p className="text-sm text-ink-soft">
                      {PORTE_LABEL[pedido.porte]}
                      {pedido.descricao ? ` · ${pedido.descricao}` : ""}
                    </p>
                  </div>
                  <StatusBadge status={pedido.status} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={linkWhatsapp(pedido.clienteTelefone, "")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-card border border-line px-3 py-1.5 text-xs font-bold"
                  >
                    💬 {formatarWhatsappVisivel(pedido.clienteTelefone)}
                  </a>
                  {pedido.status === "pendente" && (
                    <>
                      <BotaoAcao acao={atualizarStatusPedidoAction.bind(null, pedido.id, "confirmado")}>
                        Confirmar
                      </BotaoAcao>
                      <BotaoAcao acao={atualizarStatusPedidoAction.bind(null, pedido.id, "recusado")}>
                        Recusar
                      </BotaoAcao>
                    </>
                  )}
                  {pedido.status === "confirmado" && (
                    <BotaoAcao acao={atualizarStatusPedidoAction.bind(null, pedido.id, "concluido")}>
                      Concluído
                    </BotaoAcao>
                  )}
                  <BotaoAcao acao={excluirPedidoAction.bind(null, pedido.id)} destrutivo>
                    Apagar
                  </BotaoAcao>
                </div>
              </div>
            ))}
          </div>

          {!mostrarForm && (
            <Botao variante="secundario" onClick={() => setMostrarForm(true)}>
              + Adicionar encomenda
            </Botao>
          )}
          {mostrarForm && (
            <NovoPedidoForm data={selecionada} aoSalvar={() => setMostrarForm(false)} />
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const rotulos: Record<string, string> = {
    pendente: "Pendente",
    confirmado: "Confirmado",
    recusado: "Recusado",
    concluido: "Concluído",
  };
  const cores: Record<string, string> = {
    pendente: "bg-quase-bg text-quase",
    confirmado: "bg-livre-bg text-livre",
    recusado: "bg-lotado-bg text-lotado",
    concluido: "bg-paper-alt text-ink-soft",
  };
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${cores[status] ?? ""}`}>
      {rotulos[status] ?? status}
    </span>
  );
}

function BotaoAcao({
  acao,
  destrutivo,
  children,
}: {
  acao: () => Promise<void>;
  destrutivo?: boolean;
  children: React.ReactNode;
}) {
  return (
    <form action={acao}>
      <button
        type="submit"
        className={`rounded-full px-3 py-1.5 text-xs font-bold ${destrutivo ? "bg-lotado-bg text-lotado" : "bg-accent-soft text-accent"}`}
      >
        {children}
      </button>
    </form>
  );
}

const estadoInicialPedido: EstadoForm = {};

function NovoPedidoForm({ data, aoSalvar }: { data: string; aoSalvar: () => void }) {
  const [estado, formAction, pendente] = useActionState(criarPedidoAction, estadoInicialPedido);
  const [porte, setPorte] = useState<Porte>("M");

  useEffect(() => {
    if (estado.sucesso) aoSalvar();
  }, [estado.sucesso, aoSalvar]);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-2xl bg-paper-alt p-4">
      <input type="hidden" name="data" value={data} />
      <Campo rotulo="Nome da cliente">
        <Entrada name="clienteNome" required maxLength={60} />
      </Campo>
      <Campo rotulo="WhatsApp da cliente">
        <Entrada name="clienteTelefone" type="tel" inputMode="tel" required placeholder="9XX XXX XXX" />
      </Campo>
      <div className="flex flex-col gap-2">
        <span className="text-base font-bold text-ink">Tamanho da encomenda</span>
        <div className="grid grid-cols-3 gap-2">
          {PORTES.map((p) => (
            <label
              key={p}
              className={`flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 p-3 text-sm font-bold ${porte === p ? "border-accent bg-accent-soft" : "border-line bg-card"}`}
            >
              <input
                type="radio"
                name="porte"
                value={p}
                checked={porte === p}
                onChange={() => setPorte(p)}
                className="sr-only"
              />
              {PORTE_LABEL[p]}
            </label>
          ))}
        </div>
      </div>
      <Campo rotulo="Detalhes (opcional)">
        <Entrada name="descricao" maxLength={200} placeholder="Ex: bolo de chocolate, 2 andares" />
      </Campo>

      {estado.erro && (
        <p className="rounded-2xl bg-lotado-bg px-4 py-3 text-sm font-bold text-lotado">
          {estado.erro}
        </p>
      )}

      <Botao type="submit" disabled={pendente}>
        {pendente ? "A guardar..." : "Guardar encomenda"}
      </Botao>
    </form>
  );
}
