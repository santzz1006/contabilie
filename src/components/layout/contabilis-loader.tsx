"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

interface ContabilisLoaderProps {
  onComplete?: () => void;
}

export function ContabilisLoader({ onComplete }: ContabilisLoaderProps) {
  const [visible, setVisible] = useState(true);
  const pathname = usePathname();
  const finishTimer = useRef<number | null>(null);
  const fallbackTimer = useRef<number | null>(null);

  useEffect(() => {
    setVisible(true);
    fallbackTimer.current = window.setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 8000);
    return () => {
      if (finishTimer.current !== null) window.clearTimeout(finishTimer.current);
      if (fallbackTimer.current !== null) window.clearTimeout(fallbackTimer.current);
    };
  }, [pathname, onComplete]);

  const finishAfterFrameLoads = () => {
    if (fallbackTimer.current !== null) window.clearTimeout(fallbackTimer.current);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    finishTimer.current = window.setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, reducedMotion ? 900 : 3400);
  };

  if (!visible) return null;
  return (
    <iframe
      title="Carregando o Contabilis"
      src="/contabilis-loader.html"
      key={pathname}
      onLoad={finishAfterFrameLoads}
      className="fixed inset-0 z-[100] h-dvh w-screen border-0"
      aria-busy="true"
    />
  );
}
