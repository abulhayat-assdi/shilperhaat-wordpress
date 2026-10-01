<?php
/**
 * Product detail — mirrors app/(public)/product/[slug]/page.tsx + components/product/*.
 */
defined( 'ABSPATH' ) || exit;

$p        = SH_Router::data( 'product' );
$discount = $p['compareAtPrice'] ? sh_calc_discount( $p['price'], $p['compareAtPrice'] ) : 0;
$save     = $p['compareAtPrice'] ? (float) $p['compareAtPrice'] - (float) $p['price'] : 0;
$reviews  = SH_Store::product_reviews( (int) $p['id'] );
$related  = $p['categoryId'] ? SH_Catalog::query( [ 'status' => 'ACTIVE', 'categoryId' => $p['categoryId'], 'exclude' => [ (int) $p['id'] ], 'limit' => 4, 'sort' => 'newest' ] )['products'] : [];
$oos      = 0 === (int) $p['stock'];
$hasVideo = ! empty( $p['videoUrl'] ) || ! empty( $p['youtubeVideoId'] );

/* media list shared with product.js */
$media = [];
foreach ( $p['images'] as $im ) {
	$media[] = [ 'type' => 'image', 'url' => sh_asset_url( $im['imageUrl'] ), 'alt' => $im['altText'] ?: '' ];
}
if ( $hasVideo ) {
	$media[] = [ 'type' => 'video', 'videoUrl' => $p['videoUrl'] ? sh_asset_url( $p['videoUrl'] ) : '', 'youtubeVideoId' => $p['youtubeVideoId'] ?: '' ];
}

$crumbs = [ [ home_url( '/' ), 'Home' ], [ home_url( '/shop' ), 'Products' ] ];
if ( $p['category'] ) {
	$crumbs[] = [ home_url( '/shop?category=' . $p['category']['slug'] ), $p['category']['name'] ];
}

/** Thumbnail button (ProductGallery.ThumbnailButton). */
$thumb = static function ( array $m, int $i, int $size ): string {
	$active = 0 === $i;
	$h      = '<button type="button" data-gal-thumb="' . $i . '" aria-label="' . esc_attr( 'View ' . $m['type'] . ' ' . ( $i + 1 ) ) . '" style="width:' . $size . 'px;height:' . $size . 'px;border-radius:6px;overflow:hidden;border:' . ( $active ? '2px solid #800000' : '2px solid #eee' ) . ';cursor:pointer;transition:border-color 0.2s ease;background-color:#fff;padding:0;flex-shrink:0;position:relative">';
	if ( 'image' === $m['type'] ) {
		$h .= '<img src="' . esc_url( $m['url'] ) . '" alt="' . esc_attr( $m['alt'] ?: 'Image ' . ( $i + 1 ) ) . '" loading="lazy" class="object-cover" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" onerror="' . esc_attr( sh_img_onerror() ) . '">';
	} else {
		$h .= '<div class="w-full h-full flex items-center justify-center relative" style="background:#1a1a1a">';
		$h .= $m['youtubeVideoId'] ? '<img src="https://img.youtube.com/vi/' . esc_attr( $m['youtubeVideoId'] ) . '/mqdefault.jpg" alt="Video thumbnail" class="w-full h-full object-cover">' : '<div class="w-full h-full flex items-center justify-center" style="background:#1a1a1a"></div>';
		$cs = $size < 70 ? 20 : 28;
		$h .= '<div class="absolute inset-0 flex items-center justify-center" style="background:rgba(0,0,0,0.35)"><div class="flex items-center justify-center rounded-full" style="width:' . $cs . 'px;height:' . $cs . 'px;background:rgba(255,255,255,0.9)">' . sh_icon( 'play', $size < 70 ? 9 : 13, 'color:#800000;margin-left:2px', '', [ 'fill' => '#800000' ] ) . '</div></div></div>';
	}
	return $h . '</button>';
};

