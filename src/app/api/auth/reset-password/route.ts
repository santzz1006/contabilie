import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();
    if (typeof token !== "string" || typeof password !== "string" || password.length < 10) return NextResponse.json({ error: "O link é inválido ou a senha tem menos de 10 caracteres." }, { status: 400 });
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const reset = db.getPasswordReset(tokenHash);
    if (!reset) return NextResponse.json({ error: "Este link expirou ou já foi usado. Solicite outro." }, { status: 410 });
    const user = db.getUserById(reset.userId);
    if (!user || user.tenantId !== reset.tenantId || !user.active) return NextResponse.json({ error: "Não foi possível validar esta conta." }, { status: 410 });
    user.passwordHash = await hashPassword(password);
    db.saveUser(user);
    db.consumePasswordReset(tokenHash);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Falha ao redefinir senha", error);
    return NextResponse.json({ error: "Não foi possível redefinir a senha." }, { status: 500 });
  }
}
