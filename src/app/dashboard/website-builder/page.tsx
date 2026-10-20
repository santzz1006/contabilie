"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Globe,
  Eye,
  CheckCircle2,
  Save,
  Palette,
  Layout,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Smartphone,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WebsiteConfig } from "@/lib/types";

export default function WebsiteBuilderPage() {
  const [config, setConfig] = useState<WebsiteConfig | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadWebsite = async () => {
    try {
      const res = await fetch("/api/website-builder");
      if (res.ok) {
        setConfig(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadWebsite();
  }, []);

  const handleSave = async (publishedStatus?: boolean) => {
    if (!config) return;
    setIsSaving(true);
    setSaveSuccess(false);

    const payload = {
      ...config,
      published: publishedStatus !== undefined ? publishedStatus : config.published,
      lastPublishedAt: publishedStatus ? new Date().toISOString() : config.lastPublishedAt,
    };

    try {
      const res = await fetch("/api/website-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setConfig(await res.json());
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (!config) {
    return <div className="p-8 text-center text-xs text-slate-500">Carregando construtor de site...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Construtor de Sites Contábeis
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Personalize a identidade institucional, serviços, captação de leads e publique a página do escritório.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/site" target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ExternalLink className="h-4 w-4" />
              <span>Ver Site Publicado</span>
            </Button>
          </Link>

          <Button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-xs"
          >
            <Globe className="h-4 w-4" />
            <span>{isSaving ? "Publicando..." : "Publicar Alterações"}</span>
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Site contábil salvo e publicado com sucesso!</span>
        </div>
      )}

      {/* Editor & Preview Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Content Editor (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Identidade e Conteúdo</CardTitle>
              <CardDescription>Configure os textos principais e contatos visíveis no site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Escritório
                </label>
                <input
                  type="text"
                  value={config.siteName}
                  onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Slogan Institucional
                </label>
                <input
                  type="text"
                  value={config.tagline}
                  onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sobre o Escritório
                </label>
                <textarea
                  rows={3}
                  value={config.aboutUs}
                  onChange={(e) => setConfig({ ...config, aboutUs: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Modelo Visual
                  </label>
                  <select
                    value={config.templateId}
                    onChange={(e) => setConfig({ ...config, templateId: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="executive">Executivo Corporativo</option>
                    <option value="modern">Moderno Consultivo</option>
                    <option value="minimalist">Minimalista</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cor Primária
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                      className="h-8 w-10 border border-slate-300 rounded cursor-pointer"
                    />
                    <span className="font-mono text-xs text-slate-600">{config.primaryColor}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp para Leads
                  </label>
                  <input
                    type="text"
                    value={config.contactWhatsapp}
                    onChange={(e) => setConfig({ ...config, contactWhatsapp: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefone Fixo
                  </label>
                  <input
                    type="text"
                    value={config.contactPhone}
                    onChange={(e) => setConfig({ ...config, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Endereço Físico
                </label>
                <input
                  type="text"
                  value={config.address}
                  onChange={(e) => setConfig({ ...config, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => handleSave(false)}
                  disabled={isSaving}
                  variant="outline"
                  className="w-full gap-2 text-xs"
                >
                  <Save className="h-4 w-4" />
                  <span>Salvar Rascunho</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Preview Frame (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between bg-white px-4 py-2 rounded-lg border border-slate-200">
            <span className="text-xs font-semibold text-slate-600">
              Pré-visualização em Tempo Real
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode("desktop")}
                className={`p-1.5 rounded cursor-pointer ${previewMode === "desktop" ? "bg-slate-200 text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
                title="Visualização Computador"
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPreviewMode("mobile")}
                className={`p-1.5 rounded cursor-pointer ${previewMode === "mobile" ? "bg-slate-200 text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
                title="Visualização Celular"
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Interactive Preview Container */}
          <div className={`mx-auto bg-white rounded-xl border border-slate-300 shadow-md overflow-hidden transition-all ${
            previewMode === "mobile" ? "max-w-sm" : "w-full"
          }`}>
            {/* Header do Site Mockup */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between" style={{ backgroundColor: '#ffffff' }}>
              <div>
                <span className="font-bold text-sm text-slate-900 block truncate" style={{ color: config.primaryColor }}>
                  {config.siteName}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  Contabilidade Consultiva & BPO Financeiro
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-800">
                Atendimento
              </Badge>
            </div>

            {/* Hero do Mockup */}
            <div className="p-6 text-center bg-slate-50 border-b border-slate-100">
              <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-100 mb-2">
                Especialistas em Redução Tributária Legal
              </span>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {config.tagline}
              </h2>
              <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto line-clamp-3">
                {config.aboutUs}
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <span className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold shadow-xs" style={{ backgroundColor: config.primaryColor }}>
                  Falar com Contador
                </span>
              </div>
            </div>

            {/* Serviços Mockup */}
            <div className="p-6 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
                Nossas Soluções Especializadas
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {config.services.map((s) => (
                  <div key={s.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 text-left">
                    <span className="font-semibold text-xs text-slate-800 block">{s.title}</span>
                    <span className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{s.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulário de Captação no Mockup */}
            <div className="p-5 bg-slate-900 text-white text-left">
              <span className="text-xs font-bold block">Solicite uma Análise Tributária Gratuita</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Receba uma simulação comparativa para sua empresa sem compromisso.
              </span>
              <div className="mt-3 space-y-2">
                <input
                  type="text"
                  placeholder="Nome do responsável"
                  readOnly
                  className="w-full px-2.5 py-1.5 rounded bg-slate-800 text-slate-300 text-[11px] border border-slate-700"
                />
                <input
                  type="text"
                  placeholder="WhatsApp com DDD"
                  readOnly
                  className="w-full px-2.5 py-1.5 rounded bg-slate-800 text-slate-300 text-[11px] border border-slate-700"
                />
                <div className="p-2 text-center rounded text-xs font-bold text-white shadow-xs" style={{ backgroundColor: config.primaryColor }}>
                  Enviar Solicitação
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
