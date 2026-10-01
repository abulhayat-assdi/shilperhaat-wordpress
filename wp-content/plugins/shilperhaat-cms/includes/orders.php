<?php
/**
 * Public ordering REST API: coupons, orders, order tracking, Meta event relay.
 * Ports of app/api/orders, app/api/coupons/validate, app/api/orders/track, app/api/meta/track.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Site settings (delivery charge etc.) with the original API's fallbacks. */
function sh_site_settings() {
	$s = get_option( 'sh_site_settings', array() );
	return is_array( $s ) ? $s : array();
}

function sh_delivery_config() {
	$s = sh_site_settings();
	return array(
		'deliveryCharge'  => isset( $s['deliveryCharge'] ) && null !== $s['deliveryCharge'] ? (float) $s['deliveryCharge'] : 80.0,
		'freeDeliveryMin' => ! empty( $s['freeDeliveryMin'] ) ? (float) $s['freeDeliveryMin'] : 2000.0,
	);
}

/** Port of validateCoupon() from lib/coupon-data.ts. @return array{valid:bool,discount:float,message:string} */
function sh_validate_coupon( $c, $order_total ) {
	if ( ! (int) $c->is_active ) {
		return array( 'valid' => false, 'discount' => 0, 'message' => 'This coupon is not active.' );
	}
	if ( $c->expires_at && strtotime( $c->expires_at . ' UTC' ) < time() ) {
		return array( 'valid' => false, 'discount' => 0, 'message' => 'This coupon has expired.' );
	}
	if ( null !== $c->max_uses && (int) $c->used_count >= (int) $c->max_uses ) {
		return array( 'valid' => false, 'discount' => 0, 'message' => 'This coupon has reached its usage limit.' );
	}
	if ( $order_total < (float) $c->min_order_amount ) {
		return array( 'valid' => false, 'discount' => 0, 'message' => 'Minimum order of ৳' . rtrim( rtrim( number_format( (float) $c->min_order_amount, 2, '.', '' ), '0' ), '.' ) . ' required.' );
	}
	$discount = 'PERCENTAGE' === $c->type ? round( ( $order_total * (float) $c->value ) / 100 ) : (float) $c->value;
	return array( 'valid' => true, 'discount' => min( $discount, $order_total ), 'message' => '' );
}

function sh_get_coupon( $code ) {
	global $wpdb;
	return $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . sh_table( 'coupons' ) . ' WHERE code = %s', strtoupper( trim( (string) $code ) ) ) ); // phpcs:ignore WordPress.DB
}

