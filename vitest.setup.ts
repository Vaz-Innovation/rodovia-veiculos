import { vi } from "vitest";

// `server-only` throws when imported outside a React Server Component bundle.
vi.mock("server-only", () => ({}));

// `cacheLife`/`cacheTag` only work inside a real `use cache` scope; the
// directive itself is just a string literal and is a no-op under Vitest.
vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));
