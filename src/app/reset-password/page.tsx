import type { Metadata } from "next";

import { ResetPasswordClient } from "./reset-password-client";

export const metadata: Metadata = {
  title: "Redefinir senha — Rodovia Veículos",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
