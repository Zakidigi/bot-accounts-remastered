import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AgendaCheia",
    short_name: "AgendaCheia",
    description:
      "Organize as encomendas da sua confeitaria e mostre às clientes os dias livres, direto do WhatsApp.",
    start_url: "/painel",
    display: "standalone",
    background_color: "#faf6ee",
    theme_color: "#b23a4e",
    lang: "pt-AO",
    icons: [
      { src: "/manifest-icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/manifest-icon-192", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/manifest-icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/manifest-icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
