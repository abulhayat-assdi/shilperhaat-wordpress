<?php
defined( 'ABSPATH' ) || exit;

/**
 * Public REST endpoints under /wp-json/shilperhaat/v1 (storefront). Admin endpoints live in
 * admin/class-sh-admin-rest.php and are registered by SH_Admin.
 */
class SH_Rest {

	const NS = 'shilperhaat/v1';

	public static function init(): void {
		add_action( 'rest_api_init', [ self::class, 'routes' ] );
	}

	public static function routes(): void {
		$open = '__return_true';
		register_rest_route( self::NS, '/reviews', [ 'methods' => 'POST', 'callback' => [ self::class, 'post_review' ], 'permission_callback' => $open ] );
		register_rest_route( self::NS, '/meta/track', [ 'methods' => 'POST', 'callback' => [ self::class, 'meta_track' ], 'permission_callback' => $open ] );
		register_rest_route( self::NS, '/coupons/validate', [ 'methods' => 'POST', 'callback' => [ self::class, 'coupon_validate' ], 'permission_callback' => $open ] );
		register_rest_route( self::NS, '/orders', [ 'methods' => 'POST', 'callback' => [ 'SH_Orders', 'rest_create' ], 'permission_callback' => $open ] );
		register_rest_route( self::NS, '/orders/track', [ 'methods' => 'GET', 'callback' => [ 'SH_Orders', 'rest_track' ], 'permission_callback' => $open ] );
	}

	private static function err( string $msg, int $status = 400 ): WP_REST_Response {
		return new WP_REST_Response( [ 'error' => $msg ], $status );
	}

	/** Rate limit helper: max $max hits per $window seconds per IP + bucket. */
	public static function throttle( string $bucket, int $max, int $window ): bool {
		$key  = 'sh_rl_' . md5( $bucket . sh_client_ip() );
		$hits = (int) get_transient( $key );
		if ( $hits >= $max ) {
			return false;
		}
		set_transient( $key, $hits + 1, $window );
		return true;
	}

	/** POST /reviews — customers submit a product review; it stays hidden until approved in the admin. */
	public static function post_review( WP_REST_Request $req ) {
		$b         = $req->get_json_params() ?: [];
		$productId = isset( $b['productId'] ) ? trim( (string) $b['productId'] ) : '';
		$name      = isset( $b['name'] ) ? trim( (string) $b['name'] ) : '';
		$content   = isset( $b['content'] ) ? trim( (string) $b['content'] ) : '';
		$rating    = isset( $b['rating'] ) ? (int) $b['rating'] : 0;
		if ( '' === $productId ) {
			return self::err( 'Product is required' );
		}
		$nl = mb_strlen( $name );
		if ( $nl < 2 || $nl > 60 ) {
			return self::err( 'Please enter your name (2–60 characters)' );
		}
		$cl = mb_strlen( $content );
		if ( $cl < 5 || $cl > 2000 ) {
			return self::err( 'Review must be 5–2000 characters' );
		}
		if ( $rating < 1 || $rating > 5 ) {
			return self::err( 'Rating must be between 1 and 5' );
		}
		if ( 'product' !== get_post_type( (int) $productId ) ) {
			return self::err( 'Product not found', 404 );
		}
		if ( ! empty( $b['website'] ) || ! self::throttle( 'review', 5, HOUR_IN_SECONDS ) ) {
			return self::err( 'Too many submissions. Please try again later.', 429 );
		}
		SH_Store::save_review( [ 'productId' => (int) $productId, 'name' => sanitize_text_field( $name ), 'rating' => $rating, 'content' => sanitize_textarea_field( $content ), 'isVisible' => false ] );
		return new WP_REST_Response( [ 'success' => true ] );
	}

	/** POST /meta/track — forwards browser events to the Conversions API (deduplicated by event id). */
	public static function meta_track( WP_REST_Request $req ) {
		$b    = $req->get_json_params() ?: [];
		$name = isset( $b['eventName'] ) && is_string( $b['eventName'] ) ? $b['eventName'] : '';
		$id   = isset( $b['eventId'] ) && is_string( $b['eventId'] ) ? $b['eventId'] : '';
		if ( '' === $name || '' === $id ) {
			return new WP_REST_Response( [ 'ok' => false ], 400 );
		}
		if ( ! in_array( $name, [ 'ViewContent', 'AddToCart', 'InitiateCheckout', 'PageView', 'Search' ], true ) || ! self::throttle( 'meta', 120, HOUR_IN_SECONDS ) ) {
			return new WP_REST_Response( [ 'ok' => false ], 200 );
		}
		SH_Meta::send_event( [
			'eventName'      => $name,
			'eventId'        => $id,
			'eventSourceUrl' => isset( $b['eventSourceUrl'] ) && is_string( $b['eventSourceUrl'] ) ? esc_url_raw( $b['eventSourceUrl'] ) : null,
			'userData'       => SH_Meta::user_data_from_request(),
			'customData'     => is_array( $b['customData'] ?? null ) ? $b['customData'] : null,
		] );
		return new WP_REST_Response( [ 'ok' => true ] );
	}

	/** POST /coupons/validate */
	public static function coupon_validate( WP_REST_Request $req ) {
		$b        = $req->get_json_params() ?: [];
		$code     = strtoupper( trim( (string) ( $b['code'] ?? '' ) ) );
		$subtotal = isset( $b['subtotal'] ) && is_numeric( $b['subtotal'] ) ? (float) $b['subtotal'] : -1;
		if ( '' === $code || $subtotal < 0 ) {
			return new WP_REST_Response( [ 'valid' => false, 'discount' => 0, 'message' => 'Invalid request.' ], 400 );
		}
		if ( ! self::throttle( 'coupon', 60, HOUR_IN_SECONDS ) ) {
			return new WP_REST_Response( [ 'valid' => false, 'discount' => 0, 'message' => 'Too many attempts. Please try again later.' ], 429 );
		}
		$coupon = SH_Coupons::by_code( $code );
		if ( ! $coupon ) {
			return new WP_REST_Response( [ 'valid' => false, 'discount' => 0, 'message' => 'Invalid coupon code.' ] );
		}
		$res         = SH_Coupons::validate( $coupon, $subtotal );
		$res['code'] = $code;
		return new WP_REST_Response( $res );
	}
}
