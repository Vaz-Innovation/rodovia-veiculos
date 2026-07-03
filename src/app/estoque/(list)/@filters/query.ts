import { graphql } from "@/graphql/__gen__";
import { gqlQueryOptions } from "@/graphql/gqlpc";
import type { VehicleFilterOptionsQuery } from "@/graphql/__gen__/graphql";
import type {
  VehicleFilterApiOptions,
  VehicleFilterOption,
  VehicleFilterTagOption,
} from "@/hooks/useVehicleFilters";

export const VehicleFilterOptions_Query = graphql(`
  query VehicleFilterOptions {
    productCategories(first: 100) {
      nodes {
        name
        slug
      }
    }
    productTags(first: 100) {
      nodes {
        databaseId
        name
        slug
      }
    }
    brands: productAttributeTerms(taxonomy: "pa_attribute_brand") {
      name
      slug
    }
    models: productAttributeTerms(taxonomy: "pa_model") {
      name
      slug
    }
    transmissions: productAttributeTerms(taxonomy: "pa_transmission") {
      name
      slug
    }
    fuels: productAttributeTerms(taxonomy: "pa_fuel") {
      name
      slug
    }
    colors: productAttributeTerms(taxonomy: "pa_color") {
      name
      slug
    }
    conditions: productAttributeTerms(taxonomy: "pa_condition") {
      name
      slug
    }
  }
`);

export function getVehicleFilterOptionsQueryOptions() {
  // The filter options are cached server-side (`use cache` + cacheTag) and hydrated
  // into the client, so a finite staleTime is enough — no need for Infinity anymore.
  return gqlQueryOptions(VehicleFilterOptions_Query, {
    staleTime: 5 * 60 * 1000,
  });
}

type TermNodes =
  | Array<{ name?: string | null; slug?: string | null } | null | undefined>
  | null
  | undefined;

type TagNodes =
  | Array<
      { databaseId?: number | null; name?: string | null; slug?: string | null } | null | undefined
    >
  | null
  | undefined;

const fromNodes = (nodes: TermNodes): VehicleFilterOption[] =>
  (nodes ?? [])
    .map((n) => ({ name: n?.name ?? "", slug: n?.slug ?? "" }))
    .filter((n) => n.name && n.slug)
    .sort((a, b) => a.name.localeCompare(b.name));

const tagsFromNodes = (nodes: TagNodes): VehicleFilterTagOption[] =>
  (nodes ?? [])
    .map((n) => ({
      id: Number(n?.databaseId ?? 0),
      name: n?.name ?? "",
      slug: n?.slug ?? "",
    }))
    .filter((t) => t.id > 0 && t.name)
    .sort((a, b) => a.name.localeCompare(b.name));

/** Maps the raw VehicleFilterOptions query result into sorted dropdown options. */
export function mapFilterOptions(data: VehicleFilterOptionsQuery = {}): VehicleFilterApiOptions {
  return {
    brands: fromNodes(data.brands),
    categories: fromNodes(data.productCategories?.nodes),
    tags: tagsFromNodes(data.productTags?.nodes),
    models: fromNodes(data.models),
    transmissions: fromNodes(data.transmissions),
    fuels: fromNodes(data.fuels),
    colors: fromNodes(data.colors),
    conditions: fromNodes(data.conditions),
  };
}
