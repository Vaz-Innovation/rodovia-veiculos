import type { Metadata } from "next";

const description = "Leia os termos e condições de uso dos serviços da Rodovia Veículos.";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description,
  openGraph: { title: "Termos de Uso | Rodovia Veículos", description, url: "/termos" },
  twitter: { title: "Termos de Uso | Rodovia Veículos", description },
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return <div>Terms Page</div>;
}
