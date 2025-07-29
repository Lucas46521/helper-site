import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Ajudante - Seu Assistente Inteligente no Discord",
    template: "%s | Ajudante",
  },
  description:
    "Conheça o Ajudante, seu bot inteligente no Discord com recursos de música, moderação, economia e muito mais! Adicione-o ao seu servidor hoje mesmo.",
  keywords: [
    "Discord bot",
    "Ajudante",
    "bot de música",
    "moderação Discord",
    "economia Discord",
    "bot de comandos",
    "assistente Discord",
    "servidores Discord",
  ],
  authors: [{ name: "Lucas46521", url: "https://github.com/Lucas46521" }],
  creator: "Lucas46521",
  publisher: "Lucas46521",
  metadataBase: new URL("https://helper-site-two.vercel.app"),
  
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