get_header();
?>
<div style="background-color:#f9f9f9;padding:24px 0 60px" id="sh-product"
	data-id="<?php echo esc_attr( $p['id'] ); ?>" data-title="<?php echo esc_attr( $p['title'] ); ?>" data-price="<?php echo esc_attr( $p['price'] ); ?>"
	data-compare="<?php echo esc_attr( $p['compareAtPrice'] ?? '' ); ?>" data-stock="<?php echo esc_attr( $p['stock'] ); ?>" data-slug="<?php echo esc_attr( $p['slug'] ); ?>"
	data-image="<?php echo esc_attr( ! empty( $p['images'][0]['imageUrl'] ) ? sh_asset_url( $p['images'][0]['imageUrl'] ) : '' ); ?>">
	<div class="max-w-7xl mx-auto px-5">

		<nav class="flex items-center flex-wrap" style="gap:6px;margin-bottom:20px" aria-label="breadcrumb">
			<?php foreach ( $crumbs as $i => $c ) : ?>
				<span class="flex items-center" style="gap:6px"><a href="<?php echo esc_url( $c[0] ); ?>" style="font-size:13px;color:#888;text-decoration:none" class="hover:text-[#800000] transition-colors"><?php echo esc_html( $c[1] ); ?></a><?php if ( $i < count( $crumbs ) - 1 ) { echo sh_icon( 'chevron-right', 12, 'color:#ccc' ); } ?></span>
			<?php endforeach; ?>
			<span class="flex items-center" style="gap:6px"><?php echo sh_icon( 'chevron-right', 12, 'color:#ccc' ); ?><span class="line-clamp-1" style="font-size:13px;color:#222;max-width:180px;font-family:'Open Sans',sans-serif"><?php echo esc_html( $p['title'] ); ?></span></span>
		</nav>

		<div class="grid grid-cols-1 md:grid-cols-2" style="gap:32px;align-items:start">
			<!-- Gallery -->
			<div id="sh-gallery" data-media="<?php echo esc_attr( wp_json_encode( $media, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) ); ?>" data-title="<?php echo esc_attr( $p['title'] ); ?>">
			<?php if ( ! $media ) : ?>
				<div class="relative flex items-center justify-center" style="aspect-ratio:1;background-color:#F5F5F5;border-radius:8px;border:1px solid #F0F0F0"><span style="color:#888888;font-size:14px">No image available</span></div>
			<?php else : ?>
				<div class="flex" style="background-color:#FFFFFF;border-radius:8px;border:1px solid #F0F0F0;padding:16px;gap:12px;position:sticky;top:68px">
					<?php if ( count( $media ) > 1 ) : ?>
						<div class="hidden md:flex flex-col" style="gap:8px;width:80px;flex-shrink:0;max-height:440px;overflow-y:auto;scrollbar-width:none" data-gal-thumbs>
							<?php foreach ( $media as $i => $m ) { echo $thumb( $m, $i, 76 ); } // phpcs:ignore ?>
						</div>
					<?php endif; ?>
					<div class="flex-1 relative flex items-center justify-center overflow-hidden" style="min-height:380px;max-height:500px" data-gal-main>
						<?php if ( 'image' === $media[0]['type'] ) : ?>
							<div class="gallery-fade absolute inset-0 flex items-center justify-center cursor-zoom-in" data-gal-img>
								<img src="<?php echo esc_url( $media[0]['url'] ); ?>" alt="<?php echo esc_attr( $media[0]['alt'] ?: $p['title'] . ' — image 1' ); ?>" fetchpriority="high" class="object-contain transition-transform duration-300 hover:scale-[1.03]" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" onerror="<?php echo esc_attr( sh_img_onerror() ); ?>">
							</div>
							<div class="absolute bottom-3 right-3 flex items-center justify-center pointer-events-none" style="background-color:rgba(255,255,255,0.85);border-radius:50%;width:30px;height:30px;z-index:10"><?php echo sh_icon( 'zoom-in', 14, 'color:#666' ); ?></div>
						<?php endif; ?>
						<?php if ( count( $media ) > 1 ) : ?>
							<button type="button" data-gal-prev class="absolute left-2 top-1/2 -translate-y-1/2 md:hidden flex items-center justify-center" aria-label="Previous" style="background-color:rgba(0,0,0,0.12);border:none;width:32px;height:32px;border-radius:50%;cursor:pointer;color:#FFFFFF;z-index:10"><?php echo sh_icon( 'chevron-left', 16 ); ?></button>
							<button type="button" data-gal-next class="absolute right-2 top-1/2 -translate-y-1/2 md:hidden flex items-center justify-center" aria-label="Next" style="background-color:rgba(0,0,0,0.12);border:none;width:32px;height:32px;border-radius:50%;cursor:pointer;color:#FFFFFF;z-index:10"><?php echo sh_icon( 'chevron-right', 16 ); ?></button>
							<button type="button" data-gal-next class="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center" aria-label="Next image" style="background-color:rgba(255,255,255,0.92);border:1px solid #eee;width:28px;height:28px;border-radius:50%;cursor:pointer;color:#666;z-index:10;box-shadow:0 1px 4px rgba(0,0,0,0.08)"><?php echo sh_icon( 'chevron-right', 14 ); ?></button>
						<?php endif; ?>
					</div>
				</div>
				<?php if ( count( $media ) > 1 ) : ?>
					<div class="flex md:hidden overflow-x-auto mt-3" style="gap:8px;padding-bottom:4px" data-gal-thumbs-m>
						<?php foreach ( $media as $i => $m ) { echo $thumb( $m, $i, 64 ); } // phpcs:ignore ?>
					</div>
				<?php endif; ?>
			<?php endif; ?>
			</div>

			<!-- Info -->
			<div style="display:flex;flex-direction:column;gap:14px">
				<?php if ( $p['category'] ) : ?>
					<div><a href="<?php echo esc_url( home_url( '/shop?category=' . rawurlencode( $p['category']['slug'] ) ) ); ?>" class="hover:border-[#800000] hover:text-[#800000] transition-colors" style="display:inline-block;font-size:13px;color:#555;text-decoration:none;border:1px solid #ddd;border-radius:20px;padding:5px 14px;font-family:'Open Sans',sans-serif;transition:border-color 0.2s, color 0.2s"><?php echo esc_html( $p['category']['name'] ); ?></a></div>
				<?php endif; ?>
				<h1 style="font-size:28px;font-weight:700;color:#222;line-height:1.3;font-family:'Open Sans',sans-serif"><?php echo esc_html( $p['title'] ); ?></h1>
				<?php if ( $p['isBestSelling'] ) : ?>
					<div><span style="display:inline-flex;align-items:center;gap:4px;background-color:#FF3F33;color:#FFFFFF;font-size:12px;font-weight:700;padding:4px 10px;border-radius:4px;font-family:'Open Sans',sans-serif">🏅 Best Selling</span></div>
				<?php endif; ?>
				<div class="flex flex-wrap items-center" style="gap:12px">
					<span style="font-size:26px;font-weight:700;color:#800000;font-family:'Open Sans',sans-serif"><?php echo esc_html( sh_format_price( $p['price'] ) ); ?></span>
					<?php if ( $p['compareAtPrice'] ) : ?><span style="font-size:16px;color:#aaa;text-decoration:line-through"><?php echo esc_html( sh_format_price( $p['compareAtPrice'] ) ); ?></span><?php endif; ?>
					<?php if ( $save > 0 ) : ?><span style="background-color:#e8f5e9;color:#2e7d32;font-size:13px;font-weight:600;padding:4px 10px;border-radius:4px;font-family:'Open Sans',sans-serif;border:1px solid #c8e6c9">Save <?php echo (int) $discount; ?>%</span><?php endif; ?>
				</div>

				<?php if ( $oos ) : ?>
					<div style="text-align:center;padding:16px;background-color:#F5F5F5;border-radius:6px;border:1px solid #eee"><p style="color:#888;font-weight:500;font-size:14px">This product is currently out of stock</p></div>
				<?php else :
					$btn = 'display:flex;align-items:center;justify-content:center;gap:8px;height:50px;border-radius:8px;font-size:14px;font-weight:600;border:none;cursor:pointer;width:100%;color:#FFFFFF';
					?>
					<div style="display:flex;flex-direction:column;gap:16px">
						<div style="display:flex;align-items:center;gap:16px">
							<label style="font-size:14px;font-weight:600;color:#222;white-space:nowrap">Quantity:</label>
							<div style="display:flex;align-items:center;border:1px solid #ddd;border-radius:4px;overflow:hidden">
								<button type="button" data-qty-dec aria-label="Decrease quantity" style="width:36px;height:36px;border:none;background-color:#f9f9f9;color:#ccc;cursor:not-allowed;font-size:20px;font-weight:700;border-right:1px solid #ddd;display:flex;align-items:center;justify-content:center" disabled>−</button>
								<span data-qty-val style="width:44px;height:36px;font-weight:600;color:#222;font-size:15px;display:flex;align-items:center;justify-content:center">1</span>
								<button type="button" data-qty-inc aria-label="Increase quantity" style="width:36px;height:36px;border:none;background-color:#f9f9f9;color:#333;cursor:pointer;font-size:20px;font-weight:700;border-left:1px solid #ddd;display:flex;align-items:center;justify-content:center">+</button>
							</div>
						</div>
						<div class="grid grid-cols-2" style="gap:12px">
							<button type="button" data-act="add" class="sh-tap sh-b-cart" style="<?php echo esc_attr( $btn ); ?>"><span data-add-inner style="display:flex;align-items:center;gap:8px;transition:opacity 0.2s"><?php echo sh_icon( 'shopping-cart', 16 ); ?>Add To Cart</span></button>
							<button type="button" data-act="buy" class="sh-tap sh-b-buy" style="<?php echo esc_attr( $btn ); ?>"><?php echo sh_icon( 'shopping-cart', 16 ); ?> Buy Now</button>
							<button type="button" data-act="wa" class="sh-tap sh-b-wa" style="<?php echo esc_attr( $btn ); ?>"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> Order on WhatsApp</button>
							<button type="button" data-act="call" class="sh-tap sh-b-call" style="<?php echo esc_attr( $btn ); ?>"><?php echo sh_icon( 'phone', 16 ); ?> Call For Order</button>
						</div>
					</div>
				<?php endif; ?>
			</div>
		</div>

		<!-- Tabs -->
		<?php
		$rc  = count( $reviews );
		$avg = $rc ? round( array_sum( array_column( $reviews, 'rating' ) ) / $rc, 1 ) : 0;
		$stars = static function ( int $rating, int $size ): string {
			$h = '<span style="display:inline-flex;gap:2px">';
			for ( $v = 1; $v <= 5; $v++ ) {
				$h .= sh_icon( 'star', $size, 'color:' . ( $v <= $rating ? '#f59e0b' : '#ddd' ) . ';fill:' . ( $v <= $rating ? '#f59e0b' : 'none' ) );
			}
			return $h . '</span>';
		};
		?>
		<div style="margin-top:40px" id="sh-tabs" data-product="<?php echo esc_attr( $p['id'] ); ?>">
			<div style="display:flex;border-bottom:2px solid #eee">
				<button type="button" data-tab="description" style="padding:12px 24px;font-size:14px;font-weight:600;color:#800000;margin-bottom:-2px;background:none;border-width:0 0 3px 0;border-style:solid;border-color:#800000;cursor:pointer;font-family:'Open Sans', sans-serif;transition:color 0.2s;white-space:nowrap">Description</button>
				<button type="button" data-tab="reviews" style="padding:12px 24px;font-size:14px;font-weight:400;color:#666;margin-bottom:-2px;background:none;border-width:0 0 3px 0;border-style:solid;border-color:transparent;cursor:pointer;font-family:'Open Sans', sans-serif;transition:color 0.2s;white-space:nowrap">Customer Reviews (<?php echo (int) $rc; ?>)</button>
			</div>
			<div style="background-color:#fff;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px;padding:24px">
				<div data-panel="description">
					<div style="margin-bottom:20px">
						<h3 style="font-size:16px;font-weight:600;color:#222;font-family:'Open Sans', sans-serif;padding-bottom:8px;display:inline-block">Product Details</h3>
						<div style="height:3px;width:48px;background-color:#800000;border-radius:2px;margin-top:-4px"></div>
					</div>
					<?php if ( $p['description'] ) : ?>
						<div class="prose-description" style="font-size:14px;line-height:1.8;color:#444;font-family:'Open Sans', sans-serif"><?php echo wp_kses_post( $p['description'] ); ?></div>
					<?php else : ?>
						<p style="color:#aaa;font-size:14px">No description available.</p>
					<?php endif; ?>
					<?php if ( $p['tags'] ) : ?>
						<div style="margin-top:24px">
							<p style="font-size:13px;font-weight:600;color:#222;margin-bottom:10px;font-family:'Open Sans',sans-serif">Tags</p>
							<div style="display:flex;flex-wrap:wrap;gap:8px">
								<?php foreach ( $p['tags'] as $tag ) : ?>
									<a href="<?php echo esc_url( home_url( '/shop?search=' . rawurlencode( $tag ) ) ); ?>" class="sh-tag">#<?php echo esc_html( $tag ); ?></a>
								<?php endforeach; ?>
							</div>
						</div>
					<?php endif; ?>
				</div>

				<div data-panel="reviews" style="display:none;font-family:'Open Sans',sans-serif">
					<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px">
						<?php if ( $rc > 0 ) : ?>
							<div style="display:flex;align-items:center;gap:10px">
								<span style="font-size:28px;font-weight:700;color:#222"><?php echo esc_html( (string) $avg ); ?></span>
								<div><?php echo $stars( (int) round( $avg ), 16 ); // phpcs:ignore ?><p style="font-size:12px;color:#888;margin-top:2px">Based on <?php echo (int) $rc; ?> review<?php echo $rc > 1 ? 's' : ''; ?></p></div>
							</div>
						<?php else : ?>
							<p style="font-size:14px;color:#888">No reviews yet — be the first to review this product.</p>
						<?php endif; ?>
						<button type="button" data-review-open style="background-color:#800000;color:#fff;font-size:13px;font-weight:600;padding:10px 20px;border-radius:6px;border:none;cursor:pointer;font-family:'Open Sans',sans-serif">✍️ Write a Review</button>
					</div>
					<div data-review-msg style="display:none"></div>
					<form data-review-form style="display:none;border:1px solid #eee;border-radius:8px;padding:20px;margin-bottom:24px;background-color:#fafafa">
						<h4 style="font-size:15px;font-weight:600;color:#222;margin-bottom:16px">Write a Review</h4>
						<div style="margin-bottom:14px">
							<label style="display:block;font-size:13px;font-weight:600;color:#444;margin-bottom:6px">Your Rating *</label>
							<div style="display:flex;gap:4px" data-rating-stars>
								<?php for ( $v = 1; $v <= 5; $v++ ) : ?><button type="button" data-rate="<?php echo $v; ?>" aria-label="<?php echo $v; ?> star<?php echo $v > 1 ? 's' : ''; ?>" style="background:none;border:none;cursor:pointer;padding:2px"><?php echo sh_icon( 'star', 26, 'color:#f59e0b;fill:#f59e0b' ); ?></button><?php endfor; ?>
							</div>
						</div>
						<div style="margin-bottom:14px">
							<label style="display:block;font-size:13px;font-weight:600;color:#444;margin-bottom:6px">Your Name *</label>
							<input type="text" name="name" required minlength="2" maxlength="60" placeholder="e.g. Rahim Uddin" style="width:100%;max-width:360px;padding:10px 12px;border:1px solid #ddd;border-radius:6px;font-size:14px;outline:none;box-sizing:border-box;font-family:'Open Sans',sans-serif">
						</div>
						<div style="margin-bottom:16px">
							<label style="display:block;font-size:13px;font-weight:600;color:#444;margin-bottom:6px">Your Review *</label>
							<textarea name="content" required minlength="5" maxlength="2000" rows="4" placeholder="Share your experience with this product..." style="width:100%;padding:10px 12px;border:1px solid #ddd;border-radius:6px;font-size:14px;outline:none;resize:vertical;box-sizing:border-box;font-family:'Open Sans',sans-serif"></textarea>
						</div>
						<input type="text" name="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">
						<div style="display:flex;gap:10px">
							<button type="submit" data-review-submit style="background-color:#800000;color:#fff;font-size:13px;font-weight:600;padding:10px 24px;border-radius:6px;border:none;cursor:pointer;font-family:'Open Sans',sans-serif">Submit Review</button>
							<button type="button" data-review-cancel style="background-color:#fff;color:#666;font-size:13px;font-weight:600;padding:10px 20px;border-radius:6px;border:1px solid #ddd;cursor:pointer;font-family:'Open Sans',sans-serif">Cancel</button>
						</div>
					</form>
					<?php if ( $rc > 0 ) : ?>
						<div style="display:flex;flex-direction:column;gap:0">
							<?php foreach ( $reviews as $i => $r ) : ?>
								<div style="padding:16px 0;border-top:<?php echo 0 === $i ? '1px solid #eee' : 'none'; ?>;border-bottom:1px solid #eee">
									<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
										<div style="width:36px;height:36px;border-radius:50%;background-color:#800000;color:#fff;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;flex-shrink:0"><?php echo esc_html( mb_strtoupper( mb_substr( $r['name'], 0, 1 ) ) ); ?></div>
										<div>
											<p style="font-size:14px;font-weight:600;color:#222"><?php echo esc_html( $r['name'] ); ?></p>
											<div style="display:flex;align-items:center;gap:8px"><?php echo $stars( (int) $r['rating'], 12 ); // phpcs:ignore ?><span style="font-size:11px;color:#aaa"><?php echo esc_html( sh_format_date_en( $r['createdAt'] ) ); ?></span></div>
										</div>
									</div>
									<p style="font-size:14px;color:#444;line-height:1.7;white-space:pre-line"><?php echo esc_html( $r['content'] ); ?></p>
								</div>
							<?php endforeach; ?>
						</div>
					<?php endif; ?>
				</div>
			</div>
		</div>

		<?php if ( $related ) : ?>
			<div style="margin-top:60px">
				<div class="flex items-end justify-between" style="margin-bottom:24px">
					<div class="relative" style="padding-bottom:10px">
						<h2 style="font-size:22px;font-weight:600;color:#222;font-family:'Open Sans',sans-serif">Related Products</h2>
						<span class="absolute bottom-0 left-0" style="width:48px;height:3px;background-color:#800000;border-radius:2px"></span>
					</div>
					<?php if ( $p['category'] ) : ?><a href="<?php echo esc_url( home_url( '/shop?category=' . rawurlencode( $p['category']['slug'] ) ) ); ?>" class="hover:underline" style="color:#800000;font-size:13px;font-weight:600;text-decoration:none">View All →</a><?php endif; ?>
				</div>
				<div class="grid grid-cols-2 md:grid-cols-4" style="gap:16px">
					<?php foreach ( $related as $rp ) { sh_product_card( $rp ); } ?>
				</div>
			</div>
		<?php endif; ?>
	</div>
