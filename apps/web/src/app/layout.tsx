import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Cruz Agenda",
    template: "%s | Cruz Agenda",
  },
  description:
    "Agenda online simples para profissionais autônomos da beleza receberem agendamentos pelo próprio link.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
