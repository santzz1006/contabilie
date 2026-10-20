import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'SaaS Contábil B2B | Plataforma Operacional para Escritórios',
  description: 'Gestão de clientes, coleta documental, conciliação bancária, CNDs e calculadoras tributárias.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`try { const saved = localStorage.getItem('theme'); const theme = saved === 'light' || saved === 'dark' ? saved : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.documentElement.dataset.theme = theme; } catch { document.documentElement.dataset.theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }`}
        </Script>
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        <div className="contabilis-app-content min-h-screen">{children}</div>
      </body>
    </html>
  );
}
