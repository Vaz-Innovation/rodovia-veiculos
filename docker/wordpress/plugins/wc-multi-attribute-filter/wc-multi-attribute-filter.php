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

		register_graphql_input_type( 'NumericAttributeRangeInput', [
			'description' => __( 'Filter products where a numeric-valued attribute taxonomy term is within a range.', 'wc-multi-attribute-filter' ),
			'fields'      => [
				'taxonomy' => [
					'type'        => [ 'non_null' => 'String' ],
					'description' => __( 'Attribute taxonomy slug (term slugs must be parseable integers).', 'wc-multi-attribute-filter' ),
				],
				'min'      => [
					'type'        => 'Int',
					'description' => __( 'Inclusive lower bound.', 'wc-multi-attribute-filter' ),
				],
				'max'      => [
					'type'        => 'Int',
					'description' => __( 'Inclusive upper bound.', 'wc-multi-attribute-filter' ),
				],
			],
		] );

		register_graphql_input_type( 'OrderByAttributeInput', [
			'description' => __( 'Sort products by the numeric value of an attribute taxonomy term.', 'wc-multi-attribute-filter' ),
			'fields'      => [
				'taxonomy' => [
					'type'        => [ 'non_null' => 'String' ],
					'description' => __( 'Attribute taxonomy slug.', 'wc-multi-attribute-filter' ),
				],
				'order'    => [
					'type'        => 'OrderEnum',
					'description' => __( 'Sort direction (default: ASC).', 'wc-multi-attribute-filter' ),
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
				'tagIdAnd' => [
					'type'        => [ 'list_of' => 'Int' ],
					'description' => __( 'Product must have ALL listed tag IDs (AND semantics). Complement to tagIdIn which is OR.', 'wc-multi-attribute-filter' ),
				],
				'numericAttributeRanges' => [
					'type'        => [ 'list_of' => 'NumericAttributeRangeInput' ],
					'description' => __( 'Filter by numeric ranges on attribute taxonomies (e.g., pa_yearmodel).', 'wc-multi-attribute-filter' ),
				],
				'orderByAttribute' => [
					'type'        => 'OrderByAttributeInput',
					'description' => __( 'Sort by the numeric value of an attribute taxonomy term. Overrides the default `orderby` when set.', 'wc-multi-attribute-filter' ),
				],
			] );
		}

		register_graphql_object_type( 'ProductAttributeTerm', [
			'description' => __( 'A term within a WooCommerce product attribute taxonomy.', 'wc-multi-attribute-filter' ),
			'fields'      => [
				'termId' => [
					'type'        => [ 'non_null' => 'Int' ],
					'description' => __( 'WordPress term ID.', 'wc-multi-attribute-filter' ),
				],
				'name'   => [
					'type'        => [ 'non_null' => 'String' ],
					'description' => __( 'Human-readable term name.', 'wc-multi-attribute-filter' ),
				],
				'slug'   => [
					'type'        => [ 'non_null' => 'String' ],
					'description' => __( 'Term slug, used for filtering.', 'wc-multi-attribute-filter' ),
				],
			],
		] );

		register_graphql_field( 'RootQuery', 'productAttributeTerms', [
			'type'        => [ 'list_of' => [ 'non_null' => 'ProductAttributeTerm' ] ],
			'description' => __( 'List all terms within a product attribute taxonomy.', 'wc-multi-attribute-filter' ),
			'args'        => [
				'taxonomy' => [
					'type'        => [ 'non_null' => 'String' ],
					'description' => __( 'Attribute taxonomy slug, e.g. "pa_color".', 'wc-multi-attribute-filter' ),
				],
				'hideEmpty' => [
					'type'        => 'Boolean',
					'description' => __( 'Exclude terms with no associated products (default: false).', 'wc-multi-attribute-filter' ),
				],
			],
			'resolve'     => static function ( $source, array $args ) {
				$taxonomy = strtolower( (string) ( $args['taxonomy'] ?? '' ) );
				if ( $taxonomy === '' ) {
					return [];
				}
				if ( ! taxonomy_exists( $taxonomy ) && function_exists( 'wc_get_attribute_taxonomies' ) ) {
					wc_get_attribute_taxonomies();
				}
				if ( ! taxonomy_exists( $taxonomy ) ) {
					return [];
				}
				$terms = get_terms( [
					'taxonomy'   => $taxonomy,
					'hide_empty' => ! empty( $args['hideEmpty'] ),
					'orderby'    => 'name',
					'order'      => 'ASC',
				] );
				if ( is_wp_error( $terms ) || ! is_array( $terms ) ) {
					return [];
				}
				return array_map( static function ( $term ) {
					return [
						'termId' => (int) $term->term_id,
						'name'   => (string) $term->name,
						'slug'   => (string) $term->slug,
					];
				}, $terms );
			},
		] );
	}

	/**
	 * @param array $query_args  WP_Query args being assembled by WooGraphQL.
	 * @param mixed $source      Resolver source.
	 * @param array $args        Connection args, including `where`.
	 */
	public static function apply_tax_query( array $query_args, $source, array $args ): array {
		$where = $args['where'] ?? [];

		$tax_clauses = [];
		$relation    = 'AND';

		if ( ! empty( $where['multiAttributes'] ) && is_array( $where['multiAttributes'] ) ) {
			$relation = strtoupper( $where['multiAttributeRelation'] ?? 'AND' );
			if ( ! in_array( $relation, [ 'AND', 'OR' ], true ) ) {
				$relation = 'AND';
			}
			foreach ( $where['multiAttributes'] as $group ) {
				$clause = self::build_tax_clause( (array) $group );
				if ( $clause ) {
					$tax_clauses[] = $clause;
				}
			}
		}

		if ( ! empty( $where['tagIdAnd'] ) && is_array( $where['tagIdAnd'] ) ) {
			$tag_ids = array_values( array_filter( array_map( 'intval', $where['tagIdAnd'] ) ) );
			if ( $tag_ids ) {
				$tax_clauses[] = [
					'taxonomy' => 'product_tag',
					'field'    => 'term_id',
					'terms'    => $tag_ids,
					'operator' => 'AND',
				];
			}
		}

		if ( ! empty( $where['numericAttributeRanges'] ) && is_array( $where['numericAttributeRanges'] ) ) {
			foreach ( $where['numericAttributeRanges'] as $range ) {
				$clause = self::build_numeric_range_tax_clause( (array) $range );
				if ( $clause ) {
					$tax_clauses[] = $clause;
				}
			}
		}

		if ( ! empty( $where['orderByAttribute'] ) && is_array( $where['orderByAttribute'] ) ) {
			$oba      = $where['orderByAttribute'];
			$taxonomy = isset( $oba['taxonomy'] ) ? sanitize_key( (string) $oba['taxonomy'] ) : '';
			$order    = strtoupper( (string) ( $oba['order'] ?? 'ASC' ) );
			if ( $taxonomy && in_array( $order, [ 'ASC', 'DESC' ], true ) ) {
				$query_args['_wc_maf_orderby_attribute'] = [
					'taxonomy' => $taxonomy,
					'order'    => $order,
				];
				unset( $query_args['orderby'], $query_args['order'] );
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

	private static function build_numeric_range_tax_clause( array $range ): ?array {
		if ( empty( $range['taxonomy'] ) ) {
			return null;
		}

		$taxonomy = strtolower( (string) $range['taxonomy'] );

		if ( ! taxonomy_exists( $taxonomy ) && function_exists( 'wc_get_attribute_taxonomies' ) ) {
			wc_get_attribute_taxonomies();
		}
		if ( ! taxonomy_exists( $taxonomy ) ) {
			return null;
		}

		$has_min = isset( $range['min'] ) && $range['min'] !== null;
		$has_max = isset( $range['max'] ) && $range['max'] !== null;
		if ( ! $has_min && ! $has_max ) {
			return null;
		}
		$min = $has_min ? (int) $range['min'] : PHP_INT_MIN;
		$max = $has_max ? (int) $range['max'] : PHP_INT_MAX;

		$terms = get_terms( [
			'taxonomy'   => $taxonomy,
			'hide_empty' => false,
			'fields'     => 'id=>slug',
		] );
		if ( is_wp_error( $terms ) || ! is_array( $terms ) ) {
			return null;
		}

		$matching_ids = [];
		foreach ( $terms as $id => $slug ) {
			$val = filter_var( $slug, FILTER_VALIDATE_INT );
			if ( $val === false ) {
				continue;
			}
			if ( $val < $min || $val > $max ) {
				continue;
			}
			$matching_ids[] = (int) $id;
		}

		// Force zero results when the range matches nothing — sentinel term_id 0 never exists.
		if ( empty( $matching_ids ) ) {
			$matching_ids = [ 0 ];
		}

		return [
			'taxonomy' => $taxonomy,
			'field'    => 'term_id',
			'terms'    => $matching_ids,
			'operator' => 'IN',
		];
	}

	public static function apply_attribute_orderby( array $clauses, $query ): array {
		$oba = $query->get( '_wc_maf_orderby_attribute' );
		if ( ! is_array( $oba ) || empty( $oba['taxonomy'] ) ) {
			return $clauses;
		}

		global $wpdb;
		$taxonomy = sanitize_key( (string) $oba['taxonomy'] );
		$order    = strtoupper( (string) ( $oba['order'] ?? 'ASC' ) );
		if ( ! in_array( $order, [ 'ASC', 'DESC' ], true ) ) {
			$order = 'ASC';
		}

		// Use unique aliases so this doesn't collide with other tax-related JOINs.
		$suffix   = substr( md5( $taxonomy ), 0, 6 );
		$alias_tr = "wc_maf_tr_{$suffix}";
		$alias_tt = "wc_maf_tt_{$suffix}";
		$alias_t  = "wc_maf_t_{$suffix}";

		$clauses['join'] .= $wpdb->prepare(
			" LEFT JOIN {$wpdb->term_relationships} {$alias_tr} ON {$alias_tr}.object_id = {$wpdb->posts}.ID" .
			" LEFT JOIN {$wpdb->term_taxonomy} {$alias_tt} ON {$alias_tt}.term_taxonomy_id = {$alias_tr}.term_taxonomy_id AND {$alias_tt}.taxonomy = %s" .
			" LEFT JOIN {$wpdb->terms} {$alias_t} ON {$alias_t}.term_id = {$alias_tt}.term_id",
			$taxonomy
		);

		// IFNULL so products without the taxonomy sort last (treat them as 0).
		$clauses['orderby'] = "CAST(IFNULL(MAX({$alias_t}.slug), '0') AS UNSIGNED) {$order}, {$wpdb->posts}.ID DESC";

		if ( empty( $clauses['groupby'] ) || strpos( $clauses['groupby'], "{$wpdb->posts}.ID" ) === false ) {
			$clauses['groupby'] = "{$wpdb->posts}.ID";
		}

		return $clauses;
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
add_filter( 'posts_clauses', [ WC_Multi_Attribute_Filter::class, 'apply_attribute_orderby' ], 20, 2 );
