<?php
defined( 'ABSPATH' ) || exit;

/**
 * Orders on top of WooCommerce (HPOS-compatible CRUD only).
 *
 * The storefront never uses Woo's cart/checkout: the checkout form posts to /orders, which builds the
 * WC_Order here with server-side prices, stock reservation and coupon validation (port of app/api/orders).
 * The original six order statuses are registered as custom Woo statuses so the admin keeps the same flow.
 */
class SH_Orders {

	/** Original status => Woo status slug (without "wc-"). */
	const STATUS = [
		'PENDING'    => 'sh-pending',
		'CONFIRMED'  => 'sh-confirmed',
		'PROCESSING' => 'sh-processing',
		'SHIPPED'    => 'sh-shipped',
		'DELIVERED'  => 'sh-delivered',
		'CANCELLED'  => 'sh-cancelled',
	];

	const LABEL = [
		'PENDING' => 'Pending', 'CONFIRMED' => 'Confirmed', 'PROCESSING' => 'Processing',
		'SHIPPED' => 'Shipped', 'DELIVERED' => 'Delivered', 'CANCELLED' => 'Cancelled',
	];

	public static function init(): void {
		add_action( 'init', [ self::class, 'register_statuses' ] );
		add_filter( 'wc_order_statuses', [ self::class, 'add_statuses' ] );
		add_filter( 'woocommerce_reports_order_statuses', static fn( $s ) => array_merge( (array) $s, [ 'sh-confirmed', 'sh-processing', 'sh-shipped', 'sh-delivered' ] ) );
		// No e-mail notifications (by design).
		foreach ( [ 'new_order', 'cancelled_order', 'failed_order', 'customer_on_hold_order', 'customer_processing_order', 'customer_completed_order', 'customer_refunded_order', 'customer_invoice', 'customer_note', 'customer_reset_password', 'customer_new_account' ] as $id ) {
			if ( 'customer_reset_password' === $id ) {
				continue; // keep password reset working for admins
			}
			add_filter( "woocommerce_email_enabled_$id", '__return_false' );
		}
		// Woo order-attribution / marketing noise is not used.
		add_filter( 'woocommerce_admin_disabled', '__return_true' );
	}

	public static function register_statuses(): void {
		foreach ( self::STATUS as $key => $slug ) {
			register_post_status( 'wc-' . $slug, [
				'label'                     => self::LABEL[ $key ],
				'public'                    => false,
				'exclude_from_search'       => false,
				'show_in_admin_all_list'    => true,
				'show_in_admin_status_list' => true,
				/* translators: %s: count */
				'label_count'               => _n_noop( self::LABEL[ $key ] . ' <span class="count">(%s)</span>', self::LABEL[ $key ] . ' <span class="count">(%s)</span>' ),
			] );
		}
	}

	public static function add_statuses( array $s ): array {
		foreach ( self::STATUS as $key => $slug ) {
			$s[ 'wc-' . $slug ] = self::LABEL[ $key ];
		}
		return $s;
	}

	public static function status_of( WC_Order $o ): string {
		$s = $o->get_status();
		$k = array_search( $s, self::STATUS, true );
		return $k ?: 'PENDING';
	}

	/** Prisma-shaped order payload. */
	public static function to_array( WC_Order $o ): array {
		$items = [];
		foreach ( $o->get_items() as $it ) {
			/** @var WC_Order_Item_Product $it */
			$qty     = (int) $it->get_quantity();
			$line    = (float) $it->get_total();
			$items[] = [
				'id'           => (string) $it->get_id(),
				'orderId'      => (string) $o->get_id(),
				'productId'    => $it->get_product_id() && 'product' === get_post_type( $it->get_product_id() ) ? (string) $it->get_product_id() : null,
				'productTitle' => $it->get_name(),
				'productImage' => $it->get_meta( '_sh_image' ) ?: null,
				'price'        => $qty ? $line / $qty : 0,
				'quantity'     => $qty,
				'lineTotal'    => $line,
			];
		}
		$ship     = 0.0;
		foreach ( $o->get_items( 'shipping' ) as $si ) {
			$ship += (float) $si->get_total();
		}
		$discount = (float) $o->get_meta( '_sh_discount' );
		$subtotal = array_sum( array_column( $items, 'lineTotal' ) );
		$sent     = $o->get_meta( '_sh_courier_sent_at' );
		$created  = $o->get_date_created();
		$modified = $o->get_date_modified();
		return [
			'id'                   => (string) $o->get_id(),
			'orderNumber'          => (string) $o->get_meta( '_sh_order_number' ),
			'customerName'         => trim( $o->get_billing_first_name() . ' ' . $o->get_billing_last_name() ),
			'phone'                => $o->get_billing_phone(),
			'address'              => $o->get_billing_address_1(),
			'notes'                => $o->get_customer_note() ?: null,
			'subtotal'             => $subtotal,
			'deliveryCharge'       => $ship,
			'total'                => (float) $o->get_total(),
			'paymentMethod'        => $o->get_meta( '_sh_payment_method' ) ?: 'COD',
			'status'               => self::status_of( $o ),
			'adminNote'            => $o->get_meta( '_sh_admin_note' ) ?: null,
			'courierConsignmentId' => $o->get_meta( '_sh_courier_consignment_id' ) ?: null,
			'courierTrackingCode'  => $o->get_meta( '_sh_courier_tracking_code' ) ?: null,
			'courierSentAt'        => $sent ? gmdate( 'c', (int) $sent ) : null,
			'courierStatus'        => $o->get_meta( '_sh_courier_status' ) ?: null,
			'couponCode'           => $o->get_meta( '_sh_coupon_code' ) ?: null,
			'discount'             => $discount,
			'createdAt'            => $created ? gmdate( 'c', $created->getTimestamp() ) : null,
			'updatedAt'            => $modified ? gmdate( 'c', $modified->getTimestamp() ) : null,
			'items'                => $items,
		];
	}

