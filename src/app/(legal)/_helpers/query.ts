import { graphql } from "@/graphql/__gen__";
import { gqlQueryOptions } from "@/graphql/gqlpc";

export const LegalPage_Query = graphql(`
  query LegalPage($uri: ID!) {
    page(id: $uri, idType: URI) {
      title
      content
      modified
      status
    }
  }
`);

export const getLegalPageQueryOptions = (slug: string) =>
  gqlQueryOptions(LegalPage_Query, { input: { uri: `/${slug}/` } });
