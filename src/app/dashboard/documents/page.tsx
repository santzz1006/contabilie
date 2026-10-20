"use client";

import React, { useState, useEffect } from "react";
import {
  FolderOpen,
  Plus,
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Check,
  RotateCcw,
  Building,
  Calendar,
  X,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { DocumentRequest, DocumentItem, Client, DocumentCategory, DocumentStatus } from "@/lib/types";
import { formatDate, formatFileSize } from "@/lib/utils";

export default function DocumentsPage() {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"requests" | "files">("requests");

  // Form State
  const [reqForm, setReqForm] = useState({
    clientId: "",
    competence: "2026-10",
    category: "extrato" as DocumentCategory,
    title: "",
    description: "",
    dueDate: "2026-11-10",
  });

  const loadData = async () => {
    try {
      const [resClients, resReqs, resDocs] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/documents/requests"),
        fetch("/api/documents/files")
      ]);
      if (resClients.ok) setClients(await resClients.json());
      if (resReqs.ok) setRequests(await resReqs.json());
      if (resDocs.ok) setDocuments(await resDocs.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqForm.clientId || !reqForm.title) {
      alert("Selecione o cliente e preencha o título da solicitação.");
      return;
    }

    try {
      const res = await fetch("/api/documents/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqForm),
      });

      if (res.ok) {
        await loadData();
        setIsModalOpen(false);
        setReqForm({
          clientId: clients[0]?.id || "",
          competence: "2026-10",
          category: "extrato",
          title: "",
          description: "",
          dueDate: "2026-11-10",
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: DocumentStatus, reviewNotes?: string) => {
    try {
      const res = await fetch(`/api/documents/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, reviewNotes }),
      });
      if (res.ok) {
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchCategory = selectedCategory === "all" || r.category === selectedCategory;
    const matchStatus = selectedStatus === "all" || r.status === selectedStatus;
    const matchClient = selectedClientId === "all" || r.clientId === selectedClientId;
    return matchCategory && matchStatus && matchClient;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Coleta e Gestão de Documentos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Solicitações por competência, organização automática e esteira de revisão para a equipe.
          </p>
        </div>

        <Button
          onClick={() => {
            if (clients.length > 0 && !reqForm.clientId) {
              setReqForm(prev => ({ ...prev, clientId: clients[0].id }));
            }
            setIsModalOpen(true);
          }}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Solicitação</span>
        </Button>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "requests" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Solicitações de Coleta ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "files" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Arquivos Recebidos ({documents.length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="border border-slate-300 rounded-lg text-xs px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Todos os Clientes</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.tradeName}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-slate-300 rounded-lg text-xs px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Todas as Categorias</option>
            <option value="extrato">Extrato Bancário</option>
            <option value="fiscal">Fiscal / Notas</option>
            <option value="folha">Folha e Proventos</option>
            <option value="contabil">Contábil</option>
            <option value="outros">Outros</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-slate-300 rounded-lg text-xs px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Todos os Estados</option>
            <option value="solicitado">Solicitado</option>
            <option value="recebido">Recebido</option>
            <option value="em_analise">Em Análise</option>
            <option value="precisa_correcao">Precisa de Correção</option>
            <option value="aprovado">Aprovado</option>
          </select>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "requests" ? (
        filteredRequests.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="Nenhuma solicitação encontrada"
            description="Não há itens com os filtros selecionados. Crie uma solicitação para cobrar os documentos do cliente."
            actionLabel="Criar Solicitação"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((req) => {
              const client = clients.find(c => c.id === req.clientId);
              const relatedDoc = documents.find(d => d.requestId === req.id || (d.clientId === req.clientId && d.competence === req.competence && d.category === req.category));

              return (
                <Card key={req.id} className="hover:border-slate-300 transition-colors">
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-semibold text-slate-900">
                            {req.title}
                          </h4>
                          <Badge
                            variant={
                              req.status === "aprovado" ? "success" :
                              req.status === "recebido" || req.status === "em_analise" ? "info" :
                              req.status === "precisa_correcao" ? "destructive" : "warning"
                            }
                            className="capitalize"
                          >
                            {req.status === "precisa_correcao" ? "Correção Solicitada" : req.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Competência: {req.competence}
                          </Badge>
                        </div>

                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {req.description || "Sem observações adicionais."}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                          <span className="flex items-center gap-1 font-medium text-slate-600">
                            <Building className="h-3.5 w-3.5 text-slate-400" />
                            {client?.tradeName || "Cliente"}
                          </span>
                          <span>Prazo: {formatDate(req.dueDate)}</span>
                          <span className="capitalize">Categoria: {req.category}</span>
                        </div>

                        {relatedDoc && (
                          <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between text-xs">
                            <span className="font-mono text-slate-700 truncate max-w-xs">
                              Arquivo: {relatedDoc.fileName} ({formatFileSize(relatedDoc.fileSize)})
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Enviado em {formatDate(relatedDoc.uploadedAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Operational Action Controls */}
                    <div className="flex items-center gap-2 shrink-0 md:self-center">
                      {req.status === "recebido" || req.status === "em_analise" ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs gap-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            onClick={() => {
                              const note = prompt("Descreva o motivo da recusa ou correção:");
                              if (note) handleUpdateStatus(req.id, "precisa_correcao", note);
                            }}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Recusar</span>
                          </Button>
                          <Button
                            size="sm"
                            className="text-xs gap-1 bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleUpdateStatus(req.id, "aprovado")}
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Aprovar</span>
                          </Button>
                        </>
                      ) : req.status === "aprovado" ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Conferido pela Contabilidade</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-amber-700 px-3 py-1 bg-amber-50 rounded-lg border border-amber-200">
                          <Clock className="h-4 w-4" />
                          <span>Aguardando Envio do Cliente</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        /* Files View with Hash & Versioning */
        <Card>
          <CardHeader>
            <CardTitle>Repositório de Arquivos e Auditoria de Hashes</CardTitle>
            <CardDescription>
              Rastreabilidade de arquivos enviados pelos clientes com cálculo de integridade SHA-256 e prevenção de duplicidades.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Nome do Arquivo</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Competência</th>
                    <th className="py-3 px-4">Tamanho</th>
                    <th className="py-3 px-4">Hash SHA-256</th>
                    <th className="py-3 px-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documents.map((doc) => {
                    const client = clients.find(c => c.id === doc.clientId);
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-medium text-slate-800 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <span>{doc.fileName}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{client?.tradeName || "Cliente"}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{doc.competence}</td>
                        <td className="py-3 px-4 text-slate-600">{formatFileSize(doc.fileSize)}</td>
                        <td className="py-3 px-4 font-mono text-slate-400 text-[11px]" title={doc.fileHash}>
                          {doc.fileHash.substring(0, 16)}...
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={doc.status === "aprovado" ? "success" : "info"}>
                            {doc.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal Criar Solicitação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900">
                Nova Solicitação de Documento
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cliente *
                </label>
                <select
                  required
                  value={reqForm.clientId}
                  onChange={(e) => setReqForm({ ...reqForm, clientId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.tradeName} ({c.name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título da Solicitação *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Extrato Bancário Conta Corrente Itaú"
                  value={reqForm.title}
                  onChange={(e) => setReqForm({ ...reqForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Competência *
                  </label>
                  <input
                    type="month"
                    required
                    value={reqForm.competence}
                    onChange={(e) => setReqForm({ ...reqForm, competence: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={reqForm.category}
                    onChange={(e) => setReqForm({ ...reqForm, category: e.target.value as DocumentCategory })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="extrato">Extrato Bancário</option>
                    <option value="fiscal">Fiscal / Notas Fiscais</option>
                    <option value="folha">Folha e Encargos</option>
                    <option value="contabil">Contábil / Recibos</option>
                    <option value="outros">Outros Documentos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data Limite (Prazo para o Cliente) *
                </label>
                <input
                  type="date"
                  required
                  value={reqForm.dueDate}
                  onChange={(e) => setReqForm({ ...reqForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instruções para o Cliente
                </label>
                <textarea
                  rows={2}
                  placeholder="Orientações sobre formatos aceitos (PDF, OFX, XML) e período."
                  value={reqForm.description}
                  onChange={(e) => setReqForm({ ...reqForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
                  Publicar Solicitação
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
