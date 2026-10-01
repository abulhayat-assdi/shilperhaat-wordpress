<?php
/** /sitemap.xml (port of app/sitemap.ts). */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
global $wpdb;
header( 'Content-Type: application/xml; charset=utf-8' );
$u    = static function ( $path, $mod, $freq, $prio, $imgs = array() ) {
	$out = '<url><loc>' . esc_url( home_url( $path ) ) . '</loc>';
	if ( $mod ) {
		$out .= '<lastmod>' . esc_html( gmdate( 'c', is_numeric( $mod ) ? $mod : strtotime( $mod . ' UTC' ) ) ) . '</lastmod>';
	}
	$out .= '<changefreq>' . $freq . '</changefreq><priority>' . $prio . '</priority>';
	foreach ( $imgs as $i ) {
		if ( $i ) {
			$out .= '<image:image><image:loc>' . esc_url( $i ) . '</image:loc></image:image>';
		}
	}
	return $out . '</url>';
};
$now    = time();
$static = array(
	array( '', 'daily', '1.0' ), array( 'shop', 'daily', '0.9' ), array( 'blog', 'weekly', '0.7' ), array( 'about', 'monthly', '0.5' ),
	array( 'contact', 'monthly', '0.5' ), array( 'faq', 'monthly', '0.5' ), array( 'how-to-order', 'monthly', '0.5' ), array( 'support', 'monthly', '0.4' ),
	array( 'careers', 'monthly', '0.3' ), array( 'press', 'monthly', '0.3' ), array( 'shipping-info', 'yearly', '0.3' ), array( 'delivery-policy', 'yearly', '0.3' ),
	array( 'refund-policy', 'yearly', '0.3' ), array( 'privacy-policy', 'yearly', '0.3' ), array( 'terms-of-use', 'yearly', '0.3' ),
);
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">';
foreach ( $static as $r ) {
	echo $u( $r[0], $now, $r[1], $r[2] ); // phpcs:ignore
}
foreach ( (array) $wpdb->get_results( 'SELECT slug, updated_at FROM ' . sh_table( 'categories' ) ) as $c ) { // phpcs:ignore WordPress.DB
	echo $u( 'shop?category=' . $c->slug, $c->updated_at, 'weekly', '0.8' ); // phpcs:ignore
}
foreach ( sh_products() as $p ) {
	echo $u( 'product/' . $p->slug, $p->updated_at, 'weekly', '0.7', array( $p->images ? sh_image_url( $p->images[0]->image_url ) : '' ) ); // phpcs:ignore
}
foreach ( sh_blog_posts() as $b ) {
	echo $u( 'blog/' . $b->slug, $b->updated_at, 'monthly', '0.6', array( $b->cover_image ? sh_media_url( $b->cover_image ) : '' ) ); // phpcs:ignore
}
$taken = wp_list_pluck( $static, 0 );
foreach ( (array) $wpdb->get_results( 'SELECT slug, updated_at FROM ' . sh_table( 'pages' ) . ' WHERE is_published = 1' ) as $pg ) { // phpcs:ignore WordPress.DB
	if ( ! in_array( $pg->slug, $taken, true ) && ! in_array( $pg->slug, array( 'track-order', 'account', 'blog' ), true ) ) {
		echo $u( $pg->slug, $pg->updated_at, 'monthly', '0.4' ); // phpcs:ignore
	}
}
echo '</urlset>';
