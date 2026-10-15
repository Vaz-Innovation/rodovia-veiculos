import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const alias = { "@": fileURLToPath(new URL("./src", import.meta.url)) };

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: "node",
          globals: true,
          environment: "node",
          include: ["src/**/*.spec.ts"],
          setupFiles: ["./vitest.setup.ts"],
        },
      },
      {
        resolve: { alias },
        test: {
          name: "dom",
          globals: true,
          environment: "jsdom",
          include: ["src/**/*.spec.tsx"],
          setupFiles: ["./vitest.setup.ts"],
        },
      },
    ],
  },
});
