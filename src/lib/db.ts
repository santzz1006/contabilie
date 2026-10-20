import fs from 'fs';
import path from 'path';
import type {
  Organization,
  User,
  Client,
  DocumentRequest,
  DocumentItem,
  BankAccount,
  BankTransaction,
  AccountCategory,
  Certificate,
  TaxSimulation,
  TaskItem,
  WebsiteConfig,
  AuditEvent,
  NotificationItem
} from './types.ts';

interface DatabaseSchema {
  organizations: Organization[];
  users: User[];
  clients: Client[];
  documentRequests: DocumentRequest[];
  documents: DocumentItem[];
  bankAccounts: BankAccount[];
  bankTransactions: BankTransaction[];
  accountCategories: AccountCategory[];
  certificates: Certificate[];
  taxSimulations: TaxSimulation[];
  tasks: TaskItem[];
  websites: WebsiteConfig[];
  auditEvents: AuditEvent[];
  notifications: NotificationItem[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'store.json');

const INITIAL_TENANT_ID = 'org-contabil-alpha';

const INITIAL_DATA: DatabaseSchema = {
  organizations: [
    {
      id: INITIAL_TENANT_ID,
      name: 'Alpha Contabilidade & Consultoria Tributária',
      cnpj: '12.345.678/0001-90',
      email: 'contato@alphacontabil.com.br',
      phone: '(11) 3456-7890',
      plan: 'profissional',
      status: 'active',
      createdAt: '2026-01-15T09:00:00Z',
    },
    {
      id: 'org-contabil-beta',
      name: 'Beta Serviços Contábeis',
      cnpj: '98.765.432/0001-10',
      email: 'gestao@betacontabil.com.br',
      phone: '(21) 2345-6789',
      plan: 'inicial',
      status: 'active',
      createdAt: '2026-02-01T10:00:00Z',
    }
  ],
  users: [
    {
      id: 'usr-admin-1',
      tenantId: INITIAL_TENANT_ID,
      name: 'Carlos Mendes',
      email: 'carlos@alphacontabil.com.br',
      role: 'admin',
      active: true,
    },
    {
      id: 'usr-gestor-1',
      tenantId: INITIAL_TENANT_ID,
      name: 'Renata Albuquerque',
      email: 'renata@alphacontabil.com.br',
      role: 'manager',
      active: true,
    },
    {
      id: 'usr-analista-1',
      tenantId: INITIAL_TENANT_ID,
      name: 'Guilherme Siqueira',
      email: 'guilherme@alphacontabil.com.br',
      role: 'analyst',
      active: true,
    },
    {
      id: 'usr-assistente-1',
      tenantId: INITIAL_TENANT_ID,
      name: 'Camila Torres',
      email: 'camila@alphacontabil.com.br',
      role: 'assistant',
      active: true,
    },
    {
      id: 'usr-cliente-1',
      tenantId: INITIAL_TENANT_ID,
      name: 'Fernando Rocha (Diretor)',
      email: 'fernando@techsolutions.com.br',
      role: 'client',
      clientId: 'cli-tech-1',
      active: true,
    }
  ],
  clients: [
    {
      id: 'cli-tech-1',
      tenantId: INITIAL_TENANT_ID,
      name: 'TechSolutions Desenvolvimento de Software Ltda',
      tradeName: 'TechSolutions Software',
      cnpj: '23.456.789/0001-01',
      taxRegime: 'simples',
      email: 'financeiro@techsolutions.com.br',
      phone: '(11) 98765-4321',
      responsibleUserId: 'usr-analista-1',
      status: 'active',
      city: 'São Paulo',
      state: 'SP',
      createdAt: '2026-01-20T14:30:00Z',
    },
    {
      id: 'cli-varejo-2',
      tenantId: INITIAL_TENANT_ID,
      name: 'Comércio de Alimentos Bom Sabor Eireli',
      tradeName: 'Supermercado Bom Sabor',
      cnpj: '34.567.890/0001-12',
      taxRegime: 'presumido',
      email: 'contabil@bomsabor.com.br',
      phone: '(11) 97654-3210',
      responsibleUserId: 'usr-gestor-1',
      status: 'active',
      city: 'Campinas',
      state: 'SP',
      createdAt: '2026-02-10T11:00:00Z',
    },
    {
      id: 'cli-clinica-3',
      tenantId: INITIAL_TENANT_ID,
      name: 'Clínica Médica Integrada Nova Vida S/S',
      tradeName: 'Clínica Nova Vida',
      cnpj: '45.678.901/0001-23',
      taxRegime: 'presumido',
      email: 'adm@clinicanovavida.med.br',
      phone: '(11) 96543-2109',
      responsibleUserId: 'usr-analista-1',
      status: 'active',
      city: 'São Paulo',
      state: 'SP',
      createdAt: '2026-03-01T09:15:00Z',
    }
  ],
  documentRequests: [
    {
      id: 'req-doc-101',
      tenantId: INITIAL_TENANT_ID,
      clientId: 'cli-tech-1',
      competence: '2026-10',
      category: 'extrato',
      title: 'Extrato Bancário Itaú Conta Corrente (PDF e OFX)',
      description: 'Extrato bancário consolidado com todos os lançamentos do mês de Outubro/2026.',
      dueDate: '2026-11-05',
      status: 'recebido',
      assignedToUserId: 'usr-analista-1',
      createdAt: '2026-10-01T08:00:00Z',
    },
    {
      id: 'req-doc-102',
      tenantId: INITIAL_TENANT_ID,
      clientId: 'cli-tech-1',
      competence: '2026-10',
      category: 'fiscal',
      title: 'Notas Fiscais de Serviços Prestados (NFS-e)',
      description: 'Relatório das notas emitidas na prefeitura de São Paulo no período.',
      dueDate: '2026-11-08',
      status: 'em_analise',
      assignedToUserId: 'usr-analista-1',
      createdAt: '2026-10-01T08:00:00Z',
    },
    {
      id: 'req-doc-103',
      tenantId: INITIAL_TENANT_ID,
      clientId: 'cli-varejo-2',
      competence: '2026-10',
      category: 'folha',
      title: 'Comprovantes de Pagamento de Salários e Pró-labore',
      description: 'Comprovantes bancários de transferência referentes aos proventos da folha.',
      dueDate: '2026-11-07',
      status: 'solicitado',
      assignedToUserId: 'usr-assistente-1',
      createdAt: '2026-10-01T08:00:00Z',
    }
  ],
  documents: [
    {
      id: 'doc-file-01',
      tenantId: INITIAL_TENANT_ID,
      requestId: 'req-doc-101',
      clientId: 'cli-tech-1',
      competence: '2026-10',
      category: 'extrato',
      fileName: 'Extrato_Itau_ContaCorrente_102026.ofx',
      fileUrl: '/uploads/Extrato_Itau_ContaCorrente_102026.ofx',
      fileSize: 42150,
      fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      mimeType: 'application/x-ofx',
      uploadedAt: '2026-10-18T16:20:00Z',
      uploadedBy: 'usr-cliente-1',
      status: 'recebido',
      version: 1,
    },
    {
      id: 'doc-file-02',
      tenantId: INITIAL_TENANT_ID,
      requestId: 'req-doc-102',
      clientId: 'cli-tech-1',
      competence: '2026-10',
      category: 'fiscal',
      fileName: 'Relatorio_NFSe_Outubro2026.pdf',
      fileUrl: '/uploads/Relatorio_NFSe_Outubro2026.pdf',
      fileSize: 184500,
      fileHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
      mimeType: 'application/pdf',
      uploadedAt: '2026-10-19T10:05:00Z',
      uploadedBy: 'usr-cliente-1',
      status: 'em_analise',
      version: 1,
    }
  ],
  bankAccounts: [
    {
      id: 'bank-acc-1',
      tenantId: INITIAL_TENANT_ID,
      clientId: 'cli-tech-1',
      bankName: 'Banco Itaú Unibanco',
      agencyNumber: '0450',
      accountNumber: '98765-4',
    }
  ],
  bankTransactions: [
    {
      id: 'tx-01',
      tenantId: INITIAL_TENANT_ID,
      clientId: 'cli-tech-1',
      bankAccountId: 'bank-acc-1',
      date: '2026-10-05',
      description: 'PIX RECEBIDO CLIENTE XYZ TECNOLOGIA',
      amount: 15400.00,
      type: 'credit',
      status: 'conciliado',
      matchedEntryId: 'nfse-2026-089',
      matchConfidence: 98,
      matchReason: 'Valor exato e CNPJ do pagador idêntico à NFSe 89',
      accountCategoryId: 'cat-rec-serv',
      reviewedBy: 'usr-analista-1',
      reviewedAt: '2026-10-19T11:00:00Z',
    },
    {
      id: 'tx-02',
      tenantId: INITIAL_TENANT_ID,
      clientId: 'cli-tech-1',
      bankAccountId: 'bank-acc-1',
      date: '2026-10-08',
      description: 'PGTO ELETRONICO TARIFA MANUTENCAO CONTA',
      amount: 89.90,
      type: 'debit',
      status: 'conciliado',
      matchedEntryId: 'regra-tarifa-bancaria',
      matchConfidence: 95,
      matchReason: 'Padrão recorrente de despesa bancária cadastrado',
      accountCategoryId: 'cat-desp-banc',
      reviewedBy: 'usr-analista-1',
      reviewedAt: '2026-10-19T11:02:00Z',
    },
    {
      id: 'tx-03',
      tenantId: INITIAL_TENANT_ID,
      clientId: 'cli-tech-1',
      bankAccountId: 'bank-acc-1',
      date: '2026-10-12',
      description: 'TRANSF PIX ENVIADO SILVA ENGENHARIA LTDA',
      amount: 4500.00,
      type: 'debit',
      status: 'pendente',
      matchConfidence: 65,
      matchReason: 'Sugerido fornecedor prestador de serviços de infraestrutura',
      accountCategoryId: 'cat-desp-serv',
    },
    {
      id: 'tx-04',
      tenantId: INITIAL_TENANT_ID,
      clientId: 'cli-tech-1',
      bankAccountId: 'bank-acc-1',
      date: '2026-10-15',
      description: 'TED RECEBIDA CREDITO INDEVIDO / ESTORNO',
      amount: 1200.00,
      type: 'credit',
      status: 'divergente',
      matchConfidence: 20,
      matchReason: 'Sem correspondência em vendas emitidas; necessária conferência manual',
    }
  ],
  accountCategories: [
    { id: 'cat-rec-serv', tenantId: INITIAL_TENANT_ID, code: '3.1.01.01', name: 'Receita de Serviços Prestados de Software', type: 'receita' },
    { id: 'cat-desp-banc', tenantId: INITIAL_TENANT_ID, code: '4.1.03.02', name: 'Despesas com Tarifas e Serviços Bancários', type: 'despesa' },
    { id: 'cat-desp-serv', tenantId: INITIAL_TENANT_ID, code: '4.1.02.05', name: 'Serviços Prestados por Terceiros PJ', type: 'despesa' },
    { id: 'cat-desp-folha', tenantId: INITIAL_TENANT_ID, code: '4.1.01.01', name: 'Salários e Encargos da Folha', type: 'despesa' },
    { id: 'cat-ativo-banco', tenantId: INITIAL_TENANT_ID, code: '1.1.01.02', name: 'Bancos Conta Movimento', type: 'ativo' },
  ],
  certificates: [
    {
      id: 'cnd-01',
      tenantId: INITIAL_TENANT_ID,
      clientId: 'cli-tech-1',
      type: 'federal',
      title: 'Certidão de Débitos Tributários Federais e PGFN',
      issuingAgency: 'Receita Federal do Brasil / PGFN',
      status: 'valida',
      validityDate: '2026-12-15',
      lastCheckedAt: '2026-10-15T04:00:00Z',
      nextCheckAt: '2026-11-15T04:00:00Z',
      protocolNumber: 'RFB-2026-9923847-A',
      observations: 'Certidão Negativa emitida sem pendências.',
      requiresManualAssistance: false,
    },
    {
      id: 'cnd-02',
      tenantId: INITIAL_TENANT_ID,
      clientId: 'cli-tech-1',
      type: 'fgts',
      title: 'Certificado de Regularidade do FGTS (CRF)',
      issuingAgency: 'Caixa Econômica Federal',
      status: 'proxima_vencimento',
      validityDate: '2026-10-28',
      lastCheckedAt: '2026-10-18T05:30:00Z',
      nextCheckAt: '2026-10-25T05:30:00Z',
      protocolNumber: 'CRF-SP-20261018-091',
      observations: 'Vencimento em menos de 10 dias. Agendamento prioritário ativado.',
      requiresManualAssistance: false,
    },
    {
      id: 'cnd-03',
      tenantId: INITIAL_TENANT_ID,
      clientId: 'cli-varejo-2',
      type: 'estadual',
      title: 'Certidão Negativa de Débitos Estaduais (ICMS)',
      issuingAgency: 'SEFAZ - Secretaria da Fazenda de São Paulo',
      status: 'erro_consulta',
      lastCheckedAt: '2026-10-19T06:00:00Z',
      nextCheckAt: '2026-10-21T06:00:00Z',
      observations: 'Portal da SEFAZ exigiu desafio CAPTCHA gráfico. Utilize a consulta manual assistida.',
      requiresManualAssistance: true,
    },
    {
      id: 'cnd-04',
      tenantId: INITIAL_TENANT_ID,
      clientId: 'cli-clinica-3',
      type: 'trabalhista',
      title: 'Certidão Negativa de Débitos Trabalhistas (CNDT)',
      issuingAgency: 'Tribunal Superior do Trabalho - TST',
      status: 'valida',
      validityDate: '2027-01-20',
      lastCheckedAt: '2026-10-10T03:00:00Z',
      nextCheckAt: '2026-11-10T03:00:00Z',
      protocolNumber: 'CNDT-2026-00449102-3',
      observations: 'Inexistência de débitos trabalhistas perante a Justiça do Trabalho.',
      requiresManualAssistance: false,
    }
  ],
  taxSimulations: [
    {
      id: 'sim-01',
      tenantId: INITIAL_TENANT_ID,
      clientId: 'cli-tech-1',
      title: 'Simulação 2026/2027 — Desenvolvimento de Software',
      activityDescription: 'Desenvolvimento de programas de computador sob encomenda (CNAE 6201-5/01)',
      cnaeCode: '6201-5/01',
      annualRevenue: 600000.00,
      monthlyPayroll: 18000.00,
      anexoSimples: 'III',
      lucroPresumidoMargem: 0.32,
      ruleVersion: 'v2026.3',
      effectiveDate: '2026-01-01',
      results: {
        simplesNacional: {
          effectiveRate: 8.85,
          monthlyTax: 4425.00,
          annualTax: 53100.00,
          fatorR: 0.36,
          anexoUtilizado: 'Anexo III (Fator R superior a 28%)',
          notes: [
            'Fator R apurado em 36,00%, permitindo tributação no Anexo III em vez do Anexo V.',
            'Economia estimada relevante em relação à tributação padrão do Anexo V.'
          ]
        },
        lucroPresumido: {
          irpj: 28800.00,
          csll: 17280.00,
          pis: 3900.00,
          cofins: 18000.00,
          totalRate: 11.33,
          monthlyTax: 5665.00,
          annualTax: 67980.00,
          notes: [
            'Presunção IRPJ 32% (alíquota 15% + adicional 10% sobre excedente trimestral).',
            'Presunção CSLL 32% (alíquota 9%). PIS 0,65% e COFINS 3% cumulativos.'
          ]
        },
        recommendedRegime: 'Simples Nacional',
        estimatedAnnualSavings: 14880.00,
      },
      createdAt: '2026-10-15T14:00:00Z',
      createdBy: 'usr-gestor-1',
    }
  ],
  tasks: [
    {
      id: 'task-01',
      tenantId: INITIAL_TENANT_ID,
      clientId: 'cli-tech-1',
      title: 'Transmissão da DCTFWeb de Outubro/2026',
      description: 'Validar dados do eSocial e EFD-Reinf antes da transmissão oficial.',
      category: 'fiscal',
      dueDate: '2026-11-15',
      priority: 'alta',
      status: 'pendente',
      assignedToUserId: 'usr-analista-1',
      isRecurring: true,
      recurrenceRule: 'mensal-dia-15',
      createdAt: '2026-10-01T08:00:00Z',
    },
    {
      id: 'task-02',
      tenantId: INITIAL_TENANT_ID,
      clientId: 'cli-tech-1',
      title: 'Emissão e Envio da Guia DAS do Simples Nacional',
      description: 'Calcular o PGDAS-D e encaminhar a guia de pagamento ao portal do cliente.',
      category: 'fiscal',
      dueDate: '2026-11-20',
      priority: 'alta',
      status: 'pendente',
      assignedToUserId: 'usr-analista-1',
      isRecurring: true,
      recurrenceRule: 'mensal-dia-20',
      createdAt: '2026-10-01T08:00:00Z',
    },
    {
      id: 'task-03',
      tenantId: INITIAL_TENANT_ID,
      clientId: 'cli-varejo-2',
      title: 'Conciliação dos Cupons Fiscais e EFD ICMS/IPI',
      description: 'Conferir relatórios de redução Z com as notas fiscais de entrada.',
      category: 'fiscal',
      dueDate: '2026-11-10',
      priority: 'media',
      status: 'em_andamento',
      assignedToUserId: 'usr-gestor-1',
      isRecurring: true,
      recurrenceRule: 'mensal-dia-10',
      createdAt: '2026-10-01T08:00:00Z',
    },
    {
      id: 'task-04',
      tenantId: INITIAL_TENANT_ID,
      clientId: 'cli-clinica-3',
      title: 'Fechamento da Folha e Pró-Labore Médicos',
      description: 'Lançamento de plantões e cálculo das guias previdenciárias.',
      category: 'pessoal',
      dueDate: '2026-11-06',
      priority: 'urgente',
      status: 'em_andamento',
      assignedToUserId: 'usr-assistente-1',
      isRecurring: true,
      recurrenceRule: 'mensal-dia-06',
      createdAt: '2026-10-01T08:00:00Z',
    }
  ],
  websites: [
    {
      id: 'web-alpha-1',
      tenantId: INITIAL_TENANT_ID,
      siteName: 'Alpha Contabilidade & Gestão Empresarial',
      tagline: 'Inteligência tributária e contabilidade consultiva para pequenas e médias empresas',
      templateId: 'executive',
      primaryColor: '#059669',
      contactEmail: 'atendimento@alphacontabil.com.br',
      contactPhone: '(11) 3456-7890',
      contactWhatsapp: '11987654321',
      address: 'Avenida Paulista, 1500, Bela Vista, São Paulo - SP',
      aboutUs: 'Há mais de 15 anos transformando números em estratégias de crescimento sustentável para empresas inovadoras.',
      services: [
        {
          id: 'srv-01',
          title: 'Planejamento Tributário',
          description: 'Análise minuciosa de regimes fiscais para reduzir a carga tributária em total conformidade legal.',
          icon: 'Calculator'
        },
        {
          id: 'srv-02',
          title: 'Contabilidade Consultiva',
          description: 'Demonstrativos e relatórios de DRE e fluxo de caixa explicados para a tomada de decisões da diretoria.',
          icon: 'TrendingUp'
        },
        {
          id: 'srv-03',
          title: 'Gestão de Folha e RH',
          description: 'Processamento de folha de pagamento, pró-labore e envio de todas as obrigações do eSocial.',
          icon: 'Users'
        },
        {
          id: 'srv-04',
          title: 'Abertura e Regularização de Empresas',
          description: 'Processo ágil e desburocratizado para constituir sua empresa em poucos dias.',
          icon: 'Briefcase'
        }
      ],
      customDomain: 'www.alphacontabil.com.br',
      published: true,
      lastPublishedAt: '2026-10-18T10:00:00Z',
      leadCaptureCount: 14,
    }
  ],
  auditEvents: [
    {
      id: 'aud-01',
      tenantId: INITIAL_TENANT_ID,
      userId: 'usr-admin-1',
      userName: 'Carlos Mendes',
      action: 'LOGIN',
      resource: 'Sessão de Usuário',
      details: 'Autenticação com perfil Administrador realizada com sucesso.',
      ipAddress: '189.120.45.10',
      timestamp: '2026-10-20T08:15:00Z',
    },
    {
      id: 'aud-02',
      tenantId: INITIAL_TENANT_ID,
      userId: 'usr-analista-1',
      userName: 'Guilherme Siqueira',
      action: 'CONCILIACAO_APROVADA',
      resource: 'Extrato Bancário',
      details: 'Conciliação de transação bancária PIX RECEBIDO aprovada com categoria 3.1.01.01.',
      ipAddress: '189.120.45.12',
      timestamp: '2026-10-19T11:00:00Z',
    },
    {
      id: 'aud-03',
      tenantId: INITIAL_TENANT_ID,
      userId: 'usr-cliente-1',
      userName: 'Fernando Rocha',
      action: 'UPLOAD_DOCUMENTO',
      resource: 'Documento Extrato',
      details: 'Envio do arquivo Extrato_Itau_ContaCorrente_102026.ofx via Portal do Cliente.',
      ipAddress: '177.80.12.94',
      timestamp: '2026-10-18T16:20:00Z',
    }
  ],
  notifications: [
    {
      id: 'notif-01',
      tenantId: INITIAL_TENANT_ID,
      channel: 'email',
      recipient: 'financeiro@techsolutions.com.br',
      title: 'Documentos Solicitados - Competência 10/2026',
      message: 'Olá, Fernando. Os documentos da competência de Outubro/2026 já estão disponíveis para upload no seu portal.',
      status: 'enviado',
      createdAt: '2026-10-01T09:00:00Z',
    },
    {
      id: 'notif-02',
      tenantId: INITIAL_TENANT_ID,
      channel: 'whatsapp',
      recipient: '+5511987654321',
      title: 'Lembrete de Vencimento de Certidão FGTS',
      message: 'Alpha Contabilidade informa: o certificado de regularidade do FGTS vencerá em 28/10/2026. Nossa equipe já está acompanhando a renovação.',
      status: 'enviado',
      createdAt: '2026-10-18T09:30:00Z',
    }
  ]
};

// Database class managing atomic persistence and multi-tenant scoping
class DatabaseStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      const dataDir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        if (!fileContent || !fileContent.trim()) {
          return JSON.parse(JSON.stringify(INITIAL_DATA));
        }
        try {
          return JSON.parse(fileContent);
        } catch (parseErr) {
          console.warn('Aviso: store.json corrompido ou vazio. Restaurando dados iniciais.');
          return JSON.parse(JSON.stringify(INITIAL_DATA));
        }
      } else {
        this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
        this.persist();
        return this.data;
      }
    } catch (error) {
      console.error('Erro ao ler ou inicializar banco de dados:', error);
      return JSON.parse(JSON.stringify(INITIAL_DATA));
    }
  }

  private persist(): void {
    try {
      const dataDir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const tempPath = `${DB_FILE_PATH}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      try {
        fs.renameSync(tempPath, DB_FILE_PATH);
      } catch {
        fs.copyFileSync(tempPath, DB_FILE_PATH);
        try { fs.unlinkSync(tempPath); } catch {}
      }
    } catch (error) {
      console.error('Erro ao persistir banco de dados:', error);
    }
  }

  // Multi-tenant scoped repositories
  getTenant(tenantId: string): Organization | undefined {
    return this.data.organizations.find(o => o.id === tenantId);
  }

  getAllTenants(): Organization[] {
    return [...this.data.organizations];
  }

  getUsers(tenantId: string): User[] {
    return this.data.users.filter(u => u.tenantId === tenantId);
  }

  getUserById(userId: string): User | undefined {
    return this.data.users.find(u => u.id === userId);
  }

  getClients(tenantId: string): Client[] {
    return this.data.clients.filter(c => c.tenantId === tenantId);
  }

  getClientById(tenantId: string, clientId: string): Client | undefined {
    return this.data.clients.find(c => c.tenantId === tenantId && c.id === clientId);
  }

  saveClient(client: Client): Client {
    const index = this.data.clients.findIndex(c => c.tenantId === client.tenantId && c.id === client.id);
    if (index >= 0) {
      this.data.clients[index] = client;
    } else {
      this.data.clients.push(client);
    }
    this.persist();
    return client;
  }

  getDocumentRequests(tenantId: string, clientId?: string): DocumentRequest[] {
    return this.data.documentRequests.filter(r => 
      r.tenantId === tenantId && (!clientId || r.clientId === clientId)
    );
  }

  saveDocumentRequest(req: DocumentRequest): DocumentRequest {
    const index = this.data.documentRequests.findIndex(r => r.tenantId === req.tenantId && r.id === req.id);
    if (index >= 0) {
      this.data.documentRequests[index] = req;
    } else {
      this.data.documentRequests.push(req);
    }
    this.persist();
    return req;
  }

  getDocuments(tenantId: string, clientId?: string): DocumentItem[] {
    return this.data.documents.filter(d => 
      d.tenantId === tenantId && (!clientId || d.clientId === clientId)
    );
  }

  saveDocument(doc: DocumentItem): DocumentItem {
    const index = this.data.documents.findIndex(d => d.tenantId === doc.tenantId && d.id === doc.id);
    if (index >= 0) {
      this.data.documents[index] = doc;
    } else {
      this.data.documents.push(doc);
    }
    this.persist();
    return doc;
  }

  getBankTransactions(tenantId: string, clientId?: string): BankTransaction[] {
    return this.data.bankTransactions.filter(t => 
      t.tenantId === tenantId && (!clientId || t.clientId === clientId)
    );
  }

  saveBankTransaction(tx: BankTransaction): BankTransaction {
    const index = this.data.bankTransactions.findIndex(t => t.tenantId === tx.tenantId && t.id === tx.id);
    if (index >= 0) {
      this.data.bankTransactions[index] = tx;
    } else {
      this.data.bankTransactions.push(tx);
    }
    this.persist();
    return tx;
  }

  saveBankTransactionsBulk(txs: BankTransaction[]): void {
    for (const tx of txs) {
      const index = this.data.bankTransactions.findIndex(t => t.tenantId === tx.tenantId && t.id === tx.id);
      if (index >= 0) {
        this.data.bankTransactions[index] = tx;
      } else {
        this.data.bankTransactions.push(tx);
      }
    }
    this.persist();
  }

  getAccountCategories(tenantId: string): AccountCategory[] {
    return this.data.accountCategories.filter(c => c.tenantId === tenantId);
  }

  getCertificates(tenantId: string, clientId?: string): Certificate[] {
    return this.data.certificates.filter(c => 
      c.tenantId === tenantId && (!clientId || c.clientId === clientId)
    );
  }

  saveCertificate(cert: Certificate): Certificate {
    const index = this.data.certificates.findIndex(c => c.tenantId === cert.tenantId && c.id === cert.id);
    if (index >= 0) {
      this.data.certificates[index] = cert;
    } else {
      this.data.certificates.push(cert);
    }
    this.persist();
    return cert;
  }

  getTaxSimulations(tenantId: string): TaxSimulation[] {
    return this.data.taxSimulations.filter(s => s.tenantId === tenantId);
  }

  saveTaxSimulation(sim: TaxSimulation): TaxSimulation {
    const index = this.data.taxSimulations.findIndex(s => s.tenantId === sim.tenantId && s.id === sim.id);
    if (index >= 0) {
      this.data.taxSimulations[index] = sim;
    } else {
      this.data.taxSimulations.push(sim);
    }
    this.persist();
    return sim;
  }

  getTasks(tenantId: string, clientId?: string): TaskItem[] {
    return this.data.tasks.filter(t => 
      t.tenantId === tenantId && (!clientId || t.clientId === clientId)
    );
  }

  saveTask(task: TaskItem): TaskItem {
    const index = this.data.tasks.findIndex(t => t.tenantId === task.tenantId && t.id === task.id);
    if (index >= 0) {
      this.data.tasks[index] = task;
    } else {
      this.data.tasks.push(task);
    }
    this.persist();
    return task;
  }

  getWebsite(tenantId: string): WebsiteConfig | undefined {
    return this.data.websites.find(w => w.tenantId === tenantId);
  }

  saveWebsite(web: WebsiteConfig): WebsiteConfig {
    const index = this.data.websites.findIndex(w => w.tenantId === web.tenantId);
    if (index >= 0) {
      this.data.websites[index] = web;
    } else {
      this.data.websites.push(web);
    }
    this.persist();
    return web;
  }

  getAuditEvents(tenantId: string): AuditEvent[] {
    return this.data.auditEvents.filter(a => a.tenantId === tenantId);
  }

  logAuditEvent(event: AuditEvent): void {
    this.data.auditEvents.unshift(event);
    if (this.data.auditEvents.length > 500) {
      this.data.auditEvents = this.data.auditEvents.slice(0, 500);
    }
    this.persist();
  }

  getNotifications(tenantId: string): NotificationItem[] {
    return this.data.notifications.filter(n => n.tenantId === tenantId);
  }

  saveNotification(item: NotificationItem): void {
    this.data.notifications.unshift(item);
    this.persist();
  }
}

export const db = new DatabaseStore();
