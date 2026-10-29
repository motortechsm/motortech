import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MotorTech | Módulos eletrônicos automotivos",
    template: "%s | MotorTech",
  },
  description: "Loja de módulos eletrônicos automotivos da MotorTech.",
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
