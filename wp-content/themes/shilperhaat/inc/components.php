<?php
/**
 * Small reusable template helpers (ports of the shared React components).
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Section header: title + underline + "View All →" link (CategorySection / TopSellingSection style). */
function sh_section_header( $title, $href, $link_label = 'View All', $color = '#222831', $subtitle = '' ) {
	?>
	<div class="flex items-end justify-between" style="margin-bottom:24px">
		<div class="relative" style="padding-bottom:10px">
			<h2 style="font-size:22px;font-weight:600;color:<?php echo esc_attr( $color ); ?>;font-family:'Open Sans',sans-serif"><?php echo esc_html( $title ); ?></h2>
			<span class="absolute bottom-0 left-0" style="width:48px;height:3px;background-color:#800000;border-radius:2px"></span>
		</div>
		<a href="<?php echo esc_url( sh_url( $href ) ); ?>" class="flex items-center gap-1 transition-all duration-200 hover:gap-2" style="color:#800000;font-size:13px;font-weight:600;text-decoration:none;font-family:'Open Sans',sans-serif"><?php echo esc_html( $link_label ); ?> <?php echo sh_icon( 'arrow-right', 14 ); // phpcs:ignore ?></a>
	</div>
	<?php
}

/** Data attribute payload read by theme.js "add to cart" (same shape as the original CartItem minus quantity). */
function sh_cart_payload( $product ) {
	$img = ! empty( $product->images ) ? $product->images[0]->image_url : '';
	return array(
		'id'             => $product->id,
		'productId'      => $product->id,
		'title'          => $product->title,
		'price'          => (float) $product->price,
		'compareAtPrice' => $product->compare_at_price ? (float) $product->compare_at_price : null,
		'image'          => sh_image_url( $img ),
		'stock'          => (int) $product->stock,
		'slug'           => $product->slug,
	);
}
