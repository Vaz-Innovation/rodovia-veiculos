import { beforeEach, describe, expect, it, vi } from "vitest";

import { cacheLife } from "next/cache";

const { getSitemapProducts } = vi.hoisted(() => ({ getSitemapProducts: vi.fn() }));
vi.mock("./_loaders/get-sitemap-products", () => ({ getSitemapProducts }));

import sitemap from "./sitemap";

const vehicleUrls = (entries: Awaited<ReturnType<typeof sitemap>>) =>
  entries.map((entry) => entry.url).filter((url) => url.includes("/estoque/"));

describe("sitemap", () => {
  beforeEach(() => {
    getSitemapProducts.mockReset();
    vi.mocked(cacheLife).mockClear();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("lists the static routes plus one entry per vehicle, cached for hours", async () => {
    getSitemapProducts.mockResolvedValue({
      products: [
        { id: 7, date: "2026-01-02T00:00:00" },
        { id: 8, date: null },
      ],
      error: null,
    });

    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls.some((url) => url.endsWith("/estoque/7"))).toBe(true);
    expect(urls.some((url) => url.endsWith("/estoque/8"))).toBe(true);
    expect(urls.some((url) => url.endsWith("/delivery"))).toBe(true);
    expect(entries.find((entry) => entry.url.endsWith("/estoque/7"))?.lastModified).toEqual(
      new Date("2026-01-02T00:00:00"),
    );
    expect(cacheLife).toHaveBeenCalledWith("hours");
    expect(console.error).not.toHaveBeenCalled();
  });

  it("keeps the vehicles collected before a later page failed, with a short-lived cache", async () => {
    getSitemapProducts.mockResolvedValue({
      products: [{ id: 7, date: null }],
      error: new Error("page 2 down"),
    });

    const entries = await sitemap();

    expect(vehicleUrls(entries)).toHaveLength(1);
    expect(console.error).toHaveBeenCalled();
    expect(cacheLife).toHaveBeenCalledWith("minutes");
  });

  it("degrades to the static routes (short-lived) when WordPress is unreachable", async () => {
    getSitemapProducts.mockRejectedValue(new Error("down"));

    const entries = await sitemap();

    expect(entries.length).toBeGreaterThan(0);
    expect(vehicleUrls(entries)).toHaveLength(0);
    expect(console.error).toHaveBeenCalled();
    expect(cacheLife).toHaveBeenCalledWith("minutes");
  });
});
