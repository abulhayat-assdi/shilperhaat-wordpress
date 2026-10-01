<?php
/**
 * Shared helpers used by the plugin, the theme and the admin panel.
 */
defined( 'ABSPATH' ) || exit;

/* ───────────────────────── Uploads / images ───────────────────────── */

/** Filesystem directory that holds the imported/uploaded media (same tree as the old /uploads). */
function sh_uploads_dir(): string {
	$u = wp_get_upload_dir();
	return trailingslashit( $u['basedir'] ) . 'shilperhaat';
}

function sh_uploads_url(): string {
	$u = wp_get_upload_dir();
	return trailingslashit( $u['baseurl'] ) . 'shilperhaat';
}

/**
 * Maps a stored path (e.g. "/uploads/products/x.webp") to a public URL.
 * Absolute URLs pass through; "/placeholder-product.svg" resolves to the theme asset.
 */
function sh_asset_url( $path ): string {
	$path = is_string( $path ) ? trim( $path ) : '';
	if ( '' === $path ) {
		return sh_placeholder_url();
	}
	if ( preg_match( '#^(https?:)?//#i', $path ) || str_starts_with( $path, 'data:' ) ) {
		return $path;
	}
	if ( str_starts_with( $path, '/uploads/' ) ) {
		return sh_uploads_url() . '/' . rawurlencode_path( substr( $path, 9 ) );
	}
	if ( str_starts_with( $path, '/placeholder-product.svg' ) ) {
		return sh_placeholder_url();
	}
	return home_url( $path );
}

function rawurlencode_path( string $p ): string {
	return implode( '/', array_map( 'rawurlencode', explode( '/', $p ) ) );
}

function sh_placeholder_url(): string {
	return get_template_directory_uri() . '/assets/img/placeholder-product.svg';
}

/** Absolute URL for SEO/meta usage. */
function sh_absolute_url( $pathOrUrl ): string {
	$pathOrUrl = (string) $pathOrUrl;
	if ( '' === $pathOrUrl ) {
		return '';
	}
	if ( preg_match( '#^https?://#i', $pathOrUrl ) ) {
		return $pathOrUrl;
	}
	if ( str_starts_with( $pathOrUrl, '/uploads/' ) ) {
		return sh_asset_url( $pathOrUrl );
	}
	return home_url( '/' . ltrim( $pathOrUrl, '/' ) );
}

/* ───────────────────────── Formatting ───────────────────────── */

function sh_format_price( $price ): string {
	return '৳' . number_format( round( (float) $price ), 0, '.', ',' );
}

function sh_calc_discount( $price, $compare ): int {
	$price   = (float) $price;
	$compare = (float) $compare;
	if ( ! $compare || $compare <= $price ) {
		return 0;
	}
	return (int) round( ( ( $compare - $price ) / $compare ) * 100 );
}

function sh_format_date_en( $date ): string {
	$ts = is_numeric( $date ) ? (int) $date : strtotime( (string) $date );
	return gmdate( 'M j, Y', $ts ?: time() );
}

/* ───────────────────────── Contact helpers (ported from lib/contact-settings.ts) ───────────────────────── */

function sh_format_whatsapp_url( $raw = '', $message = '' ): string {
	$msg = $message ? '?text=' . rawurlencode( $message ) : '';
	$raw = trim( (string) $raw );
	if ( '' === $raw ) {
		return 'https://wa.me/' . $msg;
	}
	if ( false !== stripos( $raw, 'x' ) ) {
		return 'https://wa.me/8801700000000' . $msg;
	}
	$digits = preg_replace( '/[^0-9]/', '', $raw );
	if ( preg_match( '#^https?://#', $raw ) ) {
		if ( strlen( $digits ) >= 8 ) {
			return 'https://wa.me/' . sh_wa_number( $digits ) . $msg;
		}
		$sep = str_contains( $raw, '?' ) ? '&' : '?';
		return $message ? $raw . $sep . 'text=' . rawurlencode( $message ) : $raw;
	}
	if ( '' === $digits ) {
		return 'https://wa.me/' . $msg;
	}
	return 'https://wa.me/' . sh_wa_number( $digits ) . $msg;
}

function sh_wa_number( string $digits ): string {
	if ( str_starts_with( $digits, '01' ) && 11 === strlen( $digits ) ) {
		return '88' . $digits;
	}
	if ( str_starts_with( $digits, '1' ) && 10 === strlen( $digits ) ) {
		return '880' . $digits;
	}
	return $digits;
}

function sh_format_phone_url( $raw = '' ): string {
	$raw = trim( (string) $raw );
	if ( '' === $raw ) {
		return 'tel:';
	}
	if ( false !== stripos( $raw, 'x' ) ) {
		return 'tel:01700000000';
	}
	return 'tel:' . preg_replace( '/[\s\-\(\)]/', '', $raw );
}

