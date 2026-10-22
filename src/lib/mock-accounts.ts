const STORAGE_KEY = "contabilis.mock-accounts.v1";
const ITERATIONS = 120_000;

type MockAccount = {
  name: string;
  organizationName: string;
  email: string;
  salt: string;
  passwordHash: string;
  createdAt: string;
};

function readAccounts(): MockAccount[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value as MockAccount[] : [];
  } catch {
    return [];
  }
}

async function derivePassword(password: string, salt: string) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: Uint8Array.from(atob(salt), (char) => char.charCodeAt(0)), iterations: ITERATIONS, hash: "SHA-256" }, material, 256);
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

export async function saveMockAccount(input: { name: string; organizationName: string; email: string; password: string }) {
  const accounts = readAccounts();
  const email = input.email.trim().toLowerCase();
  if (accounts.some((account) => account.email === email)) throw new Error("Este e-mail já foi usado neste navegador. Entre com ele ou informe outro.");
  const salt = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
  const passwordHash = await derivePassword(input.password, salt);
  accounts.push({ name: input.name.trim(), organizationName: input.organizationName.trim(), email, salt, passwordHash, createdAt: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export async function verifyMockAccount(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const account = readAccounts().find((item) => item.email === normalizedEmail);
  if (!account) return false;
  const candidate = await derivePassword(password, account.salt);
  return candidate === account.passwordHash;
}
