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
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { TaskItem, Client, TaskPriority, TaskStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [taskForm, setTaskForm] = useState({
    clientId: "",
    title: "",
    description: "",
    category: "fiscal" as TaskItem['category'],
    dueDate: "2026-11-20",
    priority: "alta" as TaskPriority,
    isRecurring: true,
  });

  const loadData = async () => {
    try {
      const [resClients, resTasks] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/tasks")
      ]);
      if (resClients.ok) setClients(await resClients.json());
      if (resTasks.ok) setTasks(await resTasks.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
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
    return matchStatus && matchClient;
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
            const isCompleted = task.status === "concluida";

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
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Button
                      size="sm"
                      variant={isCompleted ? "ghost" : "outline"}
                      onClick={() => handleToggleTaskStatus(task)}
                      className="text-xs"
                    >
                      {isCompleted ? "Reabrir" : "Concluir"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
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
