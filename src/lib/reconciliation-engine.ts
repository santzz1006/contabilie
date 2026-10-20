import type { BankTransaction } from './types.ts';

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  rawId?: string;
}

export interface ParseResult {
  success: boolean;
  transactions: ParsedTransaction[];
  totalCredits: number;
  totalDebits: number;
  errors: string[];
}

export function parseCSVStatement(csvContent: string): ParseResult {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  const transactions: ParsedTransaction[] = [];
  const errors: string[] = [];
  let totalCredits = 0;
  let totalDebits = 0;

  if (lines.length < 2) {
    return {
      success: false,
      transactions: [],
      totalCredits: 0,
      totalDebits: 0,
      errors: ['Arquivo CSV não contém linhas de lançamentos válidas.'],
    };
  }

  // Detect header or start from line 1
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Pular cabeçalho comum
    if (i === 0 && (line.toLowerCase().includes('data') || line.toLowerCase().includes('date') || line.toLowerCase().includes('historico'))) {
      continue;
    }

    const cols = line.split(/[;,]/).map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length < 3) continue;

    // Formatos esperados:
    // [Data, Descricao, Valor] ou [Data, Historico, Documento, Valor]
    let dateStr = cols[0];
    let desc = cols[1];
    let valStr = cols[cols.length - 1];

    // Tratar datas DD/MM/AAAA ou AAAA-MM-DD
    let normalizedDate = dateStr;
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          normalizedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        } else {
          normalizedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
    }

    // Normalizar valor BRL (1.234,56 ou -1234.56)
    let cleanVal = valStr.replace(/\s+/g, '').replace('R$', '');
    let isNegative = cleanVal.startsWith('-') || cleanVal.endsWith('-');
    cleanVal = cleanVal.replace('-', '');

    if (cleanVal.includes(',') && cleanVal.includes('.')) {
      cleanVal = cleanVal.replace(/\./g, '').replace(',', '.');
    } else if (cleanVal.includes(',')) {
      cleanVal = cleanVal.replace(',', '.');
    }

    const numVal = parseFloat(cleanVal);
    if (isNaN(numVal)) {
      errors.push(`Linha ${i + 1}: valor numérico inválido "${valStr}"`);
      continue;
    }

    const type: 'credit' | 'debit' = isNegative ? 'debit' : 'credit';
    const finalAmount = Math.abs(numVal);

    if (type === 'credit') totalCredits += finalAmount;
    else totalDebits += finalAmount;

    transactions.push({
      date: normalizedDate,
      description: desc.toUpperCase(),
      amount: finalAmount,
      type,
    });
  }

  return {
    success: transactions.length > 0,
    transactions,
    totalCredits,
    totalDebits,
    errors,
  };
}

export function parseOFXStatement(ofxContent: string): ParseResult {
  const transactions: ParsedTransaction[] = [];
  const errors: string[] = [];
  let totalCredits = 0;
  let totalDebits = 0;

  try {
    const stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
    let match;

    while ((match = stmtTrnRegex.exec(ofxContent)) !== null) {
      const block = match[1];

      const trnType = (block.match(/<TRNTYPE>([^\r\n<]+)/i)?.[1] || '').trim().toUpperCase();
      const dtPosted = (block.match(/<DTPOSTED>([^\r\n<]+)/i)?.[1] || '').trim();
      const trnAmt = (block.match(/<TRNAMT>([^\r\n<]+)/i)?.[1] || '').trim();
      const memo = (block.match(/<MEMO>([^\r\n<]+)/i)?.[1] || block.match(/<NAME>([^\r\n<]+)/i)?.[1] || 'LANCAMENTO SEM HISTORICO').trim();
      const fitId = (block.match(/<FITID>([^\r\n<]+)/i)?.[1] || '').trim();

      let date = dtPosted.substring(0, 8);
      if (date.length === 8) {
        date = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
      }

      const numVal = parseFloat(trnAmt.replace(',', '.'));
      if (isNaN(numVal)) continue;

      const isDebit = numVal < 0 || trnType === 'DEBIT';
      const absAmount = Math.abs(numVal);

      if (isDebit) totalDebits += absAmount;
      else totalCredits += absAmount;

      transactions.push({
        date,
        description: memo.toUpperCase(),
        amount: absAmount,
        type: isDebit ? 'debit' : 'credit',
        rawId: fitId,
      });
    }

    return {
      success: transactions.length > 0,
      transactions,
      totalCredits,
      totalDebits,
      errors: transactions.length === 0 ? ['Nenhum bloco <STMTTRN> válido encontrado no arquivo OFX.'] : [],
    };
  } catch (err: any) {
    return {
      success: false,
      transactions: [],
      totalCredits: 0,
      totalDebits: 0,
      errors: [`Erro ao processar arquivo OFX: ${err.message}`],
    };
  }
}

// Matching engine with rule-based heuristics and explainable confidence scoring
export function matchBankTransaction(tx: Omit<BankTransaction, 'id' | 'status'>): {
  status: 'pendente' | 'conciliado' | 'divergente';
  confidence: number;
  reason: string;
  suggestedCategory: string;
} {
  const desc = tx.description.toUpperCase();

  // 1. Regras de Tarifas e Bancos
  if (desc.includes('TARIFA') || desc.includes('MANUT') || desc.includes('IOF') || desc.includes('ENCARG')) {
    return {
      status: 'conciliado',
      confidence: 96,
      reason: 'Padrão bancário recorrente identificado (tarifas e encargos bancários)',
      suggestedCategory: 'cat-desp-banc',
    };
  }

  // 2. Recebimentos PIX / Vendas / Clientes
  if (tx.type === 'credit' && (desc.includes('PIX RECEBIDO') || desc.includes('CLIENTE') || desc.includes('VENDA') || desc.includes('FATURA'))) {
    return {
      status: 'conciliado',
      confidence: 92,
      reason: 'Entrada operacional compatível com recebimento de clientes ou serviços',
      suggestedCategory: 'cat-rec-serv',
    };
  }

  // 3. Pagamentos de Folha e Salários
  if (tx.type === 'debit' && (desc.includes('SALARIO') || desc.includes('FOLHA') || desc.includes('PRO-LABORE') || desc.includes('FGTS'))) {
    return {
      status: 'conciliado',
      confidence: 94,
      reason: 'Lançamento identificado como remuneração ou encargo de folha de pagamento',
      suggestedCategory: 'cat-desp-folha',
    };
  }

  // 4. Pagamentos a Prestadores e Serviços
  if (tx.type === 'debit' && (desc.includes('SERVICO') || desc.includes('LTDA') || desc.includes('ENGENHARIA') || desc.includes('CONSULT'))) {
    return {
      status: 'pendente',
      confidence: 68,
      reason: 'Identificado fornecedor terceiro prestador de serviços. Requer aprovação contábil.',
      suggestedCategory: 'cat-desp-serv',
    };
  }

  // 5. Transações sem padrão claro (fila de exceções / divergentes)
  return {
    status: 'divergente',
    confidence: 25,
    reason: 'Sem correspondência automática confiável no histórico. Necessária revisão humana.',
    suggestedCategory: 'cat-desp-serv',
  };
}
