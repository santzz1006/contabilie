"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Calculator,
  TrendingUp,
  Users,
  Briefcase,
  Send,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WebsiteConfig } from "@/lib/types";

export default function PublicSitePage() {
  const [config, setConfig] = useState<WebsiteConfig | null>(null);
  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch("/api/website-builder")
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(console.error);
  }, []);

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
        Carregando site institucional...
      </div>
    );
  }

  const iconMap: Record<string, any> = {
    Calculator,
    TrendingUp,
    Users,
    Briefcase
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <span className="font-bold text-base text-slate-900 block">
                {config.siteName}
              </span>
              <span className="text-xs text-slate-500 block">
                Assessoria Contábil & Gestão Tributária
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#sobre" className="hover:text-emerald-600 transition-colors">Sobre Nós</a>
            <a href="#servicos" className="hover:text-emerald-600 transition-colors">Serviços</a>
            <a href="#contato" className="hover:text-emerald-600 transition-colors">Fale Conosco</a>
          </div>

          <a
            href={`https://wa.me/55${config.contactWhatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>WhatsApp do Escritório</span>
            </Button>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-slate-50 py-20 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <Badge variant="outline" className="border-emerald-300 text-emerald-800 bg-emerald-50 px-3 py-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 mr-1.5" />
            <span>Contabilidade Consultiva & Segurança Jurídica</span>
          </Badge>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {config.tagline}
          </h1>

          <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {config.aboutUs}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#contato">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                Solicitar Proposta Especializada
              </Button>
            </a>
            <a href="#servicos">
              <Button size="lg" variant="outline" className="border-slate-300 text-slate-700">
                Conhecer Nossas Soluções
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="servicos" className="py-16 max-w-6xl mx-auto px-6 w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Nossos Serviços Estratégicos
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Atendimento sob medida para reduzir custos tributários e simplificar sua rotina fiscal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {config.services.map((srv) => {
            const Icon = iconMap[srv.icon] || Briefcase;
            return (
              <Card key={srv.id} className="glass-card">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{srv.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {srv.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Contact & Lead Capture Form */}
      <section id="contato" className="bg-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--or)]">
                Atendimento Rápido
              </span>
              <h2 className="text-2xl font-bold mt-1">
                Fale com Nossos Especialistas
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Preencha o formulário para agendar um diagnóstico tributário com nossa equipe contábil.
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-[var(--or)] shrink-0" />
                <span>{config.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-[var(--or)] shrink-0" />
                <span>{config.contactPhone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-[var(--or)] shrink-0" />
                <span>{config.contactEmail}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="h-10 w-10 text-[var(--or)] mx-auto" />
                <h3 className="text-sm font-bold">Mensagem Enviada!</h3>
                <p className="text-xs text-slate-300">
                  Nossa equipe contábil entrará em contato em breve via WhatsApp ou e-mail.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Seu nome"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="seu@email.com"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      WhatsApp *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="(11) 99999-9999"
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Nome da Empresa
                  </label>
                  <input
                    type="text"
                    placeholder="Sua empresa ou nova empresa"
                    value={leadForm.company}
                    onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs">
                    Solicitar Contato
                  </Button>
                </div>

                <p className="text-[10px] text-slate-500 text-center mt-2">
                  Respeitamos sua privacidade (LGPD). Seus dados não serão compartilhados.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Public Footer */}
      <footer className="py-6 bg-slate-950 text-slate-500 text-center text-xs border-t border-slate-800">
        <p>© 2026 {config.siteName}. Todos os direitos reservados. CRC ativo.</p>
      </footer>
    </div>
  );
}