	public static function find_by_number( string $number ): ?WC_Order {
		$ids = wc_get_orders( [ 'limit' => 1, 'return' => 'ids', 'status' => array_map( static fn( $s ) => 'wc-' . $s, array_values( self::STATUS ) ), 'meta_key' => '_sh_order_number', 'meta_value' => $number ] ); // phpcs:ignore
		return $ids ? wc_get_order( $ids[0] ) : null;
	}

	public static function delivery_charge( string $district ): int {
		if ( '' === $district ) {
			return 0;
		}
		return 'dhaka' === strtolower( $district ) ? 100 : 150;
	}

	/** Map a cart product id (new numeric id, or an old cuid from a pre-migration cart) to a Woo product id. */
	private static function resolve_product_id( $raw ): int {
		$raw = (string) $raw;
		if ( ctype_digit( $raw ) && 'product' === get_post_type( (int) $raw ) ) {
			return (int) $raw;
		}
		$ids = get_posts( [ 'post_type' => 'product', 'post_status' => 'any', 'meta_key' => '_sh_legacy_id', 'meta_value' => $raw, 'numberposts' => 1, 'fields' => 'ids' ] ); // phpcs:ignore
		return $ids ? (int) $ids[0] : 0;
	}

	/**
	 * POST /orders
	 *
	 * @return WP_REST_Response
	 */
	public static function rest_create( WP_REST_Request $req ) {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return new WP_REST_Response( [ 'success' => false, 'error' => 'Store is not available.' ], 503 );
		}
		if ( ! SH_Rest::throttle( 'order', 15, HOUR_IN_SECONDS ) ) {
			return new WP_REST_Response( [ 'success' => false, 'error' => 'Too many orders from this connection. Please try again later.' ], 429 );
		}
		$b    = $req->get_json_params() ?: [];
		$fail = static fn( string $m, int $s = 400 ) => new WP_REST_Response( [ 'success' => false, 'error' => $m ], $s );

		$name     = trim( (string) ( $b['customerName'] ?? '' ) );
		$phone    = preg_replace( '/\s+/', '', (string) ( $b['phone'] ?? '' ) );
		$address  = trim( (string) ( $b['address'] ?? '' ) );
		$district = trim( (string) ( $b['district'] ?? '' ) );
		$notes    = trim( (string) ( $b['notes'] ?? '' ) );
		if ( mb_strlen( $name ) < 2 || mb_strlen( $name ) > 120 ) {
			return $fail( 'Full name is required.' );
		}
		if ( ! preg_match( '/^01\d{9}$/', $phone ) ) {
			return $fail( 'Enter a valid Bangladesh number (01XXXXXXXXX)' );
		}
		if ( mb_strlen( $address ) < 5 || mb_strlen( $address ) > 500 ) {
			return $fail( 'House/street address is required.' );
		}
		if ( mb_strlen( $notes ) > 90 ) {
			return $fail( 'Notes are too long.' );
		}

