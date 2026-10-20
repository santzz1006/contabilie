import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const tenantId = body.tenantId || 'org-contabil-alpha';

    const txs = db.getBankTransactions(tenantId);
    const existing = txs.find(t => t.id === id);

    if (!existing) {
      return NextResponse.json({ error: 'Transação não encontrada.' }, { status: 404 });
    }

    let updatedStatus = existing.status;
    if (body.action === 'aprovar') updatedStatus = 'conciliado';
    else if (body.action === 'divergente') updatedStatus = 'divergente';
    else if (body.action === 'rejeitar') updatedStatus = 'pendente';

    const updated = {
      ...existing,
      status: updatedStatus,
      accountCategoryId: body.categoryId || existing.accountCategoryId,
      reviewedBy: 'usr-analista-1',
      reviewedAt: new Date().toISOString(),
    };

    db.saveBankTransaction(updated);

    db.logAuditEvent({
      id: `aud-${Date.now()}`,
      tenantId,
      userId: 'usr-analista-1',
      userName: 'Guilherme Siqueira',
      action: 'REVISAR_TRANSACAO_BANCARIA',
      resource: 'Conciliação Bancária',
      details: `Lançamento ${existing.description} (${existing.amount}) marcado como ${updatedStatus}.`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
