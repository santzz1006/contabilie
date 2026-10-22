import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const COOKIE_NAME = "contabilis_session";
const SESSION_SECONDS = 60 * 60 * 24 * 30;
export const DEMO_SESSION_SECRET = "contabilis-public-demo-session-v1";

function secret(demo = false) {
  if (demo) return DEMO_SESSION_SECRET;
  const configured = process.env.AUTH_SECRET;
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") throw new Error("Este ambiente ainda não está configurado para criar contas. Configure AUTH_SECRET ou use a demonstração.");
  return "contabilis-local-development-secret-change-before-deploy";
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored?: string) {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createSession(payload: { userId: string; tenantId: string; role: string; clientId?: string }, remember = true, demo = false) {
  const expiresAt = Math.floor(Date.now() / 1000) + (remember ? SESSION_SECONDS : 60 * 60 * 12);
  const value = Buffer.from(JSON.stringify({ ...payload, ...(demo ? { demo: true } : {}), expiresAt })).toString("base64url");
  const signature = createHmac("sha256", secret(demo)).update(value).digest("base64url");
  return { token: `${value}.${signature}`, maxAge: expiresAt - Math.floor(Date.now() / 1000) };
}

export function readSession(token?: string) {
  if (!token) return null;
  const [value, signature] = token.split(".");
  if (!value || !signature) return null;
  let payload: { userId: string; tenantId: string; role: string; clientId?: string; expiresAt: number; demo?: boolean };
  try { payload = JSON.parse(Buffer.from(value, "base64url").toString("utf8")); } catch { return null; }
  if (payload.demo && (payload.userId !== "usr-admin-1" || payload.tenantId !== "org-contabil-alpha" || payload.role !== "admin")) return null;
  let signingSecret: string;
  try { signingSecret = secret(Boolean(payload.demo)); } catch { return null; }
  const expected = createHmac("sha256", signingSecret).update(value).digest();
  let actual: Buffer;
  try { actual = Buffer.from(signature, "base64url"); } catch { return null; }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    if (!payload.userId || !payload.tenantId || payload.expiresAt <= Date.now() / 1000) return null;
    return payload as { userId: string; tenantId: string; role: string; clientId?: string; expiresAt: number };
  } catch { return null; }
}

export { COOKIE_NAME };
