import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Cooked — Recettes culinaires",
  description: "Découvrez et partagez des recettes culinaires délicieuses.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body
        className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable}`}
      >
        <a href="#main-content" className="skip-to-content">
          Aller au contenu principal
        </a>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
