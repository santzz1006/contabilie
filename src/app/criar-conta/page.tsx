"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Check, Eye, EyeOff, Moon, ShieldCheck, Sun, UsersRound } from "lucide-react";
import { saveMockAccount } from "@/lib/mock-accounts";
import "../login/login.css";

type Theme = "light" | "dark";

export default function CreateAccountPage() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    if (current === "dark" || current === "light") setTheme(current);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {}
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const organizationName = String(form.get("organizationName") || "").trim();
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");
    if (password.length < 10) { setMessage("A senha precisa ter pelo menos 10 caracteres."); return; }
    if (password !== confirmPassword) { setMessage("As senhas não coincidem. Confira os dois campos."); return; }

    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, organizationName, email, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok) {
        window.location.assign("/painel");
        return;
      }
      if (response.status < 500) throw new Error(result.error || `Não foi possível criar a conta (erro ${response.status}).`);
      await saveMockAccount({ name, organizationName, email, password });
      const demo = await fetch("/api/auth/demo", { method: "POST" });
      if (!demo.ok) throw new Error("A conta ficou salva neste navegador, mas não foi possível abrir o painel de demonstração.");
      window.location.assign("/painel");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível criar a conta. Confira se o navegador permite armazenamento local.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page signup-page">
      <button className="login-theme signup-theme" type="button" onClick={toggleTheme} aria-label="Alternar tema" title="Alternar tema">
        {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
      </button>
      <div className="login-wrap signup-wrap">
        <article className="login-card signup-card">
          <section className="login-stage signup-stage" aria-label="Benefícios do Contabilis">
            <p className="login-hello">Contabilis · rotina contábil em ordem</p>
            <div>
              <h2>Um escritório mais organizado começa aqui.</h2>
              <p>Reúna clientes, tarefas e documentos em um só lugar, com a identidade visual do Contabilis.</p>
            </div>
            <div className="signup-preview" aria-hidden="true">
              <div className="signup-preview-head"><strong>Seu escritório</strong><span>Visão geral</span></div>
              <div className="signup-preview-stat"><Building2 /><span>Clientes acompanhados<strong>Em um só painel</strong></span></div>
              <div className="signup-preview-stat"><UsersRound /><span>Equipe e responsabilidades<strong>Com acesso organizado</strong></span></div>
              <div className="signup-preview-row"><span><Check size={14} /> Atividades do escritório</span><ShieldCheck size={16} /></div>
            </div>
          </section>

          <section className="login-form-panel signup-form-panel">
            <div className="login-brand"><img className="login-logo" src="/contabilis-simbolo-escuro.svg" alt="" />Contabilis</div>
            <h1>Crie sua conta</h1>
            <p className="login-sub login-lead">Cadastre o acesso do seu escritório para começar.</p>
            <p className="signup-storage-note">Sem banco conectado, o acesso de demonstração fica salvo neste navegador e usa dados fictícios.</p>

            <form onSubmit={submit}>
              <div className="signup-field-grid">
                <div>
                  <label className="login-label" htmlFor="name">Seu nome</label>
                  <div className="login-input-wrap"><input id="name" name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder="Como podemos chamar você?" /></div>
                </div>
                <div>
                  <label className="login-label" htmlFor="email">E-mail profissional</label>
                  <div className="login-input-wrap"><input id="email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="nome@escritorio.com.br" /></div>
                </div>
                <div className="signup-field-wide">
                  <label className="login-label" htmlFor="organizationName">Nome do escritório</label>
                  <div className="login-input-wrap"><input id="organizationName" name="organizationName" required minLength={2} maxLength={120} autoComplete="organization" placeholder="Ex.: Escritório Contábil" /></div>
                </div>
                <div>
                  <label className="login-label" htmlFor="password">Senha · mínimo 10 caracteres</label>
                  <div className="login-input-wrap login-password-wrap">
                    <input id="password" name="password" type={showPassword ? "text" : "password"} required minLength={10} autoComplete="new-password" placeholder="Crie uma senha segura" />
                    <button className="login-eye-button" type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? <EyeOff /> : <Eye />}</button>
                  </div>
                </div>
                <div>
                  <label className="login-label" htmlFor="confirmPassword">Confirme a senha</label>
                  <div className="login-input-wrap login-password-wrap">
                    <input id="confirmPassword" name="confirmPassword" type={showConfirmation ? "text" : "password"} required minLength={10} autoComplete="new-password" placeholder="Digite a senha novamente" />
                    <button className="login-eye-button" type="button" onClick={() => setShowConfirmation(value => !value)} aria-label={showConfirmation ? "Ocultar confirmação" : "Mostrar confirmação"}>{showConfirmation ? <EyeOff /> : <Eye />}</button>
                  </div>
                </div>
              </div>

              <p className="login-message error" role="alert" aria-live="polite">{message}</p>
              <button className="login-submit" type="submit" disabled={busy}>
                {busy && <span className="login-spinner" aria-hidden="true" />}
                {busy ? "Criando seu acesso..." : "Criar conta do escritório"}
              </button>
            </form>
            <p className="login-foot">Já tem uma conta? <Link className="login-link" href="/">Entrar</Link></p>
            <p className="login-demo-note">Quer conhecer primeiro? <Link className="login-link" href="/">Acesse a demonstração</Link></p>
          </section>
        </article>
      </div>
    </main>
  );
}
