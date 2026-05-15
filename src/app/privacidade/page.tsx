import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Leia nossa política de privacidade e saiba como tratamos seus dados na Rodovia Veículos.",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return <div>Privacy Page</div>;
}
