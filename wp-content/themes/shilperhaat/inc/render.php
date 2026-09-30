<?php
/**
 * Small render helpers shared by the route templates (product cards, section headers...).
 */
defined( 'ABSPATH' ) || exit;

/** Inline onerror handler used by every product image (falls back to the placeholder). */
function sh_img_onerror(): string {
	return "this.onerror=null;this.src='" . esc_js( sh_placeholder_url() ) . "'";
}

/** Data attributes consumed by assets/js/core.js for add-to-cart buttons. */
function sh_cart_attrs( array $p ): string {
	$img = ! empty( $p['images'][0]['imageUrl'] ) ? sh_asset_url( $p['images'][0]['imageUrl'] ) : sh_placeholder_url();
	return ' data-sh-add'
		. ' data-id="' . esc_attr( $p['id'] ) . '"'
		. ' data-title="' . esc_attr( $p['title'] ) . '"'
		. ' data-price="' . esc_attr( $p['price'] ) . '"'
		. ' data-compare="' . esc_attr( $p['compareAtPrice'] ?? '' ) . '"'
		. ' data-image="' . esc_attr( $img ) . '"'
		. ' data-stock="' . esc_attr( $p['stock'] ) . '"'
		. ' data-slug="' . esc_attr( $p['slug'] ) . '"';
}

function sh_product_url( array $p ): string {
	return home_url( '/product/' . rawurlencode( $p['slug'] ) );
}

/** Section title with the small maroon underline + "View All" link (Top Selling / category sections). */
function sh_section_header( string $title, string $href, string $subtitle = '', string $linkText = 'View All', string $linkClass = 'flex items-center gap-1 transition-all duration-200 hover:gap-2' ): void {
	?>
	<div class="flex items-end justify-between" style="margin-bottom:24px">
		<div class="relative" style="padding-bottom:10px">
			<h2 style="font-size:22px;font-weight:600;color:#222831;font-family:'Open Sans', sans-serif"><?php echo esc_html( $title ); ?></h2>
			<?php if ( $subtitle ) : ?><p style="font-size:13px;color:#888;margin-top:4px;font-family:'Open Sans', sans-serif"><?php echo esc_html( $subtitle ); ?></p><?php endif; ?>
			<span class="absolute bottom-0 left-0" style="width:48px;height:3px;background-color:#800000;border-radius:2px"></span>
		</div>
		<a href="<?php echo esc_url( $href ); ?>" class="<?php echo esc_attr( $linkClass ); ?>" style="color:#800000;font-size:13px;font-weight:600;text-decoration:none;font-family:'Open Sans', sans-serif"><?php echo esc_html( $linkText ); ?> <?php echo sh_icon( 'arrow-right', 14 ); ?></a>
	</div>
	<?php
}

/** components/ui/ProductCard.tsx */
function sh_product_card( array $p ): void {
	$img      = ! empty( $p['images'][0]['imageUrl'] ) ? sh_asset_url( $p['images'][0]['imageUrl'] ) : sh_placeholder_url();
	$alt      = ! empty( $p['images'][0]['altText'] ) ? $p['images'][0]['altText'] : $p['title'];
	$discount = $p['compareAtPrice'] ? sh_calc_discount( $p['price'], $p['compareAtPrice'] ) : 0;
	$oos      = 0 === (int) $p['stock'];
	?>
	<div class="group product-card sh-pc" style="background-color:#FFFFFF;border-radius:8px;border:1px solid #eeeeee;overflow:hidden">
		<a href="<?php echo esc_url( sh_product_url( $p ) ); ?>" style="text-decoration:none;display:block">
			<div style="position:relative;width:100%;padding-bottom:75%;background-color:#F8F8F8;overflow:hidden">
				<div class="absolute z-20 pointer-events-none flex flex-col" style="top:8px;left:8px;gap:4px">
					<?php if ( $discount > 0 ) : ?><span class="sh-pbadge" style="background-color:#FF3F33">Save <?php echo (int) $discount; ?>%</span><?php endif; ?>
					<?php if ( $p['isBestSelling'] ) : ?><span class="sh-pbadge" style="background-color:#F48721">Best Seller</span><?php endif; ?>
					<?php if ( $oos ) : ?><span class="sh-pbadge" style="background-color:#888888">Out of Stock</span><?php endif; ?>
				</div>
				<img src="<?php echo esc_url( $img ); ?>" alt="<?php echo esc_attr( $alt ); ?>" loading="lazy" decoding="async" class="object-cover group-hover:scale-105 transition-transform duration-300" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" onerror="<?php echo esc_attr( sh_img_onerror() ); ?>">
			</div>
			<div style="padding:10px 12px 4px">
				<?php if ( $p['category'] ) : ?><p style="font-size:11px;color:#800000;font-weight:500;margin-bottom:3px"><?php echo esc_html( $p['category']['name'] ); ?></p><?php endif; ?>
				<h4 class="line-clamp-2" style="font-size:13px;font-weight:600;color:#222831;margin-bottom:6px;line-height:1.4;min-height:2.4em"><?php echo esc_html( $p['title'] ); ?></h4>
				<div class="flex items-center flex-wrap" style="gap:6px;margin-bottom:10px">
					<span style="font-size:14px;font-weight:700;color:#800000"><?php echo esc_html( sh_format_price( $p['price'] ) ); ?></span>
					<?php if ( $p['compareAtPrice'] ) : ?><span style="font-size:12px;color:#aaa;text-decoration:line-through"><?php echo esc_html( sh_format_price( $p['compareAtPrice'] ) ); ?></span><?php endif; ?>
				</div>
			</div>
		</a>
		<div style="padding:0 12px 12px">
			<button type="button" class="btn-cart sh-btn-cart w-full flex items-center justify-center gap-1.5"<?php echo $oos ? ' disabled' : ''; echo sh_cart_attrs( $p ); // phpcs:ignore ?> aria-label="<?php echo esc_attr( 'Add to cart — ' . $p['title'] ); ?>">
				<?php echo sh_icon( 'shopping-cart', 13 ); ?><span><?php echo $oos ? 'Out of Stock' : 'Add to Cart'; ?></span>
			</button>
		</div>
	</div>
	<?php
}
