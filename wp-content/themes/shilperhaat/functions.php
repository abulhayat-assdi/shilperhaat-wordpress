<?php
/**
 * Shilperhaat theme bootstrap.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'SH_THEME_VERSION', '0.1.0' );
define( 'SH_THEME_DIR', get_template_directory() );
define( 'SH_THEME_URI', get_template_directory_uri() );

require_once SH_THEME_DIR . '/inc/icons.php';
require_once SH_THEME_DIR . '/inc/router.php';
require_once SH_THEME_DIR . '/inc/components.php';

add_action( 'after_setup_theme', function () {
	add_theme_support( 'title-tag' );
	add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
	add_theme_support( 'post-thumbnails' );
} );

add_action( 'wp_enqueue_scripts', function () {
	$ver = SH_THEME_VERSION;
	wp_enqueue_style( 'sh-fonts', SH_THEME_URI . '/assets/css/fonts.css', array(), $ver );
	wp_enqueue_style( 'sh-tailwind', SH_THEME_URI . '/assets/css/tailwind.css', array( 'sh-fonts' ), $ver );
	wp_enqueue_style( 'sh-theme', SH_THEME_URI . '/assets/css/theme.css', array( 'sh-tailwind' ), $ver );
	wp_enqueue_script( 'sh-theme', SH_THEME_URI . '/assets/js/theme.js', array(), $ver, array( 'in_footer' => true, 'strategy' => 'defer' ) );
	wp_localize_script( 'sh-theme', 'SH', array(
		'home'  => home_url( '/' ),
		'shop'  => home_url( '/shop' ),
		'ajax'  => admin_url( 'admin-ajax.php' ),
		'placeholder' => SH_THEME_URI . '/assets/img/placeholder-product.svg',
		'iconPaths' => sh_icon_paths(),
		'delivery' => function_exists( 'sh_delivery_config' ) ? sh_delivery_config() : array( 'deliveryCharge' => 80, 'freeDeliveryMin' => 2000 ),
		'rest'  => esc_url_raw( rest_url( 'shilperhaat/v1/' ) ),
		'contact' => array(
			'whatsappUrl'    => sh_contact_settings()['whatsappUrl'],
			'phoneNumber'    => sh_contact_settings()['phoneNumber'],
			'layoutWhatsapp' => sh_layout()['whatsappNumber'],
			'layoutPhone'    => sh_layout()['phone'],
		),
		'icons' => array(
			'success' => sh_icon( 'check-circle', 18, '', 2, 'text-green-600' ),
			'error'   => sh_icon( 'x-circle', 18, '', 2, 'text-red-600' ),
			'warning' => sh_icon( 'alert-circle', 18, '', 2, 'text-yellow-600' ),
			'info'    => sh_icon( 'info', 18, '', 2, 'text-blue-600' ),
			'close'   => sh_icon( 'x', 14 ),
		),
	) );
	global $sh_route;
	wp_enqueue_script( 'sh-cart', SH_THEME_URI . '/assets/js/cart.js', array( 'sh-theme' ), $ver, array( 'in_footer' => true, 'strategy' => 'defer' ) );
	$tpl = isset( $sh_route['template'] ) ? $sh_route['template'] : '';
	if ( 'checkout' === $tpl || 'thank-you' === $tpl ) {
		wp_enqueue_script( 'sh-districts', SH_THEME_URI . '/assets/js/districts.js', array(), $ver, array( 'in_footer' => true, 'strategy' => 'defer' ) );
		wp_enqueue_script( 'sh-checkout', SH_THEME_URI . '/assets/js/checkout.js', array( 'sh-cart', 'sh-districts' ), $ver, array( 'in_footer' => true, 'strategy' => 'defer' ) );
	}
	if ( 'track-order' === $tpl ) {
		wp_enqueue_script( 'sh-track', SH_THEME_URI . '/assets/js/track.js', array( 'sh-cart' ), $ver, array( 'in_footer' => true, 'strategy' => 'defer' ) );
	}
	if ( 'product' === $tpl ) {
		wp_enqueue_script( 'sh-product', SH_THEME_URI . '/assets/js/product.js', array( 'sh-theme' ), $ver, array( 'in_footer' => true, 'strategy' => 'defer' ) );
	}
	// The original site has no block-editor / emoji styling; keep the front end identical.
	wp_dequeue_style( 'wp-block-library' );
	wp_dequeue_style( 'wp-block-library-theme' );
	wp_dequeue_style( 'global-styles' );
	wp_dequeue_style( 'classic-theme-styles' );
}, 20 );

remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );
remove_action( 'wp_head', 'wp_generator' );
remove_action( 'wp_head', 'wp_robots', 1 ); // we print our own robots meta
remove_action( 'wp_head', 'rsd_link' );
remove_action( 'wp_head', 'wlwmanifest_link' );
remove_action( 'wp_head', 'wp_shortlink_wp_head' );
remove_action( 'wp_head', 'rest_output_link_wp_head' );
remove_action( 'template_redirect', 'rest_output_link_header', 11 );
remove_action( 'wp_body_open', 'wp_global_styles_render_svg_filters' );
add_filter( 'show_admin_bar', '__return_false' ); // keep the storefront pixel-identical for admins too

add_action( 'admin_notices', function () {
	if ( ! function_exists( 'sh_layout' ) && current_user_can( 'activate_plugins' ) ) {
		echo '<div class="notice notice-error"><p><strong>Shilperhaat থিম:</strong> "Shilperhaat CMS" প্লাগিনটি অ্যাক্টিভ করুন।</p></div>';
	}
} );

/** Resolve a nav/footer link stored as "/shop?x=1" to a full URL. */
function sh_url( $path ) {
	$path = (string) $path;
	if ( preg_match( '#^(https?:|mailto:|tel:)#i', $path ) ) {
		return $path;
	}
	return home_url( '/' . ltrim( $path, '/' ) );
}

