<?php
/** /manifest.webmanifest (port of app/manifest.ts). */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
header( 'Content-Type: application/manifest+json; charset=utf-8' );
$s    = sh_site_settings();
$name = ! empty( $s['siteName'] ) ? $s['siteName'] : 'Shilperhaat';
$img  = SH_THEME_URI . '/assets/img/';
$icons = ! empty( $s['faviconUrl'] )
	? array( array( 'src' => sh_media_url( $s['faviconUrl'] ), 'sizes' => 'any' ) )
	: array(
		array( 'src' => $img . 'icon-192.png', 'sizes' => '192x192', 'type' => 'image/png' ),
		array( 'src' => $img . 'icon-512.png', 'sizes' => '512x512', 'type' => 'image/png' ),
		array( 'src' => $img . 'icon-512.png', 'sizes' => '512x512', 'type' => 'image/png', 'purpose' => 'maskable' ),
	);
echo wp_json_encode( array(
	'name'             => $name . " — Bangladesh's Finest Handcraft Textiles",
	'short_name'       => $name,
	'description'      => "Shop Bangladesh's best handcraft textiles — Katha, Chadar, Blankets, Nakshi Katha and more.",
	'start_url'        => '/',
	'display'          => 'standalone',
	'background_color' => '#ffffff',
	'theme_color'      => '#800000',
	'icons'            => $icons,
), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
