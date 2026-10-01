<?php
/**
 * Public REST API (namespace shilperhaat/v1). Admin screens use admin-post/ajax with nonces instead.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function sh_rest_error( $message, $status = 400 ) {
	return new WP_REST_Response( array( 'error' => $message ), $status );
}

add_action( 'rest_api_init', function () {
	// Customer product review → hidden until approved in the admin panel.
	register_rest_route( 'shilperhaat/v1', '/reviews', array(
		'methods'             => 'POST',
		'permission_callback' => '__return_true',
		'callback'            => function ( WP_REST_Request $req ) {
			global $wpdb;
			if ( ! sh_rate_limit( 'review', 10 ) ) {
				return sh_rest_error( 'Too many reviews submitted. Please try again later.', 429 );
			}
			$body       = $req->get_json_params();
			$product_id = isset( $body['productId'] ) ? trim( (string) $body['productId'] ) : '';
			$name       = isset( $body['name'] ) ? trim( (string) $body['name'] ) : '';
			$content    = isset( $body['content'] ) ? trim( (string) $body['content'] ) : '';
			$rating     = isset( $body['rating'] ) ? (int) $body['rating'] : 0;
			if ( '' === $product_id ) {
				return sh_rest_error( 'Product is required' );
			}
			if ( mb_strlen( $name ) < 2 || mb_strlen( $name ) > 60 ) {
				return sh_rest_error( 'Please enter your name (2–60 characters)' );
			}
			if ( mb_strlen( $content ) < 5 || mb_strlen( $content ) > 2000 ) {
				return sh_rest_error( 'Review must be 5–2000 characters' );
			}
			if ( $rating < 1 || $rating > 5 ) {
				return sh_rest_error( 'Rating must be between 1 and 5' );
			}
			$exists = $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM ' . sh_table( 'products' ) . ' WHERE id = %s', $product_id ) ); // phpcs:ignore WordPress.DB
			if ( ! $exists ) {
				return sh_rest_error( 'Product not found', 404 );
			}
			$now = current_time( 'mysql', true );
			$wpdb->insert( sh_table( 'reviews' ), array(
				'id'         => sh_new_id(),
				'name'       => sanitize_text_field( $name ),
				'rating'     => $rating,
				'content'    => sanitize_textarea_field( $content ),
				'is_visible' => 0,
				'sort_order' => 0,
				'product_id' => $product_id,
				'created_at' => $now,
				'updated_at' => $now,
			) );
			return new WP_REST_Response( array( 'success' => true ) );
		},
	) );
} );
