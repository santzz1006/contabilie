"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  Shield,
  Users,
  Building2,
  Lock,
  FileCheck2,
  CheckCircle2,
  Key,
  Database,
  ArrowRightLeft,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Organization, User, AuditEvent, Client, UserRole } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function SettingsPage() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "assistant" as UserRole, clientId: "" });
  const [userFeedback, setUserFeedback] = useState("");
  const [savingUser, setSavingUser] = useState(false);
  const [activeTab, setActiveTab] = useState<"organization" | "users" | "audit" | "lgpd">("organization");

  const loadData = async () => {
    try {
      const [resOrg, resUsers, resAudit, resClients] = await Promise.all([
        fetch("/api/settings/organization"),
        fetch("/api/settings/users"),
        fetch("/api/settings/audit"),
        fetch("/api/clients")
      ]);
      if (resOrg.ok) setOrganization(await resOrg.json());
      if (resUsers.ok) setUsers(await resUsers.json());
      if (resAudit.ok) setAuditLogs(await resAudit.json());
      if (resClients.ok) setClients(await resClients.json());
    } catch (e) {
      console.error(e);
    }
  };

  const createUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingUser(true);
    setUserFeedback("");
    try {
      const response = await fetch("/api/settings/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newUser) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível criar o acesso.");
      setNewUser({ name: "", email: "", password: "", role: "assistant", clientId: "" });
      setUserFeedback("Acesso criado. Entregue a senha ao usuário por um canal seguro.");
      await loadData();
    } catch (error) { setUserFeedback(error instanceof Error ? error.message : "Falha ao criar acesso."); }
    finally { setSavingUser(false); }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Configurações, Auditoria e LGPD
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestão do escritório, usuários internos, permissões de acesso e trilha de conformidade legal.
          </p>
        </div>

        <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-xs px-3 py-1">
          <Shield className="h-3.5 w-3.5 text-emerald-600 mr-1.5" />
          <span>Isolamento Multi-tenant Ativo</span>
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("organization")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "organization" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Dados do Escritório
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "users" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Equipe & Permissões ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "audit" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Trilha de Auditoria ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab("lgpd")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "lgpd" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Conformidade LGPD
        </button>
      </div>

      {/* Tab 1: Dados do Escritório */}
      {activeTab === "organization" && organization && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Perfil da Organização (Tenant)</CardTitle>
              <CardDescription>Identificação cadastral da empresa contábil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="rounded-xl border p-4" style={{ borderColor: "var(--line)", background: "var(--surf2)" }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div><strong className="block text-sm" style={{ color: "var(--tx)" }}>Meu site</strong><span style={{ color: "var(--tx2)" }}>Construa e publique a página institucional do escritório como benefício do Contabilis.</span></div>
                  <Link href="/dashboard/website-builder" className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold" style={{ background: "var(--dk)", color: "var(--dk-tx)" }}>Abrir criador de sites</Link>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block">Razão Social:</span>
                <span className="font-semibold text-slate-800 text-sm">{organization.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block">CNPJ:</span>
                  <span className="font-mono font-medium text-slate-800">{organization.cnpj}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Plano Contratado:</span>
                  <Badge variant="success" className="capitalize">{organization.plan}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block">E-mail:</span>
                  <span className="text-slate-800">{organization.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Telefone:</span>
                  <span className="text-slate-800">{organization.phone}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  Identificador de Tenant: <code className="font-mono text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">{organization.id}</code>
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Segurança e Isolamento de Dados</CardTitle>
              <CardDescription>Garantias arquiteturais conforme Seção 14 do PDF</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <Lock className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800 block">Isolamento Multi-tenant Rigoroso</span>
                  <span>Todas as consultas e gravações exigem <code>tenant_id</code>. Nenhum escritório visualiza dados de outro.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <Database className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800 block">Armazenamento Criptografado</span>
                  <span>Documentos de extratos e notas possuem integridade garantida por hash SHA-256 e políticas de acesso restrito.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Equipe e Permissões */}
      {activeTab === "users" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Usuários Internos e Controle de Acesso (RBAC)</CardTitle>
            <CardDescription>Perfis: Administrador, Contador/Gestor, Analista Contábil e Assistente</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createUser} className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3 rounded-xl border p-4" style={{ borderColor: "var(--line)", background: "var(--surf2)" }}>
              <div className="md:col-span-2"><strong className="text-sm">Criar acesso para funcionário ou cliente</strong><p className="text-xs text-slate-500 mt-1">O cliente poderá entrar no portal e verá apenas os próprios documentos.</p></div>
              <input required minLength={2} placeholder="Nome completo" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="rounded-lg border px-3 py-2 text-xs" />
              <input required type="email" placeholder="E-mail de acesso" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="rounded-lg border px-3 py-2 text-xs" />
              <input required minLength={10} type="password" autoComplete="new-password" placeholder="Senha temporária (mínimo 10 caracteres)" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="rounded-lg border px-3 py-2 text-xs" />
              <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })} className="rounded-lg border px-3 py-2 text-xs">
                <option value="manager">Contador / gestor</option><option value="analyst">Analista</option><option value="assistant">Assistente</option><option value="client">Cliente (portal)</option>
              </select>
              {newUser.role === "client" && <select required value={newUser.clientId} onChange={(e) => setNewUser({ ...newUser, clientId: e.target.value })} className="rounded-lg border px-3 py-2 text-xs"><option value="">Selecione o cliente</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.tradeName}</option>)}</select>}
              <Button type="submit" disabled={savingUser || (newUser.role === "client" && clients.length === 0)}>{savingUser ? "Criando acesso..." : "Criar acesso"}</Button>
              {userFeedback && <p role="status" className="md:col-span-2 text-xs">{userFeedback}</p>}
            </form>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Nome do Profissional</th>
                    <th className="py-3 px-4">E-mail</th>
                    <th className="py-3 px-4">Papel (RBAC)</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-semibold text-slate-800 flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-[11px]">
                          <UserCheck className="h-3.5 w-3.5" />
                        </div>
                        <span>{u.name}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            u.role === "admin" ? "default" :
                            u.role === "manager" ? "info" :
                            u.role === "analyst" ? "warning" : "secondary"
                          }
                          className="capitalize font-mono text-[10px]"
                        >
                          {u.role === "admin" ? "Administrador" :
                           u.role === "manager" ? "Contador/Gestor" :
                           u.role === "analyst" ? "Analista" :
                           u.role === "assistant" ? "Assistente" : "Cliente"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="success" className="text-[10px]">Ativo</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Trilha de Auditoria */}
      {activeTab === "audit" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Trilha de Auditoria Completa</CardTitle>
            <CardDescription>Registro contínuo e imutável de ações operacionais e de segurança</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Horário</th>
                    <th className="py-3 px-4">Operação</th>
                    <th className="py-3 px-4">Recurso</th>
                    <th className="py-3 px-4">Detalhes da Ação</th>
                    <th className="py-3 px-4">Usuário</th>
                    <th className="py-3 px-4">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {log.timestamp.replace("T", " ").substring(0, 19)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{log.action}</td>
                      <td className="py-3 px-4 text-slate-600">{log.resource}</td>
                      <td className="py-3 px-4 text-slate-600 max-w-sm truncate" title={log.details}>
                        {log.details}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{log.userName}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{log.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Conformidade LGPD */}
      {activeTab === "lgpd" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Governança e Proteção de Dados Pessoais (LGPD)</CardTitle>
              <CardDescription>Diretrizes ativas no sistema para tratamento lícito de dados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-slate-600">
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                <span className="font-semibold text-emerald-900 block mb-1">
                  1. Finalidade e Minimização dos Dados
                </span>
                <p className="leading-relaxed">
                  Os dados cadastrais de clientes, extratos bancários e notas fiscais são tratados estritamente para o cumprimento de obrigações tributárias e fiscais legais. Não há comercialização nem compartilhamento de dados com terceiros não autorizados.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-semibold text-slate-900 block mb-1">
                  2. Política de Retenção de Documentos
                </span>
                <p className="leading-relaxed">
                  Extratos, recibos e declarações são preservados durante o prazo prescricional legal previsto no Código Tributário Nacional (5 anos). Após esse período, o cliente pode solicitar a exportação integral ou exclusão segura dos arquivos armazenados.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-semibold text-slate-900 block mb-1">
                  3. Direitos dos Titulares e Portabilidade
                </span>
                <p className="leading-relaxed">
                  A plataforma garante a extração dos dados contábeis em formatos abertos e universais (CSV, JSON, OFX) a qualquer momento, sem taxas de saída abusivas.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