		$rawItems = isset( $b['items'] ) && is_array( $b['items'] ) ? $b['items'] : [];
		if ( ! $rawItems ) {
			return $fail( 'Cart is empty.' );
		}
		$lines = [];
		foreach ( $rawItems as $item ) {
			$qty = isset( $item['quantity'] ) && is_numeric( $item['quantity'] ) ? (int) floor( (float) $item['quantity'] ) : 0;
			if ( $qty < 1 || $qty > 99 ) {
				return $fail( 'Invalid item quantity.' );
			}
			$pid = self::resolve_product_id( $item['productId'] ?? '' );
			$p   = $pid ? wc_get_product( $pid ) : null;
			if ( ! $p || 'ACTIVE' !== ( get_post_meta( $pid, '_sh_status', true ) ?: 'ACTIVE' ) ) {
				return $fail( 'Some items in your cart are no longer available. Please refresh and try again.' );
			}
			if ( (int) $p->get_stock_quantity() < $qty ) {
				return $fail( '"' . $p->get_name() . '" does not have enough stock.' );
			}
			$price = (float) get_post_meta( $pid, '_sh_price', true );
			if ( isset( $lines[ $pid ] ) ) {
				$lines[ $pid ]['qty'] += $qty;
			} else {
				$imgRows = SH_Catalog::images_for( [ $pid ] );
				$img     = ! empty( $imgRows[ $pid ][0] ) ? $imgRows[ $pid ][0]->image_url : ( is_string( $item['productImage'] ?? null ) ? $item['productImage'] : '' );
				$lines[ $pid ] = [ 'product' => $p, 'qty' => $qty, 'price' => $price, 'image' => $img ];
			}
		}
		foreach ( $lines as $pid => $l ) {
			if ( (int) $l['product']->get_stock_quantity() < $l['qty'] ) {
				return $fail( '"' . $l['product']->get_name() . '" does not have enough stock.' );
			}
		}
		$subtotal = 0.0;
		foreach ( $lines as $l ) {
			$subtotal += $l['price'] * $l['qty'];
		}

		// Delivery is derived from the district (Dhaka ৳100, elsewhere ৳150).
		if ( '' !== $district ) {
			$delivery = (float) self::delivery_charge( $district );
		} else {
			$delivery = isset( $b['deliveryCharge'] ) && is_numeric( $b['deliveryCharge'] ) ? (float) $b['deliveryCharge'] : -1;
			if ( $delivery < 0 || $delivery > 1000 ) {
				return $fail( 'Invalid delivery charge.' );
			}
		}

		// Coupon: always re-validated server-side.
		$discount = 0.0;
		$couponId = 0;
		$couponCode = null;
		if ( ! empty( $b['couponCode'] ) ) {
			$coupon = SH_Coupons::by_code( (string) $b['couponCode'] );
			if ( ! $coupon ) {
				return $fail( 'Invalid coupon code.' );
			}
			$res = SH_Coupons::validate( $coupon, $subtotal );
			if ( ! $res['valid'] ) {
				return $fail( $res['message'] ?: 'Coupon is no longer valid.' );
			}
			$discount   = (float) $res['discount'];
			$couponCode = $coupon['code'];
			$couponId   = (int) $coupon['id'];
		}
		$total = $subtotal + $delivery - $discount;

