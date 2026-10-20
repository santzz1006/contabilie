"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Users,
  FolderOpen,
  ArrowLeftRight,
  ShieldCheck,
  Calculator,
  Globe,
  CalendarCheck2,
  FileSpreadsheet,
  Settings,
  Building,
  X
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const items = [
    { title: "Visão Geral", type: "Módulo", href: "/dashboard", icon: LayoutDashboard },
    { title: "Clientes e Carteira", type: "Módulo", href: "/dashboard/clients", icon: Users },
    { title: "Documentos e Coleta", type: "Módulo", href: "/dashboard/documents", icon: FolderOpen },
    { title: "Conciliação Bancária", type: "Módulo", href: "/dashboard/reconciliation", icon: ArrowLeftRight },
    { title: "Relatórios e Balanços", type: "Módulo", href: "/dashboard/balance-mapping", icon: FileSpreadsheet },
    { title: "Certidões (CNDs)", type: "Módulo", href: "/dashboard/certificates", icon: ShieldCheck },
    { title: "Simuladores Tributários", type: "Módulo", href: "/dashboard/tax-simulators", icon: Calculator },
    { title: "Sites Contábeis", type: "Módulo", href: "/dashboard/website-builder", icon: Globe },
    { title: "Tarefas e Obrigações", type: "Módulo", href: "/dashboard/tasks", icon: CalendarCheck2 },
    { title: "WhatsApp e Notificações", type: "Módulo", href: "/dashboard/notifications", icon: FolderOpen },
    { title: "Configurações e Auditoria", type: "Módulo", href: "/dashboard/settings", icon: Settings },
    // Clientes da base
    { title: "TechSolutions Software", type: "Cliente", href: "/dashboard/clients", icon: Building },
    { title: "Supermercado Bom Sabor", type: "Cliente", href: "/dashboard/clients", icon: Building },
    { title: "Clínica Nova Vida", type: "Cliente", href: "/dashboard/clients", icon: Building },
  ];

  const filtered = items.filter(i =>
    i.title.toLowerCase().includes(query.toLowerCase()) ||
    i.type.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] px-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.35)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] rounded-2xl p-3 border shadow-2xl overflow-hidden contabilis-glass"
        style={{
          borderColor: "var(--glass-line)",
          background: "var(--surf)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center gap-2 px-3 h-11 rounded-xl border mb-2"
          style={{ borderColor: "var(--line)", backgroundColor: "var(--bg)" }}
        >
          <Search className="h-4 w-4" style={{ color: "var(--tx2)" }} />
          <input
            type="text"
            autoFocus
            placeholder="Buscar módulo ou cliente..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-0 outline-none text-xs"
            style={{ color: "var(--tx)" }}
          />
          <button onClick={onClose} className="p-1 hover:opacity-70 cursor-pointer">
            <X className="h-3.5 w-3.5" style={{ color: "var(--tx2)" }} />
          </button>
        </div>

        <div className="max-h-[300px] overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <p className="text-xs p-4 text-center" style={{ color: "var(--tx2)" }}>
              Nenhum módulo ou cliente encontrado.
            </p>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    router.push(item.href);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs text-left transition-colors cursor-pointer"
                  style={{ color: "var(--tx)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--surf2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="h-4 w-4 shrink-0" style={{ color: "var(--or)" }} />
                    <span className="font-medium truncate">{item.title}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ backgroundColor: "var(--surf2)", color: "var(--tx2)" }}>
                    {item.type}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
