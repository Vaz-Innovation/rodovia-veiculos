import { beforeEach, describe, expect, it, vi } from "vitest";

const { getLegalPage } = vi.hoisted(() => ({ getLegalPage: vi.fn() }));
vi.mock("../_loaders/get-legal-page", () => ({ getLegalPage }));

import { LegalDocument } from "./legal-document";

const render = () => LegalDocument({ slug: "termos", kicker: "Termos" });

describe("LegalDocument", () => {
  beforeEach(() => {
    getLegalPage.mockReset();
  });

  it("renders the page when it exists", async () => {
    getLegalPage.mockResolvedValue({ title: "Termos", content: "<p>x</p>", modified: null });

    await expect(render()).resolves.toBeTruthy();
    expect(getLegalPage).toHaveBeenCalledWith("termos");
  });

  it("triggers notFound() when the page is missing or unpublished", async () => {
    getLegalPage.mockResolvedValue(null);

    await expect(render()).rejects.toMatchObject({ digest: expect.stringContaining("404") });
  });

  it("rethrows other errors so Next renders the error boundary, not a 404", async () => {
    const error = new Error("WordPress is down");
    getLegalPage.mockRejectedValue(error);

    await expect(render()).rejects.toBe(error);
  });
});
