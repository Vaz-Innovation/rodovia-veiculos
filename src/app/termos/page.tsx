import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Leia os termos e condições de uso dos serviços da Rodovia Veículos.",
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return <div>Terms Page</div>;
}
