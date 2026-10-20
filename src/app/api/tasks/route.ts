import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { TaskItem } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId') || 'org-contabil-alpha';
  const clientId = searchParams.get('clientId') || undefined;

  const tasks = db.getTasks(tenantId, clientId);
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantId = body.tenantId || 'org-contabil-alpha';

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      tenantId,
      clientId: body.clientId || undefined,
      title: body.title,
      description: body.description || '',
      category: body.category || 'fiscal',
      dueDate: body.dueDate,
      priority: body.priority || 'media',
      status: 'pendente',
      assignedToUserId: 'usr-analista-1',
      isRecurring: body.isRecurring ?? false,
      recurrenceRule: body.isRecurring ? `mensal-dia-${body.dueDate.split('-')[2]}` : undefined,
      createdAt: new Date().toISOString(),
    };

    db.saveTask(newTask);

    db.logAuditEvent({
      id: `aud-${Date.now()}`,
      tenantId,
      userId: 'usr-admin-1',
      userName: 'Carlos Mendes',
      action: 'CRIAR_TAREFA_OBRIGACAO',
      resource: 'Obrigações e Tarefas',
      details: `Tarefa criada: "${newTask.title}" com prazo em ${newTask.dueDate}.`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
