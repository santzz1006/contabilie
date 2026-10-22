import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return NextResponse.json({ error: "A recuperação por e-mail precisa ser configurada pelo administrador (RESEND_API_KEY e RESEND_FROM_EMAIL)." }, { status: 503 });
  try {
    const { email } = await request.json();
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
    const user = db.getUserByEmail(email);
    if (!user || !user.active || !user.passwordHash) return NextResponse.json({ ok: true, message: "Se a conta existir, enviaremos um link para redefinir a senha." });

    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    db.addPasswordReset({ tokenHash, userId: user.id, tenantId: user.tenantId, expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString() });
    const origin = process.env.APP_BASE_URL || new URL(request.url).origin;
    const resetUrl = `${origin}/redefinir-senha?token=${encodeURIComponent(token)}`;
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [user.email], subject: "Redefinição de senha do Contabilis", html: `<p>Olá, ${user.name.replace(/[&<>"']/g, "")}</p><p>Use o link abaixo para criar uma nova senha. Ele expira em 1 hora e pode ser usado uma única vez.</p><p><a href="${resetUrl}">Redefinir minha senha</a></p><p>Se você não solicitou esta alteração, ignore esta mensagem.</p>` }),
    });
    if (!response.ok) {
      console.error("Resend recusou envio de recuperação", response.status, await response.text());
      return NextResponse.json({ error: "O serviço de e-mail recusou o envio. Confira a API key e o domínio remetente." }, { status: 502 });
    }
    return NextResponse.json({ ok: true, message: "Se a conta existir, enviaremos um link para redefinir a senha." });
  } catch (error) {
    console.error("Falha ao solicitar redefinição de senha", error);
    return NextResponse.json({ error: "Não foi possível processar a solicitação." }, { status: 500 });
  }
}
