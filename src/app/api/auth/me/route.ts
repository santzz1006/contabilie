import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { COOKIE_NAME, readSession } from "@/lib/auth";

export async function GET(request: Request) {
  const token = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  const session = readSession(token);
  const user = session ? db.getUserById(session.userId) : undefined;
  if (!user || !user.active || user.tenantId !== session?.tenantId) return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, clientId: user.clientId }, client: user.clientId ? db.getClientById(user.tenantId, user.clientId) : null, organization: db.getTenant(user.tenantId)?.name });
}
