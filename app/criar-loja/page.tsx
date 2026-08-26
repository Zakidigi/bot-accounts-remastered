"use client";

import { useActionState } from "react";
import Link from "next/link";
import { criarLojaAction, type EstadoCriarLoja } from "./actions";
import { Botao, Campo, Entrada, EntradaPin, RotuloEscolha } from "@/components/ui";
import { PRESETS_CAPACIDADE } from "@/lib/capacidade";

const estadoInicial: EstadoCriarLoja = {};

export default function CriarLojaPagina() {
  const [estado, formAction, pendente] = useActionState(criarLojaAction, estadoInicial);

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
        <Link href="/" className="text-sm font-bold text-ink-soft">
          ← Voltar
        </Link>

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold">Crie a sua loja</h1>
          <p className="text-ink-soft">Leva menos de 2 minutos. Sem e-mail, sem cartão.</p>
        </div>

        <form action={formAction} className="flex flex-col gap-5">
          <Campo rotulo="Nome da sua loja ou o seu nome">
            <Entrada name="nome" placeholder="Ex: Doces da Ana" required maxLength={60} />
          </Campo>

          <Campo rotulo="O seu número de WhatsApp" ajuda="Os pedidos vão chegar por aqui">
            <Entrada
              name="whatsapp"
              type="tel"
              inputMode="tel"
              placeholder="9XX XXX XXX"
              required
            />
          </Campo>

          <Campo
            rotulo="Crie um PIN de 4 números"
            ajuda="Vai usar este PIN para entrar. Escolha um fácil de lembrar."
          >
            <EntradaPin name="pin" required />
          </Campo>

          <fieldset className="flex flex-col gap-3">
            <legend className="text-base font-bold text-ink">Como você trabalha?</legend>
            {PRESETS_CAPACIDADE.map((preset, indice) => (
              <RotuloEscolha key={preset.chave}>
                <input
                  type="radio"
                  name="presetCapacidade"
                  value={preset.chave}
                  defaultChecked={indice === 0}
                  className="mt-1 h-5 w-5 accent-[var(--accent)]"
                />
                <span className="flex flex-col">
                  <span className="font-bold text-ink">{preset.titulo}</span>
                  <span className="text-sm text-ink-soft">{preset.descricao}</span>
                </span>
              </RotuloEscolha>
            ))}
            <p className="text-sm text-ink-soft">Pode mudar isto depois, a qualquer momento.</p>
          </fieldset>

          {estado.erro && (
            <p className="rounded-2xl bg-lotado-bg px-4 py-3 text-sm font-bold text-lotado">
              {estado.erro}
            </p>
          )}

          <Botao type="submit" disabled={pendente}>
            {pendente ? "A criar..." : "Criar a minha loja"}
          </Botao>
        </form>
      </div>
    </main>
  );
}
