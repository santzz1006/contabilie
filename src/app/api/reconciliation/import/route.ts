import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseCSVStatement, parseOFXStatement, matchBankTransaction } from '@/lib/reconciliation-engine';
import { BankTransaction } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const requestedClientId = formData.get('clientId') as string | null;
    const sessionClientId = request.headers.get('x-contabilis-client');
    const clientId = sessionClientId || requestedClientId || '';
    const userId = request.headers.get('x-contabilis-user') || '';
    const user = db.getUserById(userId);
    const tenantId = request.headers.get('x-contabilis-tenant') || '';

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }
    if (!tenantId || !clientId || !user) return NextResponse.json({ error: 'Selecione um cliente válido.' }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'O arquivo excede o limite de 10 MB.' }, { status: 413 });
    if (!db.getClientById(tenantId, clientId)) return NextResponse.json({ error: 'Cliente não encontrado neste escritório.' }, { status: 404 });

    const content = await file.text();
    const fileName = file.name.toLowerCase();

    let parseResult;
    if (fileName.endsWith('.ofx')) {
      parseResult = parseOFXStatement(content);
    } else {
      parseResult = parseCSVStatement(content);
    }

    if (!parseResult.success) {
      return NextResponse.json({
        error: parseResult.errors.join(' | ') || 'Não foi possível extrair lançamentos do extrato.'
      }, { status: 400 });
    }

    // Criar transações com regras de correspondência
    const createdTransactions: BankTransaction[] = [];
    for (const item of parseResult.transactions) {
      const match = matchBankTransaction({
        tenantId,
        clientId,
        bankAccountId: 'imported-statement',
        date: item.date,
        description: item.description,
        amount: item.amount,
        type: item.type,
      });

      const tx: BankTransaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        tenantId,
        clientId,
        bankAccountId: 'imported-statement',
        date: item.date,
        description: item.description,
        amount: item.amount,
        type: item.type,
        status: match.status,
        matchConfidence: match.confidence,
        matchReason: match.reason,
        accountCategoryId: match.suggestedCategory,
      };

      createdTransactions.push(tx);
    }

    db.saveBankTransactionsBulk(createdTransactions);

    db.logAuditEvent({
      id: `aud-${Date.now()}`,
      tenantId,
      userId,
      userName: user.name,
      action: 'IMPORTAR_EXTRATO_BANCARIO',
      resource: 'Conciliação Bancária',
      details: `Arquivo ${file.name} processado. ${createdTransactions.length} lançamentos adicionados para a empresa ${clientId}.`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      count: createdTransactions.length,
      totalCredits: parseResult.totalCredits,
      totalDebits: parseResult.totalDebits,
      transactions: createdTransactions,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
