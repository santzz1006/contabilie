import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { NotificationItem } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = request.headers.get('x-contabilis-tenant') || '';

  const notifs = db.getNotifications(tenantId);
  return NextResponse.json(notifs);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantId = request.headers.get('x-contabilis-tenant') || '';

    if (!['email', 'whatsapp', 'portal'].includes(body.channel) || typeof body.recipient !== 'string' || !body.recipient.trim() || typeof body.message !== 'string' || !body.message.trim()) {
      return NextResponse.json({ error: 'Informe um canal, destinatário e mensagem válidos.' }, { status: 400 });
    }

    const item: NotificationItem = {
      id: `notif-${Date.now()}`,
      tenantId,
      channel: body.channel || 'whatsapp',
      recipient: body.recipient,
      title: body.title,
      message: body.message,
      status: 'preparada',
      createdAt: new Date().toISOString(),
    };

    db.saveNotification(item);

    db.logAuditEvent({
      id: `aud-${Date.now()}`,
      tenantId,
      userId: request.headers.get('x-contabilis-user') || '',
      userName: db.getUserById(request.headers.get('x-contabilis-user') || '')?.name || 'Usu?rio',
      action: 'PREPARAR_NOTIFICACAO',
      resource: 'Central de Notificações',
      details: `Mensagem preparada via ${item.channel.toUpperCase()} para ${item.recipient}. O envio deve ser confirmado no aplicativo conectado.`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
