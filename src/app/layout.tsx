import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comision",
  description: "No lo se",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen flex flex-col">
        <main className="flex-1 pb-16">{children}</main>
        
        {/* Barra inferior fija */}
        <nav className="fixed bottom-0 left-0 w-full flex justify-center py-4">
          <div className="flex bg-black text-white rounded-full px-6 py-2 space-x-8">
            <Link href="/ingresos" className="flex items-center justify-center text-sm">
              <span>➕</span>
            </Link>
            <Link href="/" className="flex items-center justify-center text-sm">
              <span>📊</span>
            </Link>
            <Link href="/gastos" className="flex items-center justify-center text-sm">
              <span>➖</span>
            </Link>
          </div>
        </nav>
      </body>
    </html>
  );
}