"use client";

import React, { useCallback, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ThemeProvider } from "@/lib/theme";
import { CommandPalette } from "@/components/layout/command-palette";
import { ContabilisLoader } from "@/components/layout/contabilis-loader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("visao_geral");
  const closeMobileMenu = useCallback(() => setIsMobileOpen(false), []);

  return (
    <ThemeProvider>
      {/* Tela de Carregamento Criativa SVG + GSAP */}
      <ContabilisLoader />

      {/* Paleta de Comando Global (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />

      <div className="min-h-screen flex transition-colors" style={{ backgroundColor: "var(--bg)" }}>
        {/* Sidebar Fixa de 72px */}
        <Sidebar
          isMobileOpen={isMobileOpen}
          onCloseMobile={closeMobileMenu}
        />

        {/* Área Principal de Conteúdo */}
        <div className="flex-1 md:ml-[72px] flex flex-col min-w-0 relative z-10">
          <Header
            onOpenMobileMenu={() => setIsMobileOpen(true)}
            onOpenCommandPalette={() => setIsCommandOpen(true)}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
          />

          <main className="dashboard-page-content flex-1 p-6 md:p-8 max-w-[1360px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
