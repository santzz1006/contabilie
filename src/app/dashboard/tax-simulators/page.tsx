"use client";

import React, { useState, useEffect } from "react";
import {
  Calculator,
  TrendingDown,
  TrendingUp,
  FileCheck2,
  Sparkles,
  Building,
  Save,
  Info,
  DollarSign,
  AlertCircle,
  HelpCircle,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateTaxes, TaxEngineInput, TaxEngineResult } from "@/lib/tax-engine";
import { formatCurrency } from "@/lib/utils";
import { Client, TaxSimulation } from "@/lib/types";

export default function TaxSimulatorsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [savedSimulations, setSavedSimulations] = useState<TaxSimulation[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [simulationTitle, setSimulationTitle] = useState("Planejamento Tributário 2026/2027");

  // Inputs
  const [annualRevenue, setAnnualRevenue] = useState(480000);
  const [monthlyPayroll, setMonthlyPayroll] = useState(14000);
  const [activityType, setActivityType] = useState<TaxEngineInput['activityType']>('servicos_fator_r');
  const [cnaeDescription, setCnaeDescription] = useState('Serviços de Tecnologia da Informação e Consultoria');

  // Resultado
  const [result, setResult] = useState<TaxEngineResult | null>(null);

  const loadData = async () => {
    try {
      const [resClients, resSims] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/tax-simulators")
      ]);
      if (resClients.ok) setClients(await resClients.json());
      if (resSims.ok) setSavedSimulations(await resSims.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Recalcular dinamicamente
    const res = calculateTaxes({
      annualRevenue,
      monthlyPayroll,
      activityType,
      cnaeDescription,
    });
    setResult(res);
  }, [annualRevenue, monthlyPayroll, activityType, cnaeDescription]);

  const handleSaveSimulation = async () => {
    if (!result) return;

    try {
      const res = await fetch("/api/tax-simulators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId || undefined,
          title: simulationTitle,
          activityDescription: cnaeDescription,
          cnaeCode: "6201-5/01",
          annualRevenue,
          monthlyPayroll,
          anexoSimples: result.simplesNacional.anexo.includes('III') ? 'III' : 'V',
          lucroPresumidoMargem: result.lucroPresumido.presumedMarginRate,
          ruleVersion: result.ruleVersion,
          effectiveDate: result.effectiveDate,
          results: {
            simplesNacional: {
              effectiveRate: result.simplesNacional.effectiveRate * 100,
              monthlyTax: result.simplesNacional.monthlyTax,
              annualTax: result.simplesNacional.annualTax,
              fatorR: result.fatorR,
              anexoUtilizado: result.simplesNacional.anexo,
              notes: result.simplesNacional.breakdown,
            },
            lucroPresumido: {
              irpj: result.lucroPresumido.irpj,
              csll: result.lucroPresumido.csll,
              pis: result.lucroPresumido.pis,
              cofins: result.lucroPresumido.cofins,
              totalRate: result.lucroPresumido.totalRate * 100,
              monthlyTax: result.lucroPresumido.monthlyTax,
              annualTax: result.lucroPresumido.annualTax,
              notes: result.lucroPresumido.breakdown,
            },
            recommendedRegime: result.recommendedRegime,
            estimatedAnnualSavings: result.annualSavings,
          }
        }),
      });

      if (res.ok) {
        alert("Simulação e memória de cálculo salvas com sucesso!");
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Simulador e Comparador Tributário
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Comparativo de cenários entre Simples Nacional e Lucro Presumido com apuração de Fator R e regras vigentes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-xs py-1">
            <Sparkles className="h-3 w-3 mr-1 text-emerald-600" />
            <span>Versão das Regras: <strong>v2026.1</strong></span>
          </Badge>
        </div>
      </div>

      {/* Legal Disclaimer Box */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <Info className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800 block">Aviso Legal e Governança Tributária</span>
          <p className="mt-0.5 leading-relaxed">
            As projeções tributárias apresentadas abaixo são calculadas com base nas alíquotas da LC 123/2006 e normas vigentes de IRPJ/CSLL/PIS/COFINS. Os resultados possuem caráter <strong>estritamente estimativo e consultivo</strong> para apoio à decisão comercial, exigindo validação definitiva do contador técnico responsável antes de alterações cadastrais perante a Receita Federal.
          </p>
        </div>
      </div>

      {/* Main Two Column Form & Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Inputs & Premises (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Parâmetros do Cenário</CardTitle>
              <CardDescription>Defina os dados operacionais da empresa ou prospecto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vincular a Cliente Existente (Opcional)
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => {
                    setSelectedClientId(e.target.value);
                    const cl = clients.find(c => c.id === e.target.value);
                    if (cl) setSimulationTitle(`Planejamento Tributário - ${cl.tradeName}`);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">Novo Lead / Simulação Avulsa</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.tradeName} ({c.name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título da Simulação
                </label>
                <input
                  type="text"
                  value={simulationTitle}
                  onChange={(e) => setSimulationTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Atividade Econômica / CNAE
                </label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="servicos_fator_r">Serviços Sujeitos a Fator R (TI, Engenharia, Consultoria, Médicos)</option>
                  <option value="servicos_gerais">Serviços Gerais (Anexo III puro)</option>
                  <option value="comercio">Comércio Varejista / Atacadista (Anexo I)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Faturamento Bruto Anual (RBT12)
                  </label>
                  <span className="font-mono font-bold text-emerald-700 text-xs">
                    {formatCurrency(annualRevenue)}
                  </span>
                </div>
                <input
                  type="range"
                  min={60000}
                  max={4800000}
                  step={30000}
                  value={annualRevenue}
                  onChange={(e) => setAnnualRevenue(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>R$ 60 mil/ano</span>
                  <span>R$ 2,4 mi</span>
                  <span>R$ 4,8 mi/ano</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Folha de Pagamento Mensal + Pró-labore
                  </label>
                  <span className="font-mono font-bold text-emerald-700 text-xs">
                    {formatCurrency(monthlyPayroll)}/mês
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={150000}
                  step={2000}
                  value={monthlyPayroll}
                  onChange={(e) => setMonthlyPayroll(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>R$ 0</span>
                  <span>R$ 75 mil/mês</span>
                  <span>R$ 150 mil/mês</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleSaveSimulation}
                  className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-xs"
                >
                  <Save className="h-4 w-4" />
                  <span>Salvar Proposta no Histórico</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Comparative Results & Calculations (7 cols) */}
        {result && (
          <div className="lg:col-span-7 space-y-5">
            {/* Recommendation Highlight Banner */}
            <div className={`p-5 rounded-xl border flex items-center justify-between gap-4 ${
              result.recommendedRegime === 'Simples Nacional'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-sky-50 border-sky-200 text-sky-900'
            }`}>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider block opacity-75">
                  Regime Mais Vantajoso Estimado
                </span>
                <h3 className="text-xl font-bold mt-0.5">
                  {result.recommendedRegime}
                </h3>
                <p className="text-xs mt-1 leading-relaxed">
                  {result.summaryText}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs block text-slate-500">Economia Anual Prevista</span>
                <span className="text-xl font-mono font-extrabold text-emerald-700">
                  {formatCurrency(result.annualSavings)}
                </span>
              </div>
            </div>

            {/* Side-by-Side Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card Simples Nacional */}
              <Card className={result.recommendedRegime === 'Simples Nacional' ? 'border-2 border-emerald-500 shadow-sm' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Simples Nacional</CardTitle>
                    {result.recommendedRegime === 'Simples Nacional' && (
                      <Badge variant="success">Recomendado</Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs">
                    Guia Única (DAS)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 text-[11px] block">Imposto Estimado Mensal</span>
                    <span className="text-lg font-mono font-bold text-slate-900">
                      {formatCurrency(result.simplesNacional.monthlyTax)}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Alíquota Efetiva: <strong>{(result.simplesNacional.effectiveRate * 100).toFixed(2)}%</strong>
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-600">
                    <p className="font-semibold text-slate-800">
                      {result.simplesNacional.anexo}
                    </p>
                    <p>Fator R Apurado: <strong>{result.fatorRPercent}</strong></p>
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-slate-400 block">Total Tributário Anual:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {formatCurrency(result.simplesNacional.annualTax)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card Lucro Presumido */}
              <Card className={result.recommendedRegime === 'Lucro Presumido' ? 'border-2 border-sky-500 shadow-sm' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Lucro Presumido</CardTitle>
                    {result.recommendedRegime === 'Lucro Presumido' && (
                      <Badge variant="info">Recomendado</Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs">
                    Guias Separadas + CPP
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 text-[11px] block">Imposto Estimado Mensal</span>
                    <span className="text-lg font-mono font-bold text-slate-900">
                      {formatCurrency(result.lucroPresumido.monthlyTax)}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Alíquota Total Estimada: <strong>{(result.lucroPresumido.totalRate * 100).toFixed(2)}%</strong>
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-600">
                    <div className="flex justify-between">
                      <span>IRPJ Anual:</span>
                      <span className="font-mono">{formatCurrency(result.lucroPresumido.irpj)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CSLL Anual:</span>
                      <span className="font-mono">{formatCurrency(result.lucroPresumido.csll)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PIS + COFINS:</span>
                      <span className="font-mono">{formatCurrency(result.lucroPresumido.pis + result.lucroPresumido.cofins)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CPP Patronal (Folha):</span>
                      <span className="font-mono">{formatCurrency(result.lucroPresumido.cppEstimada)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between font-semibold text-slate-800">
                      <span>Total Anual:</span>
                      <span className="font-mono">{formatCurrency(result.lucroPresumido.annualTax)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Calculation Memory Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase text-slate-500 tracking-wider">
                  Memória de Cálculo e Fundamentação
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2 text-slate-600">
                <ul className="list-disc pl-4 space-y-1">
                  {result.simplesNacional.breakdown.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                  {result.lucroPresumido.breakdown.map((item, idx) => (
                    <li key={`lp-${idx}`}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
