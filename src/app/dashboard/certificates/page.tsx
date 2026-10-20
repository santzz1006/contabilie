"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Plus,
  X,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { Certificate, Client, CertificateType, CertificateStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { OFFICIAL_PORTALS } from "@/lib/cnd-engine";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isConsulting, setIsConsulting] = useState<string | null>(null);
  const [manualModalCert, setManualModalCert] = useState<Certificate | null>(null);
  const [protocolInput, setProtocolInput] = useState("");
  const [validityInput, setValidityInput] = useState("");

  const loadData = async () => {
    try {
      const [resClients, resCnds] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/certificates")
      ]);
      if (resClients.ok) setClients(await resClients.json());
      if (resCnds.ok) setCertificates(await resCnds.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunCheck = async (cert: Certificate) => {
    if (cert.requiresManualAssistance) {
      // Abre modal de assistência com link direto
      setManualModalCert(cert);
      setProtocolInput(cert.protocolNumber || "");
      setValidityInput(cert.validityDate || "");
      return;
    }

    setIsConsulting(cert.id);
    try {
      const res = await fetch(`/api/certificates/${cert.id}/check`, {
        method: "POST",
      });
      if (res.ok) {
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsConsulting(null);
    }
  };

  const handleSaveManualVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualModalCert) return;

    try {
      const res = await fetch(`/api/certificates/${manualModalCert.id}/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          protocolNumber: protocolInput,
          validityDate: validityInput,
          status: "valida",
          observations: "Consulta realizada com sucesso através do portal oficial assistido com validação de CAPTCHA.",
        }),
      });

      if (res.ok) {
        await loadData();
        setManualModalCert(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredCertificates = certificates.filter(c => {
    const matchClient = selectedClientId === "all" || c.clientId === selectedClientId;
    const matchStatus = selectedStatus === "all" || c.status === selectedStatus;
    return matchClient && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Monitoramento de CNDs e Regularidade Fiscal
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Acompanhamento de certidões negativas federais, estaduais, municipais, FGTS e trabalhistas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-emerald-300 text-emerald-800 bg-emerald-50 px-3 py-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mr-1.5" />
            <span>Fontes Oficiais Conectadas</span>
          </Badge>
        </div>
      </div>

      {/* Filters Bar */}
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
                  <option key={c.id} value={c.id}>{c.tradeName} ({c.name})</option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-auto">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-slate-300 rounded-lg text-xs p-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Todos os Estados</option>
                <option value="valida">Válidas</option>
                <option value="proxima_vencimento">Próximas do Vencimento</option>
                <option value="vencida">Vencidas</option>
                <option value="erro_consulta">Exigem Consulta Assistida</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CNDs Grid */}
      {filteredCertificates.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Nenhuma certidão encontrada"
          description="Ajuste os filtros de seleção de empresa ou estado para exibir certidões."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCertificates.map((cert) => {
            const client = clients.find(c => c.id === cert.clientId);
            const portal = OFFICIAL_PORTALS[cert.type];

            return (
              <Card key={cert.id} className="glass-card flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-sm font-semibold truncate" title={cert.title}>
                        {cert.title}
                      </CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {cert.issuingAgency}
                      </p>
                    </div>

                    <Badge
                      variant={
                        cert.status === "valida" ? "success" :
                        cert.status === "proxima_vencimento" ? "warning" :
                        cert.status === "vencida" ? "destructive" : "info"
                      }
                      className="capitalize shrink-0"
                    >
                      {cert.status === "proxima_vencimento" ? "A Vencer" :
                       cert.status === "erro_consulta" ? "Consulta Manual" : cert.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-800">
                      Empresa: {client?.tradeName || "Cliente"}
                    </span>
                    <span className="font-mono text-slate-500 text-[11px]">
                      CNPJ: {client?.cnpj}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Validade da Certidão</span>
                      <span className="font-semibold text-slate-700">
                        {cert.validityDate ? formatDate(cert.validityDate) : "Não informada"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Última Consulta</span>
                      <span className="font-medium text-slate-700">
                        {cert.lastCheckedAt ? formatDate(cert.lastCheckedAt) : "Pendente"}
                      </span>
                    </div>
                  </div>

                  {cert.protocolNumber && (
                    <div className="p-2 bg-slate-50 rounded border border-slate-100 text-[11px]">
                      <span className="text-slate-500 block">Protocolo Oficial:</span>
                      <span className="font-mono font-medium text-slate-800">{cert.protocolNumber}</span>
                    </div>
                  )}

                  {cert.observations && (
                    <p className="text-[11px] text-slate-500 bg-amber-50/50 p-2 rounded border border-amber-100">
                      {cert.observations}
                    </p>
                  )}
                </CardContent>

                <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-3">
                  {portal && (
                    <a
                      href={portal.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-600 hover:text-emerald-700 flex items-center gap-1 font-medium"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Abrir Portal Oficial</span>
                    </a>
                  )}

                  <Button
                    size="sm"
                    variant={cert.requiresManualAssistance ? "outline" : "default"}
                    disabled={isConsulting === cert.id}
                    onClick={() => handleRunCheck(cert)}
                    className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isConsulting === cert.id ? "animate-spin" : ""}`} />
                    <span>
                      {isConsulting === cert.id ? "Verificando..." :
                       cert.requiresManualAssistance ? "Consulta Assistida" : "Verificar Agora"}
                    </span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Consulta Assistida */}
      {manualModalCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900">
                Consulta Manual Assistida de Certidão
              </h3>
              <button
                onClick={() => setManualModalCert(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
              <span className="font-semibold block mb-0.5">Mecanismo de Segurança do Órgão</span>
              <p>
                O portal da <strong>{manualModalCert.issuingAgency}</strong> requer validação humana (desafio de imagem/CAPTCHA). Conforme a governança do sistema, acesse a fonte oficial pelo link abaixo e registre os dados retornados.
              </p>
            </div>

            <div className="my-4">
              <a
                href={OFFICIAL_PORTALS[manualModalCert.type]?.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 hover:bg-emerald-100"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Acessar {OFFICIAL_PORTALS[manualModalCert.type]?.agencyName}</span>
              </a>
            </div>

            <form onSubmit={handleSaveManualVerification} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número de Protocolo / Código de Controle
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: CND-SP-2026-9812739"
                  value={protocolInput}
                  onChange={(e) => setProtocolInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nova Data de Validade da Certidão
                </label>
                <input
                  type="date"
                  required
                  value={validityInput}
                  onChange={(e) => setValidityInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setManualModalCert(null)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Registrar Certidão Emitida
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
