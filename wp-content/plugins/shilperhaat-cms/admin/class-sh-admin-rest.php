<?php
defined( 'ABSPATH' ) || exit;

/**
 * REST API used by the admin panel. Paths and payloads mirror the original Next.js /api/admin/* routes
 * (the bundled UI calls them unchanged; admin/assets/admin.js rewrites /api/... to /wp-json/shilperhaat/v1/...).
 */
class SH_Admin_Rest {

	public static function init(): void {
		add_action( 'rest_api_init', [ self::class, 'routes' ] );
	}

	private static function perm( string $key ): callable {
		return static fn() => SH_Admin::can( $key );
	}

	private static function route( string $path, array $methods, callable $cb, $perm ): void {
		register_rest_route( SH_Rest::NS, $path, [ 'methods' => $methods, 'callback' => $cb, 'permission_callback' => is_string( $perm ) ? self::perm( $perm ) : $perm ] );
	}

	public static function routes(): void {
		$any   = static fn() => null !== SH_Admin::user();
		$super = static fn() => SH_Admin::is_super();
		$open  = static fn() => true;
		$id    = '/(?P<id>[A-Za-z0-9_-]+)';

		// Auth
		self::route( '/admin/login', [ 'POST' ], [ self::class, 'login' ], $open );
		self::route( '/admin/logout', [ 'POST', 'GET' ], [ self::class, 'logout' ], $open );

		// Page data (server-side props of the original admin pages)
		self::route( '/admin/data/dashboard', [ 'GET' ], [ self::class, 'data_dashboard' ], $any );
		self::route( '/admin/data/products', [ 'GET' ], [ self::class, 'data_products' ], 'products' );
		self::route( '/admin/data/product-form', [ 'GET' ], [ self::class, 'data_product_form' ], 'products' );
		self::route( '/admin/data/categories', [ 'GET' ], [ self::class, 'data_categories' ], 'categories' );
		self::route( '/admin/data/banners', [ 'GET' ], [ self::class, 'data_banners' ], 'banners' );
		self::route( '/admin/data/reviews', [ 'GET' ], [ self::class, 'data_reviews' ], 'reviews' );
		self::route( '/admin/data/orders', [ 'GET' ], [ self::class, 'data_orders' ], 'orders' );
		self::route( '/admin/data/settings', [ 'GET' ], [ self::class, 'data_settings' ], 'settings' );
		self::route( '/admin/data/users', [ 'GET' ], [ self::class, 'users_list' ], $super );

		// Products
		self::route( '/admin/products', [ 'GET' ], [ self::class, 'products_get' ], 'products' );
		self::route( '/admin/products', [ 'POST' ], [ self::class, 'product_save' ], 'products' );
		self::route( '/admin/products' . $id, [ 'PUT' ], [ self::class, 'product_save' ], 'products' );
		self::route( '/admin/products' . $id, [ 'DELETE' ], [ self::class, 'product_delete' ], 'products' );
		// Categories
		self::route( '/admin/categories', [ 'GET' ], [ self::class, 'data_categories' ], 'categories' );
		self::route( '/admin/categories', [ 'POST' ], [ self::class, 'category_save' ], 'categories' );
		self::route( '/admin/categories' . $id, [ 'PUT' ], [ self::class, 'category_save' ], 'categories' );
		self::route( '/admin/categories' . $id, [ 'DELETE' ], [ self::class, 'category_delete' ], 'categories' );
		// Banners
		self::route( '/admin/banners', [ 'GET' ], [ self::class, 'data_banners' ], 'banners' );
		self::route( '/admin/banners', [ 'POST' ], [ self::class, 'banner_save' ], 'banners' );
		self::route( '/admin/banners' . $id, [ 'PUT' ], [ self::class, 'banner_save' ], 'banners' );
		self::route( '/admin/banners' . $id, [ 'DELETE' ], [ self::class, 'banner_delete' ], 'banners' );
		// Reviews
		self::route( '/admin/reviews', [ 'GET' ], [ self::class, 'data_reviews' ], 'reviews' );
		self::route( '/admin/reviews', [ 'POST' ], [ self::class, 'review_save' ], 'reviews' );
		self::route( '/admin/reviews' . $id, [ 'PUT' ], [ self::class, 'review_save' ], 'reviews' );
		self::route( '/admin/reviews' . $id, [ 'DELETE' ], [ self::class, 'review_delete' ], 'reviews' );
		// Coupons
		self::route( '/admin/coupons', [ 'GET' ], [ self::class, 'coupons_get' ], 'coupons' );
		self::route( '/admin/coupons', [ 'POST' ], [ self::class, 'coupon_save' ], 'coupons' );
		self::route( '/admin/coupons' . $id, [ 'PUT' ], [ self::class, 'coupon_save' ], 'coupons' );
		self::route( '/admin/coupons' . $id, [ 'DELETE' ], [ self::class, 'coupon_delete' ], 'coupons' );
		// Orders
		self::route( '/admin/orders', [ 'GET' ], [ self::class, 'orders_get' ], 'orders' );
		self::route( '/admin/orders' . $id, [ 'PUT' ], [ self::class, 'order_update' ], 'orders' );
		self::route( '/admin/orders' . $id, [ 'DELETE' ], [ self::class, 'order_delete' ], 'orders' );
		// Pages
		self::route( '/admin/pages', [ 'GET' ], [ self::class, 'pages_get' ], 'pages' );
		self::route( '/admin/pages/(?P<slug>[^/]+)', [ 'PUT' ], [ self::class, 'page_update' ], 'pages' );
		// Settings / integrations / site content
		self::route( '/admin/settings', [ 'GET' ], [ self::class, 'settings_get' ], 'settings' );
		self::route( '/admin/settings', [ 'PUT' ], [ self::class, 'settings_put' ], 'settings' );
		self::route( '/admin/integrations', [ 'GET', 'PUT' ], [ self::class, 'integrations' ], 'settings' );
		self::route( '/admin/site-content/(?P<key>[a-z-]+)', [ 'PUT', 'DELETE' ], [ self::class, 'site_content_write' ], static fn() => SH_Admin::can( 'site-layout' ) || SH_Admin::can( 'contact-widget' ) );
		// Users (Access Management)
		self::route( '/admin/users', [ 'GET' ], [ self::class, 'users_list' ], $super );
		self::route( '/admin/users', [ 'POST' ], [ self::class, 'user_create' ], $super );
		self::route( '/admin/users' . $id, [ 'PUT' ], [ self::class, 'user_update' ], $super );
		self::route( '/admin/users' . $id, [ 'DELETE' ], [ self::class, 'user_delete' ], $super );
		// Upload + courier
		self::route( '/admin/upload', [ 'POST' ], [ self::class, 'upload' ], $any );
		self::route( '/admin/courier/steadfast', [ 'POST', 'GET' ], [ 'SH_Courier', 'handle' ], static fn() => SH_Admin::can( 'orders' ) || SH_Admin::can( 'settings' ) );

		// Public (used by the storefront and by the admin UI itself)
		self::route( '/site-content/(?P<key>[a-z-]+)', [ 'GET' ], [ self::class, 'site_content_get' ], $open );
		self::route( '/categories', [ 'GET' ], [ self::class, 'public_categories' ], $open );
		self::route( '/settings', [ 'GET' ], static fn() => new WP_REST_Response( sh_public_settings() ), $open );
	}

