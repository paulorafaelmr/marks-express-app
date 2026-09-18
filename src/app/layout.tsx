import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marks Express",
  description: "Gestão de viagens e financeiro da Marks Express",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
