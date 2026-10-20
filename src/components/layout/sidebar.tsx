"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  ArrowLeftRight,
  ShieldCheck,
  Calculator,
  Globe,
  CalendarCheck2,
  Bell,
  FileSpreadsheet,
  Settings,
  Sun,
  Moon,
  X
} from "lucide-react";
import { useTheme } from "@/lib/theme";

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ isMobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    onCloseMobile();
  }, [pathname, onCloseMobile]);

  const navigation = [
    { name: "Visão geral", href: "/dashboard", icon: LayoutDashboard },
    { name: "Clientes", href: "/dashboard/clients", icon: Users },
    { name: "Documentos", href: "/dashboard/documents", icon: FolderOpen },
    { name: "Conciliação bancária", href: "/dashboard/reconciliation", icon: ArrowLeftRight },
    { name: "Relatórios & Balanços", href: "/dashboard/balance-mapping", icon: FileSpreadsheet },
    { name: "Certidões", href: "/dashboard/certificates", icon: ShieldCheck },
    { name: "Simuladores tributários", href: "/dashboard/tax-simulators", icon: Calculator },
    { name: "Sites", href: "/dashboard/website-builder", icon: Globe },
    { name: "Tarefas", href: "/dashboard/tasks", icon: CalendarCheck2 },
    { name: "Notificações", href: "/dashboard/notifications", icon: Bell },
  ];

  return (
    <>
      {/* Scrim no mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/35 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col items-center gap-1.5 py-4 transition-transform duration-250 select-none border-r ${
          isMobileOpen
            ? "w-64 px-3 translate-x-0 bg-white/95 shadow-2xl"
            : "w-[72px] -translate-x-full md:translate-x-0"
        }`}
        style={{
          background: "var(--glass)",
          backdropFilter: "blur(14px) saturate(140%)",
          WebkitBackdropFilter: "blur(14px) saturate(140%)",
          borderColor: "var(--line)",
        }}
      >
        {/* Top Logo / Mobile Close */}
        <div className={`w-full flex items-center mb-3 ${isMobileOpen ? "justify-between px-2" : "justify-center"}`}>
          <Link href="/dashboard" onClick={onCloseMobile}>
            <img className="w-[38px] h-[38px] rounded-xl shadow-sm" src="/contabilis-simbolo-escuro.svg" alt="Contabilis" />
          </Link>
          {isMobileOpen && (
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 flex-1 w-full items-center">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (pathname === item.href) onCloseMobile();
                }}
                className={`group relative h-11 rounded-2xl flex items-center transition-colors cursor-pointer ${
                  isMobileOpen ? "w-full px-3 gap-3 justify-start" : "w-11 justify-center"
                } ${
                  isActive
                    ? "font-semibold shadow-sm"
                    : "hover:opacity-90"
                }`}
                style={{
                  color: isActive ? "var(--or)" : "var(--tx2)",
                  backgroundColor: isActive ? "var(--surf)" : "transparent",
                  boxShadow: isActive ? "4px 4px 10px var(--neo-d), -4px -4px 10px var(--neo-l)" : "none",
                }}
                aria-current={isActive ? "page" : undefined}
                title={!isMobileOpen ? item.name : undefined}
              >
                {/* Indicador lateral laranja quando ativo */}
                {isActive && (
                  <span
                    className="absolute rounded-full"
                    style={{
                      left: isMobileOpen ? "0px" : "-14px",
                      top: "12px",
                      bottom: "12px",
                      width: "3px",
                      backgroundColor: "var(--or)",
                    }}
                  />
                )}

                <Icon className="h-5 w-5 shrink-0 stroke-[1.75]" />

                {isMobileOpen ? (
                  <span className="text-xs truncate">{item.name}</span>
                ) : (
                  /* Tooltip flutuante com atraso sutil */
                  <span
                    className="absolute left-14 top-1/2 -translate-y-1/2 -translate-x-1 whitespace-nowrap px-2.5 py-1.5 rounded-xl text-xs font-medium opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 delay-150 z-50 border shadow-lg"
                    style={{
                      background: "var(--surf)",
                      borderColor: "var(--line)",
                      color: "var(--tx)",
                    }}
                  >
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="flex flex-col items-center gap-1.5 w-full pt-2 border-t" style={{ borderColor: "var(--line)" }}>
          {/* Alternador de Tema */}
          <button
            onClick={toggleTheme}
            className={`group relative h-11 rounded-2xl flex items-center justify-center transition-colors cursor-pointer ${
              isMobileOpen ? "w-full px-3 gap-3 justify-start" : "w-11"
            }`}
            style={{ color: "var(--tx2)" }}
            aria-label="Alternar tema"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 shrink-0 stroke-[1.75]" />
            ) : (
              <Moon className="h-5 w-5 shrink-0 stroke-[1.75]" />
            )}
            {isMobileOpen ? (
              <span className="text-xs">Alternar tema</span>
            ) : (
              <span
                className="absolute left-14 top-1/2 -translate-y-1/2 -translate-x-1 whitespace-nowrap px-2.5 py-1.5 rounded-xl text-xs font-medium opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 delay-150 z-50 border shadow-lg"
                style={{
                  background: "var(--surf)",
                  borderColor: "var(--line)",
                  color: "var(--tx)",
                }}
              >
                Alternar tema
              </span>
            )}
          </button>

          {/* Configurações */}
          <Link
            href="/dashboard/settings"
            onClick={onCloseMobile}
            className={`group relative h-11 rounded-2xl flex items-center justify-center transition-colors cursor-pointer ${
              pathname === "/dashboard/settings"
                ? "font-semibold shadow-sm"
                : ""
            } ${isMobileOpen ? "w-full px-3 gap-3 justify-start" : "w-11"}`}
            style={{
              color: pathname === "/dashboard/settings" ? "var(--or)" : "var(--tx2)",
              backgroundColor: pathname === "/dashboard/settings" ? "var(--surf)" : "transparent",
              boxShadow: pathname === "/dashboard/settings" ? "4px 4px 10px var(--neo-d), -4px -4px 10px var(--neo-l)" : "none",
            }}
            aria-label="Configurações"
          >
            <Settings className="h-5 w-5 shrink-0 stroke-[1.75]" />
            {isMobileOpen ? (
              <span className="text-xs">Configurações</span>
            ) : (
              <span
                className="absolute left-14 top-1/2 -translate-y-1/2 -translate-x-1 whitespace-nowrap px-2.5 py-1.5 rounded-xl text-xs font-medium opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 delay-150 z-50 border shadow-lg"
                style={{
                  background: "var(--surf)",
                  borderColor: "var(--line)",
                  color: "var(--tx)",
                }}
              >
                Configurações
              </span>
            )}
          </Link>

          {/* Avatar */}
          <div
            className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-xs font-bold mt-1 cursor-pointer select-none"
            style={{
              backgroundColor: "var(--dk)",
              color: "var(--dk-tx)",
            }}
          >
            AM
          </div>
        </div>
      </aside>
    </>
  );
}