/* ───────────────────────── Icons ───────────────────────── */

/** Inline lucide icon. $extra supports fill / stroke / stroke-width overrides. */
function sh_icon( string $name, int $size = 24, string $style = '', string $class = '', array $extra = [] ): string {
	static $icons = null;
	if ( null === $icons ) {
		$icons = require SH_CMS_DIR . 'includes/icons.php';
	}
	if ( ! isset( $icons[ $name ] ) ) {
		return '';
	}
	$fill   = $extra['fill'] ?? 'none';
	$stroke = $extra['stroke'] ?? 'currentColor';
	$sw     = $extra['stroke-width'] ?? '2';
	$cls    = 'lucide lucide-' . $name . ( $class ? ' ' . $class : '' );
	$st     = $style ? ' style="' . esc_attr( $style ) . '"' : '';
	return '<svg xmlns="http://www.w3.org/2000/svg" width="' . $size . '" height="' . $size . '" viewBox="0 0 24 24" fill="' . esc_attr( $fill ) . '" stroke="' . esc_attr( $stroke ) . '" stroke-width="' . esc_attr( $sw ) . '" stroke-linecap="round" stroke-linejoin="round" class="' . esc_attr( $cls ) . '" aria-hidden="true"' . $st . '>' . $icons[ $name ] . '</svg>';
}

/* ───────────────────────── Site content / settings ───────────────────────── */

function sh_table( string $name ): string {
	global $wpdb;
	return $wpdb->prefix . 'sh_' . $name;
}

function sh_get_content( string $key, $default = null ) {
	global $wpdb;
	$t   = sh_table( 'site_content' );
	$val = $wpdb->get_var( $wpdb->prepare( "SELECT value FROM $t WHERE content_key = %s", $key ) ); // phpcs:ignore
	if ( null === $val ) {
		return $default;
	}
	$decoded = json_decode( $val, true );
	return null === $decoded ? $default : $decoded;
}

function sh_set_content( string $key, $value ): void {
	global $wpdb;
	$t = sh_table( 'site_content' );
	$wpdb->query( $wpdb->prepare( "REPLACE INTO $t (content_key, value, updated_at) VALUES (%s, %s, %s)", $key, wp_json_encode( $value, JSON_UNESCAPED_UNICODE ), current_time( 'mysql', true ) ) ); // phpcs:ignore
	delete_transient( 'sh_layout_cache' );
}

function sh_delete_content( string $key ): void {
	global $wpdb;
	$t = sh_table( 'site_content' );
	$wpdb->delete( $t, [ 'content_key' => $key ] );
	delete_transient( 'sh_layout_cache' );
}

function sh_default_layout(): array {
	return [
		'siteName'          => 'Shilperhaat',
		'tagline'           => 'Handcraft Marketplace',
		'logoLetter'        => 'S',
		'logoUrl'           => '',
		'logoWidth'         => 140,
		'logoHeight'        => 50,
		'phone'             => '01700000000',
		'whatsappNumber'    => '01700000000',
		'email'             => 'info@shilperhaat.com',
		'address'           => 'Dhaka, Bangladesh',
		'facebookUrl'       => 'https://facebook.com/shilperhaat',
		'twitterUrl'        => 'https://twitter.com/shilperhaat',
		'instagramUrl'      => 'https://instagram.com/shilperhaat',
		'navItems'          => [],
		'footerDescription' => "Bringing Bangladesh's traditional handcraft textiles to your doorstep. Premium-quality Katha, Chadar & Blankets.",
		'footerCopyright'   => '© 2025 Shilperhaat. All rights reserved.',
		'footerLinks'       => [
			'information' => [
				[ 'href' => '/about', 'label' => 'About Us' ],
				[ 'href' => '/contact', 'label' => 'Contact Us' ],
				[ 'href' => '/about', 'label' => 'Company Information' ],
				[ 'href' => '/terms-of-use', 'label' => 'Terms & Conditions' ],
				[ 'href' => '/privacy-policy', 'label' => 'Privacy Policy' ],
				[ 'href' => '/careers', 'label' => 'Careers' ],
			],
			'shop'        => [],
			'support'     => [
				[ 'href' => '/support', 'label' => 'Support Center' ],
				[ 'href' => '/how-to-order', 'label' => 'How to Order' ],
				[ 'href' => '/track-order', 'label' => 'Order Tracking' ],
				[ 'href' => '/delivery-policy', 'label' => 'Payment' ],
				[ 'href' => '/shipping-info', 'label' => 'Shipping' ],
				[ 'href' => '/faq', 'label' => 'FAQ' ],
			],
			'policy'      => [
				[ 'href' => '/privacy-policy', 'label' => 'Privacy Policy' ],
				[ 'href' => '/terms-of-use', 'label' => 'Terms of Use' ],
				[ 'href' => '/refund-policy', 'label' => 'Refund Policy' ],
				[ 'href' => '/delivery-policy', 'label' => 'Delivery Policy' ],
			],
		],
	];
}

