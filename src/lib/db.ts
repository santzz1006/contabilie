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
  NotificationItem,
  PasswordResetRecord
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
  passwordResets: PasswordResetRecord[];
}

const DB_FILE_PATH = process.env.CONTABILIS_DB_PATH || path.join(process.cwd(), 'data', 'store.json');

const seedData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'lib', 'seed-data.json'), 'utf-8'));
const INITIAL_DATA = { ...seedData, passwordResets: [] } as unknown as DatabaseSchema;

export interface DataRepository {
  getTenant(id: string): Organization | undefined;
  getAllTenants(): Organization[];
  getUsers(tenantId: string): User[];
  getUserById(id: string): User | undefined;
  getUserByEmail(email: string): User | undefined;
  saveUser(user: User): void;
  addPasswordReset(record: PasswordResetRecord): void;
  getPasswordReset(tokenHash: string): PasswordResetRecord | undefined;
  consumePasswordReset(tokenHash: string): void;
  createAccount(organization: Organization, user: User): void;
  getClients(tenantId: string): Client[];
  getClientById(tenantId: string, clientId: string): Client | undefined;
  saveClient(client: Client): Client;
  getDocumentRequests(tenantId: string, clientId?: string): DocumentRequest[];
  saveDocumentRequest(request: DocumentRequest): DocumentRequest;
  getDocuments(tenantId: string, clientId?: string): DocumentItem[];
  saveDocument(document: DocumentItem): DocumentItem;
  getBankTransactions(tenantId: string, clientId?: string): BankTransaction[];
  saveBankTransaction(transaction: BankTransaction): BankTransaction;
  saveBankTransactionsBulk(transactions: BankTransaction[]): void;
  getAccountCategories(tenantId: string): AccountCategory[];
  getCertificates(tenantId: string, clientId?: string): Certificate[];
  saveCertificate(certificate: Certificate): Certificate;
  getTaxSimulations(tenantId: string): TaxSimulation[];
  saveTaxSimulation(simulation: TaxSimulation): TaxSimulation;
  getTasks(tenantId: string, clientId?: string): TaskItem[];
  saveTask(task: TaskItem): TaskItem;
  getWebsite(tenantId: string): WebsiteConfig | undefined;
  saveWebsite(website: WebsiteConfig): WebsiteConfig;
  getAuditEvents(tenantId: string): AuditEvent[];
  logAuditEvent(event: AuditEvent): void;
  getNotifications(tenantId: string): NotificationItem[];
  saveNotification(notification: NotificationItem): void;
}

// Database class managing atomic persistence and multi-tenant scoping
class DatabaseStore implements DataRepository {
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
          const loaded = JSON.parse(fileContent) as Partial<DatabaseSchema>;
          return { ...JSON.parse(JSON.stringify(INITIAL_DATA)), ...loaded, passwordResets: loaded.passwordResets || [] };
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
      throw new Error('Não foi possível salvar os dados locais. Verifique a permissão de gravação ou configure um banco persistente para este ambiente.');
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

  getUserByEmail(email: string): User | undefined {
    const normalized = email.trim().toLowerCase();
    return this.data.users.find(u => u.email.toLowerCase() === normalized);
  }

  saveUser(user: User): void {
    const index = this.data.users.findIndex((item) => item.tenantId === user.tenantId && item.id === user.id);
    if (index >= 0) this.data.users[index] = user;
    else this.data.users.push(user);
    this.persist();
  }

  addPasswordReset(record: PasswordResetRecord): void {
    this.data.passwordResets = this.data.passwordResets.filter((item) => item.userId !== record.userId || item.usedAt || Date.parse(item.expiresAt) <= Date.now());
    this.data.passwordResets.push(record);
    this.persist();
  }

  getPasswordReset(tokenHash: string): PasswordResetRecord | undefined {
    return this.data.passwordResets.find((item) => item.tokenHash === tokenHash && !item.usedAt && Date.parse(item.expiresAt) > Date.now());
  }

  consumePasswordReset(tokenHash: string): void {
    const record = this.getPasswordReset(tokenHash);
    if (record) record.usedAt = new Date().toISOString();
    this.persist();
  }

  createAccount(organization: Organization, user: User): void {
    if (this.getUserByEmail(user.email)) throw new Error('Este e-mail já possui uma conta. Entre ou use outro endereço.');
    this.data.organizations.push(organization);
    this.data.users.push(user);
    try {
      this.persist();
    } catch (error) {
      this.data.organizations.pop();
      this.data.users.pop();
      throw error;
    }
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

export const db: DataRepository = new DatabaseStore();
