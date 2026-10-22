"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import "../login/login.css";

function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirmation = String(form.get("confirmation") || "");
    if (password !== confirmation) { setMessage("As senhas não coincidem."); return; }
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível redefinir a senha.");
      setDone(true); setMessage("Senha alterada. Agora você pode entrar com a nova senha.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Falha ao redefinir a senha."); }
    finally { setBusy(false); }
  }
  return <main className="login-page"><div className="login-wrap"><article className="login-card" style={{ display: "block", maxWidth: 560, margin: "auto" }}><section className="login-form-panel" style={{ padding: 40 }}>
    <div className="login-brand"><img className="login-logo" src="/contabilis-simbolo-escuro.svg" alt="" />Contabilis</div>
    <h1>Redefinir senha</h1>
    <p className="login-sub">Escolha uma senha nova com pelo menos 10 caracteres.</p>
    {!token ? <p role="alert" className="login-message error">O link está incompleto. Solicite uma nova redefinição.</p> : done ? <p role="status" className="login-message success">{message}</p> : <form onSubmit={submit}>
      <label className="login-label" htmlFor="password">Nova senha</label><div className="login-input-wrap"><input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" /></div>
      <label className="login-label" htmlFor="confirmation">Confirme a senha</label><div className="login-input-wrap"><input id="confirmation" name="confirmation" type="password" required minLength={10} autoComplete="new-password" /></div>
      <p role="alert" className="login-message error">{message}</p>
      <button className="login-submit" disabled={busy}>{busy ? "Salvando..." : "Salvar nova senha"}</button>
    </form>}
    <p className="login-foot"><Link className="login-link" href="/">Voltar para entrar</Link></p>
  </section></article></div></main>;
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<main className="login-page" aria-busy="true" />}><ResetPasswordForm /></Suspense>;
}
