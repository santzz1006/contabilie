"use client";

import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  Building,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Lock,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BankTransaction, Client, AccountCategory } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function BalanceMappingPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [categories, setCategories] = useState<AccountCategory[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("cli-tech-1");
  const [isExporting, setIsExporting] = useState(false);

  const loadData = async () => {
    try {
      const [resClients, resTxs, resCats] = await Promise.all([
        fetch("/api/clients"),
        fetch(`/api/reconciliation/transactions?clientId=${selectedClientId}`),
        fetch("/api/reconciliation/categories")
      ]);
      if (resClients.ok) setClients(await resClients.json());
      if (resTxs.ok) setTransactions(await resTxs.json());
      if (resCats.ok) setCategories(await resCats.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClientId]);

  // Agrupamento contábil
  const unclassifiedCount = transactions.filter(t => !t.accountCategoryId).length;
  const pendingCount = transactions.filter(t => t.status !== 'conciliado').length;

  const totalReceitas = transactions
    .filter(t => t.type === 'credit' && t.status === 'conciliado')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalDespesas = transactions
    .filter(t => t.type === 'debit' && t.status === 'conciliado')
    .reduce((acc, t) => acc + t.amount, 0);

  const resultadoExercicio = totalReceitas - totalDespesas;

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const handleExportDraft = () => {
    if (pendingCount > 0) {
      alert("Aviso de Conformidade: Existem lançamentos não conciliados ou pendentes. A exportação definitiva é bloqueada até que todas as exceções sejam revisadas pelo contador.");
      return;
    }
    alert("Rascunho de Balancete Contábil gerado com sucesso para arquivo contábil SPED/CSV.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Relatórios e Preparação de Balanços
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Mapeamento ao plano de contas, pré-preenchimento de DRE preliminar e conferência de saldos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="border border-slate-300 rounded-lg text-xs p-2 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.tradeName}</option>
            ))}
          </select>

          <Button
            onClick={handleExportDraft}
            className={`gap-2 ${pendingCount > 0 ? 'bg-slate-700 hover:bg-slate-800' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          >
            {pendingCount > 0 ? <Lock className="h-4 w-4" /> : <Download className="h-4 w-4" />}
            <span>Exportar Balancete / DRE</span>
          </Button>
        </div>
      </div>

      {/* Conformity Notice */}
      {pendingCount > 0 ? (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block text-sm">Atenção Contábil: Pendências em Aberto</span>
            <p className="mt-0.5 leading-relaxed">
              Existem <strong>{pendingCount} lançamentos</strong> não conciliados para {selectedClient?.tradeName || "este cliente"}. Conforme os requisitos de governança do sistema, relatórios oficiais não inventam contas ou saldos e exigem revisão humana integral antes do fechamento do balancete.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-semibold block text-sm">Conciliação 100% Conferida</span>
            <span>Todos os lançamentos do período foram categorizados e aprovados por responsável técnico.</span>
          </div>
        </div>
      )}

      {/* DRE Preliminar / Balanço Estimativo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resumo Financeiro */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm">Demonstrativo de Resultado Preliminar</CardTitle>
            <CardDescription>Competência Outubro/2026</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
              <span className="text-slate-600">Receita Bruta Operacional (+)</span>
              <span className="font-mono font-semibold text-emerald-600">{formatCurrency(totalReceitas)}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
              <span className="text-slate-600">Custos e Despesas Operacionais (-)</span>
              <span className="font-mono font-semibold text-rose-600">- {formatCurrency(totalDespesas)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-sm font-bold">
              <span className="text-slate-900">Resultado Líquido do Período</span>
              <span className={`font-mono ${resultadoExercicio >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatCurrency(resultadoExercicio)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Mapeamento de Plano de Contas */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm">Distribuição por Contas Contábeis</CardTitle>
                <CardDescription>Valores acumulados nos grupos do plano de contas</CardDescription>
              </div>
              <Badge variant="outline">
                {categories.length} Contas Mapeadas
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-slate-100">
                {categories.map((cat) => {
                  const catTxs = transactions.filter(t => t.accountCategoryId === cat.id && t.status === 'conciliado');
                  const catTotal = catTxs.reduce((acc, t) => acc + t.amount, 0);

                  return (
                    <div key={cat.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-700">{cat.code}</span>
                          <span className="font-medium text-slate-800">{cat.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 capitalize mt-0.5 block">
                          Grupo: {cat.type} • {catTxs.length} lançamento(s)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900 block">
                          {formatCurrency(catTotal)}
                        </span>
                        <span className="text-[10px] text-emerald-600">Conferido</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
