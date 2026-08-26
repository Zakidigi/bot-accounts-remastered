import Link from "next/link";
import { Botao } from "@/components/ui";

export default function PaginaInicial() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-between gap-10 px-6 py-10">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🧁</span>
            <span className="text-xl font-extrabold">AgendaCheia</span>
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-extrabold leading-tight text-balance">
              Nunca mais aceite uma encomenda que a sua cozinha não aguenta.
            </h1>
            <p className="text-lg text-ink-soft">
              Marque quanto trabalho cabe em cada dia. A sua agenda fica verde, amarela ou
              vermelha sozinha — e a cliente vê antes de lhe mandar mensagem.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-card border border-line p-4">
              <span className="h-3 w-3 shrink-0 rounded-full bg-livre" />
              <span className="text-base">Dia livre — pode aceitar</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-card border border-line p-4">
              <span className="h-3 w-3 shrink-0 rounded-full bg-quase" />
              <span className="text-base">Quase cheio — com cuidado</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-card border border-line p-4">
              <span className="h-3 w-3 shrink-0 rounded-full bg-lotado" />
              <span className="text-base">Lotado — a agenda fecha sozinha</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/criar-loja" className="w-full">
            <Botao className="w-full">Criar a minha loja — é grátis</Botao>
          </Link>
          <Link href="/entrar" className="w-full">
            <Botao variante="secundario" className="w-full">
              Já tenho uma loja
            </Botao>
          </Link>
        </div>
      </div>
    </main>
  );
}
