import { describe, expect, it, vi } from "vitest";

const { LegalDocument } = vi.hoisted(() => ({ LegalDocument: vi.fn(() => null) }));
vi.mock("./_components/legal-document", () => ({ LegalDocument }));

import CookiesPage, { metadata as cookies } from "./cookies/page";
import PrivacyPage, { metadata as privacy } from "./privacidade/page";
import TermsPage, { metadata as terms } from "./termos/page";

/** Each route renders the WordPress page with its slug; the site's URLs stay short. */
describe.each([
  ["/privacidade", PrivacyPage, privacy, "politica-de-privacidade"],
  ["/termos", TermsPage, terms, "termos-de-servico"],
  ["/cookies", CookiesPage, cookies, "politica-de-cookies"],
])("%s", (_route, Page, metadata, slug) => {
  it(`renders the WordPress page "${slug}"`, () => {
    const element = Page();

    expect(element.type).toBe(LegalDocument);
    expect(element.props.slug).toBe(slug);
  });

  it("has a title and description, and is kept out of search results", () => {
    expect(metadata.title).toBeTruthy();
    expect(metadata.description).toBeTruthy();
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
