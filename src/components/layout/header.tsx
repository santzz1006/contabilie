"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  Sun,
  Moon,
  CheckCircle2,
  Settings,
  LogOut,
  UserCheck
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import gsap from "gsap";

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenCommandPalette: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export function Header({
  onOpenMobileMenu,
  onOpenCommandPalette,
  activeTab,
  onSelectTab,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [openPopover, setOpenPopover] = useState<"bell" | "user" | null>(null);
  const [profile, setProfile] = useState({ name: "Conta", email: "", organization: "" });

  useEffect(() => {
    fetch("/api/auth/me").then((response) => response.ok ? response.json() : null).then((data) => {
      if (data?.user) setProfile({ name: data.user.name, email: data.user.email, organization: data.organization || "" });
    }).catch(() => undefined);
  }, []);

  const tabs = [
    { id: "visao_geral", label: "Visão geral" },
    { id: "atividades", label: "Atividades" },
    { id: "pendencias", label: "Pendências" },
    { id: "processamento", label: "Processamento" },
    { id: "relatorios", label: "Relatórios" },
  ];

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement>(null);

  // Animação GSAP do indicador deslizante nas abas
  useEffect(() => {
    const activeIndex = tabs.findIndex((t) => t.id === activeTab);
    const activeEl = tabRefs.current[activeIndex >= 0 ? activeIndex : 0];

    if (activeEl && indicatorRef.current) {
      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const x = activeEl.offsetLeft;
      const width = activeEl.offsetWidth;

      if (isReduced) {
        gsap.set(indicatorRef.current, { x, width });
      } else {
        gsap.to(indicatorRef.current, {
          x,
          width,
          duration: 0.28,
          ease: "power2.out",
        });
      }
    }
  }, [activeTab]);

  // Fechar popover com Escape ou clique fora
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenPopover(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 py-3 border-b transition-colors select-none"
      style={{
        background: "var(--glass)",
        backdropFilter: "blur(14px) saturate(140%)",
        WebkitBackdropFilter: "blur(14px) saturate(140%)",
        borderColor: "var(--line)",
      }}
    >
      {/* 1. Região Esquerda: Botão Menu + Marca */}
      <div className="flex items-center gap-3 min-w-[150px]">
        <button
          onClick={onOpenMobileMenu}
          className="p-1.5 rounded-xl md:hidden cursor-pointer hover:opacity-80 transition-opacity"
          style={{ color: "var(--tx2)" }}
          aria-label="Abrir menu lateral"
        >
          <Menu className="h-5 w-5 stroke-[1.75]" />
        </button>

        <div className="flex items-center gap-2 font-semibold text-sm tracking-tight" style={{ color: "var(--tx)" }}>
          <img className="h-7 w-7 rounded-lg shadow-xs" src="/contabilis-simbolo-escuro.svg" alt="" />
          <span className="hidden sm:inline">Contabilis</span>
        </div>
      </div>

      {/* 2. Região Central: Abas em Cápsula com Indicador Deslizante */}
      <div
        className="relative flex items-center gap-1 p-1 rounded-full overflow-x-auto max-w-full scrollbar-none"
        style={{ backgroundColor: "var(--surf2)" }}
        role="tablist"
      >
        <div
          ref={indicatorRef}
          className="absolute top-1 bottom-1 left-0 rounded-full z-0 transition-all pointer-events-none"
          style={{ backgroundColor: "var(--dk)" }}
        />

        {tabs.map((tab, idx) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[idx] = el;
              }}
              onClick={() => onSelectTab(tab.id)}
              role="tab"
              aria-selected={isSelected}
              className={`relative z-10 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                isSelected ? "font-semibold" : "hover:opacity-90"
              }`}
              style={{
                color: isSelected ? "var(--dk-tx)" : "var(--tx2)",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Região Direita: Ferramentas (Busca, Notificações, Tema, Perfil) */}
      <div className="flex items-center gap-1.5 min-w-[150px] justify-end relative">
        {/* Busca Ctrl+K */}
        <button
          onClick={onOpenCommandPalette}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
          style={{ color: "var(--tx2)" }}
          title="Pesquisar (Ctrl+K)"
          aria-label="Pesquisar"
        >
          <Search className="h-4 w-4 stroke-[1.75]" />
        </button>

        {/* Notificações com Popover */}
        <div className="relative">
          <button
            onClick={() => setOpenPopover(openPopover === "bell" ? null : "bell")}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
            style={{ color: "var(--tx2)" }}
            aria-label="Notificações"
          >
            <Bell className="h-4 w-4 stroke-[1.75]" />
          </button>

          {openPopover === "bell" && (
            <div
              className="absolute right-0 top-11 w-72 p-3 rounded-2xl border shadow-xl z-50 contabilis-glass text-xs"
              style={{
                borderColor: "var(--glass-line)",
                background: "var(--surf)",
                color: "var(--tx)",
              }}
            >
              <h4 className="font-semibold px-2 py-1 mb-1" style={{ color: "var(--tx2)" }}>
                Notificações
              </h4>
              <div className="space-y-1">
                <div className="p-2 rounded-xl transition-colors" style={{ backgroundColor: "var(--surf2)" }}>
                  <span className="font-medium block">3 certidões vencem esta semana</span>
                  <span className="text-[10px]" style={{ color: "var(--tx2)" }}>há 12 min</span>
                </div>
                <div className="p-2 rounded-xl transition-colors hover:bg-slate-100">
                  <span className="font-medium block">Extrato do Itaú recebido</span>
                  <span className="text-[10px]" style={{ color: "var(--tx2)" }}>há 1 h</span>
                </div>
                <div className="p-2 rounded-xl transition-colors hover:bg-slate-100">
                  <span className="font-medium block">Competência de setembro fechada</span>
                  <span className="text-[10px]" style={{ color: "var(--tx2)" }}>ontem</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Alternador de Tema */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
          style={{ color: "var(--tx2)" }}
          aria-label="Alternar tema"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 stroke-[1.75]" />
          ) : (
            <Moon className="h-4 w-4 stroke-[1.75]" />
          )}
        </button>

        {/* Menu do Usuário */}
        <div className="relative">
          <button
            onClick={() => setOpenPopover(openPopover === "user" ? null : "user")}
            className="flex items-center gap-2 pl-2 py-1 pr-1.5 rounded-xl cursor-pointer transition-colors"
            style={{ color: "var(--tx)" }}
            aria-label="Menu do perfil"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ backgroundColor: "var(--dk)", color: "var(--dk-tx)" }}
            >
              {profile.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="text-left hidden lg:block">
              <span className="text-xs font-semibold block leading-tight">{profile.name}</span>
              <span className="text-[10px] block" style={{ color: "var(--tx2)" }}>{profile.organization || "Conta do escritório"}</span>
            </div>
          </button>

          {openPopover === "user" && (
            <div
              className="absolute right-0 top-11 w-56 p-2 rounded-2xl border shadow-xl z-50 contabilis-glass text-xs"
              style={{
                borderColor: "var(--glass-line)",
                background: "var(--surf)",
                color: "var(--tx)",
              }}
            >
              <div className="px-2 py-2 mb-1 border-b" style={{ borderColor: "var(--line)" }}>
                <span className="font-semibold block">{profile.name}</span>
                <span className="block text-[10px] mt-0.5" style={{ color: "var(--tx2)" }}>{profile.email}</span>
                <span className="block text-[10px] mt-0.5" style={{ color: "var(--tx2)" }}>{profile.organization} · {profile.organization ? "Usuário" : ""}</span>
              </div>
              <a
                href="/configuracoes"
                className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 transition-colors text-left"
              >
                <Settings className="h-3.5 w-3.5" style={{ color: "var(--tx2)" }} />
                <span>Configurações</span>
              </a>
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 transition-colors text-left cursor-pointer"
              >
                {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                <span>Alternar tema</span>
              </button>
              <div className="h-px my-1" style={{ backgroundColor: "var(--line)" }} />
              <button
                onClick={async () => { setOpenPopover(null); await fetch("/api/auth/logout", { method: "POST" }); window.location.assign("/"); }}
                className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 transition-colors text-left cursor-pointer"
                title="Voltar à tela de acesso"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Encerrar sessão</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
