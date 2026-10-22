import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contabilis | Entrar",
  description: "Acesse com segurança o painel do seu escritório no Contabilis.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
