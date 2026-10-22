import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'node:crypto';
import { hashPassword } from '@/lib/auth';
import type { UserRole } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = request.headers.get('x-contabilis-tenant') || '';

  const users = db.getUsers(tenantId);
  return NextResponse.json(users.map(({ passwordHash: _passwordHash, ...user }) => user));
}

export async function POST(request: Request) {
  try {
    if (request.headers.get('x-contabilis-role') !== 'admin') return NextResponse.json({ error: 'Somente administradores podem criar acessos.' }, { status: 403 });
    const body = await request.json();
    const tenantId = request.headers.get('x-contabilis-tenant');
    const roles: UserRole[] = ['manager', 'analyst', 'assistant', 'client'];
    if (!tenantId || typeof body.name !== 'string' || body.name.trim().length < 2 || typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) || typeof body.password !== 'string' || body.password.length < 10 || !roles.includes(body.role)) {
      return NextResponse.json({ error: 'Informe nome, e-mail, senha de 10 caracteres e uma função válida.' }, { status: 400 });
    }
    if (db.getUserByEmail(body.email)) return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 409 });
    const clientId = body.role === 'client' ? body.clientId : undefined;
    if (body.role === 'client' && (!clientId || !db.getClientById(tenantId, clientId))) return NextResponse.json({ error: 'Selecione um cliente deste escritório para o acesso ao portal.' }, { status: 400 });
    const user = { id: `usr-${randomUUID()}`, tenantId, name: body.name.trim(), email: body.email.trim().toLowerCase(), role: body.role as UserRole, clientId, active: true, passwordHash: await hashPassword(body.password) };
    db.saveUser(user);
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return NextResponse.json(safeUser, { status: 201 });
  } catch (error) {
    console.error('Falha ao criar usuário', error);
    return NextResponse.json({ error: 'Não foi possível criar este acesso.' }, { status: 500 });
  }
}