add_action( 'rest_api_init', function () {
	$ns = 'shilperhaat/v1';

	register_rest_route( $ns, '/coupons/validate', array(
		'methods'             => 'POST',
		'permission_callback' => '__return_true',
		'callback'            => function ( WP_REST_Request $req ) {
			$b        = $req->get_json_params();
			$code     = strtoupper( trim( (string) ( isset( $b['code'] ) ? $b['code'] : '' ) ) );
			$subtotal = isset( $b['subtotal'] ) && is_numeric( $b['subtotal'] ) ? (float) $b['subtotal'] : -1;
			if ( '' === $code || $subtotal < 0 ) {
				return new WP_REST_Response( array( 'valid' => false, 'discount' => 0, 'message' => 'Invalid request.' ), 400 );
			}
			$coupon = sh_get_coupon( $code );
			if ( ! $coupon ) {
				return new WP_REST_Response( array( 'valid' => false, 'discount' => 0, 'message' => 'Invalid coupon code.' ) );
			}
			return new WP_REST_Response( array_merge( sh_validate_coupon( $coupon, $subtotal ), array( 'code' => $code ) ) );
		},
	) );

	register_rest_route( $ns, '/orders', array(
		'methods'             => 'POST',
		'permission_callback' => '__return_true',
		'callback'            => 'sh_rest_create_order',
	) );

	register_rest_route( $ns, '/orders/track', array(
		'methods'             => 'GET',
		'permission_callback' => '__return_true',
		'callback'            => function ( WP_REST_Request $req ) {
			global $wpdb;
			if ( ! sh_rate_limit( 'track', 40 ) ) {
				return new WP_REST_Response( array( 'success' => false, 'error' => 'Too many lookups. Please try again later.' ), 429 );
			}
			$num = strtoupper( trim( (string) $req->get_param( 'orderNumber' ) ) );
			if ( '' === $num ) {
				return new WP_REST_Response( array( 'success' => false, 'error' => 'Order number is required' ), 400 );
			}
			$o = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . sh_table( 'orders' ) . ' WHERE order_number = %s', $num ) ); // phpcs:ignore WordPress.DB
			if ( ! $o ) {
				return new WP_REST_Response( array( 'success' => false, 'error' => 'Order not found' ), 404 );
			}
			$items = (array) $wpdb->get_results( $wpdb->prepare( 'SELECT product_title, product_image, price, quantity, line_total FROM ' . sh_table( 'order_items' ) . ' WHERE order_id = %s', $o->id ) ); // phpcs:ignore WordPress.DB
			return new WP_REST_Response( array(
				'success' => true,
				'order'   => array(
					'id'             => $o->id,
					'orderNumber'    => $o->order_number,
					'customerName'   => $o->customer_name,
					'phone'          => $o->phone,
					'address'        => $o->address,
					'subtotal'       => (float) $o->subtotal,
					'deliveryCharge' => (float) $o->delivery_charge,
					'total'          => (float) $o->total,
					'paymentMethod'  => $o->payment_method,
					'status'         => $o->status,
					'adminNote'      => $o->admin_note,
					'createdAt'      => gmdate( 'c', strtotime( $o->created_at . ' UTC' ) ),
					'updatedAt'      => gmdate( 'c', strtotime( $o->updated_at . ' UTC' ) ),
					'items'          => array_map( static function ( $i ) {
						return array(
							'productTitle' => $i->product_title,
							'productImage' => $i->product_image,
							'price'        => (float) $i->price,
							'quantity'     => (int) $i->quantity,
							'lineTotal'    => (float) $i->line_total,
						);
					}, $items ),
				),
			) );
		},
	) );

	// Browser-originated events → Conversions API (deduplicated with the Pixel through eventId).
	register_rest_route( $ns, '/meta/track', array(
		'methods'             => 'POST',
		'permission_callback' => '__return_true',
		'callback'            => function ( WP_REST_Request $req ) {
			$b    = $req->get_json_params();
			$name = isset( $b['eventName'] ) && is_string( $b['eventName'] ) ? sanitize_text_field( $b['eventName'] ) : '';
			$id   = isset( $b['eventId'] ) && is_string( $b['eventId'] ) ? sanitize_text_field( $b['eventId'] ) : '';
			if ( '' === $name || '' === $id ) {
				return new WP_REST_Response( array( 'ok' => false ), 400 );
			}
			sh_meta_send_event( array(
				'event_name' => $name,
				'event_id'   => $id,
				'source_url' => isset( $b['eventSourceUrl'] ) && is_string( $b['eventSourceUrl'] ) ? esc_url_raw( $b['eventSourceUrl'] ) : '',
				'custom'     => isset( $b['customData'] ) && is_array( $b['customData'] ) ? $b['customData'] : null,
			) );
			return new WP_REST_Response( array( 'ok' => true ) );
		},
	) );
} );

function sh_order_error( $msg, $status = 400 ) {
	return new WP_REST_Response( array( 'success' => false, 'error' => $msg ), $status );
}

