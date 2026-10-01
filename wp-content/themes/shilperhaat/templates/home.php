<?php
/**
 * Home page. Mirrors app/(public)/page.tsx and components/home/*.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
$banners    = sh_banners();
$categories = sh_categories();
$products   = sh_products();
$reviews    = sh_reviews( array( 'visible' => true ) );

$GLOBALS['sh_head'] = array(
	'title'       => "Shilperhaat — Bangladesh's Finest Handcraft Textiles",
	'description' => 'Explore a vast collection of hand-woven Katha, Chadar, Blankets & Nakshi Katha. Premium quality, affordable prices.',
	'canonical'   => home_url( '/' ),
);

get_header();
?>
<div style="background-color:#FAF0E6">

	<?php /* 1. Hero banner ─────────────────────────────────────── */ ?>
	<?php if ( ! $banners ) : ?>
		<a href="<?php echo esc_url( home_url( '/shop' ) ); ?>" aria-label="Shop all products" style="display:block;text-decoration:none">
			<section class="relative w-full flex items-end" style="height:clamp(280px, 52vw, 520px);background:linear-gradient(135deg, #041F1E 0%, #0A3D3B 60%, #1A6A65 100%);cursor:pointer"></section>
		</a>
	<?php else : ?>
		<?php $first_mobile = ! empty( $banners[0]->mobile_image_url ); ?>
		<section data-sh-hero class="relative w-full overflow-hidden bg-[#041F1E] <?php echo $first_mobile ? 'aspect-[768/400] md:aspect-[1920/600] max-h-[520px]' : ''; ?>" style="<?php echo $first_mobile ? '' : 'height:clamp(280px, 52vw, 520px)'; ?>">
			<a href="<?php echo esc_url( home_url( '/shop' ) ); ?>" aria-label="Shop all products" class="absolute inset-0 z-10" style="display:block"></a>
			<?php foreach ( $banners as $i => $b ) : ?>
				<?php $has_m = ! empty( $b->mobile_image_url ); ?>
				<div data-sh-slide data-has-mobile="<?php echo $has_m ? '1' : '0'; ?>" <?php echo 0 === $i ? '' : 'hidden'; ?> style="position:absolute;inset:0">
					<img src="<?php echo esc_url( sh_media_url( $b->image_url ) ); ?>" alt="<?php echo esc_attr( $b->title ? $b->title : 'Shilperhaat banner' ); ?>" <?php echo 0 === $i ? 'fetchpriority="high"' : 'loading="lazy"'; ?> decoding="async" class="<?php echo $has_m ? 'hidden md:block' : 'block'; ?> object-cover object-center" style="position:absolute;inset:0;width:100%;height:100%;color:transparent">
					<?php if ( $has_m ) : ?>
						<img src="<?php echo esc_url( sh_media_url( $b->mobile_image_url ) ); ?>" alt="<?php echo esc_attr( $b->title ? $b->title : 'Shilperhaat banner' ); ?>" <?php echo 0 === $i ? 'fetchpriority="high"' : 'loading="lazy"'; ?> decoding="async" class="block md:hidden object-cover object-center" style="position:absolute;inset:0;width:100%;height:100%;color:transparent">
					<?php endif; ?>
				</div>
			<?php endforeach; ?>

			<?php if ( count( $banners ) > 1 ) : ?>
				<button type="button" data-sh-hero-prev aria-label="Previous banner" class="sh-hero-arrow absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-9 rounded-full cursor-pointer border-none"><?php echo sh_icon( 'chevron-left', 18 ); // phpcs:ignore ?></button>
				<button type="button" data-sh-hero-next aria-label="Next banner" class="sh-hero-arrow absolute right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-9 rounded-full cursor-pointer border-none"><?php echo sh_icon( 'chevron-right', 18 ); // phpcs:ignore ?></button>
				<div class="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
					<?php foreach ( $banners as $i => $b ) : ?>
						<button type="button" data-sh-hero-dot="<?php echo (int) $i; ?>" aria-label="Banner <?php echo (int) $i + 1; ?>" style="width:<?php echo 0 === $i ? 20 : 8; ?>px;height:8px;border-radius:4px;background-color:<?php echo 0 === $i ? '#800000' : 'rgba(255,255,255,0.5)'; ?>;border:none;padding:0;cursor:pointer;transition:all 0.25s ease"></button>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>
		</section>
	<?php endif; ?>

	<?php /* 2. Featured categories ─────────────────────────────── */ ?>
	<?php if ( $categories ) : ?>
		<section style="padding:40px 0;background-color:#FAF0E6">
			<div class="max-w-7xl mx-auto px-4 md:px-5">
				<?php sh_section_header( 'Featured Categories', '/shop', 'View All', '#222' ); ?>
				<div class="relative">
					<button type="button" data-sh-cat-scroll="-1" aria-label="Scroll categories left" class="md:hidden flex absolute -left-1 z-10 items-center justify-center transition-colors" style="top:38%;transform:translateY(-50%);background-color:#800000;color:#fff;border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.18)"><?php echo sh_icon( 'chevron-left', 14 ); // phpcs:ignore ?></button>

					<?php foreach ( array( 'mobile' => 'md:hidden flex py-3 px-1', 'desktop' => 'hidden md:flex flex-wrap justify-center py-3 px-1' ) as $kind => $cls ) : ?>
						<div <?php echo 'mobile' === $kind ? 'data-sh-cat-track' : ''; ?> class="<?php echo esc_attr( $cls ); ?>" style="gap:<?php echo 'mobile' === $kind ? 16 : 24; ?>px;<?php echo 'mobile' === $kind ? 'overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none' : ''; ?>">
							<?php foreach ( $categories as $cat ) : ?>
								<a href="<?php echo esc_url( home_url( '/shop?category=' . rawurlencode( $cat->slug ) ) ); ?>" aria-label="<?php echo esc_attr( 'Browse ' . $cat->name ); ?>" style="flex-shrink:0;width:100px;min-width:100px;display:flex;flex-direction:column;align-items:center;gap:10px;text-decoration:none;color:inherit">
									<div class="sh-cat-circle" style="width:80px;height:80px;border-radius:50%;background-color:#FFF0F0;border:2px solid #f5d0d0;overflow:hidden;position:relative;flex-shrink:0;transition:box-shadow 0.2s, transform 0.2s">
										<img src="<?php echo esc_url( sh_image_url( $cat->image_url ) ); ?>" alt="<?php echo esc_attr( $cat->name ); ?>" width="80" height="80" loading="lazy" decoding="async" data-sh-fallback class="object-cover" style="position:absolute;inset:0;width:100%;height:100%;color:transparent">
									</div>
									<span class="sh-cat-name" style="font-size:13px;font-weight:500;color:#333;text-align:center;line-height:1.3;font-family:'Open Sans',sans-serif;transition:color 0.2s"><?php echo esc_html( $cat->name ); ?></span>
								</a>
							<?php endforeach; ?>
						</div>
					<?php endforeach; ?>

					<button type="button" data-sh-cat-scroll="1" aria-label="Scroll categories right" class="md:hidden flex absolute -right-1 z-10 items-center justify-center transition-colors" style="top:38%;transform:translateY(-50%);background-color:#800000;color:#fff;border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.18)"><?php echo sh_icon( 'chevron-right', 14 ); // phpcs:ignore ?></button>
				</div>
			</div>
		</section>
	<?php endif; ?>

	<?php /* 3. Top selling ─────────────────────────────────────── */ ?>
	<?php
	$top     = array_slice( array_values( array_filter( $products, static function ( $p ) {
		return (bool) $p->is_best_selling;
	} ) ), 0, 4 );
	$display = count( $top ) >= 4 ? $top : array_slice( $products, 0, 4 );
	?>
	<?php if ( $display ) : ?>
		<section style="padding:40px 0;background-color:#FFFFFF">
			<div class="max-w-7xl mx-auto px-4 md:px-5">
				<?php sh_section_header( 'Top Selling Products', '/shop?sort=best_selling' ); ?>
				<div class="grid grid-cols-1 md:grid-cols-2" style="gap:0">
					<?php foreach ( $display as $p ) { get_template_part( 'template-parts/top-selling-card', null, array( 'product' => $p ) ); } ?>
				</div>
				<div class="text-center" style="margin-top:32px">
					<a href="<?php echo esc_url( home_url( '/shop?sort=best_selling' ) ); ?>" class="inline-block border-2 border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white transition-colors" style="padding:12px 40px;border-radius:4px;font-size:14px;font-weight:600;text-decoration:none;font-family:'Open Sans',sans-serif">View All Best Sellers</a>
				</div>
			</div>
		</section>
	<?php endif; ?>

	<?php /* 4. Per-category sections ───────────────────────────── */ ?>
	<?php foreach ( $categories as $cat ) : ?>
		<?php
		$cat_products = array_slice( array_values( array_filter( $products, static function ( $p ) use ( $cat ) {
			return $p->category_id === $cat->id;
		} ) ), 0, 4 );
		if ( ! $cat_products ) {
			continue;
		}
		?>
		<section style="padding:40px 0;background-color:#FAF0E6">
			<div class="max-w-7xl mx-auto px-4 md:px-5">
				<?php sh_section_header( $cat->name, '/shop?category=' . rawurlencode( $cat->slug ) ); ?>
				<div class="grid md:hidden" style="grid-template-columns:repeat(2, minmax(0, 1fr));gap:12px">
					<?php foreach ( $cat_products as $p ) { get_template_part( 'template-parts/product-card', null, array( 'product' => $p ) ); } ?>
				</div>
				<div class="hidden md:grid" style="grid-template-columns:repeat(4, minmax(0, 1fr));gap:16px">
					<?php foreach ( $cat_products as $p ) { get_template_part( 'template-parts/product-card', null, array( 'product' => $p ) ); } ?>
				</div>
				<div class="flex justify-center" style="margin-top:28px">
					<a href="<?php echo esc_url( home_url( '/shop?category=' . rawurlencode( $cat->slug ) ) ); ?>" class="inline-block border-2 border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white transition-colors rounded-full" style="padding:10px 36px;font-size:13px;font-weight:600;text-decoration:none;font-family:'Open Sans',sans-serif">View All <?php echo esc_html( $cat->name ); ?> Products</a>
				</div>
			</div>
		</section>
	<?php endforeach; ?>

	<?php /* 5. Customer reviews ────────────────────────────────── */ ?>
	<?php $visible = array_slice( $reviews, 0, 6 ); ?>
	<?php if ( $visible ) : ?>
		<section data-sh-reviews style="padding:40px 0;background-color:#FFFFFF;width:100%">
			<div class="w-full max-w-7xl mx-auto px-4 md:px-5">
				<div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:28px">
					<div style="position:relative;padding-bottom:10px">
						<h2 style="font-size:22px;font-weight:600;color:#222831;font-family:'Open Sans',sans-serif">Customer Reviews</h2>
						<p style="font-size:13px;color:#888;margin-top:4px;font-family:'Open Sans',sans-serif">What our happy customers say</p>
						<span style="position:absolute;bottom:0;left:0;width:48px;height:3px;background-color:#800000;border-radius:2px"></span>
					</div>
					<div style="display:flex;gap:8px;flex-shrink:0">
						<button type="button" data-sh-rev-prev aria-label="Previous reviews" class="sh-rev-prev" style="width:36px;height:36px;border-radius:50%;background-color:#F5F5F5;border:1px solid #E8E8E8;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background-color 0.2s;padding:0"><?php echo sh_icon( 'chevron-left', 18, 'color:#555' ); // phpcs:ignore ?></button>
						<button type="button" data-sh-rev-next aria-label="Next reviews" class="sh-rev-next" style="width:36px;height:36px;border-radius:50%;background-color:#800000;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background-color 0.2s;padding:0"><?php echo sh_icon( 'chevron-right', 18, 'color:#fff' ); // phpcs:ignore ?></button>
					</div>
				</div>

				<div style="overflow:hidden">
					<div data-sh-rev-track style="display:flex;transition:transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)">
						<?php foreach ( $visible as $r ) : ?>
							<div data-sh-rev-item style="flex-shrink:0;width:100%;padding:4px 8px">
								<div style="background-color:#FFFFFF;border-radius:12px;padding:20px;border:1px solid #EEEEEE;box-shadow:0 2px 8px rgba(0,0,0,0.04);display:flex;flex-direction:column;height:100%">
									<?php echo sh_icon( 'quote', 26, 'color:#800000;opacity:0.55;margin-bottom:12px' ); // phpcs:ignore ?>
									<div style="display:flex;gap:2px">
										<?php for ( $s = 0; $s < 5; $s++ ) : ?>
											<?php echo $s < (int) $r->rating ? sh_icon( 'star', 14, 'color:#800000;fill:#800000' ) : sh_icon( 'star', 14, 'color:#D1D5DB' ); // phpcs:ignore ?>
										<?php endfor; ?>
									</div>
									<?php if ( $r->title ) : ?><h4 style="font-size:14px;font-weight:700;color:#222831;margin:10px 0 6px;font-family:'Open Sans',sans-serif"><?php echo esc_html( $r->title ); ?></h4><?php endif; ?>
									<p style="font-size:13px;color:#666666;line-height:1.7;flex:1;margin-bottom:16px;font-family:'Open Sans',sans-serif;overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:4"><?php echo esc_html( $r->content ); ?></p>
									<div style="display:flex;align-items:center;gap:12px;padding-top:14px;border-top:1px solid #F5F5F5">
										<?php if ( $r->avatar_url ) : ?>
											<img src="<?php echo esc_url( sh_image_url( $r->avatar_url ) ); ?>" alt="<?php echo esc_attr( $r->name ); ?>" width="40" height="40" loading="lazy" style="border-radius:50%;object-fit:cover;flex-shrink:0">
										<?php else : ?>
											<div style="width:38px;height:38px;border-radius:50%;background-color:#800000;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:16px;flex-shrink:0"><?php echo esc_html( mb_substr( $r->name, 0, 1 ) ); ?></div>
										<?php endif; ?>
										<div>
											<p style="font-size:13px;font-weight:600;color:#222831;font-family:'Open Sans',sans-serif"><?php echo esc_html( $r->name ); ?></p>
											<?php if ( $r->role ) : ?><p style="font-size:11px;color:#999;font-family:'Open Sans',sans-serif"><?php echo esc_html( $r->role ); ?></p><?php endif; ?>
										</div>
									</div>
								</div>
							</div>
						<?php endforeach; ?>
					</div>
				</div>
				<div data-sh-rev-dots style="display:flex;justify-content:center;gap:8px;margin-top:24px"></div>
			</div>
		</section>
	<?php endif; ?>
</div>
<?php
get_footer();
