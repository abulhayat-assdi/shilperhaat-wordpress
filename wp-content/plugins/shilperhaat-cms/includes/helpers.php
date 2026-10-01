<?php
/**
 * Small shared helpers used by the theme and the admin panel.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Maps an original upload path ("/uploads/products/x.webp") to the WordPress uploads folder
 * (wp-content/uploads/shilperhaat/products/x.webp). Absolute URLs are returned untouched.
 */
function sh_media_url( $path ) {
	$path = (string) $path;
	if ( '' === $path ) {
		return '';
	}
	if ( preg_match( '#^(https?:)?//#i', $path ) ) {
		return $path;
	}
	if ( 0 === strpos( $path, '/uploads/' ) ) {
		$uploads = wp_get_upload_dir();
		return trailingslashit( $uploads['baseurl'] ) . 'shilperhaat/' . substr( $path, strlen( '/uploads/' ) );
	}
	return $path;
}

/** Categories ordered like the original API (sortOrder asc). */
function sh_categories() {
	global $wpdb;
	$cached = wp_cache_get( 'sh_categories', 'shilperhaat' );
	if ( false !== $cached ) {
		return $cached;
	}
	$rows = $wpdb->get_results( 'SELECT id, name, slug, image_url, is_featured, sort_order FROM ' . sh_table( 'categories' ) . ' ORDER BY sort_order ASC, name ASC' ); // phpcs:ignore WordPress.DB.PreparedSQL
	$rows = is_array( $rows ) ? $rows : array();
	wp_cache_set( 'sh_categories', $rows, 'shilperhaat', 300 );
	return $rows;
}

/** Port of formatWhatsAppUrl() from the original contact-settings.ts */
function sh_whatsapp_url( $raw = '', $message = '' ) {
	$msg = $message ? '?text=' . rawurlencode( $message ) : '';
	$raw = trim( (string) $raw );
	if ( '' === $raw ) {
		return 'https://wa.me/' . $msg;
	}
	if ( false !== stripos( $raw, 'x' ) ) {
		return 'https://wa.me/8801700000000' . $msg;
	}
	$normalize = static function ( $digits ) {
		if ( 0 === strpos( $digits, '01' ) && 11 === strlen( $digits ) ) {
			return '88' . $digits;
		}
		if ( 0 === strpos( $digits, '1' ) && 10 === strlen( $digits ) ) {
			return '880' . $digits;
		}
		return $digits;
	};
	$digits = preg_replace( '/[^0-9]/', '', $raw );
	if ( preg_match( '#^https?://#i', $raw ) ) {
		if ( strlen( $digits ) >= 8 ) {
			return 'https://wa.me/' . $normalize( $digits ) . $msg;
		}
		$sep = false !== strpos( $raw, '?' ) ? '&' : '?';
		return $message ? $raw . $sep . 'text=' . rawurlencode( $message ) : $raw;
	}
	if ( '' === $digits ) {
		return 'https://wa.me/' . $msg;
	}
	return 'https://wa.me/' . $normalize( $digits ) . $msg;
}

/** Port of formatPhoneUrl() */
function sh_phone_url( $raw = '' ) {
	$raw = trim( (string) $raw );
	if ( '' === $raw ) {
		return 'tel:';
	}
	if ( false !== stripos( $raw, 'x' ) ) {
		return 'tel:01700000000';
	}
	return 'tel:' . preg_replace( '/[\s\-\(\)]/', '', $raw );
}
