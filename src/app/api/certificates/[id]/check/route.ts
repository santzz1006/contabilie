import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { evaluateCertificateStatus } from '@/lib/cnd-engine';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = 'org-contabil-alpha';

    const certs = db.getCertificates(tenantId);
    const existing = certs.find(c => c.id === id);

    if (!existing) {
      return NextResponse.json({ error: 'Certidão não encontrada.' }, { status: 404 });
    }

    // Se exige assistência manual, não simula emissão falsa (regra expressa do PDF)
    if (existing.requiresManualAssistance) {
      return NextResponse.json({
        error: 'Esta fonte oficial exige validação por CAPTCHA. Utilize a consulta manual assistida.'
      }, { status: 400 });
    }

    // Simula renovação oficial de fontes automatizadas suportadas (RFB / TST / FGTS)
    const newValidityDate = '2027-02-15';
    const newStatus = evaluateCertificateStatus(newValidityDate);

    const updated = {
      ...existing,
      status: newStatus,
      lastCheckedAt: new Date().toISOString(),
      nextCheckAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      protocolNumber: `AUT-${Date.now().toString().substring(6)}`,
      observations: 'Certidão verificada com sucesso perante a base oficial.',
    };

    db.saveCertificate(updated);

    db.logAuditEvent({
      id: `aud-${Date.now()}`,
      tenantId,
      userId: 'usr-analista-1',
      userName: 'Guilherme Siqueira',
      action: 'CONSULTA_CND_OFICIAL',
      resource: 'Certidões',
      details: `Verificação de ${updated.title} concluída com estado ${updated.status}.`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
