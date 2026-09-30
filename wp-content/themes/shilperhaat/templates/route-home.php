<?php
/**
 * Home page — mirrors app/(public)/page.tsx and components/home/*.
 */
defined( 'ABSPATH' ) || exit;
get_header();

$banners    = SH_Store::banners( true );
$categories = SH_Catalog::categories();
$products   = SH_Catalog::query( [ 'all' => true, 'status' => 'ACTIVE', 'sort' => 'newest' ] )['products'];
$reviews    = array_slice( SH_Store::visible_reviews(), 0, 6 );

/* ── 1. Hero banner ── */
$hero_h = 'clamp(280px, 52vw, 520px)';
if ( ! $banners ) : ?>
	<a href="<?php echo esc_url( home_url( '/shop' ) ); ?>" aria-label="Shop all products" style="display:block;text-decoration:none">
		<section class="relative w-full flex items-end" style="height:<?php echo esc_attr( $hero_h ); ?>;background:linear-gradient(135deg, #041F1E 0%, #0A3D3B 60%, #1A6A65 100%);cursor:pointer"></section>
	</a>
<?php else : ?>
	<div id="sh-hero" data-count="<?php echo count( $banners ); ?>">
	<?php foreach ( $banners as $i => $b ) :
		$hasMobile = ! empty( $b['mobileImageUrl'] );
		$alt       = $b['title'] ?: 'Shilperhaat banner';
		?>
		<section class="sh-hero-slide relative w-full overflow-hidden bg-[#041F1E] <?php echo $hasMobile ? 'aspect-[768/400] md:aspect-[1920/600] max-h-[520px]' : ''; ?>" style="<?php echo $hasMobile ? '' : 'height:' . $hero_h; ?><?php echo 0 === $i ? '' : ';display:none'; ?>" data-index="<?php echo (int) $i; ?>">
			<a href="<?php echo esc_url( home_url( '/shop' ) ); ?>" aria-label="Shop all products" class="absolute inset-0 z-10" style="display:block"></a>
			<img src="<?php echo esc_url( sh_asset_url( $b['imageUrl'] ) ); ?>" alt="<?php echo esc_attr( $alt ); ?>" <?php echo 0 === $i ? 'fetchpriority="high"' : 'loading="lazy"'; ?> decoding="async" class="<?php echo $hasMobile ? 'hidden md:block object-cover object-center' : 'block object-cover object-center'; ?>" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" onerror="this.style.display='none'">
			<?php if ( $hasMobile ) : ?>
				<img src="<?php echo esc_url( sh_asset_url( $b['mobileImageUrl'] ) ); ?>" alt="<?php echo esc_attr( $alt ); ?>" <?php echo 0 === $i ? 'fetchpriority="high"' : 'loading="lazy"'; ?> decoding="async" class="block md:hidden object-cover object-center" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" onerror="this.style.display='none'">
			<?php endif; ?>
			<?php if ( count( $banners ) > 1 ) : ?>
				<button type="button" data-hero-prev aria-label="Previous banner" class="sh-hero-arrow absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-9 rounded-full cursor-pointer border-none"><?php echo sh_icon( 'chevron-left', 18 ); ?></button>
				<button type="button" data-hero-next aria-label="Next banner" class="sh-hero-arrow absolute right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-9 rounded-full cursor-pointer border-none"><?php echo sh_icon( 'chevron-right', 18 ); ?></button>
				<div class="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
					<?php foreach ( $banners as $j => $_ ) : $on = $j === $i; ?>
						<button type="button" data-hero-dot="<?php echo (int) $j; ?>" aria-label="Banner <?php echo $j + 1; ?>" style="width:<?php echo $on ? 20 : 8; ?>px;height:8px;border-radius:4px;background-color:<?php echo $on ? '#800000' : 'rgba(255,255,255,0.5)'; ?>;border:none;padding:0;cursor:pointer;transition:all 0.25s ease"></button>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>
		</section>
	<?php endforeach; ?>
	</div>
<?php endif;

