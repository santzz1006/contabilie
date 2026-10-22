"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarCheck2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  Calendar,
  Check,
  X,
  UserCheck,
  Tag,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { TaskItem, Client, User, TaskPriority, TaskStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [selectedUserId, setSelectedUserId] = useState<string>("all");
  const [detailsTask, setDetailsTask] = useState<TaskItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [taskForm, setTaskForm] = useState({
    clientId: "",
    title: "",
    description: "",
    category: "fiscal" as TaskItem['category'],
    dueDate: "2026-11-20",
    assignedToUserId: "usr-analista-1",
    priority: "alta" as TaskPriority,
    isRecurring: true,
  });

  const loadData = async () => {
    try {
      const [resClients, resTasks] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/tasks"),
      ]);
      if (resClients.ok) setClients(await resClients.json());
      if (resTasks.ok) setTasks(await resTasks.json());
      const resUsers = await fetch("/api/settings/users");
      if (resUsers.ok) setUsers((await resUsers.json()).filter((u: User) => u.active && u.role !== "client"));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    const statusFromUrl = new URLSearchParams(window.location.search).get("status");
    if (statusFromUrl === "pendente" || statusFromUrl === "em_andamento" || statusFromUrl === "concluida") setSelectedStatus(statusFromUrl);
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title) {
      alert("Preencha o título da obrigação ou tarefa.");
      return;
    }

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskForm),
      });

      if (res.ok) {
        await loadData();
        setIsModalOpen(false);
        setTaskForm({
          clientId: clients[0]?.id || "",
          title: "",
          description: "",
          category: "fiscal",
          dueDate: "2026-11-20",
          assignedToUserId: users[0]?.id || "usr-analista-1",
          priority: "alta",
          isRecurring: true,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTaskStatus = async (task: TaskItem) => {
    const newStatus: TaskStatus = task.status === "concluida" ? "pendente" : "concluida";
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchStatus = selectedStatus === "all" || t.status === selectedStatus;
    const matchClient = selectedClientId === "all" || t.clientId === selectedClientId;
    const matchUser = selectedUserId === "all" || t.assignedToUserId === selectedUserId;
    return matchStatus && matchClient && matchUser;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Tarefas e Calendário de Obrigações Fiscais
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Controle de prazos, guias mensais (DAS, DCTF, SPED, FGTS) e rotinas contábeis recorrentes.
          </p>
        </div>

        <Button
          onClick={() => {
            if (clients.length > 0 && !taskForm.clientId) {
              setTaskForm(prev => ({ ...prev, clientId: clients[0].id }));
            }
            setIsModalOpen(true);
          }}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Obrigação</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg text-xs p-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Todas as Empresas da Carteira</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.tradeName}</option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-auto">
              <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} aria-label="Filtrar por contador responsável" className="w-full border border-slate-300 rounded-lg text-xs p-2 bg-white text-slate-700">
                <option value="all">Tarefas de todos os contadores</option>
                {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
              </select>
            </div>

            <div className="w-full md:w-auto">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-slate-300 rounded-lg text-xs p-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Todos os Status</option>
                <option value="pendente">Aguardando Execução</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluida">Concluídas</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={CalendarCheck2}
          title="Nenhuma obrigação encontrada"
          description="Ajuste os filtros de busca ou cadastre uma nova obrigação contábil para a equipe."
          actionLabel="Criar Obrigação"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const client = clients.find(c => c.id === task.clientId);
            const owner = users.find(user => user.id === task.assignedToUserId);
            const isCompleted = task.status === "concluida";
            const isPending = task.status === "pendente";
            const isCertificate = /cnd|certid[aã]o/i.test(task.title);

            return (
              <Card
                key={task.id}
                className={`transition-all ${isCompleted ? 'bg-slate-50/70 border-slate-200 opacity-80' : 'hover:border-slate-300'}`}
              >
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <button
                      onClick={() => handleToggleTaskStatus(task)}
                      className={`h-5 w-5 rounded-md border flex items-center justify-center mt-0.5 cursor-pointer transition-colors ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-emerald-500 bg-white'
                      }`}
                    >
                      {isCompleted && <Check className="h-3.5 w-3.5" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-semibold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                          {task.title}
                        </span>
                        <Badge
                          variant={
                            task.priority === "urgente" ? "destructive" :
                            task.priority === "alta" ? "warning" : "secondary"
                          }
                          className="capitalize text-[10px]"
                        >
                          {task.priority}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {task.category}
                        </Badge>
                        {task.isRecurring && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                            Recorrente Mensal
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                        <span className="flex items-center gap-1 font-medium text-slate-600">
                          <Building className="h-3.5 w-3.5 text-slate-400" />
                          {client?.tradeName || "Geral do Escritório"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          Vencimento: {formatDate(task.dueDate)}
                        </span>
                        <span className="flex items-center gap-1"><UserCheck className="h-3.5 w-3.5" />{owner?.name || "Sem responsável"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isCompleted ? (
                      <Button size="sm" variant="outline" onClick={() => setDetailsTask(task)} className="text-xs">Detalhes</Button>
                    ) : task.status === "em_andamento" ? (
                      <Button size="sm" variant="outline" onClick={() => setDetailsTask(task)} className="text-xs">Conferir</Button>
                    ) : (
                      <div className="flex gap-2">
                        {isCertificate && <Link href="/dashboard/certificates" className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs"><ExternalLink className="h-3 w-3"/>Emitir CND</Link>}
                        <Button size="sm" variant="outline" disabled={!client?.phone} title={!client?.phone ? "Cadastre o WhatsApp do cliente" : "Abrir conversa no WhatsApp"} onClick={() => client?.phone && window.open(`https://wa.me/${client.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá, ${client.tradeName}! Lembrete: ${task.title}, com vencimento em ${formatDate(task.dueDate)}.`)}`, "_blank", "noopener,noreferrer")} className="text-xs">Lembrar cliente</Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Nova Tarefa */}
      {detailsTask && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDetailsTask(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="task-detail-title" className="w-full max-w-lg rounded-2xl border p-6 shadow-xl" style={{ background: "var(--surf)", borderColor: "var(--line)", color: "var(--tx)" }} onClick={(event) => event.stopPropagation()}>
            <div className="flex justify-between items-start gap-4"><div><h2 id="task-detail-title" className="font-semibold">{detailsTask.title}</h2><p className="mt-1 text-xs" style={{ color: "var(--tx2)" }}>Resumo da tarefa concluída</p></div><button onClick={() => setDetailsTask(null)} aria-label="Fechar">×</button></div>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-xs" style={{ color: "var(--tx2)" }}>Status</dt><dd>{detailsTask.status}</dd></div><div><dt className="text-xs" style={{ color: "var(--tx2)" }}>Vencimento</dt><dd>{formatDate(detailsTask.dueDate)}</dd></div><div><dt className="text-xs" style={{ color: "var(--tx2)" }}>Responsável</dt><dd>{users.find(user => user.id === detailsTask.assignedToUserId)?.name || "Sem responsável"}</dd></div><div><dt className="text-xs" style={{ color: "var(--tx2)" }}>Cliente</dt><dd>{clients.find(client => client.id === detailsTask.clientId)?.tradeName || "Rotina do escritório"}</dd></div></dl>
            {detailsTask.description && <p className="mt-4 text-sm">{detailsTask.description}</p>}
            <div className="mt-5 flex justify-end gap-2">{detailsTask.status === "concluida" && <Button variant="outline" onClick={() => { handleToggleTaskStatus(detailsTask); setDetailsTask(null); }}>Reabrir tarefa</Button>}<Button onClick={() => setDetailsTask(null)}>Fechar</Button></div>
          </section>
        </div>
      )}

      {/* Modal Nova Tarefa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900">
                Nova Obrigação / Tarefa Recorrente
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cliente Vinculado
                </label>
                <select
                  value={taskForm.clientId}
                  onChange={(e) => setTaskForm({ ...taskForm, clientId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">Rotina Interna do Escritório</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.tradeName} ({c.name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contador responsável</label>
                <select required value={taskForm.assignedToUserId} onChange={(e) => setTaskForm({ ...taskForm, assignedToUserId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs">
                  {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título da Obrigação *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Envio e Fechamento da EFD-Reinf"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Área Contábil *
                  </label>
                  <select
                    value={taskForm.category}
                    onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="fiscal">Fiscal</option>
                    <option value="contabil">Contábil</option>
                    <option value="pessoal">Departamento Pessoal</option>
                    <option value="societario">Societário</option>
                    <option value="atendimento">Atendimento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prioridade *
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data Limite de Vencimento *
                </label>
                <input
                  type="date"
                  required
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-rec"
                  checked={taskForm.isRecurring}
                  onChange={(e) => setTaskForm({ ...taskForm, isRecurring: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="chk-rec" className="text-xs text-slate-700 select-none">
                  Repetir mensalmente nesta data de vencimento
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Cadastrar Obrigação
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
