<?php
defined( 'ABSPATH' ) || exit;

/**
 * Coupons are stored as WooCommerce shop_coupon posts (so they show up in Woo too), but the
 * validation/discount math is the original app's (lib/coupon-data.ts) to keep behaviour identical.
 */
class SH_Coupons {

	public static function to_array( WC_Coupon $c ): array {
		$expires = $c->get_date_expires();
		return [
			'id'             => (string) $c->get_id(),
			'code'           => strtoupper( $c->get_code() ),
			'type'           => 'percent' === $c->get_discount_type() ? 'PERCENTAGE' : 'FIXED',
			'value'          => (float) $c->get_amount(),
			'minOrderAmount' => (float) $c->get_minimum_amount(),
			'maxUses'        => $c->get_usage_limit() ? (int) $c->get_usage_limit() : null,
			'usedCount'      => (int) $c->get_usage_count(),
			'isActive'       => 'publish' === get_post_status( $c->get_id() ),
			'expiresAt'      => $expires ? gmdate( 'c', $expires->getTimestamp() ) : null,
			'description'    => (string) $c->get_description(),
			'createdAt'      => mysql2date( 'c', get_post_field( 'post_date_gmt', $c->get_id() ), false ),
			'updatedAt'      => mysql2date( 'c', get_post_field( 'post_modified_gmt', $c->get_id() ), false ),
		];
	}

	public static function all(): array {
		$ids = get_posts( [ 'post_type' => 'shop_coupon', 'post_status' => [ 'publish', 'draft', 'private' ], 'numberposts' => -1, 'fields' => 'ids', 'orderby' => 'date', 'order' => 'DESC' ] );
		return array_map( static fn( $id ) => self::to_array( new WC_Coupon( $id ) ), $ids );
	}

	public static function find_id( string $code ): int {
		global $wpdb;
		return (int) $wpdb->get_var( $wpdb->prepare( "SELECT ID FROM {$wpdb->posts} WHERE post_type = 'shop_coupon' AND post_status IN ('publish','draft','private') AND post_title = %s LIMIT 1", wc_format_coupon_code( $code ) ) ); // phpcs:ignore
	}

	public static function by_code( string $code ): ?array {
		$id = self::find_id( $code );
		return $id ? self::to_array( new WC_Coupon( $id ) ) : null;
	}

	/** @return int|WP_Error */
	public static function save( array $d, int $id = 0 ) {
		$code = strtoupper( trim( (string) ( $d['code'] ?? '' ) ) );
		if ( '' === $code ) {
			return new WP_Error( 'code', 'Coupon code is required' );
		}
		$existing = self::find_id( $code );
		if ( $existing && $existing !== $id ) {
			return new WP_Error( 'duplicate', 'A coupon with this code already exists' );
		}
		$c = new WC_Coupon( $id ?: 0 );
		$c->set_code( $code );
		$c->set_discount_type( 'PERCENTAGE' === ( $d['type'] ?? 'FIXED' ) ? 'percent' : 'fixed_cart' );
		$c->set_amount( (string) ( $d['value'] ?? 0 ) );
		$c->set_minimum_amount( (string) ( $d['minOrderAmount'] ?? 0 ) );
		$c->set_usage_limit( ! empty( $d['maxUses'] ) ? (int) $d['maxUses'] : 0 );
		if ( isset( $d['usedCount'] ) ) {
			$c->set_usage_count( (int) $d['usedCount'] );
		}
		$c->set_description( (string) ( $d['description'] ?? '' ) );
		$c->set_date_expires( ! empty( $d['expiresAt'] ) ? strtotime( (string) $d['expiresAt'] ) : null );
		$c->set_status( ! isset( $d['isActive'] ) || $d['isActive'] ? 'publish' : 'draft' );
		return $c->save();
	}

	public static function delete( int $id ): bool {
		return (bool) wp_delete_post( $id, true );
	}

	/** Port of validateCoupon(). @return array{valid:bool,discount:float,message:string} */
	public static function validate( array $coupon, float $orderTotal ): array {
		if ( ! $coupon['isActive'] ) {
			return [ 'valid' => false, 'discount' => 0, 'message' => 'This coupon is not active.' ];
		}
		if ( $coupon['expiresAt'] && strtotime( $coupon['expiresAt'] ) < time() ) {
			return [ 'valid' => false, 'discount' => 0, 'message' => 'This coupon has expired.' ];
		}
		if ( null !== $coupon['maxUses'] && $coupon['usedCount'] >= $coupon['maxUses'] ) {
			return [ 'valid' => false, 'discount' => 0, 'message' => 'This coupon has reached its usage limit.' ];
		}
		if ( $orderTotal < $coupon['minOrderAmount'] ) {
			$min = $coupon['minOrderAmount'];
			return [ 'valid' => false, 'discount' => 0, 'message' => 'Minimum order of ৳' . ( floor( $min ) == $min ? (int) $min : $min ) . ' required.' ];
		}
		$discount = 'PERCENTAGE' === $coupon['type'] ? round( ( $orderTotal * $coupon['value'] ) / 100 ) : $coupon['value'];
		return [ 'valid' => true, 'discount' => min( $discount, $orderTotal ), 'message' => '' ];
	}

	public static function increment_usage( int $id ): void {
		$c = new WC_Coupon( $id );
		$c->set_usage_count( $c->get_usage_count() + 1 );
		$c->save();
	}
}
