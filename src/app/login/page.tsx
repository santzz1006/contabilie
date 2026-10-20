"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Moon, Sun } from "lucide-react";
import gsap from "gsap";
import "./login.css";

type Theme = "light" | "dark";
type Mood = "mouse" | "email" | "away" | "peek" | "error" | "happy";

function CharacterFace({
  className,
  left,
  right,
  y,
  eyeRadius,
  pupilRadius,
  mouthY,
  stroke,
}: {
  className: string;
  left: number;
  right: number;
  y: number;
  eyeRadius: number;
  pupilRadius: number;
  mouthY: number;
  stroke: string;
}) {
  const eye = (x: number) => (
    <g className="login-eye" transform={`translate(${x} ${y})`} key={x}>
      <g className="login-blink">
        <g className="login-lid">
          <circle r={eyeRadius} fill="white" />
          <g className="login-pupil">
            <circle r={pupilRadius} fill="#1C1917" />
            <circle cx={pupilRadius * 0.35} cy={-pupilRadius * 0.4} r={pupilRadius * 0.3} fill="white" />
          </g>
        </g>
      </g>
    </g>
  );

  return (
    <g className={`login-face ${className}`}>
      {eye(left)}
      {eye(right)}
      <g transform={`translate(${left} ${y - eyeRadius - 8})`}>
        <path className="login-brow" d="M-7 0H7" data-index="0" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      </g>
      <g transform={`translate(${right} ${y - eyeRadius - 8})`}>
        <path className="login-brow" d="M-7 0H7" data-index="1" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      </g>
      <ellipse className="login-cheek" cx={left - 3} cy={y + eyeRadius + 8} rx="6" ry="3.5" fill="#F43F5E" />
      <ellipse className="login-cheek" cx={right + 3} cy={y + eyeRadius + 8} rx="6" ry="3.5" fill="#F43F5E" />
      <path className="login-mouth" transform={`translate(${(left + right) / 2} ${mouthY})`} d="M-9 0Q0 0 9 0" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function LoginCharacters({
  mood,
  emailValue,
  emailRef,
  passwordRef,
}: {
  mood: Mood;
  emailValue: string;
  emailRef: React.RefObject<HTMLInputElement | null>;
  passwordRef: React.RefObject<HTMLInputElement | null>;
}) {
  const artRef = useRef<SVGSVGElement>(null);
  const moodRef = useRef(mood);
  const lookRef = useRef<() => void>(() => {});
  moodRef.current = mood;

  useEffect(() => {
    const art = artRef.current;
    if (!art) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const faces = Array.from(art.querySelectorAll<SVGGElement>(".login-face"));
    const pupils = Array.from(art.querySelectorAll<SVGGElement>(".login-pupil"));
    const scope = gsap.context(() => {
      if (reduceMotion) return;
      gsap.timeline({ defaults: { ease: "power2.out" } })
        .from(art.querySelectorAll(".login-character"), { y: 50, autoAlpha: 0, duration: 0.5, stagger: 0.07, ease: "back.out(1.4)" });
    }, art);

    let pointer = { x: window.innerWidth * 0.7, y: window.innerHeight * 0.4 };
    let frame = 0;
    const getTarget = () => {
      const rect = art.getBoundingClientRect();
      const currentMood = moodRef.current;
      if (currentMood === "email" && emailRef.current) {
        const input = emailRef.current;
        const box = input.getBoundingClientRect();
        const textLength = input.selectionStart ?? input.value.length;
        return { x: box.left + 14 + Math.min(textLength * 7.5, box.width - 28), y: box.top + box.height / 2 };
      }
      if (currentMood === "peek" && passwordRef.current) {
        const box = passwordRef.current.getBoundingClientRect();
        return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
      }
      if (currentMood === "away") return { x: rect.left - 260, y: rect.top - 140 };
      if (currentMood === "error") return { x: rect.left + rect.width / 2, y: rect.bottom + 300 };
      return pointer;
    };

    const look = () => {
      const target = getTarget();
      const clamp = (value: number) => Math.max(-1, Math.min(1, value));
      faces.forEach((face) => {
        const box = face.getBoundingClientRect();
        const x = clamp((target.x - (box.left + box.width / 2)) / 320) * 5;
        const y = clamp((target.y - (box.top + box.height / 2)) / 260) * 3;
        gsap.to(face, { x, y, duration: reduceMotion ? 0 : 0.3, ease: "power2.out", overwrite: "auto" });
      });
      pupils.forEach((pupil) => {
        const eye = pupil.closest(".login-eye");
        if (!eye) return;
        const box = eye.getBoundingClientRect();
        const dx = target.x - (box.left + box.width / 2);
        const dy = target.y - (box.top + box.height / 2);
        const distance = Math.hypot(dx, dy) || 1;
        const movement = Math.min(4.8, (distance / 40) * 4.8);
        gsap.to(pupil, {
          x: (dx / distance) * movement,
          y: (dy / distance) * movement,
          duration: reduceMotion ? 0 : 0.25,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
      return undefined;
    };
    const onPointerMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      if (!frame && (moodRef.current === "mouse" || moodRef.current === "email")) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          look();
        });
      }
    };
    const onResize = () => look();
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", onResize);
    lookRef.current = look;
    look();

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
      lookRef.current = () => {};
      scope.revert();
      gsap.killTweensOf([...faces, ...pupils]);
    };
  }, [emailRef, passwordRef]);

  useEffect(() => {
    const art = artRef.current;
    if (!art) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lids = Array.from(art.querySelectorAll<SVGGElement>(".login-lid"));
    const brows = Array.from(art.querySelectorAll<SVGPathElement>(".login-brow"));
    const cheeks = Array.from(art.querySelectorAll<SVGEllipseElement>(".login-cheek"));
    const mouths = Array.from(art.querySelectorAll<SVGPathElement>(".login-mouth"));
    const browShape = mood === "away"
      ? ["M-7 1Q0 -2 7 0", "M-7 0Q0 -2 7 1"]
      : mood === "error"
        ? ["M-7 1Q0 -3 7 -2", "M-7 -2Q0 -3 7 1"]
        : mood === "peek"
          ? ["M-7 1Q0 -2 7 -1", "M-7 -1Q0 -2 7 1"]
          : mood === "happy"
            ? ["M-7 1Q0 -2 7 1", "M-7 1Q0 -2 7 1"]
            : ["M-7 0H7", "M-7 0H7"];
    const blush = mood === "away" ? 0.45 : mood === "peek" || mood === "happy" ? 0.35 : 0;
    const mouth = mood === "away" ? [0, -0.1, -0.15, 0.1] : mood === "peek" ? [0.9, 0.8, 0.9, 1] : mood === "error" ? [-1, -1, -1, -0.9] : mood === "happy" ? [1, 1, 1, 1] : [0.15, 0, 0.6, 0.5];
    gsap.to(lids, { scaleY: mood === "away" ? 0.92 : mood === "peek" ? 1.1 : 1, duration: reduceMotion ? 0 : 0.25, transformOrigin: "50% 50%", overwrite: "auto" });
    brows.forEach((brow) => {
      const index = Number(brow.dataset.index ?? 0);
      brow.setAttribute("d", browShape[index % 2]);
    });
    gsap.to(cheeks, { opacity: blush, duration: reduceMotion ? 0 : 0.25, overwrite: "auto" });
    mouths.forEach((path, index) => path.setAttribute("d", `M-9 0Q0 ${mouth[index]} 9 0`));
    lookRef.current();
    return () => gsap.killTweensOf([...lids, ...cheeks]);
  }, [mood, emailValue]);

  useEffect(() => {
    const art = artRef.current;
    if (!art || (mood !== "mouse" && mood !== "email") || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let blinkTween: gsap.core.Tween | undefined;
    const scheduleBlink = () => {
      timer = setTimeout(() => {
        const lids = Array.from(art.querySelectorAll<SVGGElement>(".login-blink"));
        blinkTween = gsap.fromTo(lids, { scaleY: 1 }, {
          scaleY: 0.05, duration: 0.07, yoyo: true, repeat: 1, stagger: 0.025,
          transformOrigin: "50% 50%", onComplete: scheduleBlink,
        });
      }, 2800 + Math.random() * 2800);
    };
    scheduleBlink();
    return () => {
      if (timer) clearTimeout(timer);
      blinkTween?.kill();
      gsap.set(art.querySelectorAll(".login-blink"), { scaleY: 1 });
    };
  }, [mood]);

  return (
    <svg ref={artRef} className="login-art" viewBox="0 0 400 300" aria-hidden="true">
      <g className="login-character login-ledger">
        <rect x="120" y="40" width="100" height="200" rx="14" fill="var(--ink)" />
        <path d="M120 54a14 14 0 0114-14v200a14 14 0 01-14-14z" fill="rgba(0,0,0,.22)" />
        <path d="M202 40h12v28l-6-5-6 5z" fill="var(--or)" />
        <path d="M142 152h66M142 168h66M142 184h66M178 146v44" stroke="rgba(255,255,255,.18)" strokeWidth="2" strokeLinecap="round" />
        <CharacterFace className="face-ledger" left={150} right={190} y={90} eyeRadius={10.5} pupilRadius={5.2} mouthY={126} stroke="white" />
      </g>
      <g className="login-character login-calculator">
        <rect x="215" y="130" width="80" height="140" rx="14" fill="#FDBA74" />
        <rect x="225" y="138" width="60" height="18" rx="5" fill="#1C1917" opacity=".88" />
        <text x="279" y="151" textAnchor="end" fontSize="10" fontWeight="600" fill="#FDBA74">0,00</text>
        <CharacterFace className="face-calculator" left={243} right={271} y={184} eyeRadius={9.5} pupilRadius={4.8} mouthY={208} stroke="#1C1917" />
        <g fill="rgba(28,25,23,.25)"><rect x="250" y="226" width="14" height="10" rx="3" /><rect x="268" y="226" width="14" height="10" rx="3" /><rect x="250" y="242" width="14" height="10" rx="3" /></g>
        <rect x="268" y="242" width="14" height="10" rx="3" fill="var(--or)" />
      </g>
      <g className="login-character login-coin">
        <path d="M30 300a110 110 0 01220 0z" fill="var(--or)" />
        <path d="M48 300a92 92 0 01184 0" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2" />
        <text x="140" y="208" textAnchor="middle" fontSize="15" fontWeight="700" fill="rgba(255,255,255,.85)">R$</text>
        <CharacterFace className="face-coin" left={112} right={150} y={240} eyeRadius={10.5} pupilRadius={5.2} mouthY={270} stroke="#1C1917" />
      </g>
      <g className="login-character login-seal">
        <path d="M290 300V218a35 35 0 0170 0v82z" fill="#FBBF24" />
        <text x="325" y="205" textAnchor="middle" fontSize="15" fontWeight="700" fill="rgba(28,25,23,.55)">%</text>
        <CharacterFace className="face-seal" left={310} right={338} y={236} eyeRadius={9} pupilRadius={4.4} mouthY={262} stroke="#1C1917" />
      </g>
    </svg>
  );
}

export default function LoginPage() {
  const pageRef = useRef<HTMLElement>(null);
  const [theme, setTheme] = useState<Theme>("light");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepConnected, setKeepConnected] = useState(true);
  const [mood, setMood] = useState<Mood>("mouse");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const eyeRef = useRef<HTMLButtonElement>(null);
  const submitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const page = pageRef.current;
    if (!page || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: "power2.out" } })
        .from("#login-card", { autoAlpha: 0, y: 14, duration: 0.4 })
        .from(".login-fx", { autoAlpha: 0, y: 8, duration: 0.3, stagger: 0.05 }, 0.2)
        .from(".login-caption", { autoAlpha: 0, duration: 0.3 }, 0.5);
    }, page);
    const safetyTimer = setTimeout(() => {
      gsap.set(page.querySelectorAll(".login-fx, .login-character, #login-card, .login-caption"), { clearProps: "opacity,transform,visibility" });
    }, 2600);
    return () => {
      clearTimeout(safetyTimer);
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    let initial: Theme = "light";
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") initial = saved;
      else if (window.matchMedia("(prefers-color-scheme: dark)").matches) initial = "dark";
    } catch {
      initial = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
    return () => {
      if (submitTimer.current) clearTimeout(submitTimer.current);
    };
  }, []);

  const changeTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // A preferência continua ativa nesta página mesmo sem armazenamento local.
    }
  };

  const clearError = () => {
    if (messageType === "error") {
      setMessage("");
      setMessageType("");
      emailRef.current?.removeAttribute("aria-invalid");
      passwordRef.current?.removeAttribute("aria-invalid");
      setMood(document.activeElement === passwordRef.current ? (showPassword ? "peek" : "away") : "email");
    }
  };

  const fail = (text: string, field: HTMLInputElement | null) => {
    setMessage(text);
    setMessageType("error");
    field?.setAttribute("aria-invalid", "true");
    setMood("error");
    field?.focus();
    requestAnimationFrame(() => setMood("error"));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    emailRef.current?.removeAttribute("aria-invalid");
    passwordRef.current?.removeAttribute("aria-invalid");
    setMessage("");
    setMessageType("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      fail("Digite um e-mail válido, por exemplo nome@escritorio.com.br.", emailRef.current);
      return;
    }
    if (password.length < 6) {
      fail("A senha precisa ter pelo menos 6 caracteres.", passwordRef.current);
      return;
    }

    setMood("mouse");
    setIsLoading(true);
    submitTimer.current = setTimeout(() => {
      setIsLoading(false);
      setIsConfirmed(true);
      setMessage("Acesso confirmado. Esta é uma demonstração; nenhum dado foi enviado.");
      setMessageType("success");
      setMood("happy");
    }, 1200);
  };

  const togglePassword = () => {
    const next = !showPassword;
    setShowPassword(next);
    passwordRef.current?.focus();
    setMood(next ? "peek" : "away");
  };

  const handleBlur = () => {
    setTimeout(() => {
      const active = document.activeElement;
      if (![emailRef.current, passwordRef.current, eyeRef.current].includes(active as HTMLInputElement | HTMLButtonElement | null) && mood !== "error" && mood !== "happy") {
        setMood("mouse");
      }
    }, 0);
  };

  return (
    <main ref={pageRef} className="login-page">
      <button className="login-theme" id="theme" onClick={changeTheme} aria-label="Alternar tema" title="Alternar tema">
        {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
      </button>

      <div className="login-wrap">
        <article className="login-card" id="login-card">
          <section className="login-stage" aria-label="Ilustração contábil interativa">
            <p className="login-hello">Sua carteira de clientes, em dia.</p>
            <LoginCharacters mood={mood} emailValue={email} emailRef={emailRef} passwordRef={passwordRef} />
          </section>

          <section className="login-form-panel">
            <div className="login-brand login-fx"><img className="login-logo" src="/contabilis-simbolo-escuro.svg" alt="" />Contabilis</div>
            <h1 className="login-fx">Bem-vindo de volta</h1>
            <p className="login-sub login-lead login-fx">Entre para acompanhar a competência do seu escritório.</p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="login-fx">
                <label className="login-label" htmlFor="email">E-mail</label>
                <div className="login-input-wrap">
                  <input
                    ref={emailRef}
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nome@escritorio.com.br"
                    value={email}
                    aria-invalid={messageType === "error" && message.includes("e-mail") ? true : undefined}
                    onChange={(event) => { setEmail(event.target.value); clearError(); if (mood !== "error") setMood("email"); }}
                    onFocus={() => setMood("email")}
                    onBlur={handleBlur}
                  />
                </div>
              </div>

              <div className="login-fx">
                <label className="login-label" htmlFor="password">Senha</label>
                <div className="login-input-wrap login-password-wrap">
                  <input
                    ref={passwordRef}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Mínimo de 6 caracteres"
                    value={password}
                    aria-invalid={messageType === "error" && message.includes("senha") ? true : undefined}
                    onChange={(event) => { setPassword(event.target.value); clearError(); if (mood !== "error") setMood(showPassword ? "peek" : "away"); }}
                    onFocus={() => setMood(showPassword ? "peek" : "away")}
                    onBlur={handleBlur}
                  />
                  <button
                    ref={eyeRef}
                    type="button"
                    className="login-eye-button"
                    onClick={togglePassword}
                    onBlur={handleBlur}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <div className="login-options login-fx">
                <label className="login-remember">
                  <input type="checkbox" checked={keepConnected} onChange={(event) => setKeepConnected(event.target.checked)} />
                  Manter conectado por 30 dias
                </label>
                <button type="button" className="login-link" disabled title="Indisponível nesta demonstração">Esqueci a senha</button>
              </div>

              <p className={`login-message ${messageType}`} role="alert" aria-live="polite">{message}</p>
              <button className="login-submit login-fx" type="submit" disabled={isLoading}>
                {isLoading && <span className="login-spinner" aria-hidden="true" />}
                <span>{isLoading ? "Entrando" : isConfirmed ? "Acesso confirmado" : "Entrar"}</span>
              </button>
              {isConfirmed && (
                <Link className="login-demo-link" href="/dashboard">Abrir painel de demonstração</Link>
              )}
            </form>

            <div className="login-divider login-fx">ou</div>
            <button className="login-submit login-google login-fx" type="button" disabled title="Indisponível nesta demonstração">Entrar com Google</button>
            <p className="login-foot login-fx">Ainda não tem conta? <button className="login-link" type="button" disabled title="Indisponível nesta demonstração">Falar com a equipe</button></p>
          </section>
        </article>

        <p className="login-caption">Digite a senha e observe como eles reagem.</p>
        <p className="login-demo-note">Demonstração: aceita qualquer e-mail válido e senha com 6 ou mais caracteres. Nenhum dado é enviado.</p>
      </div>
    </main>
  );
}
