<?php
/**
 * Shilperhaat theme bootstrap.
 *
 * The storefront is rendered by templates/route-*.php (resolved by the Shilperhaat CMS plugin's router).
 * No WooCommerce front-end assets or templates are used.
 */
defined( 'ABSPATH' ) || exit;

define( 'SH_THEME_VERSION', '1.0.0' );

add_action( 'after_setup_theme', static function () {
	add_theme_support( 'title-tag' );
	add_theme_support( 'html5', [ 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ] );
} );

add_action( 'wp_enqueue_scripts', static function () {
	$dir = get_template_directory();
	$uri = get_template_directory_uri();
	$ver = static fn( $f ) => file_exists( "$dir/$f" ) ? (string) filemtime( "$dir/$f" ) : SH_THEME_VERSION;

	wp_enqueue_style( 'sh-app', "$uri/assets/css/app.css", [], $ver( 'assets/css/app.css' ) );
	wp_enqueue_script( 'sh-icons', "$uri/assets/js/icons.js", [], $ver( 'assets/js/icons.js' ), [ 'in_footer' => true, 'strategy' => 'defer' ] );
	wp_enqueue_script( 'sh-core', "$uri/assets/js/core.js", [ 'sh-icons' ], $ver( 'assets/js/core.js' ), [ 'in_footer' => true, 'strategy' => 'defer' ] );

	$route = function_exists( 'sh_layout' ) ? SH_Router::name() : '';
	$pages = [
		'home'        => [ 'home' ],
		'shop'        => [ 'shop' ],
		'product'     => [ 'product' ],
		'cart'        => [ 'cart-page' ],
		'checkout'    => [ 'districts', 'checkout' ],
		'thank-you'   => [ 'thank-you' ],
		'track-order' => [ 'track-order' ],
	];
	foreach ( $pages[ $route ] ?? [] as $h ) {
		wp_enqueue_script( "sh-$h", "$uri/assets/js/$h.js", [ 'sh-core' ], $ver( "assets/js/$h.js" ), [ 'in_footer' => true, 'strategy' => 'defer' ] );
	}

	// Runtime configuration shared with the JS (no secrets).
	$layout  = sh_layout();
	$config  = [
		'restUrl'   => esc_url_raw( rest_url( 'shilperhaat/v1/' ) ),
		'home'      => home_url( '/' ),
		'route'     => $route,
		'settings'  => sh_public_settings(),
		'layout'    => [
			'whatsappNumber' => $layout['whatsappNumber'],
			'phone'          => $layout['phone'],
			'siteName'       => $layout['siteName'],
			'tagline'        => $layout['tagline'],
			'logoUrl'        => $layout['logoUrl'] ? sh_asset_url( $layout['logoUrl'] ) : '',
			'logoLetter'     => $layout['logoLetter'],
		],
		'contact'   => sh_contact_widget(),
		'placeholder' => sh_placeholder_url(),
		'uploadsBase' => sh_uploads_url(),
		'pixel'     => (bool) SH_Meta::pixel_id(),
	];
	wp_add_inline_script( 'sh-core', 'window.SH=' . wp_json_encode( $config, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . ';', 'before' );
}, 10 );

/* Keep WooCommerce / core block front-end assets out of the storefront. */
add_filter( 'woocommerce_enqueue_styles', '__return_empty_array' );
add_action( 'wp_enqueue_scripts', static function () {
	foreach ( [ 'wp-block-library', 'wp-block-library-theme', 'classic-theme-styles', 'global-styles', 'wc-blocks-style', 'wc-blocks-vendors-style', 'woocommerce-general', 'woocommerce-layout', 'woocommerce-smallscreen' ] as $h ) {
		wp_dequeue_style( $h );
		wp_deregister_style( $h );
	}
	foreach ( [ 'wc-cart-fragments', 'woocommerce', 'wc-add-to-cart', 'sourcebuster-js', 'wc-order-attribution', 'jquery-blockui', 'js-cookie', 'wc-jquery-blockui', 'wc-js-cookie' ] as $h ) {
		wp_dequeue_script( $h );
	}
}, 100 );
remove_action( 'wp_enqueue_scripts', 'wp_enqueue_global_styles' );
remove_action( 'wp_body_open', 'wp_global_styles_render_svg_filters' );
remove_action( 'wp_footer', 'wp_enqueue_global_styles', 1 );

require_once get_template_directory() . '/inc/render.php';