	private static function err( string $m, int $s = 400 ): WP_REST_Response {
		return new WP_REST_Response( [ 'error' => $m ], $s );
	}

	private static function body( WP_REST_Request $r ): array {
		$b = $r->get_json_params();
		return is_array( $b ) ? $b : [];
	}

	/* ─────────────────────────── Auth ─────────────────────────── */

	public static function login( WP_REST_Request $r ) {
		$b     = self::body( $r );
		$email = isset( $b['email'] ) ? trim( (string) $b['email'] ) : '';
		$pw    = isset( $b['password'] ) ? (string) $b['password'] : '';
		if ( ! is_email( $email ) || strlen( $pw ) < 6 ) {
			return new WP_REST_Response( [ 'success' => false, 'error' => 'Invalid input' ], 400 );
		}
		if ( ! SH_Rest::throttle( 'login:' . strtolower( $email ), 10, 15 * MINUTE_IN_SECONDS ) ) {
			return new WP_REST_Response( [ 'success' => false, 'error' => 'Too many attempts. Please try again in a few minutes.' ], 429 );
		}
		$user = wp_authenticate( $email, $pw );
		if ( is_wp_error( $user ) ) {
			return new WP_REST_Response( [ 'success' => false, 'error' => 'Invalid credentials' ], 401 );
		}
		if ( ! user_can( $user, 'manage_options' ) && ! in_array( 'sh_staff', (array) $user->roles, true ) ) {
			return new WP_REST_Response( [ 'success' => false, 'error' => 'Invalid credentials' ], 401 );
		}
		wp_set_current_user( $user->ID );
		wp_set_auth_cookie( $user->ID, false );
		return new WP_REST_Response( [ 'success' => true ] );
	}

	public static function logout() {
		wp_logout();
		return new WP_REST_Response( [ 'success' => true ] );
	}

	/* ─────────────────────────── Page data ─────────────────────────── */

	public static function data_dashboard() {
		global $wpdb;
		$all    = SH_Catalog::query( [ 'status' => 'ALL', 'all' => true ] );
		$active = SH_Catalog::query( [ 'status' => 'ACTIVE', 'limit' => 1 ] );
		$counts = SH_Orders::counts();
		$best   = get_posts( [ 'post_type' => 'product', 'post_status' => [ 'publish', 'draft', 'private' ], 'numberposts' => 5, 'fields' => 'ids', 'orderby' => 'date', 'order' => 'DESC', 'meta_key' => '_sh_best_selling', 'meta_value' => 1 ] ); // phpcs:ignore
		$top    = [];
		foreach ( $best as $pid ) {
			$p = SH_Catalog::to_array( $pid );
			if ( $p ) {
				$top[] = [ 'id' => $p['id'], 'title' => $p['title'], 'price' => $p['price'], 'category' => $p['category'] ];
			}
		}
		return new WP_REST_Response( [
			'stats'       => [
				'totalProducts'   => $all['total'],
				'activeProducts'  => $active['total'],
				'totalOrders'     => array_sum( $counts ),
				'pendingOrders'   => $counts['PENDING'] ?? 0,
				'totalCategories' => count( SH_Catalog::categories() ),
				'totalReviews'    => (int) $wpdb->get_var( 'SELECT COUNT(*) FROM ' . sh_table( 'reviews' ) ), // phpcs:ignore
			],
			'topProducts' => $top,
		] );
	}

