export interface TaxEngineInput {
  annualRevenue: number;
  monthlyPayroll: number;
  activityType: 'servicos_fator_r' | 'servicos_gerais' | 'comercio' | 'industria';
  cnaeDescription: string;
}

export interface TaxEngineResult {
  ruleVersion: string;
  effectiveDate: string;
  disclaimer: string;
  inputs: TaxEngineInput;
  fatorR: number;
  fatorRPercent: string;
  simplesNacional: {
    anexo: string;
    effectiveRate: number;
    monthlyTax: number;
    annualTax: number;
    breakdown: string[];
  };
  lucroPresumido: {
    presumedMarginRate: number;
    irpj: number;
    csll: number;
    pis: number;
    cofins: number;
    cppEstimada: number;
    totalRate: number;
    monthlyTax: number;
    annualTax: number;
    breakdown: string[];
  };
  recommendedRegime: 'Simples Nacional' | 'Lucro Presumido';
  annualSavings: number;
  summaryText: string;
}

export function calculateTaxes(input: TaxEngineInput): TaxEngineResult {
  const ruleVersion = 'v2026.1';
  const effectiveDate = '2026-01-01';
  const disclaimer = 'Aviso legal: Este cálculo possui finalidade estritamente estimativa e comparativa. Não substitui o planejamento e a apuração contábil oficial realizada pelo contador responsável.';

  const annualPayroll = input.monthlyPayroll * 12;
  const fatorR = input.annualRevenue > 0 ? annualPayroll / input.annualRevenue : 0;
  const fatorRPercent = (fatorR * 100).toFixed(2) + '%';

  // 1. Simples Nacional
  let anexo = 'Anexo III';
  let nominalRate = 0.06;
  let deduction = 0;

  if (input.activityType === 'comercio') {
    anexo = 'Anexo I';
    if (input.annualRevenue <= 180000) {
      nominalRate = 0.04;
      deduction = 0;
    } else if (input.annualRevenue <= 360000) {
      nominalRate = 0.073;
      deduction = 5940;
    } else if (input.annualRevenue <= 720000) {
      nominalRate = 0.095;
      deduction = 13860;
    } else {
      nominalRate = 0.107;
      deduction = 22500;
    }
  } else if (input.activityType === 'servicos_fator_r') {
    if (fatorR >= 0.28) {
      anexo = 'Anexo III (Fator R favorável >= 28%)';
      if (input.annualRevenue <= 180000) {
        nominalRate = 0.06;
        deduction = 0;
      } else if (input.annualRevenue <= 360000) {
        nominalRate = 0.112;
        deduction = 9360;
      } else if (input.annualRevenue <= 720000) {
        nominalRate = 0.135;
        deduction = 17640;
      } else {
        nominalRate = 0.16;
        deduction = 35640;
      }
    } else {
      anexo = 'Anexo V (Fator R < 28%)';
      if (input.annualRevenue <= 180000) {
        nominalRate = 0.155;
        deduction = 0;
      } else if (input.annualRevenue <= 360000) {
        nominalRate = 0.18;
        deduction = 4500;
      } else if (input.annualRevenue <= 720000) {
        nominalRate = 0.195;
        deduction = 9900;
      } else {
        nominalRate = 0.205;
        deduction = 17100;
      }
    }
  } else {
    // servicos gerais (Anexo III)
    anexo = 'Anexo III';
    if (input.annualRevenue <= 180000) {
      nominalRate = 0.06;
      deduction = 0;
    } else if (input.annualRevenue <= 360000) {
      nominalRate = 0.112;
      deduction = 9360;
    } else if (input.annualRevenue <= 720000) {
      nominalRate = 0.135;
      deduction = 17640;
    } else {
      nominalRate = 0.16;
      deduction = 35640;
    }
  }

  // Aliquota efetiva = ((RBT12 * Aliquota Nominal) - Parcela a Deduzir) / RBT12
  const effectiveSimplesRate = input.annualRevenue > 0
    ? ((input.annualRevenue * nominalRate) - deduction) / input.annualRevenue
    : 0.06;

  const annualSimplesTax = input.annualRevenue * effectiveSimplesRate;
  const monthlySimplesTax = annualSimplesTax / 12;

  // 2. Lucro Presumido
  const presumedMargin = (input.activityType === 'comercio' || input.activityType === 'industria') ? 0.08 : 0.32;
  const presumedProfitAnnual = input.annualRevenue * presumedMargin;

  // IRPJ: 15% + adicional de 10% sobre o que exceder R$ 240.000 ao ano (R$ 20.000/mes)
  const baseIrpj = presumedProfitAnnual * 0.15;
  const excessProfit = Math.max(0, presumedProfitAnnual - 240000);
  const additionalIrpj = excessProfit * 0.10;
  const totalIrpj = baseIrpj + additionalIrpj;

  // CSLL: 9% sobre margem presumida (32% servicos ou 12% comercio)
  const csllMargin = presumedMargin === 0.08 ? 0.12 : 0.32;
  const totalCsll = (input.annualRevenue * csllMargin) * 0.09;

  // PIS (0.65%) e COFINS (3.00%) Cumulativos
  const totalPis = input.annualRevenue * 0.0065;
  const totalCofins = input.annualRevenue * 0.03;

  // CPP Patronal sobre Folha no Presumido (~28% sobre folha e encargos patronais)
  const cppPresumido = annualPayroll * 0.28;

  const annualPresumidoTax = totalIrpj + totalCsll + totalPis + totalCofins + cppPresumido;
  const monthlyPresumidoTax = annualPresumidoTax / 12;
  const effectivePresumidoRate = input.annualRevenue > 0 ? (annualPresumidoTax / input.annualRevenue) : 0;

  // Comparativo
  const simplesIsCheaper = annualSimplesTax <= annualPresumidoTax;
  const recommendedRegime = simplesIsCheaper ? 'Simples Nacional' : 'Lucro Presumido';
  const annualSavings = Math.abs(annualPresumidoTax - annualSimplesTax);

  const breakdownSimples = [
    `Enquadramento: ${anexo}`,
    `Alíquota Efetiva: ${(effectiveSimplesRate * 100).toFixed(2)}%`,
    `Fator R calculado: ${fatorRPercent} (Folha anual de R$ ${annualPayroll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / Receita de R$ ${input.annualRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`,
    'Tributos unificados em guia única (DAS), inclusive CPP patronal.',
  ];

  const breakdownPresumido = [
    `Margem de presunção adotada: ${(presumedMargin * 100).toFixed(0)}%`,
    `IRPJ Anual: R$ ${totalIrpj.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (15% base + R$ ${additionalIrpj.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} adicional)`,
    `CSLL Anual: R$ ${totalCsll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (9% sobre base presumida)`,
    `PIS (0,65%) + COFINS (3,00%): R$ ${(totalPis + totalCofins).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    `CPP Patronal estimada (INSS patronal 28% sobre folha): R$ ${cppPresumido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    `Alíquota Total Estimada: ${(effectivePresumidoRate * 100).toFixed(2)}%`,
  ];

  return {
    ruleVersion,
    effectiveDate,
    disclaimer,
    inputs: input,
    fatorR,
    fatorRPercent,
    simplesNacional: {
      anexo,
      effectiveRate: effectiveSimplesRate,
      monthlyTax: monthlySimplesTax,
      annualTax: annualSimplesTax,
      breakdown: breakdownSimples,
    },
    lucroPresumido: {
      presumedMarginRate: presumedMargin,
      irpj: totalIrpj,
      csll: totalCsll,
      pis: totalPis,
      cofins: totalCofins,
      cppEstimada: cppPresumido,
      totalRate: effectivePresumidoRate,
      monthlyTax: monthlyPresumidoTax,
      annualTax: annualPresumidoTax,
      breakdown: breakdownPresumido,
    },
    recommendedRegime,
    annualSavings,
    summaryText: `Com base nas premissas vigentes (${ruleVersion}), a opção mais econômica estimada é o ${recommendedRegime}, gerando uma economia aproximada de R$ ${annualSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ao ano.`,
  };
}