/* ── 2. Featured categories ── */
if ( $categories ) : ?>
<section style="padding:40px 0;background-color:#FAF0E6">
	<div class="max-w-7xl mx-auto px-4 md:px-5">
		<div class="flex items-end justify-between" style="margin-bottom:24px">
			<div class="relative" style="padding-bottom:10px">
				<h2 style="font-size:22px;font-weight:600;color:#222;font-family:'Open Sans', sans-serif">Featured Categories</h2>
				<span class="absolute bottom-0 left-0" style="width:48px;height:3px;background-color:#800000;border-radius:2px"></span>
			</div>
			<a href="<?php echo esc_url( home_url( '/shop' ) ); ?>" class="flex items-center gap-1 transition-all duration-200 hover:gap-2" style="color:#800000;font-size:13px;font-weight:600;text-decoration:none;font-family:'Open Sans', sans-serif">View All <?php echo sh_icon( 'arrow-right', 14 ); ?></a>
		</div>
		<div class="relative">
			<button type="button" data-cat-scroll="-1" aria-label="Scroll categories left" class="md:hidden flex absolute -left-1 z-10 items-center justify-center transition-colors" style="top:38%;transform:translateY(-50%);background-color:#800000;color:#fff;border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.18)"><?php echo sh_icon( 'chevron-left', 14 ); ?></button>
			<?php
			$card = static function ( array $c ) {
				$img = sh_asset_url( $c['imageUrl'] );
				?>
				<a href="<?php echo esc_url( home_url( '/shop?category=' . rawurlencode( $c['slug'] ) ) ); ?>" aria-label="<?php echo esc_attr( 'Browse ' . $c['name'] ); ?>" class="sh-cat-card">
					<div class="sh-cat-circle"><img src="<?php echo esc_url( $img ); ?>" alt="<?php echo esc_attr( $c['name'] ); ?>" loading="lazy" decoding="async" class="object-cover" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" onerror="<?php echo esc_attr( sh_img_onerror() ); ?>"></div>
					<span class="sh-cat-name"><?php echo esc_html( $c['name'] ); ?></span>
				</a>
				<?php
			};
			?>
			<div id="sh-cat-track" class="md:hidden flex py-3 px-1 sh-cat-scroll" style="gap:16px;overflow-x:auto"><?php foreach ( $categories as $c ) { $card( $c ); } ?></div>
			<div class="hidden md:flex flex-wrap justify-center py-3 px-1" style="gap:24px"><?php foreach ( $categories as $c ) { $card( $c ); } ?></div>
			<button type="button" data-cat-scroll="1" aria-label="Scroll categories right" class="md:hidden flex absolute -right-1 z-10 items-center justify-center transition-colors" style="top:38%;transform:translateY(-50%);background-color:#800000;color:#fff;border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.18)"><?php echo sh_icon( 'chevron-right', 14 ); ?></button>
		</div>
	</div>
</section>
<?php endif;

/* ── 3. Top selling ── */
$top     = array_slice( array_values( array_filter( $products, static fn( $p ) => $p['isBestSelling'] ) ), 0, 4 );
$display = count( $top ) >= 4 ? $top : array_slice( $products, 0, 4 );
if ( $display ) : ?>
<section style="padding:40px 0;background-color:#FFFFFF">
	<div class="max-w-7xl mx-auto px-4 md:px-5">
		<?php sh_section_header( 'Top Selling Products', home_url( '/shop?sort=best_selling' ) ); ?>
		<div class="grid grid-cols-1 md:grid-cols-2" style="gap:0">
			<?php foreach ( $display as $p ) { include get_template_directory() . '/templates/partials/top-selling-card.php'; } ?>
		</div>
		<div class="text-center" style="margin-top:32px">
			<a href="<?php echo esc_url( home_url( '/shop?sort=best_selling' ) ); ?>" class="inline-block sh-viewall-btn" style="padding:12px 40px;border-radius:4px;font-size:14px;font-weight:600;text-decoration:none;font-family:'Open Sans', sans-serif">View All Best Sellers</a>
		</div>
	</div>
</section>
<?php endif;

/* ── 4. Per-category sections ── */
foreach ( $categories as $cat ) :
	$list = array_values( array_filter( $products, static fn( $p ) => $p['categoryId'] === $cat['id'] ) );
	if ( ! $list ) {
		continue;
	}
	$list = array_slice( $list, 0, 4 );
	$url  = home_url( '/shop?category=' . rawurlencode( $cat['slug'] ) );
	?>
<section style="padding:40px 0;background-color:#FAF0E6">
	<div class="max-w-7xl mx-auto px-4 md:px-5">
		<?php sh_section_header( $cat['name'], $url ); ?>
		<div class="grid md:hidden" style="grid-template-columns:repeat(2, minmax(0, 1fr));gap:12px"><?php foreach ( $list as $p ) { sh_product_card( $p ); } ?></div>
		<div class="hidden md:grid" style="grid-template-columns:repeat(4, minmax(0, 1fr));gap:16px"><?php foreach ( $list as $p ) { sh_product_card( $p ); } ?></div>
		<div class="flex justify-center" style="margin-top:28px">
			<a href="<?php echo esc_url( $url ); ?>" class="inline-block sh-viewall-btn rounded-full" style="padding:10px 36px;font-size:13px;font-weight:600;text-decoration:none;font-family:'Open Sans', sans-serif">View All <?php echo esc_html( $cat['name'] ); ?> Products</a>
		</div>
	</div>
