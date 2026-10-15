import { cacheLife, cacheTag } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GraphQLResponseError } from "@/lib/graphql/error";
import { CarById_Query } from "../_helpers/query";
import { getVehicle } from "./get-vehicle";

const { execute } = vi.hoisted(() => ({ execute: vi.fn() }));
vi.mock("@/graphql/execute", () => ({ execute }));

describe("getVehicle", () => {
  beforeEach(() => {
    execute.mockReset();
  });

  it("queries the vehicle by id", async () => {
    execute.mockResolvedValue({ product: { name: "Fiat Uno" } });

    await expect(getVehicle("42")).resolves.toEqual({ product: { name: "Fiat Uno" } });
    expect(execute).toHaveBeenCalledWith(CarById_Query, { id: "42" });
    expect(cacheTag).toHaveBeenCalledWith("vehicle", "vehicle:42");
    expect(cacheLife).toHaveBeenCalledWith("inventory");
  });

  it("resolves a missing vehicle ({ product: null }) to null", async () => {
    execute.mockResolvedValue({ product: null });

    await expect(getVehicle("999")).resolves.toBeNull();
  });

  it("resolves a backend 404 to null (checked here, where the error is still intact)", async () => {
    execute.mockRejectedValue(
      new GraphQLResponseError([{ message: "nope", extensions: { code: "NOT_FOUND" } }]),
    );

    await expect(getVehicle("999")).resolves.toBeNull();
  });

  it('resolves WPGraphQL\'s "No product exists" error (unknown id) to null, and caches that', async () => {
    execute.mockRejectedValue(
      new GraphQLResponseError([
        { message: "No product exists with the database_id: 999999", path: ["product"] },
      ]),
    );

    await expect(getVehicle("999999")).resolves.toBeNull();
    expect(cacheLife).toHaveBeenCalledWith("inventory");
  });

  it("propagates other GraphQL errors instead of turning them into null", async () => {
    const error = new GraphQLResponseError([
      { message: "boom", extensions: { code: "INTERNAL_SERVER_ERROR" } },
    ]);
    execute.mockRejectedValue(error);

    await expect(getVehicle("1")).rejects.toBe(error);
  });

  it("propagates transport failures (so they are not cached as 'not found')", async () => {
    execute.mockRejectedValue(new Error("fetch failed"));

    await expect(getVehicle("1")).rejects.toThrow("fetch failed");
  });
});
