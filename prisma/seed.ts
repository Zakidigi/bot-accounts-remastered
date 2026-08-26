import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { dataDeHoje } from "../lib/mes";

const prisma = new PrismaClient();

function somarDias(data: string, dias: number): string {
  const [ano, mes, dia] = data.split("-").map(Number);
  const d = new Date(ano, mes - 1, dia + dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function main() {
  const slug = "doces-da-ana";
  await prisma.pedido.deleteMany({ where: { loja: { slug } } });
  await prisma.loja.deleteMany({ where: { slug } });

  const loja = await prisma.loja.create({
    data: {
      nome: "Doces da Ana",
      slug,
      whatsapp: "244923456789",
      pinHash: await bcrypt.hash("1234", 10),
      capacidade: 4,
    },
  });

  const hoje = dataDeHoje();
  const pedidos = [
    { offset: 1, nome: "Marina Silva", porte: "M", status: "confirmado" },
    { offset: 1, nome: "Beatriz Costa", porte: "P", status: "confirmado" },
    { offset: 2, nome: "Joana Neto", porte: "G", status: "pendente" },
    { offset: 2, nome: "Sofia Dias", porte: "G", status: "confirmado" },
    { offset: 5, nome: "Rita Fernandes", porte: "M", status: "confirmado" },
    { offset: -2, nome: "Carla Mendes", porte: "M", status: "concluido" },
  ] as const;

  for (const p of pedidos) {
    await prisma.pedido.create({
      data: {
        lojaId: loja.id,
        clienteNome: p.nome,
        clienteTelefone: "244911222333",
        data: somarDias(hoje, p.offset),
        porte: p.porte,
        descricao: "",
        status: p.status,
        origem: "painel",
      },
    });
  }

  console.log("Loja de teste criada:");
  console.log(`  Nome da loja / login: ${slug}`);
  console.log("  PIN: 1234");
  console.log(`  Página pública: /${slug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
