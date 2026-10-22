import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const tenantId = request.headers.get('x-contabilis-tenant') || '';

    const tasks = db.getTasks(tenantId);
    const existing = tasks.find(t => t.id === id);

    if (!existing) {
      return NextResponse.json({ error: 'Tarefa não encontrada.' }, { status: 404 });
    }

    const updated = {
      ...existing,
      status: body.status || existing.status,
    };

    db.saveTask(updated);

    db.logAuditEvent({
      id: `aud-${Date.now()}`,
      tenantId,
      userId: request.headers.get('x-contabilis-user') || '',
      userName: db.getUserById(request.headers.get('x-contabilis-user') || '')?.name || 'Usu?rio',
      action: 'ATUALIZAR_STATUS_TAREFA',
      resource: 'Obrigações e Tarefas',
      details: `Tarefa "${updated.title}" alterada para "${updated.status}".`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
