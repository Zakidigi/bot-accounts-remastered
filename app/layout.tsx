import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "AgendaCheia — nunca aceite mais do que a sua cozinha aguenta",
  description:
    "Organize as encomendas da sua confeitaria e mostre às clientes quais dias já estão livres, sem sair do WhatsApp.",
};

export const viewport: Viewport = {
  themeColor: "#b23a4e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-AO" className={`${nunito.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-paper text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
