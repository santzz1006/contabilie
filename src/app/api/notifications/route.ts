import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { NotificationItem } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId') || 'org-contabil-alpha';

  const notifs = db.getNotifications(tenantId);
  return NextResponse.json(notifs);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantId = body.tenantId || 'org-contabil-alpha';

    const item: NotificationItem = {
      id: `notif-${Date.now()}`,
      tenantId,
      channel: body.channel || 'whatsapp',
      recipient: body.recipient,
      title: body.title,
      message: body.message,
      status: 'enviado',
      createdAt: new Date().toISOString(),
    };

    db.saveNotification(item);

    db.logAuditEvent({
      id: `aud-${Date.now()}`,
      tenantId,
      userId: 'usr-admin-1',
      userName: 'Carlos Mendes',
      action: 'DISPARAR_NOTIFICACAO',
      resource: 'Central de Notificações',
      details: `Mensagem "${item.title}" disparada via ${item.channel.toUpperCase()} para ${item.recipient}.`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
