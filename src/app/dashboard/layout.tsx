"use client";

import React, { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("visao_geral");
  useEffect(() => {
    const syncTab = () => {
      if (window.location.hash === "#activities") setActiveTab("atividades");
      else if (pathname === "/tarefas") setActiveTab("pendencias");
      else if (pathname === "/documentos") setActiveTab("processamento");
      else if (pathname === "/relatorios") setActiveTab("relatorios");
      else setActiveTab("visao_geral");
    };
    syncTab();
    window.addEventListener("hashchange", syncTab);
    window.addEventListener("popstate", syncTab);
    return () => {
      window.removeEventListener("hashchange", syncTab);
      window.removeEventListener("popstate", syncTab);
    };
  }, [pathname]);
  const selectTab = (tab: string) => {
    setActiveTab(tab);
    const destinations: Record<string, string> = {
      visao_geral: "/painel",
      atividades: "/painel#activities",
      pendencias: "/tarefas?status=pendente",
      processamento: "/documentos",
      relatorios: "/relatorios",
    };
    router.push(destinations[tab] || "/painel");
  };
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
            onSelectTab={selectTab}
          />

          <main className="contabilis-app-content dashboard-page-content flex-1 p-6 md:p-8 max-w-[1360px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
