import { NextRequest, NextResponse } from "next/server";

const routeMap: Record<string, string> = {
  "/painel": "/dashboard",
  "/clientes": "/dashboard/clients",
  "/documentos": "/dashboard/documents",
  "/conciliacao": "/dashboard/reconciliation",
  "/relatorios": "/dashboard/balance-mapping",
  "/certidoes": "/dashboard/certificates",
  "/simuladores": "/dashboard/tax-simulators",
  "/meu-site": "/dashboard/website-builder",
  "/tarefas": "/dashboard/tasks",
  "/notificacoes": "/dashboard/notifications",
  "/configuracoes": "/dashboard/settings",
};

function dashboardPublicPath(path: string) {
  const entry = Object.entries(routeMap).find(([, internal]) => path === internal || path.startsWith(`${internal}/`));
  return entry ? `${entry[0]}${path.slice(entry[1].length)}` : "/painel";
}

type SessionPayload = { userId: string; tenantId: string; role: string; clientId?: string; expiresAt: number; demo?: boolean };

async function validSession(request: NextRequest): Promise<SessionPayload | null> {
  const token = request.cookies.get("contabilis_session")?.value;
  if (!token) return null;
  const [payload, supplied] = token.split(".");
  if (!payload || !supplied) return null;
  try {
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as SessionPayload;
    if (decoded.demo && (decoded.userId !== "usr-admin-1" || decoded.tenantId !== "org-contabil-alpha" || decoded.role !== "admin")) return null;
    const secret = decoded.demo ? "contabilis-public-demo-session-v1" : process.env.AUTH_SECRET || (process.env.NODE_ENV === "production" ? "" : "contabilis-local-development-secret-change-before-deploy");
    if (!secret) return null;
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
    const expected = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    if (expected !== supplied) return null;
    if (!decoded.userId || !decoded.tenantId || !decoded.expiresAt || decoded.expiresAt <= Date.now() / 1000) return null;
    return decoded as SessionPayload;
  } catch { return null; }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await validSession(request);
  const authenticated = Boolean(session);
  const forwardedHeaders = new Headers(request.headers);
  if (session) {
    forwardedHeaders.set("x-contabilis-tenant", session.tenantId);
    forwardedHeaders.set("x-contabilis-user", session.userId);
    forwardedHeaders.set("x-contabilis-role", session.role);
    if (session.clientId) forwardedHeaders.set("x-contabilis-client", session.clientId);
  }
  if (pathname === "/login") return NextResponse.redirect(new URL("/", request.url));
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const target = new URL(dashboardPublicPath(pathname), request.url);
    target.search = request.nextUrl.search;
    if (!authenticated) return NextResponse.redirect(new URL(`/?next=${encodeURIComponent(target.pathname + target.search)}`, request.url));
    return NextResponse.redirect(target);
  }
  if (pathname === "/" && session) return NextResponse.redirect(new URL(session.role === "client" ? "/portal" : "/painel", request.url));
  if (pathname === "/portal") {
    if (!session) return NextResponse.redirect(new URL("/", request.url));
    if (session.role !== "client" || !session.clientId) return NextResponse.redirect(new URL("/painel", request.url));
  }
  if (pathname === "/api/auth" || pathname.startsWith("/api/auth/")) return NextResponse.next();
  if (pathname.startsWith("/api/") && !authenticated) return NextResponse.json({ error: "Sessão expirada. Entre novamente." }, { status: 401 });
  if (routeMap[pathname]) {
    if (!authenticated) return NextResponse.redirect(new URL(`/?next=${encodeURIComponent(pathname + request.nextUrl.search)}`, request.url));
    return NextResponse.rewrite(new URL(routeMap[pathname] + request.nextUrl.search, request.url), { request: { headers: forwardedHeaders } });
  }
  const matched = Object.entries(routeMap).find(([publicPath]) => pathname.startsWith(`${publicPath}/`));
  if (matched) {
    if (!authenticated) return NextResponse.redirect(new URL(`/?next=${encodeURIComponent(pathname + request.nextUrl.search)}`, request.url));
    const internal = `${routeMap[matched[0]]}${pathname.slice(matched[0].length)}`;
    return NextResponse.rewrite(new URL(internal + request.nextUrl.search, request.url), { request: { headers: forwardedHeaders } });
  }
  return NextResponse.next({ request: { headers: forwardedHeaders } });
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"] };
