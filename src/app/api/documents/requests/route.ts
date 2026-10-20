import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DocumentRequest } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId') || 'org-contabil-alpha';
  const clientId = searchParams.get('clientId') || undefined;

  const requests = db.getDocumentRequests(tenantId, clientId);
  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantId = body.tenantId || 'org-contabil-alpha';

    const newRequest: DocumentRequest = {
      id: `req-doc-${Date.now()}`,
      tenantId,
      clientId: body.clientId,
      competence: body.competence || '2026-10',
      category: body.category || 'extrato',
      title: body.title,
      description: body.description || '',
      dueDate: body.dueDate,
      status: 'solicitado',
      assignedToUserId: body.assignedToUserId || 'usr-analista-1',
      createdAt: new Date().toISOString(),
    };

    db.saveDocumentRequest(newRequest);

    db.logAuditEvent({
      id: `aud-${Date.now()}`,
      tenantId,
      userId: 'usr-admin-1',
      userName: 'Carlos Mendes',
      action: 'CRIAR_SOLICITACAO_DOCUMENTO',
      resource: 'Solicitação de Documento',
      details: `Solicitação criada: "${newRequest.title}" para o cliente ${newRequest.clientId} na competência ${newRequest.competence}.`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