		global $wpdb;
		$wpdb->query( 'START TRANSACTION' );
		try {
			if ( $couponId ) {
				// Lock + re-check the usage limit so concurrent orders cannot exceed it.
				$fresh = SH_Coupons::by_code( $couponCode );
				$chk   = $fresh ? SH_Coupons::validate( $fresh, $subtotal ) : [ 'valid' => false, 'message' => 'Invalid coupon code.' ];
				if ( ! $chk['valid'] ) {
					throw new Exception( $chk['message'] );
				}
				SH_Coupons::increment_usage( $couponId );
			}
			foreach ( $lines as $pid => $l ) {
				// Reserve stock (row lock + guard prevents overselling).
				$cur = $wpdb->get_var( $wpdb->prepare( "SELECT meta_value FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key = '_stock' FOR UPDATE", $pid ) ); // phpcs:ignore
				if ( null === $cur || (int) $cur < $l['qty'] ) {
					throw new Exception( 'Insufficient stock for "' . $l['product']->get_name() . '"' );
				}
				wc_update_product_stock( $l['product'], $l['qty'], 'decrease' );
			}

			$order = wc_create_order( [ 'status' => 'pending', 'created_via' => 'shilperhaat' ] );
			if ( is_wp_error( $order ) ) {
				throw new Exception( 'Failed to create order' );
			}
			$number = self::unique_order_number();
			foreach ( $lines as $pid => $l ) {
				$iid = $order->add_product( $l['product'], $l['qty'], [ 'subtotal' => $l['price'] * $l['qty'], 'total' => $l['price'] * $l['qty'] ] );
				if ( $iid ) {
					wc_update_order_item_meta( $iid, '_sh_image', $l['image'] );
				}
			}
			$parts = preg_split( '/\s+/', $name, 2 );
			$order->set_billing_first_name( $parts[0] );
			$order->set_billing_last_name( $parts[1] ?? '' );
			$order->set_billing_phone( $phone );
			$order->set_billing_address_1( $address );
			$order->set_billing_state( $district );
			$order->set_billing_country( 'BD' );
			$order->set_customer_note( $notes );
			$order->set_payment_method( 'cod' );
			$order->set_payment_method_title( 'Cash on Delivery' );
			$order->set_customer_ip_address( sh_client_ip() );
			if ( $delivery > 0 ) {
				$ship = new WC_Order_Item_Shipping();
				$ship->set_method_title( 'Delivery' );
				$ship->set_method_id( 'sh_delivery' );
				$ship->set_total( (string) $delivery );
				$order->add_item( $ship );
			}
			if ( $discount > 0 ) {
				$fee = new WC_Order_Item_Fee();
				$fee->set_name( 'Coupon ' . $couponCode );
				$fee->set_total( (string) ( -1 * $discount ) );
				$order->add_item( $fee );
			}
			$order->update_meta_data( '_sh_order_number', $number );
			$order->update_meta_data( '_sh_payment_method', 'COD' );
			$order->update_meta_data( '_sh_discount', $discount );
			if ( $couponCode ) {
				$order->update_meta_data( '_sh_coupon_code', $couponCode );
			}
			$order->set_total( (string) $total );
			$order->set_status( self::STATUS['PENDING'] );
			$order->save();
			$wpdb->query( 'COMMIT' );
		} catch ( Exception $e ) {
			$wpdb->query( 'ROLLBACK' );
			foreach ( $lines as $l ) {
				wp_cache_delete( $l['product']->get_id(), 'post_meta' );
			}
			return $fail( $e->getMessage() ?: 'Failed to create order', 400 );
		}

		// Authoritative server-side Purchase event; the browser Pixel uses the same event id to deduplicate.
		SH_Meta::send_event( [
			'eventName'      => 'Purchase',
			'eventId'        => 'purchase_' . $number,
			'eventSourceUrl' => isset( $b['eventSourceUrl'] ) && is_string( $b['eventSourceUrl'] ) ? esc_url_raw( $b['eventSourceUrl'] ) : wp_get_referer(),
			'userData'       => SH_Meta::user_data_from_request( [ 'phone' => $phone, 'firstName' => explode( ' ', $name )[0] ] ),
			'customData'     => [
				'value'        => $total,
				'currency'     => 'BDT',
				'content_type' => 'product',
				'content_ids'  => array_map( 'strval', array_keys( $lines ) ),
				'contents'     => array_values( array_map( static fn( $pid, $l ) => [ 'id' => (string) $pid, 'quantity' => $l['qty'], 'item_price' => $l['price'] ], array_keys( $lines ), $lines ) ),
				'num_items'    => array_sum( array_column( $lines, 'qty' ) ),
				'order_id'     => $number,
			],
		] );

