<?php
/** components/home/TopSellingCard.tsx — expects $p (product array). */
defined( 'ABSPATH' ) || exit;
$img      = ! empty( $p['images'][0]['imageUrl'] ) ? sh_asset_url( $p['images'][0]['imageUrl'] ) : sh_placeholder_url();
$alt      = ! empty( $p['images'][0]['altText'] ) ? $p['images'][0]['altText'] : $p['title'];
$save     = $p['compareAtPrice'] ? (float) $p['compareAtPrice'] - (float) $p['price'] : 0;
$oos      = 0 === (int) $p['stock'];
?>
<div class="group relative overflow-hidden sh-tsc">
	<?php if ( $p['isBestSelling'] ) : ?>
		<span class="absolute z-10" style="top:12px;right:12px;background-color:#FF3F33;color:#FFFFFF;font-size:11px;font-weight:700;padding:3px 9px;border-radius:2px 8px 2px 8px">🏅 Best Seller</span>
	<?php endif; ?>
	<a href="<?php echo esc_url( sh_product_url( $p ) ); ?>" class="flex items-center gap-3 md:gap-5 flex-1 min-w-0" style="text-decoration:none">
		<div class="flex-shrink-0 w-20 h-20 md:w-40 md:h-40" style="border-radius:6px;background-color:#f9f9f9;display:flex;align-items:center;justify-content:center;overflow:hidden">
			<img src="<?php echo esc_url( $img ); ?>" alt="<?php echo esc_attr( $alt ); ?>" width="160" height="160" loading="lazy" decoding="async" class="object-contain group-hover:scale-105 transition-transform duration-300 w-full h-full" style="object-fit:contain;color:transparent" onerror="<?php echo esc_attr( sh_img_onerror() ); ?>">
		</div>
		<div class="flex-1 min-w-0">
			<h4 class="text-sm md:text-xl" style="font-weight:600;color:#222;margin-bottom:8px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical"><?php echo esc_html( $p['title'] ); ?></h4>
			<div class="flex items-center flex-wrap" style="gap:8px;margin-bottom:12px">
				<span class="text-base md:text-2xl" style="font-weight:700;color:#800000"><?php echo esc_html( sh_format_price( $p['price'] ) ); ?></span>
				<?php if ( $p['compareAtPrice'] ) : ?><span class="text-xs md:text-sm" style="color:#aaa;text-decoration:line-through"><?php echo esc_html( sh_format_price( $p['compareAtPrice'] ) ); ?></span><?php endif; ?>
				<?php if ( $save > 0 ) : ?><span class="hidden md:inline" style="background-color:#e8f5e9;color:#2e7d32;font-size:12px;font-weight:600;padding:3px 8px;border-radius:4px">Save <?php echo esc_html( sh_format_price( $save ) ); ?></span><?php endif; ?>
			</div>
			<div class="flex" style="gap:8px" data-sh-noclick>
				<button type="button" class="sh-tsc-btn sh-tsc-cart flex items-center justify-center gap-1"<?php echo $oos ? ' disabled' : ''; echo sh_cart_attrs( $p ); // phpcs:ignore ?>>
					<?php echo sh_icon( 'shopping-cart', 13 ); ?><span><?php echo $oos ? 'Out of Stock' : 'Add To Cart'; ?></span>
				</button>
				<button type="button" class="sh-tsc-btn sh-tsc-buy flex items-center justify-center gap-1"<?php echo $oos ? ' disabled' : ''; echo sh_cart_attrs( $p ) . ' data-buy="1"'; // phpcs:ignore ?>>
					<?php echo sh_icon( 'shopping-cart', 13 ); ?><span>Buy Now</span>
				</button>
			</div>
		</div>
	</a>
</div>
