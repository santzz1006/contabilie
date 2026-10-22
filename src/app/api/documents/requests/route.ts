import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DocumentRequest } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = request.headers.get('x-contabilis-tenant') || '';
  const clientId = request.headers.get('x-contabilis-role') === 'client'
    ? request.headers.get('x-contabilis-client') || undefined
    : searchParams.get('clientId') || undefined;

  const requests = db.getDocumentRequests(tenantId, clientId);
  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantId = request.headers.get('x-contabilis-tenant') || '';
    if (request.headers.get('x-contabilis-role') === 'client') return NextResponse.json({ error: 'Clientes não podem criar solicitações.' }, { status: 403 });
    if (!db.getClientById(tenantId, body.clientId)) return NextResponse.json({ error: 'Cliente não encontrado neste escritório.' }, { status: 404 });
    if (typeof body.title !== 'string' || !body.title.trim() || typeof body.dueDate !== 'string' || Number.isNaN(Date.parse(body.dueDate))) return NextResponse.json({ error: 'Informe o título e um prazo válido.' }, { status: 400 });

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
      assignedToUserId: body.assignedToUserId || request.headers.get('x-contabilis-user') || '',
      createdAt: new Date().toISOString(),
    };

    db.saveDocumentRequest(newRequest);

    db.logAuditEvent({
      id: `aud-${Date.now()}`,
      tenantId,
      userId: request.headers.get('x-contabilis-user') || '',
      userName: db.getUserById(request.headers.get('x-contabilis-user') || '')?.name || 'Usu?rio',
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