/** Site layout (header/footer/brand) merged over defaults; legacy "/blog" links are dropped. */
function sh_layout(): array {
	static $cache = null;
	if ( null !== $cache ) {
		return $cache;
	}
	$stored = sh_get_content( 'site-layout', [] );
	$data   = array_merge( sh_default_layout(), is_array( $stored ) ? $stored : [] );
	foreach ( [ 'information', 'shop', 'support', 'policy' ] as $grp ) {
		$links = $data['footerLinks'][ $grp ] ?? [];
		$data['footerLinks'][ $grp ] = array_values( array_filter( $links, static fn( $l ) => ! preg_match( '#^/blog(\?|$|/)#', $l['href'] ?? '' ) ) );
	}
	$cache = $data;
	return $data;
}

function sh_default_contact_widget(): array {
	return [
		'whatsappUrl'    => 'https://wa.me/8801700000000',
		'phoneNumber'    => '01700000000',
		'messengerUrl'   => 'https://m.me/shilperhaat',
		'emailAddress'   => 'info@shilperhaat.com',
		'widgetEnabled'  => true,
		'welcomeMessage' => 'আমাদের সাথে যোগাযোগ করুন',
		'buttonPosition' => 'bottom-right',
	];
}

function sh_contact_widget(): array {
	$stored = sh_get_content( 'contact-widget', [] );
	return array_merge( sh_default_contact_widget(), is_array( $stored ) ? $stored : [] );
}

function sh_default_settings(): array {
	return [
		'siteName'        => 'Shilperhaat',
		'logoUrl'         => '',
		'faviconUrl'      => '',
		'footerCopyright' => '',
		'whatsappNumber'  => '',
		'socialLinks'     => null,
		'deliveryCharge'  => 0,
		'freeDeliveryMin' => null,
		'metaPixelId'     => '',
		'metaCapiToken'   => '',
		'metaTestEventCode' => '',
		'steadfastApiKey' => '',
		'steadfastSecretKey' => '',
	];
}

function sh_settings(): array {
	$stored = get_option( 'sh_settings', [] );
	return array_merge( sh_default_settings(), is_array( $stored ) ? $stored : [] );
}

function sh_setting( string $key, $default = '' ) {
	$s = sh_settings();
	return $s[ $key ] ?? $default;
}

/** Secrets may come from the environment (Coolify) and win over stored values. */
function sh_secret( string $envName, string $settingKey ): string {
	$env = getenv( $envName );
	if ( false !== $env && '' !== $env ) {
		return (string) $env;
	}
	if ( defined( $envName ) ) {
		return (string) constant( $envName );
	}
	return (string) sh_setting( $settingKey, '' );
}

/** Public delivery configuration consumed by the cart (mirrors /api/settings). */
function sh_public_settings(): array {
	$s    = sh_settings();
	$free = $s['freeDeliveryMin'];
	return [
		'deliveryCharge'  => (float) ( $s['deliveryCharge'] ?? 0 ),
		'freeDeliveryMin' => $free ? (float) $free : 2000,
		'whatsappNumber'  => $s['whatsappNumber'] ?: '01700000000',
	];
}

/* ───────────────────────── Misc ───────────────────────── */

function sh_json_response( $data, int $status = 200 ): WP_REST_Response {
	return new WP_REST_Response( $data, $status );
}

function sh_new_id( string $prefix = 'c' ): string {
	return $prefix . substr( str_replace( [ '+', '/', '=' ], '', base64_encode( random_bytes( 18 ) ) ), 0, 24 );
}

function sh_generate_slug( string $text ): string {
	$t = mb_strtolower( $text, 'UTF-8' );
	$t = preg_replace( '/[^\p{L}\p{N}\s-]/u', '', $t );
	$t = preg_replace( '/[\s_]+/u', '-', $t );
	$t = preg_replace( '/-{2,}/', '-', $t );
	return trim( $t, '-' );
}

function sh_generate_order_number(): string {
	return 'SH' . gmdate( 'ymd' ) . random_int( 1000, 9999 );
}

function sh_client_ip(): string {
	foreach ( [ 'HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'REMOTE_ADDR' ] as $k ) {
		if ( ! empty( $_SERVER[ $k ] ) ) {
			return trim( explode( ',', sanitize_text_field( wp_unslash( $_SERVER[ $k ] ) ) )[0] );
		}
	}
	return '';
}

const SH_ORDER_STATUSES = [ 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED' ];
