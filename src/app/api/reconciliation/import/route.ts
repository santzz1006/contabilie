import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseCSVStatement, parseOFXStatement, matchBankTransaction } from '@/lib/reconciliation-engine';
import { BankTransaction } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const clientId = formData.get('clientId') as string || 'cli-tech-1';
    const tenantId = formData.get('tenantId') as string || 'org-contabil-alpha';

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

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
        bankAccountId: 'bank-acc-1',
        date: item.date,
        description: item.description,
        amount: item.amount,
        type: item.type,
      });

      const tx: BankTransaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        tenantId,
        clientId,
        bankAccountId: 'bank-acc-1',
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
      userId: 'usr-analista-1',
      userName: 'Guilherme Siqueira',
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
