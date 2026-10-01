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
	) );
	// The original site has no block-editor / emoji styling; keep the front end identical.
	wp_dequeue_style( 'wp-block-library' );
	wp_dequeue_style( 'wp-block-library-theme' );
	wp_dequeue_style( 'global-styles' );
	wp_dequeue_style( 'classic-theme-styles' );
}, 20 );

remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );
remove_action( 'wp_head', 'wp_generator' );
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
	$img = SH_THEME_URI . '/assets/img/';
	echo '<link rel="icon" href="' . esc_url( $img . 'favicon.ico' ) . '" sizes="48x48">' . "\n";
	echo '<link rel="icon" href="' . esc_url( $img . 'icon-192.png' ) . '" type="image/png" sizes="192x192">' . "\n";
	echo '<link rel="icon" href="' . esc_url( $img . 'icon-512.png' ) . '" type="image/png" sizes="512x512">' . "\n";
	echo '<link rel="apple-touch-icon" href="' . esc_url( $img . 'apple-touch-icon.png' ) . '">' . "\n";
}, 2 );