	public static function products_get() {
		return new WP_REST_Response( [ 'products' => SH_Catalog::query( [ 'status' => 'ALL', 'all' => true ] )['products'] ] );
	}

	public static function data_products() {
		return self::products_get();
	}

	private static function categories_by_name(): array {
		$c = SH_Catalog::categories();
		usort( $c, static fn( $a, $b ) => strcasecmp( $a['name'], $b['name'] ) );
		return $c;
	}

	public static function data_product_form( WP_REST_Request $r ) {
		$out = [ 'categories' => self::categories_by_name() ];
		$id  = (string) $r->get_param( 'id' );
		if ( '' !== $id ) {
			$out['product'] = ctype_digit( $id ) ? SH_Catalog::by_id( (int) $id ) : null;
		}
		return new WP_REST_Response( $out );
	}

	private static function category_counts(): array {
		global $wpdb;
		$rows = $wpdb->get_results( "SELECT tt.term_id, COUNT(DISTINCT p.ID) AS n FROM {$wpdb->term_taxonomy} tt JOIN {$wpdb->term_relationships} tr ON tr.term_taxonomy_id = tt.term_taxonomy_id JOIN {$wpdb->posts} p ON p.ID = tr.object_id AND p.post_type = 'product' AND p.post_status IN ('publish','draft','private') WHERE tt.taxonomy = 'product_cat' GROUP BY tt.term_id" ); // phpcs:ignore
		$out  = [];
		foreach ( $rows as $r ) {
			$out[ (int) $r->term_id ] = (int) $r->n;
		}
		return $out;
	}

	public static function data_categories() {
		$counts = self::category_counts();
		$cats   = array_map( static function ( $c ) use ( $counts ) {
			$c['_count'] = [ 'products' => $counts[ (int) $c['id'] ] ?? 0 ];
			return $c;
		}, SH_Catalog::categories() );
		return new WP_REST_Response( [ 'categories' => $cats ] );
	}

	public static function data_banners() {
		return new WP_REST_Response( [ 'banners' => SH_Store::banners() ] );
	}

	public static function data_reviews() {
		return new WP_REST_Response( [ 'reviews' => SH_Store::all_reviews() ] );
	}

	public static function data_orders() {
		return new WP_REST_Response( [ 'orders' => SH_Orders::list( 1, 100 )['orders'] ] );
	}

	private static function settings_payload(): array {
		$s = sh_settings();
		return [
			'id'              => 'default',
			'siteName'        => $s['siteName'],
			'logoUrl'         => $s['logoUrl'] ?: null,
			'faviconUrl'      => $s['faviconUrl'] ?: null,
			'footerCopyright' => $s['footerCopyright'] ?: null,
			'whatsappNumber'  => $s['whatsappNumber'] ?: null,
			'socialLinks'     => $s['socialLinks'],
			'deliveryCharge'  => (float) $s['deliveryCharge'],
			'freeDeliveryMin' => $s['freeDeliveryMin'] ? (float) $s['freeDeliveryMin'] : null,
			'updatedAt'       => gmdate( 'c' ),
		];
	}

	public static function data_settings() {
		return new WP_REST_Response( [ 'settings' => self::settings_payload() ] );
	}

	/* ─────────────────────────── Products ─────────────────────────── */

