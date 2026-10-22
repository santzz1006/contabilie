import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = request.headers.get('x-contabilis-tenant') || '';
  const clientId = request.headers.get('x-contabilis-role') === 'client'
    ? request.headers.get('x-contabilis-client') || undefined
    : searchParams.get('clientId') || undefined;

  const docs = db.getDocuments(tenantId, clientId);
  return NextResponse.json(docs);
}
