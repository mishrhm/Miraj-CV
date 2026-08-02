import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Miraj CV",
  description: "AI-assisted job application tailoring",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
            <span className="text-lg font-semibold tracking-tight text-accent">
              Miraj CV
            </span>
          </div>
        </header>
        <div className="mx-auto max-w-3xl px-6 py-10">{children}</div>
      </body>
    </html>
  );
}