	public static function product_save( WP_REST_Request $r ) {
		$id = $r->get_param( 'id' );
		$b  = self::body( $r );
		$title = trim( (string) ( $b['title'] ?? '' ) );
		if ( '' === $title ) {
			return self::err( 'Title is required' );
		}
		$slug = trim( (string) ( $b['slug'] ?? '' ) );
		$slug = '' !== $slug ? $slug : sh_generate_slug( $title );
		$dup  = SH_Catalog::product_id_by_slug( $slug );
		if ( $dup && (string) $dup !== (string) $id ) {
			return self::err( 'এই slug দিয়ে আগেই একটি প্রোডাক্ট আছে। অন্য একটি title/slug ব্যবহার করুন।', 409 );
		}
		if ( $id && 'product' !== get_post_type( (int) $id ) ) {
			return self::err( 'Product not found', 404 );
		}
		$price = isset( $b['price'] ) ? (float) $b['price'] : 0;
		if ( $price <= 0 ) {
			return self::err( 'Price must be positive' );
		}
		$pid = SH_Catalog::save_product( [
			'title'          => $title,
			'slug'           => $slug,
			'description'    => isset( $b['description'] ) ? wp_kses_post( (string) $b['description'] ) : '',
			'price'          => $price,
			'compareAtPrice' => ! empty( $b['compareAtPrice'] ) ? (float) $b['compareAtPrice'] : null,
			'stock'          => isset( $b['stock'] ) ? max( 0, (int) $b['stock'] ) : 0,
			'categoryId'     => ! empty( $b['categoryId'] ) ? (int) $b['categoryId'] : null,
			'isFeatured'     => ! empty( $b['isFeatured'] ),
			'isBestSelling'  => ! empty( $b['isBestSelling'] ),
			'status'         => $b['status'] ?? 'ACTIVE',
			'sku'            => ! empty( $b['sku'] ) ? (string) $b['sku'] : null,
			'tags'           => is_array( $b['tags'] ?? null ) ? array_map( 'sanitize_text_field', $b['tags'] ) : [],
			'videoUrl'       => ! empty( $b['videoUrl'] ) ? (string) $b['videoUrl'] : null,
			'youtubeUrl'     => ! empty( $b['youtubeUrl'] ) ? esc_url_raw( (string) $b['youtubeUrl'] ) : null,
			'youtubeVideoId' => ! empty( $b['youtubeVideoId'] ) ? preg_replace( '/[^A-Za-z0-9_-]/', '', (string) $b['youtubeVideoId'] ) : null,
			'images'         => array_values( array_filter( array_map( 'strval', (array) ( $b['images'] ?? [] ) ) ) ),
		], (int) $id );
		if ( is_wp_error( $pid ) ) {
			return self::err( $pid->get_error_message() );
		}
		return new WP_REST_Response( [ 'success' => true, 'product' => SH_Catalog::by_id( (int) $pid ) ] );
	}

	public static function product_delete( WP_REST_Request $r ) {
		$id = (int) $r['id'];
		if ( 'product' !== get_post_type( $id ) ) {
			return self::err( 'Failed to delete product', 404 );
		}
		SH_Catalog::delete_product( $id );
		return new WP_REST_Response( [ 'success' => true ] );
	}

	/* ─────────────────────────── Categories ─────────────────────────── */

	public static function category_save( WP_REST_Request $r ) {
		$id = (int) $r->get_param( 'id' );
		$b  = self::body( $r );
		$name = trim( (string) ( $b['name'] ?? '' ) );
		$slug = trim( (string) ( $b['slug'] ?? '' ) );
		if ( '' === $name || '' === $slug ) {
			return self::err( 'Name and slug are required' );
		}
		$t = get_term_by( 'slug', sanitize_title( $slug ), 'product_cat' );
		if ( $t && (int) $t->term_id !== $id ) {
			return self::err( 'এই slug দিয়ে আগেই একটি ক্যাটাগরি আছে। অন্য একটি slug ব্যবহার করুন।', 409 );
		}
		$res = SH_Catalog::save_category( [
			'name' => $name, 'slug' => $slug, 'isFeatured' => ! empty( $b['isFeatured'] ),
			'sortOrder' => (int) ( $b['sortOrder'] ?? 0 ), 'imageUrl' => (string) ( $b['imageUrl'] ?? '' ),
		], $id );
		if ( is_wp_error( $res ) ) {
			return self::err( $res->get_error_message() );
		}
		$term = get_term( (int) $res, 'product_cat' );
		return new WP_REST_Response( [ 'category' => SH_Catalog::term_to_array( $term ) ] );
	}

	public static function category_delete( WP_REST_Request $r ) {
		$id = (int) $r['id'];
		if ( (int) get_option( 'default_product_cat' ) === $id ) {
			return self::err( 'Failed to delete category' );
		}
		$res = wp_delete_term( $id, 'product_cat' );
		return is_wp_error( $res ) || ! $res ? self::err( 'Failed to delete category', 500 ) : new WP_REST_Response( [ 'success' => true ] );
	}

	/* ─────────────────────────── Banners / Reviews ─────────────────────────── */

	public static function banner_save( WP_REST_Request $r ) {
		$id = (int) $r->get_param( 'id' );
		$b  = self::body( $r );
		if ( empty( $b['imageUrl'] ) ) {
			return self::err( 'Image URL is required' );
		}
		$bid = SH_Store::save_banner( $b, $id );
		$all = SH_Store::banners();
		foreach ( $all as $x ) {
			if ( (int) $x['id'] === (int) $bid ) {
				return new WP_REST_Response( [ 'banner' => $x ] );
			}
		}
		return self::err( 'Failed to save banner', 500 );
	}

	public static function banner_delete( WP_REST_Request $r ) {
		SH_Store::delete_banner( (int) $r['id'] );
		return new WP_REST_Response( [ 'success' => true ] );
	}

