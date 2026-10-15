import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: [process.env.WORDPRESS_API_URL || "http://localhost:8080/graphql"],
  ignoreNoDocuments: true,
  // Specs build throwaway documents against fake schemas (e.g. the vendored
  // lib's `todos` fixtures); they are not part of the app's operations.
  documents: ["src/**/*.{ts,tsx}", "!src/**/*.spec.{ts,tsx}"],
  generates: {
    "./src/graphql/__gen__/": {
      preset: "client",
      plugins: [],
      config: {
        documentMode: "string",
      },
    },
    "./src/graphql/__gen__/possible-types.json": {
      plugins: ["fragment-matcher"],
      config: {
        useExplicitTyping: true,
      },
    },
  },
};

export default config;
