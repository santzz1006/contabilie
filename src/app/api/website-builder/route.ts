import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { WebsiteConfig } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = request.headers.get('x-contabilis-tenant') || '';

  const web = db.getWebsite(tenantId);
  return NextResponse.json(web);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantId = request.headers.get('x-contabilis-tenant') || '';

    const updatedWeb: WebsiteConfig = {
      ...body,
      tenantId,
      id: body.id || `web-${Date.now()}`,
    };

    db.saveWebsite(updatedWeb);

    db.logAuditEvent({
      id: `aud-${Date.now()}`,
      tenantId,
      userId: request.headers.get('x-contabilis-user') || '',
      userName: db.getUserById(request.headers.get('x-contabilis-user') || '')?.name || 'Usu?rio',
      action: 'PUBLICAR_SITE_CONTABIL',
      resource: 'Website Builder',
      details: `Site "${updatedWeb.siteName}" atualizado. Publicado: ${updatedWeb.published}.`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(updatedWeb);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
