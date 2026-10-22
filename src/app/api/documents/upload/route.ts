import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';
import { DocumentItem } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const sessionClientId = request.headers.get('x-contabilis-client');
    const clientId = request.headers.get('x-contabilis-role') === 'client' ? sessionClientId : formData.get('clientId') as string;
    const requestId = formData.get('requestId') as string || '';
    const competence = formData.get('competence') as string || '2026-10';
    const category = (formData.get('category') as any) || 'extrato';
    const tenantId = request.headers.get('x-contabilis-tenant') || '';

    if (!clientId || !db.getClientById(tenantId, clientId)) return NextResponse.json({ error: 'Cliente não encontrado nesta conta.' }, { status: 404 });
    if (file && file.size > 25 * 1024 * 1024) return NextResponse.json({ error: 'O arquivo excede o limite de 25 MB.' }, { status: 413 });
    if (request.headers.get('x-contabilis-role') === 'client' && !sessionClientId) return NextResponse.json({ error: 'Esta conta não possui um cliente vinculado.' }, { status: 403 });
    if (requestId && !db.getDocumentRequests(tenantId, clientId).some((item) => item.id === requestId)) return NextResponse.json({ error: 'A solicitação não pertence a este cliente.' }, { status: 404 });

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Gerar hash SHA-256 para rastreabilidade de integridade
    const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');

    // Verificar se já existe arquivo com o mesmo hash para este cliente (Detecção de duplicidade sem apagar)
    const existingDocs = db.getDocuments(tenantId, clientId);
    const isDuplicate = existingDocs.some(d => d.fileHash === fileHash);

    // Salvar arquivo localmente em public/uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const diskFileName = `${Date.now()}_${sanitizedFileName}`;
    const filePath = path.join(uploadsDir, diskFileName);
    fs.writeFileSync(filePath, buffer);

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      tenantId,
      requestId: requestId || undefined,
      clientId,
      competence,
      category,
      fileName: file.name,
      fileUrl: `/uploads/${diskFileName}`,
      fileSize: buffer.length,
      fileHash,
      mimeType: file.type || 'application/octet-stream',
      uploadedAt: new Date().toISOString(),
      uploadedBy: request.headers.get('x-contabilis-user') || 'Usuário autenticado',
      status: 'recebido',
      version: 1,
    };

    db.saveDocument(newDoc);

    // Atualizar status da solicitação vinculada, se houver
    if (requestId) {
      const requests = db.getDocumentRequests(tenantId);
      const req = requests.find(r => r.id === requestId);
      if (req) {
        db.saveDocumentRequest({
          ...req,
          status: 'recebido',
        });
      }
    }

    // Registrar evento de auditoria
    db.logAuditEvent({
      id: `aud-${Date.now()}`,
      tenantId,
      userId: 'usr-cliente-1',
      userName: 'Cliente Final',
      action: 'UPLOAD_DOCUMENTO',
      resource: 'Documento',
      details: `Upload de ${file.name} (${buffer.length} bytes, SHA-256 ${fileHash.substring(0, 16)}...). ${isDuplicate ? 'Alerta: Arquivo com hash idêntico já existia no histórico.' : ''}`,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      document: newDoc,
      isDuplicate,
      message: isDuplicate 
        ? 'Arquivo recebido com sucesso. Nota: um arquivo idêntico já havia sido enviado anteriormente.' 
        : 'Arquivo recebido e armazenado com sucesso.'
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
