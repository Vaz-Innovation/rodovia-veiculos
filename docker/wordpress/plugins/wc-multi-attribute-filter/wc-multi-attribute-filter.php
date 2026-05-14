<?php
/**
 * Plugin Name: WooCommerce Multi-Attribute GraphQL Filter
 * Plugin URI:  https://github.com/your-repo/wc-multi-attribute-filter
 * Description: Extends WPGraphQL for WooCommerce with a `multiAttributes` where-arg
 *              that filters products by multiple attribute taxonomies in a single query.
 * Version:     1.0.0
 * Author:      Your Name
 * License:     GPL-2.0+
 * Text Domain: wc-multi-attribute-filter
 *
 * Requires WPGraphQL and WPGraphQL for WooCommerce (WooGraphQL) to be active.
 *
 * --------------------------------------------------------------------------
 * Usage example:
 *
 *   query {
 *     products(where: {
 *       multiAttributes: [
 *         { taxonomy: "pa_color", terms: ["branco", "preto"], operator: IN }
 *         { taxonomy: "pa_size",  terms: ["M", "G"],          operator: IN }
 *       ]
 *       multiAttributeRelation: AND
 *     }) {
 *       nodes { id name }
 *     }
 *   }
 *
 * multiAttributeRelation controls how the taxonomy groups are joined:
 *   AND  – product must match every group (default)
 *   OR   – product must match at least one group
 *
 * operator (per group) controls how terms inside a group are joined:
 *   IN      – any of the listed terms  (default)
 *   AND     – all of the listed terms
 *   NOT_IN  – none of the listed terms
 * --------------------------------------------------------------------------
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class WC_Multi_Attribute_Filter {

	/** Connection where-args types we extend with `multiAttributes`. */
	private const PRODUCT_WHERE_ARG_TYPES = [
		'RootQueryToProductConnectionWhereArgs',
		'RootQueryToProductUnionConnectionWhereArgs',
	];

	public static function register_types(): void {
		// Guard: bail silently if WPGraphQL or WooGraphQL aren't available.
		if ( ! function_exists( 'register_graphql_input_type' )
			|| ! class_exists( '\\WPGraphQL\\WooCommerce\\WooCommerce' ) ) {
			return;
		}

		register_graphql_enum_type( 'AttributeTermOperatorEnum', [
			'description' => __( 'How terms inside a single attribute group are evaluated.', 'wc-multi-attribute-filter' ),
			'values'      => [
				'IN'     => [ 'value' => 'IN',     'description' => 'Product has ANY of the listed terms.' ],
				'AND'    => [ 'value' => 'AND',    'description' => 'Product has ALL of the listed terms.' ],
				'NOT_IN' => [ 'value' => 'NOT IN', 'description' => 'Product has NONE of the listed terms.' ],
			],
		] );

		register_graphql_enum_type( 'AttributeGroupRelationEnum', [
			'description' => __( 'How multiple attribute groups are combined.', 'wc-multi-attribute-filter' ),
			'values'      => [
				'AND' => [ 'value' => 'AND', 'description' => 'Product must satisfy every attribute group.' ],
				'OR'  => [ 'value' => 'OR',  'description' => 'Product must satisfy at least one attribute group.' ],
			],
		] );

		register_graphql_input_type( 'MultiAttributeFilterInput', [
			'description' => __( 'Filter products by a single attribute taxonomy.', 'wc-multi-attribute-filter' ),
			'fields'      => [
				'taxonomy' => [
					'type'        => [ 'non_null' => 'String' ],
					'description' => __( 'Attribute taxonomy slug, e.g. "pa_color".', 'wc-multi-attribute-filter' ),
				],
				'terms'    => [
					'type'        => [ 'list_of' => 'String' ],
					'description' => __( 'Term slugs (or names/IDs depending on `field`).', 'wc-multi-attribute-filter' ),
				],
				'field'    => [
					'type'        => 'String',
					'description' => __( 'Term field to compare: slug (default), name, term_id.', 'wc-multi-attribute-filter' ),
				],
				'operator' => [
					'type'        => 'AttributeTermOperatorEnum',
					'description' => __( 'How terms inside this group are evaluated (default: IN).', 'wc-multi-attribute-filter' ),
				],
			],
		] );

		foreach ( self::PRODUCT_WHERE_ARG_TYPES as $type ) {
			register_graphql_fields( $type, [
				'multiAttributes' => [
					'type'        => [ 'list_of' => 'MultiAttributeFilterInput' ],
					'description' => __( 'Filter by multiple attribute taxonomies at once.', 'wc-multi-attribute-filter' ),
				],
				'multiAttributeRelation' => [
					'type'        => 'AttributeGroupRelationEnum',
					'description' => __( 'How the attribute groups are combined (default: AND).', 'wc-multi-attribute-filter' ),
				],
			] );
		}
	}

	/**
	 * @param array $query_args  WP_Query args being assembled by WooGraphQL.
	 * @param mixed $source      Resolver source.
	 * @param array $args        Connection args, including `where`.
	 */
	public static function apply_tax_query( array $query_args, $source, array $args ): array {
		$where = $args['where'] ?? [];

		if ( empty( $where['multiAttributes'] ) || ! is_array( $where['multiAttributes'] ) ) {
			return $query_args;
		}

		$relation = strtoupper( $where['multiAttributeRelation'] ?? 'AND' );
		if ( ! in_array( $relation, [ 'AND', 'OR' ], true ) ) {
			$relation = 'AND';
		}

		$tax_clauses = [];
		foreach ( $where['multiAttributes'] as $group ) {
			$clause = self::build_tax_clause( (array) $group );
			if ( $clause ) {
				$tax_clauses[] = $clause;
			}
		}

		if ( empty( $tax_clauses ) ) {
			return $query_args;
		}

		$existing = $query_args['tax_query'] ?? [];

		if ( count( $tax_clauses ) === 1 ) {
			$new_tax_query = array_merge( $existing, $tax_clauses );
		} else {
			$new_tax_query = array_merge( $existing, [ 'relation' => $relation ], $tax_clauses );
		}

		$query_args['tax_query'] = $new_tax_query;

		return $query_args;
	}

	private static function build_tax_clause( array $group ): ?array {
		if ( empty( $group['taxonomy'] ) ) {
			return null;
		}

		$taxonomy = strtolower( (string) $group['taxonomy'] );

		// WooCommerce registers PA_* taxonomies lazily; trigger registration if needed.
		if ( ! taxonomy_exists( $taxonomy ) && function_exists( 'wc_get_attribute_taxonomies' ) ) {
			wc_get_attribute_taxonomies();
		}
		if ( ! taxonomy_exists( $taxonomy ) ) {
			return null;
		}

		$terms = isset( $group['terms'] ) && is_array( $group['terms'] )
			? array_values( array_filter( array_map( 'sanitize_text_field', $group['terms'] ) ) )
			: [];

		$field = ! empty( $group['field'] ) ? sanitize_key( $group['field'] ) : 'slug';
		if ( ! in_array( $field, [ 'slug', 'name', 'term_id', 'id' ], true ) ) {
			$field = 'slug';
		}

		$operator_map = [
			'IN'     => 'IN',
			'AND'    => 'AND',
			'NOT IN' => 'NOT IN',
			'NOT_IN' => 'NOT IN',
		];
		$operator = $operator_map[ strtoupper( (string) ( $group['operator'] ?? 'IN' ) ) ] ?? 'IN';

		$clause = [
			'taxonomy' => $taxonomy,
			'field'    => $field,
			'operator' => $operator,
		];

		if ( $terms ) {
			$clause['terms'] = $terms;
		}

		return $clause;
	}
}

add_action( 'graphql_register_types', [ WC_Multi_Attribute_Filter::class, 'register_types' ], 20 );
add_filter( 'graphql_product_connection_query_args', [ WC_Multi_Attribute_Filter::class, 'apply_tax_query' ], 20, 3 );
