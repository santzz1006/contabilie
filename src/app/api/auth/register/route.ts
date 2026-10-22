import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { COOKIE_NAME, createSession, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, organizationName, email, password } = await request.json();
    if (typeof name !== "string" || name.trim().length < 2 || typeof organizationName !== "string" || organizationName.trim().length < 2 || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== "string" || password.length < 10) {
      return NextResponse.json({ error: "Preencha os campos corretamente. A senha deve ter ao menos 10 caracteres." }, { status: 400 });
    }
    if (db.getUserByEmail(email)) return NextResponse.json({ error: "Este e-mail já possui uma conta." }, { status: 409 });
    const tenantId = `org-${randomUUID()}`;
    const userId = `usr-${randomUUID()}`;
    const user = { id: userId, tenantId, name: name.trim(), email: email.trim().toLowerCase(), role: "admin" as const, active: true, passwordHash: await hashPassword(password) };
    const session = createSession({ userId, tenantId, role: user.role });
    db.createAccount({ id: tenantId, name: organizationName.trim(), cnpj: "", email: user.email, phone: "", plan: "inicial", status: "active", createdAt: new Date().toISOString() }, user);
    const response = NextResponse.json({ ok: true }, { status: 201 });
    response.cookies.set(COOKIE_NAME, session.token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: session.maxAge });
    return response;
  } catch (error) {
    console.error("Falha ao criar conta", error);
    return NextResponse.json({ error: "Não foi possível criar a conta." }, { status: 500 });
  }
}
