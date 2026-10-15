import { describe, expect, it } from "vitest";

import { buildVehicleJsonLd, extractSeoFields, pickAttribute, stripHtml } from "./seo";

// `extractSeoFields` receives the unmasked SEO fragment; a structural stand-in is enough.
const seoProduct = (overrides: Record<string, unknown> = {}) =>
  ({
    name: "Produto genérico",
    shortDescription: "<p>Único dono,   revisado.</p>",
    image: { sourceUrl: "https://wp.test/car.jpg" },
    price: "45000",
    attributes: {
      nodes: [
        { name: "pa_brand", options: ["Fiat"] },
        { name: "pa_model", options: ["Argo"] },
        { name: "pa_yearmodel", options: ["2021"] },
        { name: "pa_mileage", options: ["32000"] },
        { name: "pa_fuel", options: ["Flex"] },
        { name: "pa_transmission", options: ["Manual"] },
        { name: "pa_color", options: ["Branco"] },
        { name: "pa_doors", options: ["4"] },
        { name: "pa_version", options: ["Drive 1.0"] },
      ],
    },
    ...overrides,
  }) as never;

describe("pickAttribute", () => {
  const nodes = [{ name: "PA_Brand", options: ["Fiat", "Outra"] }, { name: "pa_model" }];

  it("matches the attribute name case-insensitively and returns its first option", () => {
    expect(pickAttribute(nodes, "pa_brand")).toBe("Fiat");
  });

  it("returns an empty string when the attribute or its options are missing", () => {
    expect(pickAttribute(nodes, "pa_model")).toBe("");
    expect(pickAttribute(nodes, "pa_color")).toBe("");
    expect(pickAttribute(null, "pa_brand")).toBe("");
  });
});

describe("stripHtml", () => {
  it("removes tags and collapses whitespace", () => {
    expect(stripHtml("<p>Olá  <b>mundo</b>\n!</p>")).toBe("Olá mundo !");
  });

  it("handles empty input", () => {
    expect(stripHtml(null)).toBe("");
    expect(stripHtml(undefined)).toBe("");
  });
});

describe("extractSeoFields", () => {
  it("builds the headline from brand, model and year", () => {
    const seo = extractSeoFields(seoProduct());

    expect(seo.headline).toBe("Fiat Argo 2021");
    expect(seo.description).toBe("Único dono, revisado.");
    expect(seo.price).toBe(45000);
    expect(seo.image).toBe("https://wp.test/car.jpg");
    expect(seo.version).toBe("Drive 1.0");
  });

  it("falls back to the product name, then to a generic title", () => {
    const noAttributes = { attributes: { nodes: [] } };

    expect(extractSeoFields(seoProduct(noAttributes)).headline).toBe("Produto genérico");
    expect(extractSeoFields(seoProduct({ ...noAttributes, name: null })).headline).toBe("Veículo");
  });

  it("composes a description from price and mileage when there is no short description", () => {
    const seo = extractSeoFields(seoProduct({ shortDescription: null }));

    expect(seo.description).toContain("32.000 km");
    expect(seo.description).toContain("Rodovia");
  });

  it("returns a null price when it is not numeric", () => {
    expect(extractSeoFields(seoProduct({ price: "consulte" })).price).toBeNull();
  });
});

describe("buildVehicleJsonLd", () => {
  it("describes the car, its offer and the breadcrumb", () => {
    const jsonLd = buildVehicleJsonLd(extractSeoFields(seoProduct()), "123") as {
      "@graph": Array<Record<string, any>>;
    };
    const [car, breadcrumbs] = jsonLd["@graph"];

    expect(car["@type"]).toBe("Car");
    expect(car.url).toMatch(/\/estoque\/123$/);
    expect(car.mileageFromOdometer.value).toBe(32000);
    expect(car.numberOfDoors).toBe(4);
    expect(car.offers).toMatchObject({ price: 45000, priceCurrency: "BRL" });
    expect(breadcrumbs.itemListElement).toHaveLength(3);
  });

  it("omits the offer when the price is unknown", () => {
    const jsonLd = buildVehicleJsonLd(extractSeoFields(seoProduct({ price: "consulte" })), "1") as {
      "@graph": Array<Record<string, unknown>>;
    };

    expect(jsonLd["@graph"][0]).not.toHaveProperty("offers");
  });
});
