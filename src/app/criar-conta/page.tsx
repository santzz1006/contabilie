"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import "../login/login.css";

export default function CreateAccountPage() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const data = Object.fromEntries(form.entries());
    if (data.password !== data.confirmPassword) { setMessage("As senhas não coincidem."); return; }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível criar sua conta.");
      window.location.assign("/painel");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível criar sua conta.");
    } finally { setBusy(false); }
  }

  return <main className="login-page"><div className="login-wrap"><article className="login-card" style={{ display: "block", maxWidth: 560, margin: "auto" }}><section className="login-form-panel" style={{ padding: 40 }}>
    <div className="login-brand"><img className="login-logo" src="/contabilis-simbolo-escuro.svg" alt="" />Contabilis</div>
    <h1>Crie o acesso do seu escritório</h1>
    <p className="login-sub">Cadastre seu escritório para começar a usar o Contabilis.</p>
    <form onSubmit={submit}>
      <label className="login-label" htmlFor="name">Seu nome</label><div className="login-input-wrap"><input id="name" name="name" required minLength={2} autoComplete="name" /></div>
      <label className="login-label" htmlFor="organizationName">Nome do escritório</label><div className="login-input-wrap"><input id="organizationName" name="organizationName" required minLength={2} autoComplete="organization" /></div>
      <label className="login-label" htmlFor="email">E-mail</label><div className="login-input-wrap"><input id="email" name="email" type="email" required autoComplete="email" /></div>
      <label className="login-label" htmlFor="password">Senha (mínimo de 10 caracteres)</label><div className="login-input-wrap"><input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" /></div>
      <label className="login-label" htmlFor="confirmPassword">Confirme a senha</label><div className="login-input-wrap"><input id="confirmPassword" name="confirmPassword" type="password" required minLength={10} autoComplete="new-password" /></div>
      <p className="login-message error" role="alert">{message}</p>
      <button className="login-submit" type="submit" disabled={busy}>{busy ? "Criando conta…" : "Criar conta"}</button>
    </form>
    <p className="login-foot"><Link className="login-link" href="/">Já tenho acesso</Link></p>
  </section></article></div></main>;
}
