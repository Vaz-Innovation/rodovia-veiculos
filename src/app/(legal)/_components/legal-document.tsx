import { notFound } from "next/navigation";

import { tryCatch } from "@/lib/try-catch";
import { formatModified } from "../_helpers/format-modified";
import { getLegalPage } from "../_loaders/get-legal-page";

/**
 * Renders a WordPress page as a legal document. The HTML comes from the site's
 * own WordPress (trusted editors), so it is injected as-is.
 */
export async function LegalDocument({ slug, kicker }: { slug: string; kicker: string }) {
  const [page, error] = await tryCatch(getLegalPage(slug));
  if (error) throw error;
  if (!page) notFound();

  const modified = formatModified(page.modified);

  return (
    <article>
      <header className="mb-12 border-b border-border pb-10">
        <p className="mb-6 text-[11px] uppercase tracking-[0.5em] text-foreground/70">{kicker}</p>
        <h1 className="text-4xl font-light tracking-tight md:text-6xl">{page.title}</h1>
        {modified && (
          <p className="mt-6 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Última atualização: {modified}
          </p>
        )}
      </header>

      <div className="legal-content" dangerouslySetInnerHTML={{ __html: page.content }} />
    </article>
  );
}
