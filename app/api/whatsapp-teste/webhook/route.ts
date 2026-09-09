import { NextRequest, NextResponse } from "next/server";

/**
 * Endpoint de teste para ligar a WhatsApp Cloud API em desenvolvimento.
 * Isolado do produto AgendaCheia — serve só para validar a ligação via ngrok.
 */

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? "teste123";
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const GRAPH_API_VERSION = "v25.0";

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

  const mensagem = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (mensagem?.type === "text") {
    await responderEco(mensagem.from, mensagem.text.body);
  }

  return NextResponse.json({ status: "ok" });
}

async function responderEco(para: string, textoRecebido: string) {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.warn(
      "WHATSAPP_ACCESS_TOKEN ou WHATSAPP_PHONE_NUMBER_ID em falta no .env — não é possível responder."
    );
    return;
  }

  const resposta = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: para,
        type: "text",
        text: { body: `recebi: ${textoRecebido}` },
      }),
    }
  );

  if (!resposta.ok) {
    console.error("Erro ao responder no WhatsApp:", await resposta.text());
  }
}
