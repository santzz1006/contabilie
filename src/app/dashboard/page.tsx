"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  ArrowLeftRight,
  ShieldCheck,
  CalendarCheck2,
  Plus,
  Search,
  Building,
  TrendingUp,
  X
} from "lucide-react";
import gsap from "gsap";
import { formatCurrency, formatCNPJ } from "@/lib/utils";
import { Client } from "@/lib/types";

export default function DashboardPage() {
  const [selectedComp, setSelectedComp] = useState(3); // 3 = Outubro
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isModalClientOpen, setIsModalClientOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<{ client: string; activity: string; responsible: string; status: string; time: string } | null>(null);

  // Competências
  const comps = [
    { label: "Jul 2026", pct: 100, done: 400, prazo: "10 de agosto" },
    { label: "Ago 2026", pct: 100, done: 400, prazo: "10 de setembro" },
    { label: "Set 2026", pct: 97, done: 388, prazo: "10 de outubro" },
    { label: "Out 2026", pct: 78, done: 312, prazo: "10 de novembro" },
  ];

  // Gráfico de Barras: [Mês, Recebidos, Processados]
  const chartData = [
    { month: "Mai", received: 210, processed: 196 },
    { month: "Jun", received: 232, processed: 220 },
    { month: "Jul", received: 248, processed: 239 },
    { month: "Ago", received: 226, processed: 224 },
    { month: "Set", received: 271, processed: 255 },
    { month: "Out", received: 184, processed: 148 },
  ];
  const maxChartVal = 300;

  // Atividades Recentes
  const initialActivities = [
    { client: "Padaria Alvorada", activity: "Extrato conciliado", responsible: "Bruno", status: "ok", time: "09:40" },
    { client: "Studio Lume", activity: "Nota fiscal em conferência", responsible: "Carla", status: "w", time: "09:12" },
    { client: "Oficina Ferraz", activity: "Certidão negativa vencida", responsible: "Ana", status: "e", time: "08:55" },
    { client: "Clínica Vital", activity: "Folha de setembro enviada", responsible: "Diego", status: "ok", time: "08:30" },
    { client: "Mercado Praia", activity: "Documentos solicitados", responsible: "Carla", status: "w", time: "ontem" },
    { client: "Transportes Rota", activity: "Conciliação pendente", responsible: "Bruno", status: "e", time: "ontem" },
    { client: "Café Entreposto", activity: "Guia DAS gerada", responsible: "Ana", status: "ok", time: "ontem" },
    { client: "Móveis Cedro", activity: "Simulação tributária", responsible: "Diego", status: "w", time: "ontem" },
    { client: "Escola Horizonte", activity: "Balancete aprovado", responsible: "Ana", status: "ok", time: "2 dias" },
    { client: "Pet Casa Verde", activity: "Cadastro revisado", responsible: "Carla", status: "ok", time: "2 dias" },
  ];

  // Form de novo cliente
  const [newClient, setNewClient] = useState({
    name: "",
    tradeName: "",
    cnpj: "",
    email: "",
    taxRegime: "simples",
  });

  const pageContainerRef = useRef<HTMLDivElement>(null);
  const fillBarRef = useRef<HTMLDivElement>(null);
  const countRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Entrada orquestrada com GSAP
  useEffect(() => {
    fetch("/api/clients").then(response => response.ok ? response.json() : []).then(setClients).catch(() => setClients([]));
  }, []);

  useEffect(() => {
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isReduced) {
      if (fillBarRef.current) fillBarRef.current.style.width = `${comps[selectedComp].pct}%`;
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.from(".anim-hd", { opacity: 0, y: 10, duration: 0.35 })
        .from(".anim-main-card", { opacity: 0, x: -16, y: 10, duration: 0.4 }, "-=0.2")
        .from(".anim-mini-card", {
          opacity: 0,
          y: 12,
          scale: 0.96,
          duration: 0.35,
          stagger: 0.05,
        }, "-=0.25")
        .from(".anim-chart", { opacity: 0, x: 16, y: 10, duration: 0.4 }, "-=0.3")
        .from(".anim-prog", { opacity: 0, y: 12, duration: 0.35 }, "-=0.2")
        .from(".anim-act", { opacity: 0, y: 12, duration: 0.35 }, "-=0.2")
        .from(".anim-bar-col", { scaleY: 0, duration: 0.45, stagger: 0.03, transformOrigin: "bottom" }, "-=0.3")
        .to(fillBarRef.current, { width: `${comps[selectedComp].pct}%`, duration: 0.7 }, "-=0.3");

      // Contagem animada nos números
      const targets = [
        { el: countRefs.current[0], target: 148 },
        { el: countRefs.current[1], target: 37 },
        { el: countRefs.current[2], target: 14 },
        { el: countRefs.current[3], target: 9 },
        { el: countRefs.current[4], target: 21 },
      ];

      targets.forEach((item) => {
        if (item.el) {
          const obj = { val: 0 };
          gsap.to(obj, {
            val: item.target,
            duration: 0.8,
            ease: "power2.out",
            onUpdate: () => {
              if (item.el) item.el.textContent = String(Math.round(obj.val));
            },
          });
        }
      });
    }, pageContainerRef);

    return () => ctx.revert();
  }, []);

  // Atualização da barra de progresso com a competência
  const handleSelectComp = (index: number) => {
    setSelectedComp(index);
    if (fillBarRef.current) {
      gsap.to(fillBarRef.current, {
        width: `${comps[index].pct}%`,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  };

  // Filtragem da tabela
  const filteredActivities = initialActivities.filter((item) => {
    const matchSearch = item.client.toLowerCase().includes(searchFilter.toLowerCase());
    const matchStatus = !statusFilter || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const PAGE_SIZE = 5;
  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / PAGE_SIZE));
  const paginatedActivities = filteredActivities.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE
  );

  const statusMap: Record<string, { label: string; dotClass: string }> = {
    ok: { label: "Concluído", dotClass: "bg-emerald-500 text-emerald-600" },
    w: { label: "Em análise", dotClass: "bg-amber-500 text-amber-600" },
    e: { label: "Pendente", dotClass: "bg-rose-500 text-rose-600" },
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });
      setIsModalClientOpen(false);
      setNewClient({ name: "", tradeName: "", cnpj: "", email: "", taxRegime: "simples" });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div ref={pageContainerRef} className="space-y-4">
      {/* 1. Header do Dashboard: Saudação + Seletor de Competência */}
      <div className="anim-hd flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight"
            style={{ color: "var(--tx)" }}
          >
            Bom dia, Ana
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--tx2)" }}>
            Seu escritório está <strong>{comps[selectedComp].pct}% adiantado</strong> em {comps[selectedComp].label.split(" ")[0].toLowerCase()}; 9 itens pedem atenção hoje.
          </p>
        </div>

        {/* Seletor de Competência em Pílula */}
        <div
          className="flex items-center gap-1 p-1 rounded-full border shadow-2xs self-start sm:self-auto"
          style={{
            borderColor: "var(--line)",
            backgroundColor: "var(--surf)",
          }}
        >
          {comps.map((c, i) => {
            const isSelected = selectedComp === i;
            return (
              <button
                key={c.label}
                onClick={() => handleSelectComp(i)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer"
                style={{
                  backgroundColor: isSelected ? "var(--or-s)" : "transparent",
                  color: isSelected ? "var(--or)" : "var(--tx2)",
                  fontWeight: isSelected ? 600 : 500,
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Linha 1: Cartão Principal + Grade 2x2 + Gráfico de Barras */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
        {/* Cartão Principal: Clientes Ativos (4 cols) */}
        <article className="anim-main-card lg:col-span-4 contabilis-card p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium" style={{ color: "var(--tx2)" }}>
              Clientes ativos
            </span>
            <div
              ref={(el) => { countRefs.current[0] = el; }}
              className="text-4xl sm:text-5xl font-semibold tracking-tight num my-2.5"
              style={{ color: "var(--tx)" }}
            >
              148
            </div>
            <span className="text-xs" style={{ color: "var(--tx2)" }}>
              <span className="font-semibold" style={{ color: "var(--ok)" }}>+6</span> novos no trimestre
            </span>

            {/* Chips de Regimes */}
            <div className="flex flex-wrap gap-2 my-4">
              <span className="px-2.5 py-1 rounded-full text-xs" style={{ backgroundColor: "var(--surf2)", color: "var(--tx2)" }}>
                32 no Simples
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs" style={{ backgroundColor: "var(--surf2)", color: "var(--tx2)" }}>
                41 no Presumido
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs" style={{ backgroundColor: "var(--surf2)", color: "var(--tx2)" }}>
                75 MEI
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsModalClientOpen(true)}
            className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-xl text-xs font-medium shadow-xs transition-opacity hover:opacity-90 active:scale-97 cursor-pointer"
            style={{
              backgroundColor: "var(--dk)",
              color: "var(--dk-tx)",
            }}
          >
            <Plus className="h-4 w-4" />
            <span>Cadastrar cliente</span>
          </button>
        </article>

        {/* Grade 2x2 de Micro-cartões (4 cols) */}
        <div className="anim-mini-card lg:col-span-4 grid grid-cols-2 gap-4">
          {/* Card 1: Documentos a Conferir */}
          <Link href="/dashboard/documents" className="contabilis-card p-4 flex flex-col gap-1 cursor-pointer hover:-translate-y-0.5">
            <div className="contabilis-neo mb-1.5">
              <FileText className="h-4 w-4 stroke-[1.75]" />
            </div>
            <span className="text-xs font-medium" style={{ color: "var(--tx2)" }}>
              Documentos a conferir
            </span>
            <div
              ref={(el) => { countRefs.current[1] = el; }}
              className="text-2xl font-semibold tracking-tight num"
              style={{ color: "var(--tx)" }}
            >
              37
            </div>
            <span className="text-[11px]" style={{ color: "var(--tx2)" }}>
              12 recebidos hoje
            </span>
          </Link>

          {/* Card 2: Conciliações Pendentes */}
          <Link href="/dashboard/reconciliation" className="contabilis-card p-4 flex flex-col gap-1 cursor-pointer hover:-translate-y-0.5">
            <div className="contabilis-neo mb-1.5">
              <ArrowLeftRight className="h-4 w-4 stroke-[1.75]" />
            </div>
            <span className="text-xs font-medium" style={{ color: "var(--tx2)" }}>
              Conciliações pendentes
            </span>
            <div
              ref={(el) => { countRefs.current[2] = el; }}
              className="text-2xl font-semibold tracking-tight num"
              style={{ color: "var(--tx)" }}
            >
              14
            </div>
            <span className="text-[11px]" style={{ color: "var(--tx2)" }}>
              5 clientes
            </span>
          </Link>

          {/* Card 3: Certidões em Atenção (Destaque Laranja .hot-orange!) */}
          <Link href="/dashboard/certificates" className="contabilis-card hot-orange p-4 flex flex-col gap-1 cursor-pointer hover:-translate-y-0.5">
            <div className="contabilis-neo mb-1.5">
              <ShieldCheck className="h-4 w-4 stroke-[1.75]" />
            </div>
            <span className="text-xs font-medium ct">
              Certidões em atenção
            </span>
            <div
              ref={(el) => { countRefs.current[3] = el; }}
              className="text-2xl font-semibold tracking-tight num"
            >
              9
            </div>
            <span className="text-[11px] sub">
              3 vencem em 7 dias
            </span>
          </Link>

          {/* Card 4: Tarefas a Vencer */}
          <Link href="/dashboard/tasks" className="contabilis-card p-4 flex flex-col gap-1 cursor-pointer hover:-translate-y-0.5">
            <div className="contabilis-neo mb-1.5">
              <CalendarCheck2 className="h-4 w-4 stroke-[1.75]" />
            </div>
            <span className="text-xs font-medium" style={{ color: "var(--tx2)" }}>
              Tarefas a vencer
            </span>
            <div
              ref={(el) => { countRefs.current[4] = el; }}
              className="text-2xl font-semibold tracking-tight num"
              style={{ color: "var(--tx)" }}
            >
              21
            </div>
            <span className="text-[11px]" style={{ color: "var(--tx2)" }}>
              até sexta-feira
            </span>
          </Link>
        </div>

        {/* Gráfico de Barras por Competência (4 cols) */}
        <article className="anim-chart lg:col-span-4 contabilis-card p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium" style={{ color: "var(--tx2)" }}>
              Documentos por competência
            </span>
            <p className="text-xs mt-0.5" style={{ color: "var(--tx2)" }}>
              Recebidos e processados nos últimos 6 meses.
            </p>

            {/* Legenda */}
            <div className="flex items-center gap-3.5 text-xs my-2.5" style={{ color: "var(--tx2)" }}>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: "var(--dk)", opacity: 0.85 }} />
                Recebidos
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: "var(--or)" }} />
                Processados
              </span>
            </div>
          </div>

          {/* Barras e Eixos */}
          <div>
            <div
              className="h-[140px] grid grid-cols-6 gap-2.5 items-end pb-1 border-b"
              style={{ borderColor: "var(--line)" }}
            >
              {chartData.map((d) => (
                <div key={d.month} className="group relative flex flex-col justify-end items-center h-full">
                  {/* Tooltip Hover */}
                  <div
                    className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-md"
                    style={{ backgroundColor: "var(--dk)", color: "var(--dk-tx)" }}
                  >
                    {d.month}: {d.received} rec. / {d.processed} proc.
                  </div>

                  <div className="pair flex items-end justify-center gap-1 w-full h-[130px]">
                    {/* Barra Recebidos */}
                    <div
                      className="anim-bar-col w-5/12 max-w-[18px] rounded-t-sm"
                      style={{
                        height: `${(d.received / maxChartVal) * 100}%`,
                        backgroundColor: "var(--dk)",
                        opacity: 0.85,
                      }}
                    />
                    {/* Barra Processados */}
                    <div
                      className="anim-bar-col w-5/12 max-w-[18px] rounded-t-sm"
                      style={{
                        height: `${(d.processed / maxChartVal) * 100}%`,
                        backgroundColor: "var(--or)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Rótulos dos meses */}
            <div className="grid grid-cols-6 gap-2.5 text-center text-[11px] pt-1.5" style={{ color: "var(--tx2)" }}>
              {chartData.map((d) => (
                <span key={d.month}>{d.month}</span>
              ))}
            </div>
          </div>
        </article>
      </section>

      {/* 3. Linha 2: Acompanhamento Mensal + Tabela de Atividades */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Acompanhamento Mensal (4 cols) */}
        <article className="anim-prog lg:col-span-4 contabilis-card p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium" style={{ color: "var(--tx2)" }}>
              Acompanhamento mensal
            </span>
            <h3 className="text-sm font-semibold mt-1" style={{ color: "var(--tx)" }}>
              Solicitações documentais
            </h3>

            {/* Trilho Neumórfico */}
            <div className="contabilis-track my-4">
              <div ref={fillBarRef} className="contabilis-fill" style={{ width: "0%" }} />
            </div>

            <div className="flex items-baseline justify-between">
              <b className="text-2xl font-semibold num" style={{ color: "var(--tx)" }}>
                {comps[selectedComp].pct}%
              </b>
              <span className="text-xs num" style={{ color: "var(--tx2)" }}>
                {comps[selectedComp].done} de 400 concluídas
              </span>
            </div>
          </div>

          <p className="text-xs mt-3 pt-3 border-t" style={{ borderColor: "var(--line)", color: "var(--tx2)" }}>
            Prazo de fechamento: <strong>{comps[selectedComp].prazo}</strong>
          </p>
        </article>

        {/* Tabela de Atividades Recentes (8 cols) */}
        <article id="activities" className="anim-act lg:col-span-8 contabilis-card p-5 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <h3 className="text-sm font-semibold" style={{ color: "var(--tx)" }}>
              Atividades recentes
            </h3>

            {/* Filtros e Busca */}
            <div className="flex flex-wrap items-center gap-2">
              <div
                className="flex items-center gap-1.5 px-2.5 h-8.5 rounded-lg border text-xs"
                style={{ borderColor: "var(--line)", backgroundColor: "var(--bg)" }}
              >
                <Search className="h-3.5 w-3.5 stroke-[1.75]" style={{ color: "var(--tx2)" }} />
                <input
                  type="text"
                  placeholder="Buscar cliente"
                  value={searchFilter}
                  onChange={(e) => {
                    setSearchFilter(e.target.value);
                    setCurrentPage(0);
                  }}
                  className="bg-transparent border-0 outline-none w-28 sm:w-36 text-xs"
                  style={{ color: "var(--tx)" }}
                />
              </div>

              <div className="flex items-center gap-1">
                {[
                  { id: "", label: "Todos" },
                  { id: "ok", label: "Concluído" },
                  { id: "w", label: "Em análise" },
                  { id: "e", label: "Pendente" },
                ].map((f) => {
                  const isSelected = statusFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => {
                        setStatusFilter(f.id);
                        setCurrentPage(0);
                      }}
                      className="px-2.5 h-8.5 rounded-full border text-xs font-medium transition-colors cursor-pointer"
                      style={{
                        backgroundColor: isSelected ? "var(--or-s)" : "transparent",
                        borderColor: isSelected ? "transparent" : "var(--line)",
                        color: isSelected ? "var(--or)" : "var(--tx2)",
                      }}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr style={{ color: "var(--tx2)" }}>
                  <th className="py-2 px-2.5 font-medium">Cliente</th>
                  <th className="py-2 px-2.5 font-medium">Atividade</th>
                  <th className="py-2 px-2.5 font-medium">Responsável</th>
                  <th className="py-2 px-2.5 font-medium">Status</th>
                  <th className="py-2 px-2.5 font-medium">Horário</th>
                  <th className="py-2 px-2.5 font-medium">Ação</th>
                </tr>
              </thead>
              <tbody>
                {paginatedActivities.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-t transition-colors hover:bg-slate-50/50"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <td className="py-2.5 px-2.5 font-medium" style={{ color: "var(--tx)" }}>
                      {row.client}
                    </td>
                    <td className="py-2.5 px-2.5" style={{ color: "var(--tx)" }}>
                      {row.activity}
                    </td>
                    <td className="py-2.5 px-2.5" style={{ color: "var(--tx2)" }}>
                      {row.responsible}
                    </td>
                    <td className="py-2.5 px-2.5">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px]"
                        style={{ backgroundColor: "var(--surf2)" }}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusMap[row.status].dotClass.split(" ")[0]}`} />
                        <span style={{ color: "var(--tx)" }}>{statusMap[row.status].label}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-2.5 num" style={{ color: "var(--tx2)" }}>
                      {row.time}
                    </td>
                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                      {row.status === "ok" ? (
                        <button onClick={() => setSelectedActivity(row)} className="text-xs font-semibold" style={{ color: "var(--or)" }}>Detalhes</button>
                      ) : row.status === "w" ? (
                        <Link href="/dashboard/documents" className="text-xs font-semibold" style={{ color: "var(--or)" }}>Conferir</Link>
                      ) : row.activity.toLowerCase().includes("certid") ? (
                        <Link href="/dashboard/certificates" className="text-xs font-semibold" style={{ color: "var(--or)" }}>Emitir CND</Link>
                      ) : (() => {
                        const client = clients.find(item => item.tradeName === row.client);
                        return client?.phone ? <button onClick={() => window.open(`https://wa.me/${client.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá, ${client.tradeName}! Há uma pendência para resolver com o escritório.`)}`, "_blank", "noopener,noreferrer")} className="text-xs font-semibold" style={{ color: "var(--or)" }}>Lembrar cliente</button> : <Link href="/dashboard/notifications" className="text-xs font-semibold" style={{ color: "var(--or)" }}>Lembrar cliente</Link>;
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredActivities.length === 0 && (
            <p className="text-center py-6 text-xs" style={{ color: "var(--tx2)" }}>
              Nenhuma atividade encontrada. Ajuste a busca ou o filtro.
            </p>
          )}

          {/* Paginação */}
          <div className="flex items-center justify-between pt-3 mt-1 border-t text-xs" style={{ borderColor: "var(--line)", color: "var(--tx2)" }}>
            <span>
              {filteredActivities.length > 0
                ? `${currentPage * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE + PAGE_SIZE, filteredActivities.length)} de ${filteredActivities.length}`
                : "0 resultados"}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                className="px-2.5 py-1 rounded-full border text-xs disabled:opacity-40 cursor-pointer"
                style={{ borderColor: "var(--line)" }}
              >
                Anterior
              </button>
              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                className="px-2.5 py-1 rounded-full border text-xs disabled:opacity-40 cursor-pointer"
                style={{ borderColor: "var(--line)" }}
              >
                Próxima
              </button>
            </div>
          </div>
        </article>
      </section>

      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.45)" }} onClick={() => setSelectedActivity(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="activity-detail-title" className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl" style={{ background: "var(--surf)", borderColor: "var(--line)", color: "var(--tx)" }} onClick={(event) => event.stopPropagation()}>
            <h2 id="activity-detail-title" className="text-lg font-semibold">Resumo da atividade</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--tx2)" }}>{selectedActivity.client} · {selectedActivity.activity}</p>
            <p className="mt-4 rounded-xl p-3 text-sm" style={{ background: "var(--surf2)", color: "var(--tx2)" }}>
              {/extrato|concilia/i.test(selectedActivity.activity) ? "Conciliação bancária registrada como concluída. Os lançamentos conferidos foram associados ao extrato desta competência." : `A atividade “${selectedActivity.activity}” foi concluída e registrada para ${selectedActivity.client}.`}
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-xs" style={{ color: "var(--tx2)" }}>Responsável</dt><dd>{selectedActivity.responsible}</dd></div><div><dt className="text-xs" style={{ color: "var(--tx2)" }}>Horário</dt><dd>{selectedActivity.time}</dd></div><div><dt className="text-xs" style={{ color: "var(--tx2)" }}>Status</dt><dd>{statusMap[selectedActivity.status]?.label || selectedActivity.status}</dd></div><div><dt className="text-xs" style={{ color: "var(--tx2)" }}>Registro</dt><dd>Atividade concluída no período selecionado</dd></div></dl>
            <div className="mt-5 flex justify-end"><button onClick={() => setSelectedActivity(null)} className="rounded-lg px-4 py-2 text-sm font-semibold" style={{ background: "var(--dk)", color: "var(--dk-tx)" }}>Fechar</button></div>
          </section>
        </div>
      )}

      {/* Modal de Cadastro de Cliente */}
      {isModalClientOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <div
            className="w-full max-w-md p-6 rounded-2xl border shadow-2xl contabilis-glass"
            style={{
              borderColor: "var(--glass-line)",
              background: "var(--surf)",
              color: "var(--tx)",
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--line)" }}>
              <h3 className="text-base font-semibold">Cadastrar Novo Cliente</h3>
              <button onClick={() => setIsModalClientOpen(false)} className="p-1 hover:opacity-70 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-3.5 pt-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--tx2)" }}>
                  Razão Social *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Alfa Soluções Digitais Ltda"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500"
                  style={{ borderColor: "var(--line)", backgroundColor: "var(--bg)", color: "var(--tx)" }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--tx2)" }}>
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  placeholder="Ex: Alfa Tech"
                  value={newClient.tradeName}
                  onChange={(e) => setNewClient({ ...newClient, tradeName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500"
                  style={{ borderColor: "var(--line)", backgroundColor: "var(--bg)", color: "var(--tx)" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--tx2)" }}>
                    CNPJ *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="00.000.000/0001-00"
                    value={newClient.cnpj}
                    onChange={(e) => setNewClient({ ...newClient, cnpj: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-orange-500"
                    style={{ borderColor: "var(--line)", backgroundColor: "var(--bg)", color: "var(--tx)" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--tx2)" }}>
                    Regime Tributário
                  </label>
                  <select
                    value={newClient.taxRegime}
                    onChange={(e) => setNewClient({ ...newClient, taxRegime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                    style={{ borderColor: "var(--line)", backgroundColor: "var(--bg)", color: "var(--tx)" }}
                  >
                    <option value="simples">Simples Nacional</option>
                    <option value="presumido">Lucro Presumido</option>
                    <option value="real">Lucro Real</option>
                    <option value="mei">MEI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--tx2)" }}>
                  E-mail do Responsável *
                </label>
                <input
                  type="email"
                  required
                  placeholder="contato@empresa.com.br"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500"
                  style={{ borderColor: "var(--line)", backgroundColor: "var(--bg)", color: "var(--tx)" }}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t" style={{ borderColor: "var(--line)" }}>
                <button
                  type="button"
                  onClick={() => setIsModalClientOpen(false)}
                  className="px-3 py-1.5 rounded-xl border text-xs cursor-pointer"
                  style={{ borderColor: "var(--line)" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-medium text-white shadow-xs cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: "var(--or)" }}
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
