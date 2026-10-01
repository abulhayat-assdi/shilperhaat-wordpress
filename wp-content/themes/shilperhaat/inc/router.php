<?php
/**
 * Clean-URL router that mirrors the original Next.js routes (/shop, /product/{slug}, /cart ...).
 * No rewrite rules: matched on template_redirect before WordPress' own 404 handling.
 * Each route maps to templates/{name}.php; routes whose template is not built yet
 * fall back to templates/pending.php.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** @return array{template:string,params:array}|null */
function sh_match_route( $path ) {
	$path = trim( $path, '/' );

	if ( '' === $path ) {
		return array( 'template' => 'home', 'params' => array() );
	}

	$static = array(
		'robots.txt'           => 'seo-robots',
		'sitemap.xml'          => 'seo-sitemap',
		'manifest.webmanifest' => 'seo-manifest',
		'shop'        => 'shop',
		'cart'        => 'cart',
		'checkout'    => 'checkout',
		'thank-you'   => 'thank-you',
		'track-order' => 'track-order',
		'account'     => 'account',
		'blog'        => 'blog',
	);
	if ( isset( $static[ $path ] ) ) {
		return array( 'template' => $static[ $path ], 'params' => array() );
	}

	if ( preg_match( '#^product/([^/]+)$#', $path, $m ) ) {
		return array( 'template' => 'product', 'params' => array( 'slug' => $m[1] ) );
	}
	if ( preg_match( '#^blog/([^/]+)$#', $path, $m ) ) {
		return array( 'template' => 'blog-post', 'params' => array( 'slug' => $m[1] ) );
	}

	// Single-segment CMS pages (about, faq, privacy-policy ...): resolved against the pages table later.
	if ( preg_match( '#^([a-z0-9-]+)$#', $path, $m ) && function_exists( 'sh_page_exists' ) && sh_page_exists( $m[1] ) ) {
		return array( 'template' => 'page', 'params' => array( 'slug' => $m[1] ) );
	}
	return null;
}

add_action( 'template_redirect', function () {
	if ( is_admin() || wp_doing_ajax() || wp_doing_cron() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
		return;
	}
	$uri  = isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '/'; // phpcs:ignore
	$path = rawurldecode( (string) wp_parse_url( $uri, PHP_URL_PATH ) );
	$home = rtrim( (string) wp_parse_url( home_url( '/' ), PHP_URL_PATH ), '/' );
	if ( $home && 0 === strpos( $path, $home ) ) {
		$path = substr( $path, strlen( $home ) );
	}
	$route = sh_match_route( $path );
	if ( ! $route ) {
		return;
	}
	global $sh_route;
	$sh_route = $route;
	status_header( 200 );
	nocache_headers();
	$file = SH_THEME_DIR . '/templates/' . $route['template'] . '.php';
	if ( ! file_exists( $file ) ) {
		$file = SH_THEME_DIR . '/templates/pending.php';
	}
	include $file;
	exit;
}, 1 );

/** Current route param (e.g. the slug). */
function sh_route_param( $key, $default = '' ) {
	global $sh_route;
	return isset( $sh_route['params'][ $key ] ) ? $sh_route['params'][ $key ] : $default;
}

/** Nav "active" test equivalent to usePathname().startsWith(). */
function sh_is_active( $href ) {
	$uri  = isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '/'; // phpcs:ignore
	$path = '/' . trim( (string) wp_parse_url( $uri, PHP_URL_PATH ), '/' );
	if ( '/' === $href ) {
		return '/' === $path;
	}
	return 0 === strpos( $path, $href );
}
