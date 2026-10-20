import type { Certificate, CertificateType, CertificateStatus } from './types.ts';

export interface OfficialPortalLink {
  type: CertificateType;
  agencyName: string;
  portalUrl: string;
  notes: string;
  supportsDirectAPI: boolean;
  requiresCaptcha: boolean;
}

export const OFFICIAL_PORTALS: Record<CertificateType, OfficialPortalLink> = {
  federal: {
    type: 'federal',
    agencyName: 'Receita Federal do Brasil / PGFN',
    portalUrl: 'https://solucoes.receita.fazenda.gov.br/Servicos/certidaointernet/pj/emitir',
    notes: 'Emissão oficial de Certidão de Débitos Relativos a Créditos Tributários Federais e à Dívida Ativa da União.',
    supportsDirectAPI: true,
    requiresCaptcha: false,
  },
  fgts: {
    type: 'fgts',
    agencyName: 'Caixa Econômica Federal',
    portalUrl: 'https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf',
    notes: 'Certificado de Regularidade do FGTS (CRF). Consulta pública por CNPJ com verificação periódica.',
    supportsDirectAPI: true,
    requiresCaptcha: false,
  },
  trabalhista: {
    type: 'trabalhista',
    agencyName: 'Tribunal Superior do Trabalho (TST)',
    portalUrl: 'https://www.tst.jus.br/certidao',
    notes: 'Certidão Negativa de Débitos Trabalhistas (CNDT).',
    supportsDirectAPI: true,
    requiresCaptcha: false,
  },
  estadual: {
    type: 'estadual',
    agencyName: 'Secretaria da Fazenda Estadual (SEFAZ)',
    portalUrl: 'https://www.fazenda.sp.gov.br',
    notes: 'Certidão Negativa de Débitos Tributários Estaduais. A maioria dos estados exige desafio de verificação de segurança.',
    supportsDirectAPI: false,
    requiresCaptcha: true,
  },
  municipal: {
    type: 'municipal',
    agencyName: 'Secretaria Municipal de Finanças / Prefeitura',
    portalUrl: 'https://duc.prefeitura.sp.gov.br',
    notes: 'Certidão de Tributos Mobiliários e Imobiliários municipais.',
    supportsDirectAPI: false,
    requiresCaptcha: true,
  },
};

export function evaluateCertificateStatus(validityDate?: string): CertificateStatus {
  if (!validityDate) return 'pendente';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expDate = new Date(validityDate);
  expDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'vencida';
  if (diffDays <= 15) return 'proxima_vencimento';
  return 'valida';
}
