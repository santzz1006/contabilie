import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = request.headers.get('x-contabilis-tenant') || '';

  const auditEvents = db.getAuditEvents(tenantId);
  return NextResponse.json(auditEvents);
}
