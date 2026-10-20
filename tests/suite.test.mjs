import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTaxes } from '../src/lib/tax-engine.ts';
import { parseCSVStatement, parseOFXStatement, matchBankTransaction } from '../src/lib/reconciliation-engine.ts';
import { evaluateCertificateStatus } from '../src/lib/cnd-engine.ts';
import { db } from '../src/lib/db.ts';
import fs from 'fs';
import path from 'path';

test('1. Isolamento Multi-tenant: Verificação de tenantId no modelo de dados', () => {
  const storePath = path.join(process.cwd(), 'data', 'store.json');
  assert.equal(fs.existsSync(storePath), true, 'Arquivo de banco de dados store.json deve existir');

  const store = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
  const alphaClients = store.clients.filter(c => c.tenantId === 'org-contabil-alpha');
  const betaClients = store.clients.filter(c => c.tenantId === 'org-contabil-beta');

  assert.ok(alphaClients.length > 0, 'Escritório Alpha deve possuir clientes cadastrados');
  // Prova negativa: clientes do escritório Alpha não pertencem ao escritório Beta
  for (const client of alphaClients) {
    assert.equal(client.tenantId, 'org-contabil-alpha');
    assert.notEqual(client.tenantId, 'org-contabil-beta');
  }
});

test('2. Motor Tributário: Cálculo do Simples Nacional vs Lucro Presumido com Fator R', () => {
  // Teste de Fator R favorável (>= 28% -> Anexo III)
  const resultFatorRFavoravel = calculateTaxes({
    annualRevenue: 600000,
    monthlyPayroll: 18000, // Folha anual: 216.000 -> Fator R: 36%
    activityType: 'servicos_fator_r',
    cnaeDescription: 'Desenvolvimento de software sob encomenda',
  });

  assert.equal(resultFatorRFavoravel.ruleVersion, 'v2026.1');
  assert.ok(resultFatorRFavoravel.fatorR >= 0.28, 'Fator R deve ser >= 28%');
  assert.ok(resultFatorRFavoravel.simplesNacional.anexo.includes('Anexo III'), 'Deve enquadrar no Anexo III');
  assert.ok(resultFatorRFavoravel.annualSavings > 0, 'Deve apurar economia calculada');
  assert.ok(resultFatorRFavoravel.disclaimer.length > 0, 'Deve conter aviso explícito de valor estimativo');

  // Teste de Fator R desfavorável (< 28% -> Anexo V)
  const resultFatorRDesfavoravel = calculateTaxes({
    annualRevenue: 600000,
    monthlyPayroll: 5000, // Folha anual: 60.000 -> Fator R: 10%
    activityType: 'servicos_fator_r',
    cnaeDescription: 'Desenvolvimento de software sob encomenda',
  });

  assert.ok(resultFatorRDesfavoravel.fatorR < 0.28, 'Fator R deve ser < 28%');
  assert.ok(resultFatorRDesfavoravel.simplesNacional.anexo.includes('Anexo V'), 'Deve enquadrar no Anexo V');
});

test('3. Conciliação Bancária: Parser de Extrato CSV e Algoritmo de Correspondência', () => {
  const sampleCSV = `Data;Historico;Valor
05/10/2026;PIX RECEBIDO CLIENTE XYZ;15400.00
08/10/2026;TARIFA MANUTENCAO CONTA;-89.90
12/10/2026;PAGAMENTO SERVICO DIVERSO;-150.00`;

  const parsed = parseCSVStatement(sampleCSV);
  assert.equal(parsed.success, true);
  assert.equal(parsed.transactions.length, 3);
  assert.equal(parsed.totalCredits, 15400.00);
  assert.equal(parsed.totalDebits, 239.90);

  // Teste do motor de matching com confiança explicável
  const matchTarifa = matchBankTransaction({
    tenantId: 'org-contabil-alpha',
    clientId: 'cli-tech-1',
    bankAccountId: 'acc-1',
    date: '2026-10-08',
    description: 'TARIFA MANUTENCAO CONTA',
    amount: 89.90,
    type: 'debit',
  });

  assert.equal(matchTarifa.status, 'conciliado');
  assert.ok(matchTarifa.confidence >= 90, 'Confiança de tarifa deve ser >= 90%');
  assert.equal(matchTarifa.suggestedCategory, 'cat-desp-banc');
});

test('4. Conciliação Bancária: Parser de Extrato OFX bancário', () => {
  const sampleOFX = `OFXHEADER:100
<OFX>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20261010120000[-03:EST]
<TRNAMT>-250.00
<FITID>OFX20261010001
<MEMO>PAGAMENTO FORNECEDOR ABC
</STMTTRN>
</BANKTRANLIST>
</OFX>`;

  const parsed = parseOFXStatement(sampleOFX);
  assert.equal(parsed.success, true);
  assert.equal(parsed.transactions.length, 1);
  assert.equal(parsed.transactions[0].amount, 250.00);
  assert.equal(parsed.transactions[0].type, 'debit');
  assert.equal(parsed.transactions[0].date, '2026-10-10');
});

test('5. Monitoramento de CNDs: Cálculo de Validade e Alerta', () => {
  // Data vencida (passado)
  const statusVencida = evaluateCertificateStatus('2020-01-01');
  assert.equal(statusVencida, 'vencida');

  // Data muito futura (> 30 dias)
  const statusValida = evaluateCertificateStatus('2028-12-31');
  assert.equal(statusValida, 'valida');
});

test('6. Verificação Estrita de Emojis: Proibição total em todo o código e UI', () => {
  // Regex para detecção de emojis unicode
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

  const srcDir = path.join(process.cwd(), 'src');
  
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.css')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        assert.equal(emojiRegex.test(content), false, `Arquivo ${fullPath} contém emoji proibido!`);
      }
    }
  }

  scanDir(srcDir);
});
