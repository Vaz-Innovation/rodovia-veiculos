# WooCommerce Multi-Attribute GraphQL Filter

A WordPress plugin that extends **WPGraphQL for WooCommerce** (WooGraphQL) to let you filter products by **multiple attribute taxonomies** in a single GraphQL query.

---

## Requirements

| Dependency | Minimum version |
|---|---|
| WordPress | 6.0+ |
| WooCommerce | 7.0+ |
| WPGraphQL | 1.14+ |
| WPGraphQL for WooCommerce | 0.18+ |

---

## Installation

1. Copy the `wc-multi-attribute-filter/` folder into `wp-content/plugins/`.
2. Activate it from **Plugins → Installed Plugins**.
3. That's it — no settings page needed.

---

## Usage

### New `where` fields

| Field | Type | Description |
|---|---|---|
| `multiAttributes` | `[MultiAttributeFilterInput]` | List of attribute groups to filter by |
| `multiAttributeRelation` | `AttributeGroupRelationEnum` | How groups are combined: `AND` (default) or `OR` |

### `MultiAttributeFilterInput` fields

| Field | Type | Default | Description |
|---|---|---|---|
| `taxonomy` | `String!` | — | Taxonomy slug, e.g. `"pa_color"` (case-insensitive) |
| `terms` | `[String]` | — | Term slugs (or names/IDs depending on `field`) |
| `field` | `String` | `slug` | Match field: `slug`, `name`, `term_id` |
| `operator` | `AttributeTermOperatorEnum` | `IN` | `IN`, `AND`, or `NOT_IN` |

### `AttributeTermOperatorEnum`

| Value | Meaning |
|---|---|
| `IN` | Product has **any** of the listed terms |
| `AND` | Product has **all** of the listed terms |
| `NOT_IN` | Product has **none** of the listed terms |

---

## Query examples

### AND — must match color AND size

```graphql
query {
  products(where: {
    multiAttributes: [
      { taxonomy: "pa_color", terms: ["branco", "preto"], operator: IN }
      { taxonomy: "pa_size",  terms: ["M", "G"],          operator: IN }
    ]
    multiAttributeRelation: AND
  }) {
    nodes { id name }
  }
}
```

### OR — match color OR material

```graphql
query {
  products(where: {
    multiAttributes: [
      { taxonomy: "pa_color",    terms: ["azul"] }
      { taxonomy: "pa_material", terms: ["algodao"] }
    ]
    multiAttributeRelation: OR
  }) {
    nodes { id name }
  }
}
```

### Exclusion — has color but NOT a specific size

```graphql
query {
  products(where: {
    multiAttributes: [
      { taxonomy: "pa_color", terms: ["vermelho"], operator: IN }
      { taxonomy: "pa_size",  terms: ["PP"],       operator: NOT_IN }
    ]
    multiAttributeRelation: AND
  }) {
    nodes { id name }
  }
}
```

### Combine with existing WooGraphQL `attributes` filter

Both filters stack independently — the `tax_query` entries are merged with `AND` logic relative to each other.

```graphql
query {
  products(where: {
    attributes: {
      queries: { taxonomy: PA_COLOR, terms: ["branco"] }
    }
    multiAttributes: [
      { taxonomy: "pa_size", terms: ["M"] }
    ]
  }) {
    nodes { id name }
  }
}
```

---

## How it works

1. **`register_types`** (hooked on `graphql_register_types`) — Registers three new GraphQL types and extends the product connection where-args:
   - `MultiAttributeFilterInput` (input object)
   - `AttributeTermOperatorEnum`
   - `AttributeGroupRelationEnum`
   - Adds `multiAttributes` and `multiAttributeRelation` fields to `RootQueryToProductConnectionWhereArgs` and `RootQueryToProductUnionConnectionWhereArgs`.

2. **`apply_tax_query`** — Hooked on `graphql_product_connection_query_args`. Reads the new where args from the connection's `$args`, and injects a properly structured `tax_query` array into the underlying `WP_Query` (merging with any existing `tax_query`).

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| No results even with correct terms | Check that `field` matches what you pass (`slug` vs `name`) |
| Unknown taxonomy error | Confirm the attribute exists in **WooCommerce → Attributes** |
| New fields not visible in schema | Flush WPGraphQL type cache: **GraphQL → Settings → Delete Cache** |
| Conflicts with existing `attributes` filter | Both are merged — check for duplicate `taxonomy` entries |
