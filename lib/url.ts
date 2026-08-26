import "server-only";
import { headers } from "next/headers";

export async function obterUrlBase(): Promise<string> {
  const listaHeaders = await headers();
  const host = listaHeaders.get("x-forwarded-host") ?? listaHeaders.get("host") ?? "localhost:3000";
  const protocolo = host.includes("localhost") || host.startsWith("127.") ? "http" : "https";
  return `${protocolo}://${host}`;
}
