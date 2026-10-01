<?php
/** /robots.txt (port of app/robots.ts). */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
header( 'Content-Type: text/plain; charset=utf-8' );
$base = untrailingslashit( home_url( '/' ) );
echo "User-Agent: *\n";
echo "Allow: /\n";
foreach ( array( '/wp-admin/', '/wp-json/', '/account', '/cart', '/checkout', '/thank-you', '/track-order', '/*?*add-to-cart=' ) as $d ) {
	echo 'Disallow: ' . $d . "\n"; // phpcs:ignore
}
echo "Allow: /wp-admin/admin-ajax.php\n";
echo "\nHost: " . $base . "\n"; // phpcs:ignore
echo 'Sitemap: ' . $base . "/sitemap.xml\n"; // phpcs:ignore
