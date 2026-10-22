import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = request.headers.get('x-contabilis-tenant') || '';

    const certs = db.getCertificates(tenantId);
    const existing = certs.find(c => c.id === id);

    if (!existing) {
      return NextResponse.json({ error: 'Certidão não encontrada.' }, { status: 404 });
    }

    return NextResponse.json({
      error: existing.requiresManualAssistance
        ? 'Este portal exige validação manual. Consulte a certidão no site do órgão e registre o resultado em Consulta manual.'
        : 'A consulta automática ainda não está conectada ao portal emissor. Nenhum dado foi alterado. Use Consulta manual para registrar o resultado real.',
      provider: existing.issuingAgency,
    }, { status: 503 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
