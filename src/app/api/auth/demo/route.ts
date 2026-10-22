import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { COOKIE_NAME, createSession } from "@/lib/auth";

export async function POST() {
  const user = db.getUserById("usr-admin-1");
  if (!user?.active || user.tenantId !== "org-contabil-alpha" || !db.getTenant(user.tenantId)) {
    return NextResponse.json({ error: "Os dados de demonstração não estão disponíveis." }, { status: 503 });
  }

  const session = createSession({ userId: user.id, tenantId: user.tenantId, role: user.role }, true, true);
  const response = NextResponse.json({ user: { id: user.id, name: user.name, role: user.role }, demo: true });
  response.cookies.set(COOKIE_NAME, session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: session.maxAge,
  });
  return response;
}
