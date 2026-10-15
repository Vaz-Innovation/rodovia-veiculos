import { beforeEach, describe, expect, it, vi } from "vitest";

import { GraphQLResponseError } from "@/lib/graphql/error";
import { LegalPage_Query } from "../_helpers/query";
import { getLegalPage } from "./get-legal-page";

const { execute } = vi.hoisted(() => ({ execute: vi.fn() }));
vi.mock("@/graphql/execute", () => ({ execute }));

describe("getLegalPage", () => {
  beforeEach(() => {
    execute.mockReset();
  });

  it("looks the page up by URI", async () => {
    execute.mockResolvedValue({
      page: { title: "T", content: "<p>c</p>", modified: "d", status: "publish" },
    });

    await expect(getLegalPage("termos")).resolves.toEqual({
      title: "T",
      content: "<p>c</p>",
      modified: "d",
    });
    expect(execute).toHaveBeenCalledWith(
      LegalPage_Query,
      { uri: "/termos/" },
      { next: { tags: ["page", "page:termos"], revalidate: 3600 } },
    );
  });

  it.each([
    ["missing", { page: null }],
    ["a draft", { page: { title: "T", status: "draft" } }],
    ["private", { page: { title: "T", status: "private" } }],
  ])("returns null when the page is %s", async (_label, response) => {
    execute.mockResolvedValue(response);

    await expect(getLegalPage("termos")).resolves.toBeNull();
  });

  it("returns null when the backend answers 404", async () => {
    execute.mockRejectedValue(
      new GraphQLResponseError([{ message: "nope", extensions: { code: "NOT_FOUND" } }]),
    );

    await expect(getLegalPage("termos")).resolves.toBeNull();
  });

  it("defaults nullable fields", async () => {
    execute.mockResolvedValue({ page: { status: "publish" } });

    await expect(getLegalPage("termos")).resolves.toEqual({
      title: "",
      content: "",
      modified: null,
    });
  });

  it("propagates errors instead of caching them as a missing page", async () => {
    execute.mockRejectedValue(new Error("down"));

    await expect(getLegalPage("termos")).rejects.toThrow("down");
  });
});
