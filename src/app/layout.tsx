import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { MobileUnavailableGate } from '@/components/layout/mobile-unavailable-gate';

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
    <html lang="pt-BR" data-theme="dark" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`document.documentElement.dataset.theme = 'dark'; try { localStorage.setItem('theme', 'dark'); } catch {}`}
        </Script>
      </head>
      <body className="min-h-screen antialiased font-sans">
        <div className="contabilis-app-content min-h-screen"><MobileUnavailableGate>{children}</MobileUnavailableGate></div>
      </body>
    </html>
  );
}
