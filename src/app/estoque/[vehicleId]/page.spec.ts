import { beforeEach, describe, expect, it, vi } from "vitest";

const { getVehicle, getAllVehicleIds } = vi.hoisted(() => ({
  getVehicle: vi.fn(),
  getAllVehicleIds: vi.fn(),
}));

vi.mock("./_loaders/get-vehicle", () => ({ getVehicle }));
vi.mock("./_loaders/get-all-vehicle-ids", () => ({ getAllVehicleIds }));
vi.mock("./client-page", () => ({ VehicleDetailClient: () => null }));
vi.mock("@/components/site-header", () => ({ SiteHeader: () => null }));

import { generateMetadata, generateStaticParams } from "./page";

const product = {
  name: "Uno",
  shortDescription: "<p>Econômico</p>",
  image: { sourceUrl: "https://wp.test/uno.jpg" },
  price: "35000",
  attributes: {
    nodes: [
      { name: "pa_brand", options: ["Fiat"] },
      { name: "pa_model", options: ["Uno"] },
      { name: "pa_yearmodel", options: ["2020"] },
    ],
  },
};

const params = (vehicleId: string) => ({ params: Promise.resolve({ vehicleId }) });

describe("generateStaticParams", () => {
  beforeEach(() => {
    getAllVehicleIds.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("maps every vehicle id to a route param", async () => {
    getAllVehicleIds.mockResolvedValue({ ids: ["1", "2"], error: null });

    await expect(generateStaticParams()).resolves.toEqual([{ vehicleId: "1" }, { vehicleId: "2" }]);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("keeps the ids collected before a later page failed and warns", async () => {
    getAllVehicleIds.mockResolvedValue({ ids: ["1", "2"], error: new Error("page 2 down") });

    await expect(generateStaticParams()).resolves.toEqual([{ vehicleId: "1" }, { vehicleId: "2" }]);
    expect(console.warn).toHaveBeenCalled();
  });

  it("logs and falls back to on-demand generation when the catalog is unreachable", async () => {
    getAllVehicleIds.mockRejectedValue(new Error("down"));

    await expect(generateStaticParams()).resolves.toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });
});

describe("generateMetadata", () => {
  beforeEach(() => {
    getVehicle.mockReset();
  });

  it("builds SEO metadata from the vehicle", async () => {
    getVehicle.mockResolvedValue({ product });

    const metadata = await generateMetadata(params("7"));

    expect(metadata.title).toBe("Fiat Uno 2020");
    expect(metadata.description).toBe("Econômico");
    expect(metadata.alternates?.canonical).toBe("/estoque/7");
  });

  it("returns the 'not found' title when the loader finds no vehicle", async () => {
    getVehicle.mockResolvedValue(null);

    await expect(generateMetadata(params("999"))).resolves.toEqual({
      title: "Veículo não encontrado",
    });
  });

  it("surfaces any other failure instead of rendering it as 'not found'", async () => {
    const error = new Error("WordPress is down");
    getVehicle.mockRejectedValue(error);

    await expect(generateMetadata(params("1"))).rejects.toBe(error);
  });
});
