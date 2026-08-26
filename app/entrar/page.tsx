"use client";

import { useActionState } from "react";
import Link from "next/link";
import { entrarAction, type EstadoEntrar } from "./actions";
import { Botao, Campo, Entrada, EntradaPin } from "@/components/ui";

const estadoInicial: EstadoEntrar = {};

export default function EntrarPagina() {
  const [estado, formAction, pendente] = useActionState(entrarAction, estadoInicial);

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
        <Link href="/" className="text-sm font-bold text-ink-soft">
          ← Voltar
        </Link>

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold">Entrar na minha loja</h1>
          <p className="text-ink-soft">Use o nome da loja ou o seu WhatsApp.</p>
        </div>

        <form action={formAction} className="flex flex-col gap-5">
          <Campo rotulo="Nome da loja ou WhatsApp">
            <Entrada name="identificador" placeholder="doces-da-ana ou 9XX XXX XXX" required />
          </Campo>

          <Campo rotulo="O seu PIN">
            <EntradaPin name="pin" required />
          </Campo>

          {estado.erro && (
            <p className="rounded-2xl bg-lotado-bg px-4 py-3 text-sm font-bold text-lotado">
              {estado.erro}
            </p>
          )}

          <Botao type="submit" disabled={pendente}>
            {pendente ? "A entrar..." : "Entrar"}
          </Botao>
        </form>

        <p className="text-center text-sm text-ink-soft">
          Ainda não tem loja?{" "}
          <Link href="/criar-loja" className="font-bold text-accent">
            Criar agora
          </Link>
        </p>
      </div>
    </main>
  );
}
