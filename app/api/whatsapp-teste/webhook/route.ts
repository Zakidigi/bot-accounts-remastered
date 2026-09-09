import { NextRequest, NextResponse } from "next/server";

/**
 * Endpoint de teste para ligar a WhatsApp Cloud API em desenvolvimento.
 * Isolado do produto AgendaCheia — serve só para validar a ligação via ngrok.
 */

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? "teste123";

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Verificação falhou", { status: 403 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  console.log("📩 Webhook WhatsApp recebido:\n", JSON.stringify(body, null, 2));
  return NextResponse.json({ status: "ok" });
}
