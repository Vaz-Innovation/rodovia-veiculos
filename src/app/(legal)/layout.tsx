import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { LegalNav } from "./_components/legal-nav";

/**
 * Shared shell for the legal pages (`/privacidade`, `/termos`). The `(legal)`
 * route group adds no URL segment — it only gives these WordPress-backed pages
 * a common header, document switcher and footer.
 */
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 pt-32 pb-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <div className="mb-14">
            <LegalNav />
          </div>
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
