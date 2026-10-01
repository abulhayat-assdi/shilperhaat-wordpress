<?php
/**
 * Product card. Mirrors components/ui/ProductCard.tsx.
 * Expects $args['product'].
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
$product  = $args['product'];
$primary  = ! empty( $product->images ) ? $product->images[0] : null;
$img      = sh_image_url( $primary ? $primary->image_url : '' );
$discount = $product->compare_at_price ? sh_calc_discount( $product->price, $product->compare_at_price ) : 0;
$oos      = 0 === (int) $product->stock;
$badge    = 'color:#FFFFFF;font-size:10px;font-weight:700;padding:3px 7px;border-radius:4px;display:inline-block;background-color:';
?>
<div class="group product-card sh-card" style="background-color:#FFFFFF;border-radius:8px;border:1px solid #eeeeee;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.05);transition:box-shadow 0.25s ease, transform 0.2s ease">
	<a href="<?php echo esc_url( home_url( '/product/' . rawurlencode( $product->slug ) ) ); ?>" style="text-decoration:none;display:block">
		<div style="position:relative;width:100%;padding-bottom:75%;background-color:#F8F8F8;overflow:hidden">
			<div class="absolute z-20 pointer-events-none flex flex-col" style="top:8px;left:8px;gap:4px">
				<?php if ( $discount > 0 ) : ?><span style="<?php echo $badge; ?>#FF3F33">Save <?php echo (int) $discount; ?>%</span><?php endif; ?>
				<?php if ( $product->is_best_selling ) : ?><span style="<?php echo $badge; ?>#F48721">Best Seller</span><?php endif; ?>
				<?php if ( $oos ) : ?><span style="<?php echo $badge; ?>#888888">Out of Stock</span><?php endif; ?>
			</div>
			<img src="<?php echo esc_url( $img ); ?>" alt="<?php echo esc_attr( $primary && $primary->alt_text ? $primary->alt_text : $product->title ); ?>" loading="lazy" decoding="async" class="object-cover group-hover:scale-105 transition-transform duration-300" data-sh-fallback style="position:absolute;inset:0;width:100%;height:100%;color:transparent">
		</div>
		<div style="padding:10px 12px 4px">
			<?php if ( $product->category ) : ?><p style="font-size:11px;color:#800000;font-weight:500;margin-bottom:3px"><?php echo esc_html( $product->category->name ); ?></p><?php endif; ?>
			<h4 class="line-clamp-2" style="font-size:13px;font-weight:600;color:#222831;margin-bottom:6px;line-height:1.4;min-height:2.4em"><?php echo esc_html( $product->title ); ?></h4>
			<div class="flex items-center flex-wrap" style="gap:6px;margin-bottom:10px">
				<span style="font-size:14px;font-weight:700;color:#800000"><?php echo esc_html( sh_format_price( $product->price ) ); ?></span>
				<?php if ( $product->compare_at_price ) : ?><span style="font-size:12px;color:#aaa;text-decoration:line-through"><?php echo esc_html( sh_format_price( $product->compare_at_price ) ); ?></span><?php endif; ?>
			</div>
		</div>
	</a>
	<div style="padding:0 12px 12px">
		<button type="button" data-sh-add-to-cart="<?php echo esc_attr( wp_json_encode( sh_cart_payload( $product ) ) ); ?>" <?php disabled( $oos ); ?> class="btn-cart sh-btn-outline w-full flex items-center justify-center gap-1.5" style="padding:8px 12px;background-color:white;color:<?php echo $oos ? '#aaa' : '#800000'; ?>;border:2px solid <?php echo $oos ? '#ddd' : '#800000'; ?>;border-radius:4px;font-size:12px;font-weight:600;cursor:<?php echo $oos ? 'not-allowed' : 'pointer'; ?>;transition:background-color 0.2s, color 0.2s, transform 0.1s" aria-label="<?php echo esc_attr( 'Add to cart — ' . $product->title ); ?>">
			<?php echo sh_icon( 'shopping-cart', 13 ); // phpcs:ignore ?>
			<span><?php echo $oos ? 'Out of Stock' : 'Add to Cart'; ?></span>
		</button>
	</div>
</div>
