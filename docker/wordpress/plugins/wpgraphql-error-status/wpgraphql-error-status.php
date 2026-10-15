<?php
/**
 * Plugin Name: WPGraphQL Error Status
 * Description: Answers GraphQL responses that carry `errors` with HTTP 500 instead of 200, so HTTP caches (the Next.js Data Cache stores only 200 responses) never keep a failed operation.
 * Version: 1.0.0
 * Requires Plugins: wp-graphql
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WPGraphQL answers 200 for resolver/field errors (it only uses 500 when the
 * request itself throws). The front end caches successful responses by status, so
 * an error inside a 200 would be served from cache until it expired. The body is
 * untouched: clients still read the `errors` envelope.
 *
 * Statuses other than 200 (e.g. 403 from authentication) are kept as they are.
 */
add_filter(
	'graphql_response_status_code',
	static function ( $status_code, $_deprecated, $response ) {
		if ( 200 !== (int) $status_code ) {
			return $status_code;
		}

		$errors = is_array( $response ) ? ( $response['errors'] ?? null ) : ( $response->errors ?? null );

		return empty( $errors ) ? $status_code : 500;
	},
	10,
	3
);
