import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { WebsiteConfig } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId') || 'org-contabil-alpha';

  const web = db.getWebsite(tenantId);
  return NextResponse.json(web);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantId = body.tenantId || 'org-contabil-alpha';

    const updatedWeb: WebsiteConfig = {
      ...body,
      tenantId,
      id: body.id || `web-${Date.now()}`,
    };

    db.saveWebsite(updatedWeb);

    db.logAuditEvent({
      id: `aud-${Date.now()}`,
      tenantId,
      userId: 'usr-admin-1',
      userName: 'Carlos Mendes',
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
