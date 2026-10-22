"use client";

import { useEffect, useState } from "react";

export function MobileUnavailableGate({ children }: { children: React.ReactNode }) {
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 860px)");
    const update = () => setBlocked(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  if (blocked) return <iframe title="Contabilis — versão mobile indisponível" src="/mobile-indisponivel.html" className="fixed inset-0 h-dvh w-screen border-0" />;
  return children;
}
