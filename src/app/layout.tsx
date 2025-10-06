import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Caja Comision",
  description: "App de control de caja para la barra",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen flex flex-col">
        <main className="flex-1 pb-16">{children}</main>
        
        {/* Barra inferior fija */}
        <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 flex justify-around py-2">
          <Link href="/" className="flex flex-col items-center text-sm">
            <span>📊</span>
            <span>Dashboard</span>
          </Link>
          <Link href="/ingresos" className="flex flex-col items-center text-sm">
            <span>➕</span>
            <span>Ingresos</span>
          </Link>
          <Link href="/gastos" className="flex flex-col items-center text-sm">
            <span>➖</span>
            <span>Gastos</span>
          </Link>
        </nav>
      </body>
    </html>
  );
}