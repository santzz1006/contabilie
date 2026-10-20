import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Client } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId') || 'org-contabil-alpha';

  const clients = db.getClients(tenantId);
  return NextResponse.json(clients);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantId = body.tenantId || 'org-contabil-alpha';

    const newClient: Client = {
      id: `cli-${Date.now()}`,
      tenantId,
      name: body.name,
      tradeName: body.tradeName || body.name,
      cnpj: body.cnpj,
      taxRegime: body.taxRegime || 'simples',
      email: body.email,
      phone: body.phone || '',
      responsibleUserId: body.responsibleUserId || 'usr-analista-1',
      status: 'active',
      city: body.city || 'São Paulo',
      state: body.state || 'SP',
      createdAt: new Date().toISOString(),
    };

    db.saveClient(newClient);

    db.logAuditEvent({
      id: `aud-${Date.now()}`,
      tenantId,
      userId: 'usr-admin-1',
      userName: 'Carlos Mendes',
      action: 'CRIAR_CLIENTE',
      resource: 'Cadastro de Cliente',
      details: `Cliente ${newClient.tradeName} (CNPJ ${newClient.cnpj}) cadastrado com sucesso.`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
