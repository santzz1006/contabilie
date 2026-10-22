"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  UploadCloud,
  FileCheck2,
  Clock,
  AlertCircle,
  Camera,
  CheckCircle2,
  Building2,
  FileText,
  ShieldCheck,
  Send,
  Calendar,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DocumentRequest, DocumentItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function ClientPortalPage() {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("Portal do cliente");
  const [organizationName, setOrganizationName] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const loadRequests = async () => {
    try {
      if (!clientId) return;
      const res = await fetch(`/api/documents/requests?clientId=${clientId}`);
      if (res.ok) {
        const data: DocumentRequest[] = await res.json();
        setRequests(data);
        if (data.length > 0 && !selectedRequest) {
          setSelectedRequest(data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetch("/api/auth/me").then((response) => response.ok ? response.json() : Promise.reject(new Error("Sessão não autorizada"))).then((profile) => {
      setClientId(profile.user.clientId || "");
      setClientName(profile.client?.tradeName || profile.client?.name || "Portal do cliente");
      setOrganizationName(profile.organization || "");
    }).catch(() => setUploadFeedback({ type: "error", message: "Entre com o usuário do cliente para acessar este portal." }));
  }, []);

  useEffect(() => { if (clientId) loadRequests(); }, [clientId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRequest) return;

    // Limite de 25MB
    if (file.size > 25 * 1024 * 1024) {
      setUploadFeedback({
        type: 'error',
        message: 'O arquivo excede o limite máximo permitido de 25MB.'
      });
      return;
    }

    setIsUploading(true);
    setUploadFeedback(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("clientId", clientId);
    formData.append("requestId", selectedRequest.id);
    formData.append("competence", selectedRequest.competence);
    formData.append("category", selectedRequest.category);

    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        setUploadFeedback({
          type: result.isDuplicate ? 'warning' : 'success',
          message: result.message
        });
        await loadRequests();
      } else {
        setUploadFeedback({
          type: 'error',
          message: result.error || 'Erro ao processar envio do arquivo.'
        });
      }
    } catch (err: any) {
      setUploadFeedback({
        type: 'error',
        message: 'Falha na conexão ao enviar o arquivo.'
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'solicitado' || r.status === 'precisa_correcao');
  const completedRequests = requests.filter(r => r.status === 'recebido' || r.status === 'em_analise' || r.status === 'aprovado');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Mobile-First Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 py-3 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-slate-800 leading-tight">
                {clientName}
              </h2>
              <span className="text-[10px] text-emerald-600 font-medium">
                Portal de Envio de Documentos
              </span>
            </div>
          </div>

          <Badge variant="outline" className="text-[10px] text-slate-500 gap-1 border-slate-200">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            <span>Conexão Segura</span>
          </Badge>
        </div>
      </header>

      {/* Main Container - Optimized for Mobile Screen */}
      <main className="max-w-md mx-auto w-full p-4 flex-1 space-y-5">
        {/* Banner de Boas-vindas e Resumo */}
        <div className="rounded-xl bg-[var(--dk)] text-[var(--dk-tx)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--dk-tx)]">
              Competência: {selectedRequest?.competence || new Intl.DateTimeFormat("pt-BR", { month: "2-digit", year: "numeric" }).format(new Date())}
            </span>
            <Badge variant="outline" className="border-emerald-500/40 text-[var(--dk-tx)] text-[10px]">
              {pendingRequests.length} pendentes
            </Badge>
          </div>
          <h1 className="text-lg font-bold mt-2">
            Envio Mensal de Extratos e Comprovantes
          </h1>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Envie fotos ou arquivos digitais solicitados pela sua contabilidade de forma prática pelo celular.
          </p>
        </div>

        {/* Feedback Alert */}
        {uploadFeedback && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
              uploadFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : uploadFeedback.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {uploadFeedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            ) : uploadFeedback.type === 'warning' ? (
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            )}
            <div className="flex-1">
              <span className="font-semibold block">
                {uploadFeedback.type === 'success' ? 'Envio Concluído' : uploadFeedback.type === 'warning' ? 'Aviso de Integridade' : 'Erro no Envio'}
              </span>
              <span>{uploadFeedback.message}</span>
            </div>
          </div>
        )}

        {/* Lista de Documentos Solicitados */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            1. O que falta enviar ({pendingRequests.length})
          </h3>

          {pendingRequests.length === 0 ? (
            <Card className="border-dashed bg-emerald-50/50 border-emerald-200 text-center p-6">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-emerald-900">
                Tudo em dia!
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Nenhum documento pendente para envio nesta competência.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedRequest?.id === req.id
                      ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                      {req.title}
                    </span>
                    <Badge
                      variant={req.status === 'precisa_correcao' ? 'destructive' : 'warning'}
                      className="text-[10px] shrink-0"
                    >
                      {req.status === 'precisa_correcao' ? 'Correção' : 'Pendente'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {req.description}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Prazo: {formatDate(req.dueDate)}
                    </span>
                    <span className="capitalize">Categoria: {req.category}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Action Box */}
        {selectedRequest && (
          <Card className="border-emerald-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs text-slate-500 uppercase tracking-wider">
                2. Enviar arquivo para
              </CardTitle>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {selectedRequest.title}
              </p>
              <CardDescription className="text-xs mt-0.5">
                Formatos aceitos: PDF, OFX, CSV, PNG, JPEG (até 25MB).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Hidden Inputs */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.ofx,.csv,.png,.jpg,.jpeg,.xml"
                onChange={handleFileUpload}
              />
              <input
                ref={cameraInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
              />

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUploading}
                  onClick={() => cameraInputRef.current?.click()}
                  className="h-14 flex flex-col items-center justify-center gap-1 text-slate-700 border-slate-300 hover:bg-slate-50"
                >
                  <Camera className="h-5 w-5 text-emerald-600" />
                  <span className="text-[11px] font-semibold">Tirar Foto</span>
                </Button>

                <Button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="h-14 flex flex-col items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <UploadCloud className="h-5 w-5" />
                  <span className="text-[11px] font-semibold">
                    {isUploading ? "Enviando..." : "Escolher Arquivo"}
                  </span>
                </Button>
              </div>

              <div className="pt-2 text-center">
                <span className="text-[10px] text-slate-400">
                  Os documentos são transmitidos criptografados diretamente para o contador.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documentos já enviados / Histórico */}
        {completedRequests.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Histórico de envios realizados
            </h3>
            <div className="space-y-2">
              {completedRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs"
                >
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-700 block truncate">
                      {req.title}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Competência: {req.competence}
                    </span>
                  </div>
                  <Badge variant={req.status === 'aprovado' ? 'success' : 'info'} className="text-[10px]">
                    {req.status === 'aprovado' ? 'Aprovado' : 'Em Análise'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center border-t border-slate-200 bg-white">
        <p className="text-[11px] text-slate-400">
          {organizationName || "Portal do cliente"} • Ambiente do Cliente
        </p>
      </footer>
    </div>
  );
}
