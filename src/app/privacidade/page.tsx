import type { Metadata } from "next";

const description =
  "Leia nossa política de privacidade e saiba como tratamos seus dados na Rodovia Veículos.";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description,
  openGraph: {
    title: "Política de Privacidade | Rodovia Veículos",
    description,
    url: "/privacidade",
  },
  twitter: { title: "Política de Privacidade | Rodovia Veículos", description },
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return <div>Privacy Page</div>;
}
