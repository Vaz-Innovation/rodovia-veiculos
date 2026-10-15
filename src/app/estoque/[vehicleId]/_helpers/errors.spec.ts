import { describe, expect, it } from "vitest";

import { GraphQLResponseError } from "@/lib/graphql/error";
import { isMissingProductError } from "./errors";

const error = (...errors: ConstructorParameters<typeof GraphQLResponseError>[0][number][]) =>
  new GraphQLResponseError(errors);

describe("isMissingProductError", () => {
  it("recognizes WPGraphQL's error for an unknown database id", () => {
    expect(
      isMissingProductError(
        error({ message: "No product exists with the database_id: 999999", path: ["product"] }),
      ),
    ).toBe(true);
  });

  it("recognizes the error for a malformed id", () => {
    expect(
      isMissingProductError(
        error({
          message: "No product ID was found corresponding to the database_id: abc",
          path: ["product"],
        }),
      ),
    ).toBe(true);
  });

  it("does not mistake other failures for a missing vehicle", () => {
    expect(
      isMissingProductError(error({ message: "Internal server error", path: ["product"] })),
    ).toBe(false);
    expect(
      isMissingProductError(
        error({ message: "No product exists with the database_id: 1", path: ["products"] }),
      ),
    ).toBe(false);
    expect(isMissingProductError(new Error("No product exists with the database_id: 1"))).toBe(
      false,
    );
    expect(isMissingProductError(null)).toBe(false);
  });

  it("requires every error to be the missing-product one", () => {
    expect(
      isMissingProductError(
        error(
          { message: "No product exists with the database_id: 1", path: ["product"] },
          { message: "Something else broke", path: ["product", "price"] },
        ),
      ),
    ).toBe(false);
  });
});
