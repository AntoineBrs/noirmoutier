import type { Metadata } from "next";
import { Fraunces, Nunito } from "next/font/google";
import "./globals.css";
import { ProfileProvider } from "@/components/ProfileProvider";
import { ProfileGate } from "@/components/ProfileGate";
import { Header } from "@/components/Header";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Noirmoutier — Le carnet de famille",
  description:
    "Le calendrier des séjours et le carnet de photos de la maison de famille à Noirmoutier.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${nunito.variable}`}>
      <body className="font-sans min-h-screen">
        <ProfileProvider>
          <ProfileGate>
            <Header />
            <main className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
              {children}
            </main>
          </ProfileGate>
        </ProfileProvider>
      </body>
    </html>
  );
}
