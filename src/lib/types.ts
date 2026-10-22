export type UserRole = 'admin' | 'manager' | 'analyst' | 'assistant' | 'client';

export type TaxRegime = 'simples' | 'presumido' | 'real' | 'mei';

export type DocumentStatus = 
  | 'solicitado' 
  | 'recebido' 
  | 'em_analise' 
  | 'precisa_correcao' 
  | 'aprovado' 
  | 'concluido';

export type DocumentCategory = 
  | 'extrato' 
  | 'fiscal' 
  | 'folha' 
  | 'contabil' 
  | 'outros';

export type CertificateType = 
  | 'federal' 
  | 'estadual' 
  | 'municipal' 
  | 'fgts' 
  | 'trabalhista';

export type CertificateStatus = 
  | 'valida' 
  | 'proxima_vencimento' 
  | 'vencida' 
  | 'pendente' 
  | 'indisponivel' 
  | 'erro_consulta';

export type TaskPriority = 'baixa' | 'media' | 'alta' | 'urgente';

export type TaskStatus = 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';

export interface Organization {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  plan: 'inicial' | 'profissional' | 'enterprise';
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  clientId?: string;
  active: boolean;
  avatarUrl?: string;
  passwordHash?: string;
}

export interface Client {
  id: string;
  tenantId: string;
  name: string;
  tradeName: string;
  cnpj: string;
  taxRegime: TaxRegime;
  email: string;
  phone: string;
  responsibleUserId: string;
  status: 'active' | 'inactive';
  city: string;
  state: string;
  createdAt: string;
}

export interface DocumentRequest {
  id: string;
  tenantId: string;
  clientId: string;
  competence: string; // Ex: "2026-10"
  category: DocumentCategory;
  title: string;
  description: string;
  dueDate: string;
  status: DocumentStatus;
  assignedToUserId: string;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  tenantId: string;
  requestId?: string;
  clientId: string;
  competence: string;
  category: DocumentCategory;
  fileName: string;
  fileUrl: string;
  fileSize: number; // bytes
  fileHash: string; // SHA-256
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  status: DocumentStatus;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  version: number;
}

export interface BankAccount {
  id: string;
  tenantId: string;
  clientId: string;
  bankName: string;
  accountNumber: string;
  agencyNumber: string;
}

export interface BankTransaction {
  id: string;
  tenantId: string;
  clientId: string;
  bankAccountId: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'pendente' | 'conciliado' | 'divergente' | 'ignorado';
  matchedEntryId?: string;
  matchConfidence?: number; // 0 a 100
  matchReason?: string;
  accountCategoryId?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface AccountCategory {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  type: 'ativo' | 'passivo' | 'receita' | 'despesa';
}

export interface Certificate {
  id: string;
  tenantId: string;
  clientId: string;
  type: CertificateType;
  title: string;
  issuingAgency: string;
  status: CertificateStatus;
  validityDate?: string;
  lastCheckedAt: string;
  nextCheckAt: string;
  protocolNumber?: string;
  observations?: string;
  requiresManualAssistance: boolean;
}

export interface TaxSimulation {
  id: string;
  tenantId: string;
  clientId?: string;
  title: string;
  activityDescription: string;
  cnaeCode: string;
  annualRevenue: number;
  monthlyPayroll: number;
  anexoSimples: 'I' | 'II' | 'III' | 'IV' | 'V';
  lucroPresumidoMargem: number; // Ex: 0.32 para servicos
  ruleVersion: string;
  effectiveDate: string;
  results: {
    simplesNacional: {
      effectiveRate: number;
      monthlyTax: number;
      annualTax: number;
      fatorR: number;
      anexoUtilizado: string;
      notes: string[];
    };
    lucroPresumido: {
      irpj: number;
      csll: number;
      pis: number;
      cofins: number;
      totalRate: number;
      monthlyTax: number;
      annualTax: number;
      notes: string[];
    };
    recommendedRegime: 'Simples Nacional' | 'Lucro Presumido';
    estimatedAnnualSavings: number;
  };
  createdAt: string;
  createdBy: string;
}

export interface TaskItem {
  id: string;
  tenantId: string;
  clientId?: string;
  title: string;
  description?: string;
  category: 'fiscal' | 'contabil' | 'pessoal' | 'societario' | 'atendimento';
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedToUserId: string;
  isRecurring: boolean;
  recurrenceRule?: string; // Ex: 'mensal-dia-20'
  createdAt: string;
}

export interface WebsiteConfig {
  id: string;
  tenantId: string;
  siteName: string;
  tagline: string;
  templateId: 'minimalist' | 'executive' | 'modern';
  primaryColor: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp: string;
  address: string;
  aboutUs: string;
  services: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
  }>;
  customDomain?: string;
  published: boolean;
  lastPublishedAt?: string;
  leadCaptureCount: number;
}

export interface AuditEvent {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  tenantId: string;
  channel: 'email' | 'whatsapp' | 'portal';
  recipient: string;
  title: string;
  message: string;
  status: 'enviado' | 'pendente' | 'preparada' | 'falha';
  createdAt: string;
}

export interface PasswordResetRecord {
  tokenHash: string;
  userId: string;
  tenantId: string;
  expiresAt: string;
  usedAt?: string;
  createdAt: string;
}