/** Favicons: same set as the original (favicon.ico + 192/512 PNG + apple-touch-icon). */
add_action( 'wp_head', function () {
	$custom = function_exists( 'sh_site_settings' ) && ! empty( sh_site_settings()['faviconUrl'] ) ? sh_media_url( sh_site_settings()['faviconUrl'] ) : '';
	if ( $custom ) {
		echo '<link rel="icon" href="' . esc_url( $custom ) . '">' . "\n" . '<link rel="apple-touch-icon" href="' . esc_url( $custom ) . '">' . "\n";
		return;
	}
	$img = SH_THEME_URI . '/assets/img/';
	echo '<link rel="icon" href="' . esc_url( $img . 'favicon.ico' ) . '" sizes="48x48">' . "\n";
	echo '<link rel="icon" href="' . esc_url( $img . 'icon-192.png' ) . '" type="image/png" sizes="192x192">' . "\n";
	echo '<link rel="icon" href="' . esc_url( $img . 'icon-512.png' ) . '" type="image/png" sizes="512x512">' . "\n";
	echo '<link rel="apple-touch-icon" href="' . esc_url( $img . 'apple-touch-icon.png' ) . '">' . "\n";
	echo '<link rel="manifest" href="' . esc_url( home_url( '/manifest.webmanifest' ) ) . '">' . "\n";
}, 2 );

/**
 * <title>, meta description, canonical, Open Graph and JSON-LD.
 * Templates set $GLOBALS['sh_head'] = array( title, description, canonical, og_title, og_image, jsonld, noindex ).
 * Titles follow the original Next.js metadata template "%s | {siteName}".
 */
function sh_head_data() {
	$site = function_exists( 'sh_layout' ) ? sh_layout()['siteName'] : 'Shilperhaat';
	$h    = isset( $GLOBALS['sh_head'] ) ? $GLOBALS['sh_head'] : array();
	return array_merge( array(
		'title'       => '',
		'description' => "Shop Bangladesh's best handcraft textiles — Katha, Chadar, Blankets, Nakshi Katha and much more at Shilperhaat.",
		'canonical'   => home_url( '/' ),
		'og_title'    => '',
		'og_image'    => '',
		'jsonld'      => array(),
		'site'        => $site,
	), $h );
}

add_filter( 'pre_get_document_title', function ( $title ) {
	if ( ! function_exists( 'sh_layout' ) ) {
		return $title;
	}
	$h = sh_head_data();
	if ( '' === $h['title'] ) {
		return $h['site'] . " — Bangladesh's Finest Handcraft Textiles";
	}
	return $h['title'] . ' | ' . $h['site'];
}, 5 );

add_action( 'wp_head', function () {
	if ( ! function_exists( 'sh_layout' ) ) {
		return;
	}
	$h = sh_head_data();
	echo '<meta name="description" content="' . esc_attr( $h['description'] ) . '">' . "\n";
	echo '<meta name="keywords" content="katha,nakshi katha,chadar,blanket,handcraft,bangladesh,shilperhaat,textile">' . "\n";
	echo '<link rel="canonical" href="' . esc_url( $h['canonical'] ) . '">' . "\n";
	echo '<meta name="robots" content="index, follow">' . "\n";
	echo '<meta property="og:type" content="website">' . "\n";
	echo '<meta property="og:site_name" content="' . esc_attr( $h['site'] ) . '">' . "\n";
	echo '<meta property="og:locale" content="en_US">' . "\n";
	if ( $h['og_title'] ) {
		echo '<meta property="og:title" content="' . esc_attr( $h['og_title'] ) . '">' . "\n";
		echo '<meta property="og:description" content="' . esc_attr( $h['description'] ) . '">' . "\n";
		echo '<meta property="og:url" content="' . esc_url( $h['canonical'] ) . '">' . "\n";
	}
	$og_image = $h['og_image'] ? $h['og_image'] : sh_media_url( sh_layout()['logoUrl'] );
	if ( $og_image ) {
		echo '<meta property="og:image" content="' . esc_url( $og_image ) . '">' . "\n";
	}

	$layout = sh_layout();
	$same   = array_values( array_filter( array( $layout['facebookUrl'], $layout['twitterUrl'], $layout['instagramUrl'] ) ) );
	$org    = array( '@context' => 'https://schema.org', '@type' => 'Organization', 'name' => $layout['siteName'], 'url' => home_url( '/' ) );
	if ( $layout['logoUrl'] ) {
		$org['logo'] = sh_media_url( $layout['logoUrl'] );
	}
	if ( $same ) {
		$org['sameAs'] = $same;
	}
	$site = array( '@context' => 'https://schema.org', '@type' => 'WebSite', 'name' => $layout['siteName'], 'url' => home_url( '/' ),
		'potentialAction' => array( '@type' => 'SearchAction', 'target' => array( '@type' => 'EntryPoint', 'urlTemplate' => home_url( '/shop?search={search_term_string}' ) ), 'query-input' => 'required name=search_term_string' ) );
	foreach ( array_merge( array( $org, $site ), $h['jsonld'] ) as $block ) {
		echo '<script type="application/ld+json">' . wp_json_encode( $block, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . '</script>' . "\n";
	}
}, 3 );
