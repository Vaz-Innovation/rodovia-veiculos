import { beforeEach, describe, expect, it, vi } from "vitest";

import { gqlInfiniteOptions, gqlQueryOptions } from "./gqlpc";
import type { TypedDocumentString } from "./__gen__/graphql";

const { execute } = vi.hoisted(() => ({ execute: vi.fn() }));
vi.mock("./execute", () => ({ execute }));

const query = { toString: () => "query  A {\n  a { b }\n}" } as unknown as TypedDocumentString<
  { a: { b: string } },
  Record<string, never>
>;
const queryWithVars = {
  toString: () => "query B($id: ID!) { item(id: $id) { name } }",
} as unknown as TypedDocumentString<{ item: { name: string } }, { id: string }>;

describe("gqlQueryOptions", () => {
  beforeEach(() => {
    execute.mockReset();
  });

  it("keys the query on the normalized document and its variables", () => {
    const options = gqlQueryOptions(queryWithVars, { input: { id: "1" } });

    expect(options.queryKey).toEqual([
      "graph",
      "query B($id: ID!) { item(id: $id) { name } }",
      { id: "1" },
    ]);
  });

  it("executes the document through the app transport", async () => {
    execute.mockResolvedValue({ item: { name: "Uno" } });
    const options = gqlQueryOptions(queryWithVars, { input: { id: "1" } });

    await expect((options.queryFn as () => Promise<unknown>)()).resolves.toEqual({
      item: { name: "Uno" },
    });
    expect(execute).toHaveBeenCalledWith(queryWithVars, { id: "1" });
  });

  it("calls execute without variables for variable-less documents", async () => {
    execute.mockResolvedValue({ a: { b: "x" } });

    await (gqlQueryOptions(query).queryFn as () => Promise<unknown>)();

    expect(execute).toHaveBeenCalledWith(query);
  });
});

describe("gqlInfiniteOptions", () => {
  it("leaves the variables out of the key (callers add what scopes the data)", () => {
    const options = gqlInfiniteOptions(queryWithVars, {
      input: () => ({ id: "1" }),
      initialPageParam: null as string | null,
      getNextPageParam: () => null,
    });

    expect(options.queryKey).toEqual(["graph", "query B($id: ID!) { item(id: $id) { name } }"]);
  });
});
