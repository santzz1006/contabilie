import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId') || 'org-contabil-alpha';

  const org = db.getTenant(tenantId);
  return NextResponse.json(org);
}
