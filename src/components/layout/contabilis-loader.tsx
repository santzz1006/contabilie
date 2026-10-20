"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface ContabilisLoaderProps {
  onComplete?: () => void;
}

export function ContabilisLoader({ onComplete }: ContabilisLoaderProps) {
  const [percent, setPercent] = useState(0);
  const [statusMsg, setStatusMsg] = useState("Preparando a competência");
  const [isVisible, setIsVisible] = useState(true);

  const loaderRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const dotRef = useRef<SVGGElement>(null);
  const stampRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isReduced) {
      setPercent(100);
      setStatusMsg("Tudo em ordem");
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, 300);
      return () => clearTimeout(timer);
    }

    const messages = [
      { at: 0, text: "Preparando a competência" },
      { at: 30, text: "Conferindo documentos" },
      { at: 60, text: "Conciliando extratos" },
      { at: 88, text: "Tudo em ordem" },
    ];

    const ctx = gsap.context(() => {
      // Estado inicial
      gsap.set(".lb-bar", { scaleY: 0, transformOrigin: "50% 100%" });
      gsap.set(stampRef.current, { scale: 0, transformOrigin: "50% 50%" });
      gsap.set(".ld-line", { strokeDasharray: 1, strokeDashoffset: 1 });

      const progressObj = { value: 0 };
      let currentMsgIndex = -1;

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: () => {
          setTimeout(() => {
            if (loaderRef.current) {
              gsap.to(loaderRef.current, {
                clipPath: "circle(0% at 50% 50%)",
                duration: 0.75,
                ease: "power3.inOut",
                onComplete: () => {
                  setIsVisible(false);
                  if (onComplete) onComplete();
                },
              });
            }
          }, 350);
        },
      });

      // Entrada dos textos e traços
      tl.from(".loader-txt", { opacity: 0, y: 8, duration: 0.4, stagger: 0.06 }, 0)
        .to(".ld-line:not(.ld-check)", { strokeDashoffset: 0, duration: 0.7, stagger: 0.12 }, 0.1)
        .to(".lb-bar", { scaleY: 1, duration: 0.5, stagger: 0.12, ease: "back.out(1.6)" }, 0.9)
        .to(stampRef.current, { scale: 1, duration: 0.4, ease: "back.out(2.2)" }, 1.8)
        .to(".ld-check", { strokeDashoffset: 0, duration: 0.35 }, 2.0)
        .to(
          progressObj,
          {
            value: 100,
            duration: 3.2,
            ease: "power1.inOut",
            onUpdate: () => {
              const val = Math.round(progressObj.value);
              setPercent(val);

              if (ringRef.current) {
                // Circunferência do raio 104 = 2 * PI * 104 = 653.45
                ringRef.current.style.strokeDashoffset = String(653.5 * (1 - val / 100));
              }

              if (dotRef.current) {
                gsap.set(dotRef.current, { rotation: val * 3.6, transformOrigin: "120px 120px" });
              }

              let nextMsg = 0;
              messages.forEach((m, idx) => {
                if (val >= m.at) nextMsg = idx;
              });

              if (nextMsg !== currentMsgIndex) {
                currentMsgIndex = nextMsg;
                setStatusMsg(messages[nextMsg].text);
              }
            },
          },
          0
        );
    }, loaderRef);

    return () => ctx.revert();
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      ref={loaderRef}
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-1.5 select-none"
      style={{
        backgroundColor: "var(--bg)",
        clipPath: "circle(150% at 50% 50%)",
      }}
    >
      <div
        className="absolute w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{
          background: "var(--blob)",
          filter: "blur(80px)",
        }}
      />

      <svg className="relative w-[min(240px,62vw)] h-auto overflow-visible" viewBox="0 0 240 240" aria-hidden="true">
        {/* Trilho e Anel de Progresso */}
        <circle cx="120" cy="120" r="104" fill="none" stroke="var(--line)" strokeWidth="2" />
        <circle
          ref={ringRef}
          cx="120"
          cy="120"
          r="104"
          fill="none"
          stroke="var(--or)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="653.5"
          strokeDashoffset="653.5"
          transform="rotate(-90 120 120)"
        />

        {/* Ponto orbitando */}
        <g ref={dotRef}>
          <circle cx="120" cy="16" r="6" fill="var(--or)" />
        </g>

        {/* Folha de Lançamento Contábil */}
        <rect
          className="ld-line"
          pathLength={1}
          x="72"
          y="52"
          width="96"
          height="128"
          rx="12"
          fill="var(--surf)"
          stroke="var(--tx)"
          strokeWidth="2"
        />

        {/* Linhas de Escrituração */}
        <path className="ld-line" pathLength={1} d="M90 76h60" stroke="var(--tx2)" strokeWidth="2" strokeLinecap="round" />
        <path className="ld-line" pathLength={1} d="M90 90h42" stroke="var(--tx2)" strokeWidth="2" strokeLinecap="round" />
        <path className="ld-line" pathLength={1} d="M90 104h52" stroke="var(--tx2)" strokeWidth="2" strokeLinecap="round" />

        {/* Quatro Barras Subindo */}
        <rect className="lb-bar" x="90" y="146" width="11" height="22" rx="3" fill="var(--tx)" opacity="0.8" />
        <rect className="lb-bar" x="108" y="134" width="11" height="34" rx="3" fill="var(--tx)" opacity="0.8" />
        <rect className="lb-bar" x="126" y="140" width="11" height="28" rx="3" fill="var(--tx)" opacity="0.8" />
        <rect className="lb-bar" x="144" y="122" width="11" height="46" rx="3" fill="var(--or)" />

        {/* Carimbo com Check em Laranja */}
        <g ref={stampRef}>
          <circle cx="172" cy="176" r="16" fill="var(--or)" />
          <path
            className="ld-line ld-check"
            pathLength={1}
            d="M164 176l6 6 11-12"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>

      <img
        className="loader-txt relative mt-2 w-[min(170px,48vw)] h-auto"
        src="/contabilis-horizontal-claro.svg"
        alt="Contabilis"
      />
      <div className="loader-txt relative text-xs min-h-[20px]" style={{ color: "var(--tx2)" }}>
        {statusMsg}
      </div>
      <div className="loader-txt relative text-xs font-bold num" style={{ color: "var(--or)" }}>
        {percent}%
      </div>
    </div>
  );
}
