<?php
/**
 * Horizontal "top selling" card. Mirrors components/home/TopSellingCard.tsx.
 * Expects $args['product'].
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
$product  = $args['product'];
$primary  = ! empty( $product->images ) ? $product->images[0] : null;
$img      = sh_image_url( $primary ? $primary->image_url : '' );
$save     = $product->compare_at_price ? (float) $product->compare_at_price - (float) $product->price : 0;
$oos      = 0 === (int) $product->stock;
$payload  = esc_attr( wp_json_encode( sh_cart_payload( $product ) ) );
?>
<div class="group relative overflow-hidden sh-card" style="background-color:#FFFFFF;border-radius:8px;border:1px solid #eee;display:flex;align-items:center;gap:20px;padding:16px;margin-bottom:12px;box-shadow:0 1px 4px rgba(0,0,0,0.05);transition:box-shadow 0.25s ease, transform 0.2s ease">
	<?php if ( $product->is_best_selling ) : ?>
		<span class="absolute z-10" style="top:12px;right:12px;background-color:#FF3F33;color:#FFFFFF;font-size:11px;font-weight:700;padding:3px 9px;border-radius:2px 8px 2px 8px">🏅 Best Seller</span>
	<?php endif; ?>

	<a href="<?php echo esc_url( home_url( '/product/' . $product->slug ) ); ?>" class="flex items-center gap-3 md:gap-5 flex-1 min-w-0" style="text-decoration:none">
		<div class="flex-shrink-0 w-20 h-20 md:w-40 md:h-40" style="border-radius:6px;background-color:#f9f9f9;display:flex;align-items:center;justify-content:center;overflow:hidden">
			<img src="<?php echo esc_url( $img ); ?>" alt="<?php echo esc_attr( $primary && $primary->alt_text ? $primary->alt_text : $product->title ); ?>" width="160" height="160" loading="lazy" decoding="async" data-sh-fallback class="object-contain group-hover:scale-105 transition-transform duration-300 w-full h-full" style="object-fit:contain;color:transparent">
		</div>

		<div class="flex-1 min-w-0">
			<h4 class="text-sm md:text-xl" style="font-weight:600;color:#222;margin-bottom:8px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical"><?php echo esc_html( $product->title ); ?></h4>

			<div class="flex items-center flex-wrap" style="gap:8px;margin-bottom:12px">
				<span class="text-base md:text-2xl" style="font-weight:700;color:#800000"><?php echo esc_html( sh_format_price( $product->price ) ); ?></span>
				<?php if ( $product->compare_at_price ) : ?><span class="text-xs md:text-sm" style="color:#aaa;text-decoration:line-through"><?php echo esc_html( sh_format_price( $product->compare_at_price ) ); ?></span><?php endif; ?>
				<?php if ( $save > 0 ) : ?><span class="hidden md:inline" style="background-color:#e8f5e9;color:#2e7d32;font-size:12px;font-weight:600;padding:3px 8px;border-radius:4px">Save <?php echo esc_html( sh_format_price( $save ) ); ?></span><?php endif; ?>
			</div>

			<div class="flex" style="gap:8px" data-sh-stop-link>
				<button type="button" data-sh-add-to-cart="<?php echo $payload; // phpcs:ignore ?>" <?php disabled( $oos ); ?> class="sh-btn-outline flex items-center justify-center gap-1" style="flex:1;padding:8px 8px;border-radius:4px;font-size:12px;font-weight:600;border:2px solid <?php echo $oos ? '#ddd' : '#800000'; ?>;background-color:white;color:<?php echo $oos ? '#aaa' : '#800000'; ?>;cursor:<?php echo $oos ? 'not-allowed' : 'pointer'; ?>;transition:background-color 0.2s, color 0.2s, transform 0.1s;white-space:nowrap">
					<?php echo sh_icon( 'shopping-cart', 13 ); // phpcs:ignore ?><span><?php echo $oos ? 'Out of Stock' : 'Add To Cart'; ?></span>
				</button>
				<button type="button" data-sh-buy-now="<?php echo $payload; // phpcs:ignore ?>" <?php disabled( $oos ); ?> class="sh-btn-solid flex items-center justify-center gap-1" style="flex:1;padding:8px 8px;border-radius:4px;font-size:12px;font-weight:600;background-color:<?php echo $oos ? '#F5F5F5' : '#800000'; ?>;color:<?php echo $oos ? '#aaa' : '#FFFFFF'; ?>;border:none;cursor:<?php echo $oos ? 'not-allowed' : 'pointer'; ?>;transition:background-color 0.2s, transform 0.1s;white-space:nowrap">
					<?php echo sh_icon( 'shopping-cart', 13 ); // phpcs:ignore ?><span>Buy Now</span>
				</button>
			</div>
		</div>
	</a>
</div>
