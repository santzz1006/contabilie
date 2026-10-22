import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { evaluateCertificateStatus } from '@/lib/cnd-engine';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const tenantId = request.headers.get('x-contabilis-tenant') || '';

    const certs = db.getCertificates(tenantId);
    const existing = certs.find(c => c.id === id);

    if (!existing) {
      return NextResponse.json({ error: 'Certidão não encontrada.' }, { status: 404 });
    }

    const newStatus = evaluateCertificateStatus(body.validityDate);

    const updated = {
      ...existing,
      status: newStatus,
      validityDate: body.validityDate,
      protocolNumber: body.protocolNumber,
      lastCheckedAt: new Date().toISOString(),
      nextCheckAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      observations: body.observations || 'Consulta manual assistida registrada com sucesso.',
    };

    db.saveCertificate(updated);

    db.logAuditEvent({
      id: `aud-${Date.now()}`,
      tenantId,
      userId: request.headers.get('x-contabilis-user') || '',
      userName: db.getUserById(request.headers.get('x-contabilis-user') || '')?.name || 'Usu?rio',
      action: 'REGISTRO_MANUAL_CND',
      resource: 'Certidões',
      details: `Registro manual de ${updated.title}. Protocolo: ${updated.protocolNumber}, Validade: ${updated.validityDate}.`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
