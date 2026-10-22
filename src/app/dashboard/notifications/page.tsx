"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  MessageSquare,
  Mail,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building,
  Key,
  Shield,
  ExternalLink,
  Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NotificationItem, Client } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [templateType, setTemplateType] = useState<'cobranca_docs' | 'aviso_guia_das' | 'certidao_renovada'>('cobranca_docs');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendFeedback, setSendFeedback] = useState("");

  const loadData = async () => {
    try {
      const [resClients, resNotifs] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/notifications")
      ]);
      if (resClients.ok) { const loaded: Client[] = await resClients.json(); setClients(loaded); setSelectedClientId((current) => loaded.some((c) => c.id === current) ? current : loaded[0]?.id || ""); }
      if (resNotifs.ok) setNotifications(await resNotifs.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const getTemplateMessage = () => {
    const name = selectedClient?.tradeName || "Cliente";
    if (templateType === "cobranca_docs") return "Olá, " + name + "! Há documentos pendentes para envio ao seu escritório de contabilidade. Confirme com a equipe quais arquivos e competência estão pendentes.";
    if (templateType === "aviso_guia_das") return "Olá, " + name + "! Consulte com a equipe contábil a situação da sua guia DAS e o respectivo vencimento.";
    return "Olá, " + name + "! Entre em contato com a equipe contábil para confirmar a situação da sua certidão.";
  };

  const handleSendNotification = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedClient) { setSendFeedback("Cadastre ou selecione um cliente primeiro."); setSendSuccess(true); return; }
    const recipient = channel === "whatsapp" ? selectedClient.phone : selectedClient.email;
    if (!recipient) { setSendFeedback(channel === "whatsapp" ? "Cadastre o telefone do cliente." : "Cadastre o e-mail do cliente."); setSendSuccess(true); return; }
    setIsSending(true); setSendSuccess(false); setSendFeedback("");
    try {
      const title = templateType === "cobranca_docs" ? "Solicitação de documentos" : templateType === "aviso_guia_das" ? "Consulta sobre guia DAS" : "Consulta sobre certidão";
      const message = getTemplateMessage();
      const target = channel === "whatsapp" ? "https://wa.me/" + recipient.replace(/\D/g, "") + "?text=" + encodeURIComponent(message) : "mailto:" + encodeURIComponent(recipient) + "?subject=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(message);
      window.open(target, "_blank", "noopener,noreferrer");
      const response = await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ channel, recipient, title, message }) });
      if (!response.ok) { const result = await response.json(); throw new Error(result.error || "Não foi possível preparar a mensagem."); }
      setSendFeedback("Mensagem preparada para " + recipient + ". Confirme o envio no aplicativo; a entrega não é monitorada automaticamente.");
      setSendSuccess(true); await loadData(); setTimeout(() => setSendSuccess(false), 4000);
    } catch (error) { setSendFeedback(error instanceof Error ? error.message : "Falha ao preparar mensagem."); setSendSuccess(true); }
    finally { setIsSending(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            WhatsApp e Central de Notificações
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Lembretes de documentos, cobranças de competência e comunicados com proteção aos dados confidenciais (LGPD).
          </p>
        </div>

        <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-xs px-3 py-1">
          <Shield className="h-3.5 w-3.5 text-emerald-600 mr-1.5" />
            <span>Integração pendente de configuração</span>
        </Badge>
      </div>

      {/* Integration Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-slate-500 uppercase tracking-wider">
              Conexão WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-slate-800 block">
                WhatsApp (envio manual)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Abra a conversa e confirme o envio
              </span>
            </div>
            <Badge variant="warning">Não conectado</Badge>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-slate-500 uppercase tracking-wider">
              Conexão E-mail Transacional
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-slate-800 block">
                Serviço SMTP Corporativo
              </span>
              <span className="text-[11px] text-slate-500">
                Abra uma mensagem no seu cliente de e-mail
              </span>
            </div>
            <Badge variant="warning">Sem envio automático</Badge>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-slate-500 uppercase tracking-wider">
              Privacidade de Mensagens
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <span className="text-xs text-slate-600 block leading-tight">
              Regra do PDF: Sem envio direto de extratos em mensagens abertas. Disparo de links autenticados para o portal.
            </span>
          </CardContent>
        </Card>
      </div>

      {sendSuccess && (
        <div className="p-3 rounded-lg border text-xs flex items-center gap-2" style={{ background: "var(--or-s)", borderColor: "var(--line)", color: "var(--tx)" }}>
          <CheckCircle2 className="h-4 w-4" style={{ color: "var(--or)" }} />
          <span>{sendFeedback || "Conversa aberta no WhatsApp para revisão e envio manual."}</span>
        </div>
      )}

      {/* Main Two Column Form & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Dispatcher (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Enviar Comunicado / Cobrança</CardTitle>
              <CardDescription>
                Selecione o destinatário e o modelo de mensagem institucional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendNotification} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cliente Destinatário
                  </label>
                  <select
                    value={selectedClientId}
                    disabled={clients.length === 0}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {clients.length === 0 && <option value="">Nenhum cliente cadastrado</option>}
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.tradeName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Canal de Envio
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setChannel('whatsapp')}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        channel === 'whatsapp'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <MessageSquare className="h-4 w-4 text-emerald-600" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setChannel('email')}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        channel === 'email'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Mail className="h-4 w-4 text-emerald-600" />
                      <span>E-mail</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Modelo de Mensagem (Template Aprovado)
                  </label>
                  <select
                    value={templateType}
                    onChange={(e) => setTemplateType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="cobranca_docs">Lembrete de Envio de Extratos/Notas</option>
                    <option value="aviso_guia_das">Aviso de Guia DAS Emitida</option>
                    <option value="certidao_renovada">Certidão Negativa Renovada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prévia da Mensagem Transmitida
                  </label>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans">
                    {getTemplateMessage()}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Destino: {channel === 'whatsapp' ? selectedClient?.phone : selectedClient?.email}
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={isSending}
                  className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-xs"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSending ? "Preparando..." : channel === "whatsapp" ? "Abrir WhatsApp e preparar" : "Abrir e-mail e preparar"}</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: History & Delivery Logs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm">Histórico de Envios e Entregas</CardTitle>
                <CardDescription>Registro auditável das notificações geradas pelo sistema</CardDescription>
              </div>
              <Badge variant="outline">{notifications.length} registros</Badge>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-slate-100">
                {notifications.map((notif) => (
                  <div key={notif.id} className="py-3.5 flex items-start justify-between gap-4 text-xs">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-slate-100 text-slate-600 shrink-0 mt-0.5">
                        {notif.channel === 'whatsapp' ? (
                          <MessageSquare className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Mail className="h-4 w-4 text-sky-600" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <span className="font-semibold text-slate-800 block truncate">
                          {notif.title}
                        </span>
                        <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1.5">
                          <span>Destino: {notif.recipient}</span>
                          <span>Canal: {notif.channel.toUpperCase()}</span>
                          <span>Horário: {formatDate(notif.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <Badge variant={notif.status === "enviado" ? "success" : notif.status === "falha" ? "destructive" : "warning"} className="text-[10px] shrink-0">
                      {notif.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
