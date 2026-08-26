import type { ButtonHTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";
import type { StatusDia } from "@/lib/capacidade";
import { STATUS_LABEL } from "@/lib/capacidade";

export function Botao({
  className = "",
  variante = "primario",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: "primario" | "secundario" | "fantasma" }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-lg font-bold transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
  const estilos = {
    primario: "bg-accent text-accent-ink shadow-sm hover:brightness-105",
    secundario: "bg-card text-ink border-2 border-line hover:border-accent",
    fantasma: "bg-transparent text-ink-soft hover:text-ink",
  } as const;
  return <button className={`${base} ${estilos[variante]} ${className}`} {...props} />;
}

export function Campo({
  rotulo,
  ajuda,
  erro,
  children,
}: {
  rotulo: string;
  ajuda?: string;
  erro?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-base font-bold text-ink">{rotulo}</span>
      {children}
      {ajuda && !erro && <span className="text-sm text-ink-soft">{ajuda}</span>}
      {erro && <span className="text-sm font-bold text-lotado">{erro}</span>}
    </label>
  );
}

export function Entrada(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border-2 border-line bg-card px-5 py-4 text-lg text-ink placeholder:text-ink-soft/60 outline-none focus:border-accent ${props.className ?? ""}`}
    />
  );
}

export function EntradaPin(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={4}
      placeholder="••••"
      {...props}
      className={`w-full rounded-2xl border-2 border-line bg-card px-5 py-4 text-center text-3xl font-bold tracking-[0.6em] text-ink outline-none focus:border-accent ${props.className ?? ""}`}
    />
  );
}

export function Cartao({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-3xl bg-card border border-line ${className}`}>{children}</div>;
}

export function RotuloEscolha({
  children,
  className = "",
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { children: ReactNode }) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-line bg-card p-4 transition has-[:checked]:border-accent has-[:checked]:bg-accent-soft ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}

const CORES_STATUS: Record<StatusDia, { texto: string; fundo: string }> = {
  livre: { texto: "text-livre", fundo: "bg-livre-bg" },
  quase: { texto: "text-quase", fundo: "bg-quase-bg" },
  lotado: { texto: "text-lotado", fundo: "bg-lotado-bg" },
};

export function SeloStatus({ status }: { status: StatusDia }) {
  const cor = CORES_STATUS[status];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${cor.texto} ${cor.fundo}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
