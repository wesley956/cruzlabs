import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cruz Agenda Admin",
  description: "Painel administrativo da Cruz Labs.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
