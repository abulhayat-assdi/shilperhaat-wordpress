<?php
/**
 * Cart page (rendered by cart.js from the localStorage cart, like the original CartPageClient).
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
$GLOBALS['sh_head'] = array(
	'title'       => 'Cart — Shilperhaat',
	'description' => 'Your shopping cart at Shilperhaat',
	'canonical'   => home_url( '/cart' ),
);
get_header();
?>
<div data-sh-cart-page><div style="min-height:50vh"></div></div>
<?php
get_footer();
