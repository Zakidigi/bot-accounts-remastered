/** Normaliza um número angolano para o formato que o wa.me espera: só dígitos, com 244 na frente. */
export function normalizarWhatsapp(bruto: string): string {
  const digitos = bruto.replace(/\D/g, "");
  if (digitos.startsWith("244")) return digitos;
  if (digitos.startsWith("00244")) return digitos.slice(2);
  if (digitos.startsWith("0")) return `244${digitos.slice(1)}`;
  if (digitos.length === 9) return `244${digitos}`;
  return digitos;
}

export function formatarWhatsappVisivel(bruto: string): string {
  const normalizado = normalizarWhatsapp(bruto);
  const local = normalizado.slice(3);
  if (local.length !== 9) return `+${normalizado}`;
  return `+244 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
}

export function linkWhatsapp(bruto: string, mensagem: string): string {
  const numero = normalizarWhatsapp(bruto);
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