</section>
<?php endforeach;

/* ── 5. Customer reviews ── */
if ( $reviews ) : ?>
<section style="padding:40px 0;background-color:#FFFFFF;width:100%" id="sh-reviews" data-count="<?php echo count( $reviews ); ?>">
	<div class="w-full max-w-7xl mx-auto px-4 md:px-5">
		<div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:28px">
			<div style="position:relative;padding-bottom:10px">
				<h2 style="font-size:22px;font-weight:600;color:#222831;font-family:'Open Sans', sans-serif">Customer Reviews</h2>
				<p style="font-size:13px;color:#888;margin-top:4px;font-family:'Open Sans', sans-serif">What our happy customers say</p>
				<span style="position:absolute;bottom:0;left:0;width:48px;height:3px;background-color:#800000;border-radius:2px"></span>
			</div>
			<div style="display:flex;gap:8px;flex-shrink:0">
				<button type="button" data-rc-prev aria-label="Previous reviews" class="sh-rc-prev"><?php echo sh_icon( 'chevron-left', 18, 'color:#555' ); ?></button>
				<button type="button" data-rc-next aria-label="Next reviews" class="sh-rc-next"><?php echo sh_icon( 'chevron-right', 18, 'color:#fff' ); ?></button>
			</div>
		</div>
		<div style="overflow:hidden">
			<div id="sh-rc-track" style="display:flex;transform:translateX(-0%);transition:transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)">
				<?php foreach ( $reviews as $r ) : ?>
					<div class="sh-rc-item">
						<div style="background-color:#FFFFFF;border-radius:12px;padding:20px;border:1px solid #EEEEEE;box-shadow:0 2px 8px rgba(0,0,0,0.04);display:flex;flex-direction:column;height:100%">
							<?php echo sh_icon( 'quote', 26, 'color:#800000;opacity:0.55;margin-bottom:12px' ); ?>
							<div style="display:flex;gap:2px">
								<?php for ( $s = 0; $s < 5; $s++ ) { echo sh_icon( 'star', 14, $s < $r['rating'] ? 'color:#800000;fill:#800000' : 'color:#D1D5DB' ); } ?>
							</div>
							<?php if ( $r['title'] ) : ?><h4 style="font-size:14px;font-weight:700;color:#222831;margin:10px 0 6px;font-family:'Open Sans', sans-serif"><?php echo esc_html( $r['title'] ); ?></h4><?php endif; ?>
							<p style="font-size:13px;color:#666666;line-height:1.7;flex:1;margin-bottom:16px;font-family:'Open Sans', sans-serif;overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:4"><?php echo esc_html( $r['content'] ); ?></p>
							<div style="display:flex;align-items:center;gap:12px;padding-top:14px;border-top:1px solid #F5F5F5">
								<?php if ( $r['avatarUrl'] ) : ?>
									<img src="<?php echo esc_url( sh_asset_url( $r['avatarUrl'] ) ); ?>" alt="<?php echo esc_attr( $r['name'] ); ?>" width="40" height="40" loading="lazy" style="border-radius:50%;object-fit:cover;flex-shrink:0;color:transparent">
								<?php else : ?>
									<div style="width:38px;height:38px;border-radius:50%;background-color:#800000;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:16px;flex-shrink:0"><?php echo esc_html( mb_substr( $r['name'], 0, 1 ) ); ?></div>
								<?php endif; ?>
								<div>
									<p style="font-size:13px;font-weight:600;color:#222831;font-family:'Open Sans', sans-serif"><?php echo esc_html( $r['name'] ); ?></p>
									<?php if ( $r['role'] ) : ?><p style="font-size:11px;color:#999;font-family:'Open Sans', sans-serif"><?php echo esc_html( $r['role'] ); ?></p><?php endif; ?>
								</div>
							</div>
						</div>
					</div>
				<?php endforeach; ?>
			</div>
		</div>
		<div id="sh-rc-dots" style="display:flex;justify-content:center;gap:8px;margin-top:24px"></div>
	</div>
</section>
<?php endif;

get_footer();
