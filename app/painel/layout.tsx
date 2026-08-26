import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { obterLojaIdDaSessao } from "@/lib/session";
import { sairAction } from "./actions";

export default async function PainelLayout({ children }: LayoutProps<"/painel">) {
  const lojaId = await obterLojaIdDaSessao();
  if (!lojaId) redirect("/entrar");

  const loja = await prisma.loja.findUnique({ where: { id: lojaId } });
  if (!loja) redirect("/entrar");

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-6 py-4">
          <Link href="/painel" className="flex items-center gap-2">
            <span className="text-2xl">🧁</span>
            <span className="font-extrabold">{loja.nome}</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-bold text-ink-soft">
            <Link href="/painel/configuracoes" className="hover:text-ink">
              Ajustes
            </Link>
            <form action={sairAction}>
              <button type="submit" className="hover:text-ink">
                Sair
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-md flex-1 px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
