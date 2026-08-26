"use client";

import { useActionState, useEffect, useState } from "react";
import type { StatusDia } from "@/lib/capacidade";
import { PORTE_LABEL, type Porte } from "@/lib/capacidade";
import { formatarDataCurta } from "@/lib/mes";
import { Botao, Campo, Entrada } from "@/components/ui";
import { criarPedidoPublicoAction, type EstadoPedidoPublico } from "./actions";

const CORES_CELULA: Record<StatusDia, string> = {
  livre: "bg-livre-bg text-livre",
  quase: "bg-quase-bg text-quase",
  lotado: "bg-lotado-bg text-lotado",
};

const PORTES: Porte[] = ["P", "M", "G"];
const estadoInicial: EstadoPedidoPublico = {};

export default function PaginaPublicaCalendario({
  slug,
  celulasVazias,
  dias,
  diasStatus,
  hoje,
}: {
  slug: string;
  celulasVazias: number;
  dias: string[];
  diasStatus: Record<string, StatusDia>;
  hoje: string;
}) {
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const acaoComSlug = criarPedidoPublicoAction.bind(null, slug);
  const [estado, formAction, pendente] = useActionState(acaoComSlug, estadoInicial);
  const [porte, setPorte] = useState<Porte>("M");

  useEffect(() => {
    if (estado.linkWhatsapp) {
      window.location.href = estado.linkWhatsapp;
    }
  }, [estado.linkWhatsapp]);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: celulasVazias }, (_, i) => (
          <div key={`vazia-${i}`} />
        ))}
        {dias.map((data) => {
          const status = diasStatus[data] ?? "livre";
          const numero = Number(data.split("-")[2]);
          const passado = data < hoje;
          const bloqueado = status === "lotado" || passado;
          const ativo = data === selecionada;
          return (
            <button
              key={data}
              disabled={bloqueado}
              onClick={() => setSelecionada(data)}
              className={`flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-bold transition ${CORES_CELULA[status]} ${ativo ? "ring-2 ring-accent ring-offset-1" : ""} ${bloqueado ? "opacity-40" : ""}`}
            >
              {numero}
            </button>
          );
        })}
      </div>

      {selecionada && !estado.linkWhatsapp && (
        <form
          action={formAction}
          className="flex flex-col gap-4 rounded-3xl border border-line bg-card p-5"
        >
          <input type="hidden" name="data" value={selecionada} />
          <p className="font-extrabold">Pedir o dia {formatarDataCurta(selecionada)}</p>

          <Campo rotulo="O seu nome">
            <Entrada name="clienteNome" required maxLength={60} />
          </Campo>
          <Campo rotulo="O seu WhatsApp">
            <Entrada name="clienteTelefone" type="tel" inputMode="tel" required placeholder="9XX XXX XXX" />
          </Campo>
          <div className="flex flex-col gap-2">
            <span className="text-base font-bold text-ink">Tamanho do pedido</span>
            <div className="grid grid-cols-3 gap-2">
              {PORTES.map((p) => (
                <label
                  key={p}
                  className={`flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 p-3 text-sm font-bold ${porte === p ? "border-accent bg-accent-soft" : "border-line bg-paper-alt"}`}
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
          <Campo rotulo="O que você quer? (opcional)">
            <Entrada name="descricao" maxLength={200} placeholder="Ex: bolo de aniversário para 20 pessoas" />
          </Campo>

          {estado.erro && (
            <p className="rounded-2xl bg-lotado-bg px-4 py-3 text-sm font-bold text-lotado">
              {estado.erro}
            </p>
          )}

          <Botao type="submit" disabled={pendente}>
            {pendente ? "A enviar..." : "Enviar pelo WhatsApp"}
          </Botao>
        </form>
      )}
    </div>
  );
}