</div>

<!-- Sticky Add-to-Cart bar (mobile) -->
<div class="md:hidden fixed left-0 right-0 z-40 flex items-center px-4 py-3" style="bottom:64px;background-color:#FFFFFF;border-top:1px solid #eee;box-shadow:0 -2px 8px rgba(0,0,0,0.08);gap:12px">
	<div class="flex-1 min-w-0">
		<p class="line-clamp-1" style="font-size:12px;color:#888"><?php echo esc_html( $p['title'] ); ?></p>
		<p style="font-weight:700;color:#800000;font-size:15px"><?php echo esc_html( sh_format_price( $p['price'] ) ); ?></p>
	</div>
	<button type="button" data-act="sticky-add"<?php echo $oos ? ' disabled' : ''; ?> style="padding:10px 20px;border-radius:4px;font-weight:600;font-size:13px;border:none;cursor:<?php echo $oos ? 'not-allowed' : 'pointer'; ?>;background-color:<?php echo $oos ? '#F5F5F5' : '#800000'; ?>;color:<?php echo $oos ? '#aaa' : '#FFFFFF'; ?>;flex-shrink:0;display:flex;align-items:center;gap:8px;transition:background-color 0.15s"><?php echo sh_icon( 'shopping-cart', 15 ); ?> Add to Cart</button>
</div>
<?php
get_footer();
