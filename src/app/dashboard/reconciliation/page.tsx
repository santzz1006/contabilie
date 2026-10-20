"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeftRight,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileSpreadsheet,
  Check,
  X,
  Building,
  RotateCcw,
  Sparkles,
  DollarSign,
  Download,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { BankTransaction, Client, AccountCategory } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ReconciliationPage() {
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [categories, setCategories] = useState<AccountCategory[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("cli-tech-1");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<{ count: number; totalCredits: number; totalDebits: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("clientId", selectedClientId);

    try {
      const res = await fetch("/api/reconciliation/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setImportSummary({
          count: data.count,
          totalCredits: data.totalCredits,
          totalDebits: data.totalDebits,
        });
        await loadData();
      } else {
        alert(data.error || "Erro ao importar extrato.");
      }
    } catch (e) {
      console.error(e);
      alert("Falha na importação do arquivo.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleReviewTransaction = async (
    txId: string,
    action: "aprovar" | "divergente" | "rejeitar",
    categoryId?: string
  ) => {
    try {
      const res = await fetch(`/api/reconciliation/transactions/${txId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, categoryId }),
      });
      if (res.ok) {
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Totais
  const totalCredits = transactions.filter(t => t.type === 'credit').reduce((acc, t) => acc + t.amount, 0);
  const totalDebits = transactions.filter(t => t.type === 'debit').reduce((acc, t) => acc + t.amount, 0);
  const totalConciliated = transactions.filter(t => t.status === 'conciliado').length;
  const totalPending = transactions.filter(t => t.status === 'pendente').length;
  const totalDivergent = transactions.filter(t => t.status === 'divergente').length;

  const filteredTransactions = transactions.filter(t => {
    if (selectedFilter === "all") return true;
    return t.status === selectedFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Conciliação Bancária Assistida
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Importação de extratos OFX/CSV, correspondência sugerida com confiança explicável e conferência humana.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".ofx,.csv"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <UploadCloud className="h-4 w-4" />
            <span>{isImporting ? "Processando..." : "Importar Extrato (OFX/CSV)"}</span>
          </Button>
        </div>
      </div>

      {/* Select Client & Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-slate-500 uppercase tracking-wider">
              Empresa Selecionada
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg text-xs p-2 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.tradeName}</option>
              ))}
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-slate-500 uppercase tracking-wider">
              Total Entradas (Créditos)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-emerald-700">
              {formatCurrency(totalCredits)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Lançamentos a crédito no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-slate-500 uppercase tracking-wider">
              Total Saídas (Débitos)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-slate-800">
              {formatCurrency(totalDebits)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Pagamentos e tarifas debitadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs text-slate-500 uppercase tracking-wider">
              Status da Esteira
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-slate-900">{totalConciliated}</span>
              <span className="text-xs text-slate-500"> / {transactions.length}</span>
            </div>
            <div className="flex gap-1.5">
              <Badge variant="success">{totalConciliated} ok</Badge>
              <Badge variant="warning">{totalPending} pend</Badge>
              {totalDivergent > 0 && <Badge variant="destructive">{totalDivergent} div</Badge>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Alert after upload */}
      {importSummary && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-semibold block">Extrato bancário normalizado com sucesso!</span>
              <span>
                Foram importadas {importSummary.count} transações ({formatCurrency(importSummary.totalCredits)} em entradas e {formatCurrency(importSummary.totalDebits)} em saídas).
              </span>
            </div>
          </div>
          <button
            onClick={() => setImportSummary(null)}
            className="text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          {["all", "pendente", "conciliado", "divergente"].map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                selectedFilter === f
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f === "all" ? "Todos os Lançamentos" : f}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500">
          Mostrando {filteredTransactions.length} transações
        </div>
      </div>

      {/* Transactions Table */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="Nenhum lançamento bancário"
          description="Importe um arquivo OFX ou CSV do extrato da empresa para iniciar a conciliação."
          actionLabel="Importar Extrato"
          onAction={() => fileInputRef.current?.click()}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Descrição do Extrato</th>
                  <th className="py-3 px-4">Valor (BRL)</th>
                  <th className="py-3 px-4">Confiança da Sugestão</th>
                  <th className="py-3 px-4">Plano de Contas</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ação Contábil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => {
                  const category = categories.find(c => c.id === tx.accountCategoryId);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {formatDate(tx.date)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 max-w-xs">
                        <div className="truncate" title={tx.description}>
                          {tx.description}
                        </div>
                        {tx.matchReason && (
                          <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                            Motivo: {tx.matchReason}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold">
                        <span className={tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-800'}>
                          {tx.type === 'credit' ? '+' : '-'} {formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {tx.matchConfidence !== undefined ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full ${
                                  tx.matchConfidence >= 85 ? 'bg-emerald-500' :
                                  tx.matchConfidence >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${tx.matchConfidence}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] text-slate-500 font-medium">
                              {tx.matchConfidence}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={tx.accountCategoryId || ""}
                          onChange={(e) => handleReviewTransaction(tx.id, "aprovar", e.target.value)}
                          className="border border-slate-200 rounded p-1 text-[11px] bg-white text-slate-700 max-w-xs"
                        >
                          <option value="">Selecione categoria...</option>
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            tx.status === "conciliado" ? "success" :
                            tx.status === "divergente" ? "destructive" : "warning"
                          }
                          className="capitalize"
                        >
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {tx.status !== "conciliado" ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-[11px] gap-1 text-emerald-700 hover:bg-emerald-50 border-emerald-300"
                                onClick={() => handleReviewTransaction(tx.id, "aprovar", tx.accountCategoryId)}
                              >
                                <Check className="h-3 w-3" />
                                <span>Validar</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-[11px] gap-1 text-rose-600 hover:bg-rose-50 border-rose-300"
                                onClick={() => handleReviewTransaction(tx.id, "divergente")}
                              >
                                <AlertTriangle className="h-3 w-3" />
                                <span>Divergência</span>
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-[11px] text-slate-400 hover:text-slate-600"
                              onClick={() => handleReviewTransaction(tx.id, "rejeitar")}
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Reabrir</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