		return new WP_REST_Response( [ 'success' => true, 'orderId' => (string) $order->get_id(), 'orderNumber' => $number, 'subtotal' => $subtotal, 'deliveryCharge' => $delivery, 'discount' => $discount, 'total' => $total ] );
	}

	private static function unique_order_number(): string {
		for ( $i = 0; $i < 10; $i++ ) {
			$n = sh_generate_order_number();
			if ( ! self::find_by_number( $n ) ) {
				return $n;
			}
		}
		return 'SH' . gmdate( 'ymd' ) . random_int( 10000, 99999 );
	}

	/** GET /orders/track?orderNumber=... (contact details are masked: order numbers are guessable). */
	public static function rest_track( WP_REST_Request $req ) {
		$num = strtoupper( trim( (string) $req->get_param( 'orderNumber' ) ) );
		if ( '' === $num ) {
			return new WP_REST_Response( [ 'success' => false, 'error' => 'Order number is required' ], 400 );
		}
		if ( ! SH_Rest::throttle( 'track', 40, HOUR_IN_SECONDS ) ) {
			return new WP_REST_Response( [ 'success' => false, 'error' => 'Too many lookups. Please try again later.' ], 429 );
		}
		$o = self::find_by_number( $num );
		if ( ! $o ) {
			return new WP_REST_Response( [ 'success' => false, 'error' => 'Order not found' ], 404 );
		}
		$a    = self::to_array( $o );
		$ph   = (string) $a['phone'];
		$parts = array_map( 'trim', explode( ',', (string) $a['address'] ) );
		$addr  = count( $parts ) > 2 ? '…, ' . implode( ', ', array_slice( $parts, -2 ) ) : ( count( $parts ) > 1 ? '…, ' . end( $parts ) : '…' );
		$nm    = preg_split( '/\s+/', (string) $a['customerName'] );
		$order = [
			'orderNumber'    => $a['orderNumber'],
			'customerName'   => $nm[0] . ( isset( $nm[1] ) ? ' ' . mb_substr( $nm[1], 0, 1 ) . '.' : '' ),
			'phone'          => strlen( $ph ) >= 7 ? substr( $ph, 0, 3 ) . str_repeat( '•', max( 0, strlen( $ph ) - 5 ) ) . substr( $ph, -2 ) : $ph,
			'address'        => $addr,
			'subtotal'       => $a['subtotal'],
			'deliveryCharge' => $a['deliveryCharge'],
			'total'          => $a['total'],
			'paymentMethod'  => $a['paymentMethod'],
			'status'         => $a['status'],
			'adminNote'      => $a['adminNote'],
			'createdAt'      => $a['createdAt'],
			'updatedAt'      => $a['updatedAt'],
			'items'          => array_map( static fn( $i ) => [ 'productTitle' => $i['productTitle'], 'productImage' => $i['productImage'], 'price' => $i['price'], 'quantity' => $i['quantity'], 'lineTotal' => $i['lineTotal'] ], $a['items'] ),
		];
		return new WP_REST_Response( [ 'success' => true, 'order' => $order ] );
	}

	/* ─────────────────────────── Admin operations ─────────────────────────── */

	/** @return array{orders: array, total: int} */
	public static function list( int $page = 1, int $limit = 50, string $status = '' ): array {
		$st = $status && isset( self::STATUS[ $status ] ) ? [ 'wc-' . self::STATUS[ $status ] ] : array_map( static fn( $s ) => 'wc-' . $s, array_values( self::STATUS ) );
		$q  = new WC_Order_Query( [ 'limit' => $limit, 'paged' => $page, 'orderby' => 'date', 'order' => 'DESC', 'status' => $st, 'paginate' => true ] );
		$r  = $q->get_orders();
		return [ 'orders' => array_map( [ self::class, 'to_array' ], $r->orders ), 'total' => (int) $r->total ];
	}

	public static function counts(): array {
		$out = [];
		foreach ( self::STATUS as $k => $slug ) {
			$out[ $k ] = (int) wc_orders_count( $slug );
		}
		return $out;
	}

	private static function restock( WC_Order $o ): void {
		foreach ( $o->get_items() as $it ) {
			$pid = $it->get_product_id();
			if ( $pid && 'product' === get_post_type( $pid ) ) {
				$p = wc_get_product( $pid );
				if ( $p ) {
					wc_update_product_stock( $p, (int) $it->get_quantity(), 'increase' );
				}
			}
		}
	}

	public static function update( int $id, array $b ): ?array {
		$o = wc_get_order( $id );
		if ( ! $o ) {
			return null;
		}
		if ( isset( $b['status'] ) && isset( self::STATUS[ $b['status'] ] ) ) {
			if ( 'CANCELLED' === $b['status'] && 'CANCELLED' !== self::status_of( $o ) ) {
				self::restock( $o ); // restore stock once
			}
			$o->set_status( self::STATUS[ $b['status'] ] );
		}
		if ( array_key_exists( 'adminNote', $b ) ) {
			$o->update_meta_data( '_sh_admin_note', (string) $b['adminNote'] );
		}
		foreach ( [ 'courierConsignmentId' => '_sh_courier_consignment_id', 'courierTrackingCode' => '_sh_courier_tracking_code', 'courierStatus' => '_sh_courier_status' ] as $k => $mk ) {
			if ( array_key_exists( $k, $b ) ) {
				$o->update_meta_data( $mk, (string) ( $b[ $k ] ?? '' ) );
			}
		}
		if ( array_key_exists( 'courierSentAt', $b ) ) {
			$o->update_meta_data( '_sh_courier_sent_at', $b['courierSentAt'] ? strtotime( (string) $b['courierSentAt'] ) : '' );
		}
		$o->save();
		return self::to_array( $o );
	}

	public static function delete( int $id ): bool {
		$o = wc_get_order( $id );
		if ( ! $o ) {
			return false;
		}
		if ( 'CANCELLED' !== self::status_of( $o ) ) {
			self::restock( $o ); // return reserved stock unless already restored on cancellation
		}
		$o->delete( true );
		return true;
	}
}