/** Port of POST /api/orders: prices & totals are recomputed server-side, stock is reserved atomically. */
function sh_rest_create_order( WP_REST_Request $req ) {
	global $wpdb;
	if ( ! sh_rate_limit( 'order', 20 ) ) {
		return sh_order_error( 'Too many orders from this connection. Please try again later.', 429 );
	}
	$b     = $req->get_json_params();
	$raw   = isset( $b['items'] ) && is_array( $b['items'] ) ? $b['items'] : array();
	if ( ! $raw ) {
		return sh_order_error( 'Cart is empty.' );
	}

	$name    = isset( $b['customerName'] ) ? trim( sanitize_text_field( $b['customerName'] ) ) : '';
	$phone   = isset( $b['phone'] ) ? preg_replace( '/[^0-9]/', '', (string) $b['phone'] ) : '';
	$address = isset( $b['address'] ) ? trim( sanitize_textarea_field( $b['address'] ) ) : '';
	if ( mb_strlen( $name ) < 2 || ! preg_match( '/^01\d{9}$/', $phone ) || mb_strlen( $address ) < 5 ) {
		return sh_order_error( 'Please provide a valid name, phone number and address.' );
	}
	$notes = isset( $b['notes'] ) ? mb_substr( sanitize_textarea_field( $b['notes'] ), 0, 300 ) : '';

	$ids = array();
	foreach ( $raw as $i ) {
		if ( ! empty( $i['productId'] ) ) {
			$ids[] = (string) $i['productId'];
		}
	}
	$products = array();
	if ( $ids ) {
		$in   = implode( ',', array_fill( 0, count( $ids ), '%s' ) );
		$rows = (array) $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . sh_table( 'products' ) . " WHERE id IN ($in)", $ids ) ); // phpcs:ignore WordPress.DB
		foreach ( $rows as $r ) {
			$products[ $r->id ] = $r;
		}
	}

	$items = array();
	foreach ( $raw as $i ) {
		$qty = isset( $i['quantity'] ) ? (int) floor( (float) $i['quantity'] ) : 0;
		if ( $qty < 1 || $qty > 99 ) {
			return sh_order_error( 'Invalid item quantity.' );
		}
		$p = isset( $i['productId'], $products[ $i['productId'] ] ) ? $products[ $i['productId'] ] : null;
		if ( ! $p || 'ACTIVE' !== $p->status ) {
			return sh_order_error( 'Some items in your cart are no longer available. Please refresh and try again.' );
		}
		if ( (int) $p->stock < $qty ) {
			return sh_order_error( sprintf( '"%s" does not have enough stock.', $p->title ) );
		}
		$price   = (float) $p->price;
		$items[] = array(
			'productId'    => $p->id,
			'productTitle' => $p->title,
			'productImage' => ! empty( $i['productImage'] ) ? esc_url_raw( (string) $i['productImage'] ) : null,
			'price'        => $price,
			'quantity'     => $qty,
			'lineTotal'    => $price * $qty,
		);
	}
	$subtotal = array_sum( wp_list_pluck( $items, 'lineTotal' ) );

	$delivery = isset( $b['deliveryCharge'] ) && is_numeric( $b['deliveryCharge'] ) ? (float) $b['deliveryCharge'] : -1;
	if ( $delivery < 0 || $delivery > 1000 ) {
		return sh_order_error( 'Invalid delivery charge.' );
	}

	$discount  = 0.0;
	$coupon_id = null;
	$coupon_cd = null;
	if ( ! empty( $b['couponCode'] ) ) {
		$coupon = sh_get_coupon( $b['couponCode'] );
		if ( ! $coupon ) {
			return sh_order_error( 'Invalid coupon code.' );
		}
		$res = sh_validate_coupon( $coupon, $subtotal );
		if ( ! $res['valid'] ) {
			return sh_order_error( $res['message'] ? $res['message'] : 'Coupon is no longer valid.' );
		}
		$discount  = (float) $res['discount'];
		$coupon_id = $coupon->id;
		$coupon_cd = $coupon->code;
	}
	$total = $subtotal + $delivery - $discount;

	$number = isset( $b['orderNumber'] ) ? strtoupper( trim( (string) $b['orderNumber'] ) ) : '';
	if ( ! preg_match( '/^[A-Z0-9-]{6,32}$/', $number ) ) {
		$number = 'SH' . gmdate( 'ymd' ) . wp_rand( 1000, 9999 );
	}

	$wpdb->query( 'START TRANSACTION' );
	$ok = true;
	if ( $coupon_id ) {
		$ok = false !== $wpdb->query( $wpdb->prepare( 'UPDATE ' . sh_table( 'coupons' ) . ' SET used_count = used_count + 1 WHERE id = %s', $coupon_id ) ); // phpcs:ignore WordPress.DB
	}
	if ( $ok ) {
		foreach ( $items as $it ) {
			$n = $wpdb->query( $wpdb->prepare( 'UPDATE ' . sh_table( 'products' ) . ' SET stock = stock - %d WHERE id = %s AND stock >= %d', $it['quantity'], $it['productId'], $it['quantity'] ) ); // phpcs:ignore WordPress.DB
			if ( 1 !== $n ) {
				$wpdb->query( 'ROLLBACK' );
				return sh_order_error( sprintf( 'Insufficient stock for "%s"', $it['productTitle'] ), 400 );
			}
		}
		$now      = current_time( 'mysql', true );
		$order_id = sh_new_id();
		$ok       = false !== $wpdb->insert( sh_table( 'orders' ), array(
			'id'              => $order_id,
			'order_number'    => $number,
			'customer_name'   => $name,
			'phone'           => $phone,
			'address'         => $address,
			'notes'           => '' !== $notes ? $notes : null,
			'subtotal'        => $subtotal,
			'delivery_charge' => $delivery,
			'discount'        => $discount,
			'coupon_code'     => $coupon_cd,
			'total'           => $total,
			'payment_method'  => 'COD',
			'status'          => 'PENDING',
			'created_at'      => $now,
			'updated_at'      => $now,
		) );
		if ( $ok ) {
			foreach ( $items as $it ) {
				$ok = $ok && false !== $wpdb->insert( sh_table( 'order_items' ), array(
					'id'            => sh_new_id(),
					'order_id'      => $order_id,
					'product_id'    => $it['productId'],
					'product_title' => $it['productTitle'],
					'product_image' => $it['productImage'],
					'price'         => $it['price'],
					'quantity'      => $it['quantity'],
					'line_total'    => $it['lineTotal'],
				) );
			}
		}
	}
	if ( ! $ok ) {
		$wpdb->query( 'ROLLBACK' );
		return sh_order_error( 'Failed to create order', 500 );
	}
	$wpdb->query( 'COMMIT' );
	wp_cache_delete( 'sh_categories', 'shilperhaat' );

	// Authoritative server-side Purchase (event_id matches the browser Pixel → deduplicated by Meta).
	sh_meta_send_event( array(
		'event_name' => 'Purchase',
		'event_id'   => 'purchase_' . $number,
		'source_url' => isset( $b['eventSourceUrl'] ) && is_string( $b['eventSourceUrl'] ) ? esc_url_raw( $b['eventSourceUrl'] ) : '',
		'user'       => array( 'phone' => $phone, 'first_name' => explode( ' ', $name )[0] ),
		'custom'     => array(
			'value'        => $total,
			'currency'     => 'BDT',
			'content_type' => 'product',
			'content_ids'  => wp_list_pluck( $items, 'productId' ),
			'contents'     => array_map( static function ( $i ) {
				return array( 'id' => $i['productId'], 'quantity' => $i['quantity'], 'item_price' => $i['price'] );
			}, $items ),
			'num_items'    => array_sum( wp_list_pluck( $items, 'quantity' ) ),
			'order_id'     => $number,
		),
	) );

	do_action( 'sh_order_created', $order_id, $number );
	return new WP_REST_Response( array( 'success' => true, 'orderId' => $order_id, 'orderNumber' => $number ) );
}
