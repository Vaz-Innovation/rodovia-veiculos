import { queryOptions, skipToken } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { runQuery } from "./run-query";

describe("runQuery", () => {
  it("runs the options' queryFn with their key and resolves to its data", async () => {
    const queryFn = vi.fn(async () => ({ ok: true }));
    const options = queryOptions({ queryKey: ["graph", "query A { ok }", {}] as const, queryFn });

    await expect(runQuery(options)).resolves.toEqual({ ok: true });
    expect(queryFn).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["graph", "query A { ok }", {}] }),
    );
  });

  it("propagates the queryFn's error untouched (no retries, no wrapping)", async () => {
    const error = new Error("down");
    const queryFn = vi.fn(async () => {
      throw error;
    });

    await expect(runQuery(queryOptions({ queryKey: ["x"], queryFn }))).rejects.toBe(error);
    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it("refuses options without a queryFn", async () => {
    await expect(runQuery({ queryKey: ["x"], queryFn: skipToken })).rejects.toThrow("no queryFn");
  });
});
