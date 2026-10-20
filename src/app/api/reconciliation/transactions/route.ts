import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId') || 'org-contabil-alpha';
  const clientId = searchParams.get('clientId') || undefined;

  const txs = db.getBankTransactions(tenantId, clientId);
  return NextResponse.json(txs);
}
