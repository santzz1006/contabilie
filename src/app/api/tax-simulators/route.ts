import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { TaxSimulation } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId') || 'org-contabil-alpha';

  const sims = db.getTaxSimulations(tenantId);
  return NextResponse.json(sims);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantId = body.tenantId || 'org-contabil-alpha';

    const newSim: TaxSimulation = {
      id: `sim-${Date.now()}`,
      tenantId,
      clientId: body.clientId,
      title: body.title || 'Simulação Tributária',
      activityDescription: body.activityDescription,
      cnaeCode: body.cnaeCode || '6201-5/01',
      annualRevenue: body.annualRevenue,
      monthlyPayroll: body.monthlyPayroll,
      anexoSimples: body.anexoSimples || 'III',
      lucroPresumidoMargem: body.lucroPresumidoMargem || 0.32,
      ruleVersion: body.ruleVersion || 'v2026.1',
      effectiveDate: body.effectiveDate || '2026-01-01',
      results: body.results,
      createdAt: new Date().toISOString(),
      createdBy: 'usr-gestor-1',
    };

    db.saveTaxSimulation(newSim);

    db.logAuditEvent({
      id: `aud-${Date.now()}`,
      tenantId,
      userId: 'usr-gestor-1',
      userName: 'Renata Albuquerque',
      action: 'SALVAR_SIMULACAO_TRIBUTARIA',
      resource: 'Simulador Fiscal',
      details: `Simulação "${newSim.title}" salva com economia estimada de R$ ${newSim.results.estimatedAnnualSavings.toFixed(2)}.`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(newSim, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
