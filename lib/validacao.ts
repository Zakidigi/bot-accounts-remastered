import { z } from "zod";

export const schemaCriarLoja = z.object({
  nome: z.string().trim().min(2, "Escreva o nome da sua loja").max(60),
  whatsapp: z
    .string()
    .trim()
    .min(9, "Número de WhatsApp inválido")
    .max(20),
  pin: z.string().regex(/^\d{4}$/, "O PIN deve ter 4 números"),
  presetCapacidade: z.enum(["sozinha", "ajudante", "atelie"]),
});

export const schemaEntrar = z.object({
  identificador: z.string().trim().min(2, "Escreva o nome da loja ou o WhatsApp"),
  pin: z.string().regex(/^\d{4}$/, "O PIN deve ter 4 números"),
});

export const schemaPedidoManual = z.object({
  clienteNome: z.string().trim().min(2, "Escreva o nome da cliente").max(60),
  clienteTelefone: z.string().trim().min(9, "Número inválido").max(20),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  porte: z.enum(["P", "M", "G"]),
  descricao: z.string().trim().max(200).optional().default(""),
});

export const schemaPedidoPublico = z.object({
  clienteNome: z.string().trim().min(2, "Escreva o seu nome").max(60),
  clienteTelefone: z.string().trim().min(9, "Número inválido").max(20),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  porte: z.enum(["P", "M", "G"]),
  descricao: z.string().trim().max(200).optional().default(""),
});

export const schemaCapacidade = z.object({
  capacidade: z.coerce.number().int().min(1).max(50),
});

export const schemaPerfil = z.object({
  nome: z.string().trim().min(2).max(60),
  whatsapp: z.string().trim().min(9).max(20),
});