	public static function review_save( WP_REST_Request $r ) {
		global $wpdb;
		$id = (int) $r->get_param( 'id' );
		$b  = self::body( $r );
		if ( ! $id && ( '' === trim( (string) ( $b['name'] ?? '' ) ) || '' === trim( (string) ( $b['content'] ?? '' ) ) ) ) {
			return self::err( 'Name and content are required' );
		}
		if ( $id ) {
			$cur = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . sh_table( 'reviews' ) . ' WHERE id = %d', $id ) ); // phpcs:ignore
			if ( ! $cur ) {
				return self::err( 'Failed to update review', 404 );
			}
			$b = array_merge( [ 'name' => $cur->name, 'content' => $cur->content, 'rating' => $cur->rating, 'isVisible' => (bool) $cur->is_visible, 'sortOrder' => $cur->sort_order, 'productId' => $cur->product_id, 'createdAt' => $cur->created_at . ' UTC' ], $b );
		}
		$rid = SH_Store::save_review( [
			'name' => trim( (string) $b['name'] ), 'title' => $b['title'] ?? null, 'rating' => $b['rating'] ?? 5, 'content' => trim( (string) $b['content'] ),
			'avatarUrl' => $b['avatarUrl'] ?? null, 'role' => $b['role'] ?? null, 'isVisible' => $b['isVisible'] ?? true, 'sortOrder' => $b['sortOrder'] ?? 0,
			'productId' => $id ? ( $b['productId'] ?? null ) : null,
		], $id );
		$row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . sh_table( 'reviews' ) . ' WHERE id = %d', $rid ) ); // phpcs:ignore
		return new WP_REST_Response( [ 'review' => SH_Store::review_to_array( $row ) ] );
	}

	public static function review_delete( WP_REST_Request $r ) {
		SH_Store::delete_review( (int) $r['id'] );
		return new WP_REST_Response( [ 'success' => true ] );
	}

	/* ─────────────────────────── Coupons ─────────────────────────── */

	public static function coupons_get() {
		return new WP_REST_Response( [ 'coupons' => SH_Coupons::all() ] );
	}

	public static function coupon_save( WP_REST_Request $r ) {
		$id = (int) $r->get_param( 'id' );
		$b  = self::body( $r );
		$cur = $id ? ( new WC_Coupon( $id ) ) : null;
		$d   = $id ? SH_Coupons::to_array( $cur ) : [ 'type' => 'FIXED', 'isActive' => true, 'description' => '', 'minOrderAmount' => 0, 'maxUses' => null, 'expiresAt' => null ];
		if ( array_key_exists( 'code', $b ) || ! $id ) {
			$code = strtoupper( trim( (string) ( $b['code'] ?? '' ) ) );
			if ( ! preg_match( '/^[A-Z0-9_-]{2,20}$/', $code ) ) {
				return self::err( 'Code must be A-Z, 0-9, -, _ only (2–20 characters).' );
			}
			$dup = SH_Coupons::find_id( $code );
			if ( $dup && $dup !== $id ) {
				return self::err( 'This code already exists.', 409 );
			}
			$d['code'] = $code;
		}
		if ( array_key_exists( 'type', $b ) ) {
			$d['type'] = 'PERCENTAGE' === $b['type'] ? 'PERCENTAGE' : 'FIXED';
		}
		if ( array_key_exists( 'value', $b ) || ! $id ) {
			$value = (float) ( $b['value'] ?? 0 );
			if ( $value <= 0 ) {
				return self::err( 'Discount value must be greater than zero.' );
			}
			if ( 'PERCENTAGE' === $d['type'] && $value > 100 ) {
				return self::err( 'Percentage cannot exceed 100.' );
			}
			$d['value'] = $value;
		}
		if ( array_key_exists( 'minOrderAmount', $b ) ) {
			$d['minOrderAmount'] = max( 0, (float) $b['minOrderAmount'] );
		}
		if ( array_key_exists( 'maxUses', $b ) ) {
			$d['maxUses'] = null === $b['maxUses'] ? null : max( 1, (int) $b['maxUses'] );
		}
		if ( array_key_exists( 'isActive', $b ) ) {
			$d['isActive'] = (bool) $b['isActive'];
		}
		if ( array_key_exists( 'expiresAt', $b ) ) {
			$d['expiresAt'] = $b['expiresAt'] ?: null;
		}
		if ( array_key_exists( 'description', $b ) ) {
			$d['description'] = (string) $b['description'];
		}
		$res = SH_Coupons::save( $d, $id );
		if ( is_wp_error( $res ) ) {
			return self::err( $res->get_error_message(), 'duplicate' === $res->get_error_code() ? 409 : 400 );
		}
		return new WP_REST_Response( [ 'coupon' => SH_Coupons::to_array( new WC_Coupon( (int) $res ) ) ] );
	}

	public static function coupon_delete( WP_REST_Request $r ) {
		SH_Coupons::delete( (int) $r['id'] );
		return new WP_REST_Response( [ 'success' => true ] );
	}

	/* ─────────────────────────── Orders ─────────────────────────── */

	public static function orders_get( WP_REST_Request $r ) {
		$page   = max( 1, (int) ( $r->get_param( 'page' ) ?: 1 ) );
		$limit  = min( 100, (int) ( $r->get_param( 'limit' ) ?: 50 ) );
		$status = (string) $r->get_param( 'status' );
		$res    = SH_Orders::list( $page, $limit, $status );
		return new WP_REST_Response( [ 'orders' => $res['orders'], 'total' => $res['total'], 'page' => $page, 'limit' => $limit ] );
	}

	public static function order_update( WP_REST_Request $r ) {
		$o = SH_Orders::update( (int) $r['id'], self::body( $r ) );
		return $o ? new WP_REST_Response( [ 'order' => $o ] ) : self::err( 'Failed to update order', 404 );
	}

	public static function order_delete( WP_REST_Request $r ) {
		return SH_Orders::delete( (int) $r['id'] ) ? new WP_REST_Response( [ 'success' => true ] ) : self::err( 'Failed to delete order', 404 );
	}

	/* ─────────────────────────── Pages / site content ─────────────────────────── */

	public static function pages_get() {
		$pages = SH_Store::pages();
		usort( $pages, static fn( $a, $b ) => strcmp( $a['slug'], $b['slug'] ) );
		return new WP_REST_Response( [ 'pages' => $pages ] );
	}

	public static function page_update( WP_REST_Request $r ) {
		$slug = (string) $r['slug'];
		$cur  = SH_Store::page( $slug );
		if ( ! $cur ) {
			return self::err( 'Page not found', 404 );
		}
		$b = self::body( $r );
		if ( isset( $b['sections'] ) && ! is_array( $b['sections'] ) ) {
			return self::err( 'sections must be an array' );
		}
		$merged = array_merge( $cur, array_intersect_key( $b, array_flip( [ 'title', 'subtitle', 'metaTitle', 'metaDescription', 'isPublished', 'sections' ] ) ) );
		if ( isset( $b['sections'] ) ) {
			foreach ( $merged['sections'] as &$s ) {
				$s = [ 'id' => (string) ( $s['id'] ?? '' ), 'title' => (string) ( $s['title'] ?? '' ), 'content' => wp_kses_post( (string) ( $s['content'] ?? '' ) ), 'order' => (int) ( $s['order'] ?? 0 ) ];
			}
			unset( $s );
		}
		SH_Store::save_page( $merged, $slug );
		return new WP_REST_Response( [ 'page' => SH_Store::page( $slug ) ] );
	}

	public static function site_content_get( WP_REST_Request $r ) {
		$key = (string) $r['key'];
		if ( ! in_array( $key, [ 'site-layout', 'contact-widget' ], true ) ) {
			return self::err( 'Not found', 404 );
		}
		return new WP_REST_Response( [ 'value' => sh_get_content( $key, null ) ] );
	}

	public static function site_content_write( WP_REST_Request $r ) {
		$key = (string) $r['key'];
		if ( ! in_array( $key, [ 'site-layout', 'contact-widget' ], true ) || ! SH_Admin::can( $key ) ) {
			return self::err( 'Not found', 404 );
		}
		if ( 'DELETE' === $r->get_method() ) {
			sh_delete_content( $key );
			return new WP_REST_Response( [ 'success' => true ] );
		}
		$b = self::body( $r );
		if ( ! array_key_exists( 'value', $b ) || null === $b['value'] ) {
			return self::err( 'value is required' );
		}
		sh_set_content( $key, $b['value'] );
		if ( 'site-layout' === $key && is_array( $b['value'] ) ) {
			$links = [];
			foreach ( (array) ( $b['value']['footerLinks'] ?? [] ) as $group ) {
				if ( is_array( $group ) ) {
					$links = array_merge( $links, $group );
				}
			}
			foreach ( (array) ( $b['value']['navItems'] ?? [] ) as $item ) {
				$links[] = $item;
				if ( ! empty( $item['dropdown'] ) && is_array( $item['dropdown'] ) ) {
					$links = array_merge( $links, $item['dropdown'] );
				}
			}
			SH_Store::ensure_pages_for_links( $links );
		}
		return new WP_REST_Response( [ 'value' => sh_get_content( $key, null ) ] );
	}

	public static function public_categories() {
		return new WP_REST_Response( [ 'categories' => array_map( static fn( $c ) => [ 'id' => $c['id'], 'name' => $c['name'], 'slug' => $c['slug'], 'sortOrder' => $c['sortOrder'] ], SH_Catalog::categories() ) ] );
	}

	/* ─────────────────────────── Settings / integrations ─────────────────────────── */

	public static function settings_get() {
		return self::data_settings();
	}

	public static function settings_put( WP_REST_Request $r ) {
		$b   = self::body( $r );
		$cur = sh_settings();
		$cur['siteName']        = isset( $b['siteName'] ) && '' !== trim( (string) $b['siteName'] ) ? sanitize_text_field( $b['siteName'] ) : 'Shilperhaat';
		$cur['logoUrl']         = (string) ( $b['logoUrl'] ?? '' );
		$cur['faviconUrl']      = (string) ( $b['faviconUrl'] ?? '' );
		$cur['footerCopyright'] = sanitize_text_field( (string) ( $b['footerCopyright'] ?? '' ) );
		$cur['whatsappNumber']  = sanitize_text_field( (string) ( $b['whatsappNumber'] ?? '' ) );
		$cur['socialLinks']     = is_array( $b['socialLinks'] ?? null ) ? $b['socialLinks'] : null;
		$cur['deliveryCharge']  = max( 0, (float) ( $b['deliveryCharge'] ?? 0 ) );
		$cur['freeDeliveryMin'] = ! empty( $b['freeDeliveryMin'] ) ? (float) $b['freeDeliveryMin'] : null;
		update_option( 'sh_settings', $cur, false );
		return new WP_REST_Response( [ 'settings' => self::settings_payload() ] );
	}

	public static function integrations( WP_REST_Request $r ) {
		$cur = sh_settings();
		if ( 'PUT' === $r->get_method() ) {
			$b = self::body( $r );
			if ( isset( $b['steadfast'] ) && is_array( $b['steadfast'] ) ) {
				if ( '' !== trim( (string) ( $b['steadfast']['apiKey'] ?? '' ) ) ) {
					$cur['steadfastApiKey'] = trim( (string) $b['steadfast']['apiKey'] );
				}
				if ( '' !== trim( (string) ( $b['steadfast']['secretKey'] ?? '' ) ) ) {
					$cur['steadfastSecretKey'] = trim( (string) $b['steadfast']['secretKey'] );
				}
			}
			if ( isset( $b['meta'] ) && is_array( $b['meta'] ) ) {
				$cur['metaPixelId']       = preg_replace( '/[^0-9]/', '', (string) ( $b['meta']['pixelId'] ?? '' ) );
				$cur['metaTestEventCode'] = sanitize_text_field( (string) ( $b['meta']['testEventCode'] ?? '' ) );
				if ( '' !== trim( (string) ( $b['meta']['accessToken'] ?? '' ) ) ) {
					$cur['metaCapiToken'] = trim( (string) $b['meta']['accessToken'] );
				}
			}
			update_option( 'sh_settings', $cur, false );
		}
		return new WP_REST_Response( [
			'steadfast' => [ 'configured' => '' !== SH_Courier::key() && '' !== SH_Courier::secret() ],
			'meta'      => [ 'pixelId' => (string) $cur['metaPixelId'], 'hasToken' => '' !== sh_secret( 'META_CAPI_ACCESS_TOKEN', 'metaCapiToken' ), 'testEventCode' => (string) $cur['metaTestEventCode'] ],
		] );
	}

	/* ─────────────────────────── Users (Access Management) ─────────────────────────── */

	private static function user_payload( WP_User $u ): array {
		$super = user_can( $u, 'manage_options' );
		return [
			'id'         => (string) $u->ID,
			'name'       => $u->display_name ?: $u->user_login,
			'email'      => $u->user_email,
			'role'       => $super ? 'super_admin' : 'admin',
			'createdAt'  => mysql2date( 'c', $u->user_registered, false ),
			'pageAccess' => $super ? [] : array_values( array_intersect( (array) get_user_meta( $u->ID, 'sh_page_access', true ), array_keys( SH_Install::ADMIN_PAGES ) ) ),
		];
	}

	public static function users_list() {
		$users = get_users( [ 'role__in' => [ 'administrator', 'sh_staff' ], 'orderby' => 'registered', 'order' => 'ASC' ] );
		return new WP_REST_Response( [ 'users' => array_map( [ self::class, 'user_payload' ], $users ) ] );
	}

	private static function valid_pages( $in ): array {
		return is_array( $in ) ? array_values( array_unique( array_filter( $in, static fn( $k ) => is_string( $k ) && isset( SH_Install::ADMIN_PAGES[ $k ] ) ) ) ) : [];
	}

	public static function user_create( WP_REST_Request $r ) {
		$b     = self::body( $r );
		$name  = trim( (string) ( $b['name'] ?? '' ) );
		$email = strtolower( trim( (string) ( $b['email'] ?? '' ) ) );
		$pw    = (string) ( $b['password'] ?? '' );
		if ( '' === $name || '' === $email || '' === trim( $pw ) ) {
			return self::err( 'Name, email, and password are required' );
		}
		if ( ! is_email( $email ) ) {
			return self::err( 'Enter a valid email address' );
		}
		if ( strlen( $pw ) < 8 ) {
			return self::err( 'Password must be at least 8 characters' );
		}
		if ( email_exists( $email ) || username_exists( $email ) ) {
			return self::err( 'An admin with this email already exists', 409 );
		}
		$super = 'super_admin' === ( $b['role'] ?? '' );
		$uid   = wp_insert_user( [ 'user_login' => $email, 'user_email' => $email, 'user_pass' => $pw, 'display_name' => $name, 'first_name' => $name, 'role' => $super ? 'administrator' : 'sh_staff' ] );
		if ( is_wp_error( $uid ) ) {
			return self::err( $uid->get_error_message() );
		}
		if ( ! $super ) {
			update_user_meta( $uid, 'sh_page_access', self::valid_pages( $b['pageAccess'] ?? [] ) );
		}
		return new WP_REST_Response( [ 'user' => self::user_payload( get_user_by( 'id', $uid ) ) ] );
	}

	public static function user_update( WP_REST_Request $r ) {
		$id = (int) $r['id'];
		if ( (string) $id === (string) get_current_user_id() ) {
			return self::err( 'You cannot modify your own account' );
		}
		$u = get_user_by( 'id', $id );
		if ( ! $u ) {
			return self::err( 'Not found', 404 );
		}
		$b     = self::body( $r );
		$super = 'super_admin' === ( $b['role'] ?? '' );
		$u->set_role( $super ? 'administrator' : 'sh_staff' );
		update_user_meta( $id, 'sh_page_access', $super ? [] : self::valid_pages( $b['pageAccess'] ?? [] ) );
		return new WP_REST_Response( [ 'user' => self::user_payload( get_user_by( 'id', $id ) ) ] );
	}

	public static function user_delete( WP_REST_Request $r ) {
		$id = (int) $r['id'];
		if ( (string) $id === (string) get_current_user_id() ) {
			return self::err( 'You cannot delete your own account' );
		}
		require_once ABSPATH . 'wp-admin/includes/user.php';
		return wp_delete_user( $id ) ? new WP_REST_Response( [ 'success' => true ] ) : self::err( 'Internal server error', 500 );
	}

	/* ─────────────────────────── Upload ─────────────────────────── */

	public static function upload( WP_REST_Request $r ) {
		$files = $r->get_file_params();
		$f     = $files['file'] ?? null;
		if ( ! $f || empty( $f['tmp_name'] ) ) {
			return self::err( 'No file provided' );
		}
		if ( ! empty( $f['error'] ) ) {
			$msg = UPLOAD_ERR_INI_SIZE === (int) $f['error'] || UPLOAD_ERR_FORM_SIZE === (int) $f['error'] ? 'File is larger than the server upload limit (upload_max_filesize / post_max_size).' : 'Upload failed';
			return self::err( $msg );
		}
		$folder = preg_replace( '/[^a-z0-9_-]/', '', strtolower( (string) ( $r->get_param( 'folder' ) ?: 'misc' ) ) ) ?: 'misc';
		$ext    = strtolower( pathinfo( (string) $f['name'], PATHINFO_EXTENSION ) );
		$mime   = (string) ( wp_check_filetype_and_ext( $f['tmp_name'], $f['name'] )['type'] ?: $f['type'] );
		$isImg  = in_array( $ext, [ 'jpg', 'jpeg', 'png', 'webp', 'gif' ], true ) && str_starts_with( $mime, 'image/' );
		$isVid  = in_array( $ext, [ 'mp4', 'webm', 'mov' ], true ) && ( str_starts_with( $mime, 'video/' ) || 'application/octet-stream' === $mime );
		if ( ! $isImg && ! $isVid ) {
			return self::err( 'Only image (JPG, PNG, WebP, GIF) or video (MP4, WebM, MOV) files are allowed' );
		}
		if ( $isImg && (int) $f['size'] > 15 * MB_IN_BYTES ) {
			return self::err( 'Image size must be under 15MB' );
		}
		if ( $isVid && (int) $f['size'] > 200 * MB_IN_BYTES ) {
			return self::err( 'Video file must be under 200MB. Please use YouTube link instead.' );
		}
		$dir = sh_uploads_dir() . '/' . $folder;
		if ( ! wp_mkdir_p( $dir ) ) {
			return self::err( 'সার্ভারে ফাইল লেখার অনুমতি নেই। Admin-কে জানান।', 500 );
		}
		$base = time() . str_pad( (string) wp_rand( 100, 999 ), 3, '0' ) . '-' . strtolower( wp_generate_password( 10, false ) );
		if ( $isVid ) {
			$name = $base . '.' . $ext;
			if ( ! move_uploaded_file( $f['tmp_name'], $dir . '/' . $name ) && ! @rename( $f['tmp_name'], $dir . '/' . $name ) ) { // phpcs:ignore
				return self::err( 'সার্ভারে ফাইল লেখার অনুমতি নেই। Admin-কে জানান।', 500 );
			}
			return new WP_REST_Response( [ 'success' => true, 'url' => '/uploads/' . $folder . '/' . $name ] );
		}
		// Images: rotate per EXIF, cap at 1600px, convert to WebP (falls back to the original format if WebP is unavailable).
		$editor = wp_get_image_editor( $f['tmp_name'] );
		if ( is_wp_error( $editor ) ) {
			return self::err( 'Could not process the image: ' . $editor->get_error_message() );
		}
		if ( method_exists( $editor, 'maybe_exif_rotate' ) ) {
			$editor->maybe_exif_rotate();
		}
		$editor->resize( 1600, 1600, false );
		$editor->set_quality( 82 );
		$webp = wp_image_editor_supports( [ 'mime_type' => 'image/webp' ] );
		$name = $base . ( $webp ? '.webp' : '.' . ( 'jpeg' === $ext ? 'jpg' : $ext ) );
		$res  = $editor->save( $dir . '/' . $name, $webp ? 'image/webp' : null );
		if ( is_wp_error( $res ) ) {
			return self::err( $res->get_error_message(), 500 );
		}
		return new WP_REST_Response( [ 'success' => true, 'url' => '/uploads/' . $folder . '/' . $name ] );
	}
}
