"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Botao, Campo, Entrada } from "@/components/ui";
import { atualizarCapacidadeAction, atualizarPerfilAction, type EstadoForm } from "../actions";

const estadoInicial: EstadoForm = {};

export default function ConfiguracoesForm({
  nome,
  whatsappVisivel,
  capacidade,
  urlPublica,
}: {
  nome: string;
  whatsappVisivel: string;
  capacidade: number;
  urlPublica: string;
}) {
  return (
    <div className="flex flex-col gap-8">
      <Link href="/painel" className="text-sm font-bold text-ink-soft">
        ← Voltar ao calendário
      </Link>

      <LinkPublico url={urlPublica} />
      <CapacidadeForm capacidadeAtual={capacidade} />
      <PerfilForm nomeAtual={nome} whatsappAtual={whatsappVisivel} />
    </div>
  );
}

function LinkPublico({ url }: { url: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // clipboard indisponível; a cliente pode copiar o texto manualmente
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-line bg-card p-5">
      <h2 className="text-lg font-extrabold">A sua página para clientes</h2>
      <p className="text-sm text-ink-soft">
        Envie este link nos seus estados e grupos. A cliente vê os dias livres sem precisar de
        lhe perguntar.
      </p>
      <p className="break-all rounded-2xl bg-paper-alt px-4 py-3 text-sm font-bold">{url}</p>
      <Botao variante="secundario" onClick={copiar} type="button">
        {copiado ? "Link copiado! ✓" : "Copiar link"}
      </Botao>
    </section>
  );
}

function CapacidadeForm({ capacidadeAtual }: { capacidadeAtual: number }) {
  const [estado, formAction, pendente] = useActionState(atualizarCapacidadeAction, estadoInicial);
  const [capacidade, setCapacidade] = useState(capacidadeAtual);

  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-line bg-card p-5">
      <h2 className="text-lg font-extrabold">Quanto você aguenta por dia?</h2>
      <p className="text-sm text-ink-soft">
        Some 1 para um bolo pequeno, 2 para médio, 3 para grande. Ajuste até bater com a sua
        realidade.
      </p>
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="capacidade" value={capacidade} />
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => setCapacidade((c) => Math.max(1, c - 1))}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-paper-alt text-2xl font-bold"
            aria-label="Diminuir"
          >
            −
          </button>
          <span className="w-16 text-center text-4xl font-extrabold tabular-nums">
            {capacidade}
          </span>
          <button
            type="button"
            onClick={() => setCapacidade((c) => Math.min(50, c + 1))}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-paper-alt text-2xl font-bold"
            aria-label="Aumentar"
          >
            +
          </button>
        </div>
        {estado.erro && <p className="text-center text-sm font-bold text-lotado">{estado.erro}</p>}
        {estado.sucesso && (
          <p className="text-center text-sm font-bold text-livre">Capacidade atualizada ✓</p>
        )}
        <Botao type="submit" disabled={pendente}>
          {pendente ? "A guardar..." : "Guardar"}
        </Botao>
      </form>
    </section>
  );
}

function PerfilForm({
  nomeAtual,
  whatsappAtual,
}: {
  nomeAtual: string;
  whatsappAtual: string;
}) {
  const [estado, formAction, pendente] = useActionState(atualizarPerfilAction, estadoInicial);

  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-line bg-card p-5">
      <h2 className="text-lg font-extrabold">Os seus dados</h2>
      <form action={formAction} className="flex flex-col gap-4">
        <Campo rotulo="Nome da loja">
          <Entrada name="nome" defaultValue={nomeAtual} required maxLength={60} />
        </Campo>
        <Campo rotulo="WhatsApp">
          <Entrada name="whatsapp" defaultValue={whatsappAtual} type="tel" required />
        </Campo>
        {estado.erro && <p className="text-sm font-bold text-lotado">{estado.erro}</p>}
        {estado.sucesso && <p className="text-sm font-bold text-livre">Dados atualizados ✓</p>}
        <Botao type="submit" disabled={pendente}>
          {pendente ? "A guardar..." : "Guardar"}
        </Botao>
      </form>
    </section>
  );
}
