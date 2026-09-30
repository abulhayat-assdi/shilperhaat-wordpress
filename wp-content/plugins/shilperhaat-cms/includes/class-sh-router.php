<?php
defined( 'ABSPATH' ) || exit;

/**
 * Front-end router. WordPress pretty permalinks only need to be on (every request reaches index.php);
 * the storefront URLs of the original app are resolved here, so no rewrite-rule flushing is needed:
 *
 *   /                 home            /cart  /checkout  /thank-you  /track-order  /account
 *   /shop             product listing /product/{slug}   product detail
 *   /{slug}           CMS page (wp_sh_pages)              /admin[/...]   admin panel
 *   /sitemap.xml /robots.txt /manifest.webmanifest        /uploads/...   legacy media URLs
 */
class SH_Router {

	/** @var array{name:string,args:array}|null */
	private static $route = null;
	/** @var array<string,mixed> */
	private static $data = [];

	const STATIC_ROUTES = [
		''            => 'home',
		'shop'        => 'shop',
		'cart'        => 'cart',
		'checkout'    => 'checkout',
		'thank-you'   => 'thank-you',
		'track-order' => 'track-order',
		'account'     => 'account',
	];

	public static function init(): void {
		add_action( 'parse_request', [ self::class, 'parse_request' ], 1 );
		add_filter( 'pre_handle_404', [ self::class, 'pre_handle_404' ], 10, 2 );
		add_filter( 'posts_pre_query', [ self::class, 'posts_pre_query' ], 10, 2 );
		add_filter( 'redirect_canonical', [ self::class, 'no_canonical' ] );
		add_filter( 'template_include', [ self::class, 'template_include' ], 99 );
		add_filter( 'show_admin_bar', '__return_false' );
		add_filter( 'body_class', static fn() => [] );
	}

	public static function name(): string {
		return self::$route['name'] ?? '';
	}

	public static function is( string $name ): bool {
		return self::name() === $name;
	}

	/** Data loaded while resolving the route (e.g. the product array or CMS page). */
	public static function data( ?string $key = null, $default = null ) {
		return null === $key ? self::$data : ( self::$data[ $key ] ?? $default );
	}

	public static function set_data( string $key, $value ): void {
		self::$data[ $key ] = $value;
	}

	public static function request_path(): string {
		global $wp;
		return trim( (string) $wp->request, '/' );
	}

	public static function parse_request( WP $wp ): void {
		if ( is_admin() || ! empty( $wp->query_vars['rest_route'] ) ) {
			return;
		}
		$path = trim( (string) $wp->request, '/' );
		if ( preg_match( '#^(wp-json|wp-login\.php|wp-admin|wp-cron\.php|xmlrpc\.php|wp-sitemap)#', $path ) ) {
			return;
		}
		// Plain-permalink style requests (?p=, ?s=) are not part of the storefront; leave them to WordPress.
		if ( '' === $path && ( isset( $_GET['p'] ) || isset( $_GET['page_id'] ) || isset( $_GET['s'] ) || isset( $_GET['rest_route'] ) ) ) { // phpcs:ignore
			return;
		}

		// Machine-readable files.
		if ( in_array( $path, [ 'sitemap.xml', 'robots.txt', 'manifest.webmanifest', 'favicon.ico' ], true ) ) {
			SH_Seo::serve( $path );
			return;
		}
		// Legacy media URLs (/uploads/products/x.webp) → real file location.
		if ( str_starts_with( $path, 'uploads/' ) ) {
			$rel = substr( $path, 8 );
			if ( ! str_contains( $rel, '..' ) && file_exists( sh_uploads_dir() . '/' . rawurldecode( $rel ) ) ) {
				wp_redirect( sh_uploads_url() . '/' . $rel, 301 ); // phpcs:ignore
				exit;
			}
			return;
		}

		$route = null;
		if ( isset( self::STATIC_ROUTES[ $path ] ) ) {
			$route = [ 'name' => self::STATIC_ROUTES[ $path ], 'args' => [] ];
		} elseif ( 'admin' === $path || str_starts_with( $path, 'admin/' ) ) {
			$route = [ 'name' => 'admin', 'args' => [ 'sub' => trim( substr( $path, 5 ), '/' ) ] ];
		} elseif ( preg_match( '#^product/([^/]+)$#', $path, $m ) ) {
			$prod  = SH_Catalog::by_slug( $m[1] );
			$route = $prod ? [ 'name' => 'product', 'args' => [ 'slug' => $m[1] ] ] : [ 'name' => '404', 'args' => [] ];
			if ( $prod ) {
				self::$data['product'] = $prod;
			}
		} elseif ( preg_match( '#^[^/]+$#', $path ) ) {
			$slug = rawurldecode( $path );
			if ( ! in_array( strtolower( $slug ), SH_Store::RESERVED_SLUGS, true ) ) {
				$page = SH_Store::published_page( $slug );
				if ( $page ) {
					self::$data['page'] = $page;
					$route              = [ 'name' => 'page', 'args' => [ 'slug' => $slug ] ];
				}
			}
		}
		if ( ! $route ) {
			// Unknown URL. If WordPress itself has nothing for it, render the storefront 404.
			add_action( 'wp', static function () {
				global $wp_query;
				if ( $wp_query->is_404() && ! self::$route ) {
					self::$route = [ 'name' => '404', 'args' => [] ];
				}
			} );
			return;
		}
		self::$route = $route;
		// Hide the real query from WordPress so it does not run / 404 on its own.
		$wp->query_vars = [];
		$wp->matched_rule = '';
	}

	public static function pre_handle_404( $preempt, $wp_query ) {
		if ( self::$route ) {
			status_header( '404' === self::$route['name'] ? 404 : 200 );
			if ( '404' === self::$route['name'] ) {
				$wp_query->set_404();
			} else {
				$wp_query->is_404   = false;
				$wp_query->is_home  = false;
			}
			nocache_headers_if_needed();
			return true;
		}
		return $preempt;
	}

	public static function posts_pre_query( $posts, $q ) {
		if ( self::$route && $q->is_main_query() ) {
			return [];
		}
		return $posts;
	}

	public static function no_canonical( $redirect ) {
		return self::$route ? false : $redirect;
	}

	public static function template_include( $template ) {
		if ( ! self::$route ) {
			return $template;
		}
		$name = self::$route['name'];
		$file = locate_template( 'templates/route-' . $name . '.php' );
		if ( 'admin' === $name ) {
			SH_Admin::render( self::$route['args']['sub'] ?? '' );
			exit;
		}
		return $file ?: $template;
	}
}

/** Checkout/cart/track pages are per-visitor; keep them out of shared caches. */
function nocache_headers_if_needed(): void {
	$n = SH_Router::name();
	if ( in_array( $n, [ 'cart', 'checkout', 'thank-you', 'track-order', 'account', 'admin' ], true ) ) {
		nocache_headers();
	}
}
