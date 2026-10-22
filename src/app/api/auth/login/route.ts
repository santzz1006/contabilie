import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { COOKIE_NAME, createSession, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, remember } = await request.json();
    if (typeof email !== "string" || typeof password !== "string") return NextResponse.json({ error: "Informe e-mail e senha." }, { status: 400 });
    const user = db.getUserByEmail(email);
    if (!user || !user.active || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
    }
    const session = createSession({ userId: user.id, tenantId: user.tenantId, role: user.role, clientId: user.clientId }, Boolean(remember));
    const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, clientId: user.clientId } });
    response.cookies.set(COOKIE_NAME, session.token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: session.maxAge });
    return response;
  } catch (error) {
    console.error("Falha no login", error);
    return NextResponse.json({ error: "Não foi possível entrar agora." }, { status: 500 });
  }
}
