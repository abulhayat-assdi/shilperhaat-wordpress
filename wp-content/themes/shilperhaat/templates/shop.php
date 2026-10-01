<?php
/**
 * Shop listing. Mirrors app/(public)/shop/page.tsx + ShopFilters + SearchBar.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
// phpcs:disable WordPress.Security.NonceVerification
$q        = static function ( $k, $d = '' ) {
	return isset( $_GET[ $k ] ) ? sanitize_text_field( wp_unslash( $_GET[ $k ] ) ) : $d;
};
$cat_slug = $q( 'category' );
$sort     = $q( 'sort', 'newest' );
$min      = $q( 'minPrice' );
$max      = $q( 'maxPrice' );
$search   = $q( 'search' );
$page     = max( 1, (int) $q( 'page', '1' ) );
$limit    = 12;

$res        = sh_query_products( array( 'category' => $cat_slug, 'min' => $min, 'max' => $max, 'search' => $search, 'sort' => $sort, 'page' => $page, 'limit' => $limit ) );
$products   = $res['products'];
$total      = $res['total'];
$total_pages = (int) ceil( $total / $limit );
$categories = sh_categories();
$active_cat = null;
foreach ( $categories as $c ) {
	if ( $c->slug === $cat_slug ) {
		$active_cat = $c;
	}
}
$has_active = $cat_slug || $min || $max || $search;
$sort_opts  = array( 'newest' => 'Newest First', 'price_asc' => 'Price: Low to High', 'price_desc' => 'Price: High to Low', 'best_selling' => 'Best Selling' );

$shop_title = $active_cat ? $active_cat->name : 'All Products';
$GLOBALS['sh_head'] = array(
	'title'       => 'All Products — Shilperhaat',
	'description' => "Browse Shilperhaat's full collection of hand-woven Katha, Chadar, Blankets & Nakshi Katha.",
	'canonical'   => home_url( '/shop' ),
);

/** One filter panel (rendered for the desktop sidebar and the mobile drawer; radio names are scoped per instance). */
$render_panel = static function ( $scope ) use ( $sort_opts, $sort, $categories, $cat_slug, $min, $max, $has_active ) {
	?>
	<div class="space-y-5" data-sh-filters>
		<div>
			<h3 class="font-semibold text-sm mb-2" style="color:#1a1208">Sort By</h3>
			<div class="space-y-1.5">
				<?php foreach ( $sort_opts as $val => $label ) : ?>
					<label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="sort_<?php echo esc_attr( $scope ); ?>" value="<?php echo esc_attr( $val ); ?>" data-sh-filter="sort" <?php checked( $sort, $val ); ?> class="accent-[#800000]"><span class="text-sm" style="color:#4a2c0a"><?php echo esc_html( $label ); ?></span></label>
				<?php endforeach; ?>
			</div>
		</div>
		<div>
			<h3 class="font-semibold text-sm mb-2" style="color:#1a1208">Category</h3>
			<div class="space-y-1.5">
				<label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="category_<?php echo esc_attr( $scope ); ?>" value="" data-sh-filter="category" <?php checked( ! $cat_slug ); ?> class="accent-[#800000]"><span class="text-sm" style="color:#4a2c0a">All Categories</span></label>
				<?php foreach ( $categories as $c ) : ?>
					<label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="category_<?php echo esc_attr( $scope ); ?>" value="<?php echo esc_attr( $c->slug ); ?>" data-sh-filter="category" <?php checked( $cat_slug, $c->slug ); ?> class="accent-[#800000]"><span class="text-sm" style="color:#4a2c0a"><?php echo esc_html( $c->name ); ?></span></label>
				<?php endforeach; ?>
			</div>
		</div>
		<div>
			<h3 class="font-semibold text-sm mb-2" style="color:#1a1208">Price Range (৳)</h3>
			<div class="flex items-center gap-2">
				<input type="number" placeholder="Min" value="<?php echo esc_attr( $min ); ?>" data-sh-filter="minPrice" data-sh-filter-debounce class="w-full border border-[#e0d0b0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#800000]">
				<span class="text-sm flex-shrink-0" style="color:#7a6045">—</span>
				<input type="number" placeholder="Max" value="<?php echo esc_attr( $max ); ?>" data-sh-filter="maxPrice" data-sh-filter-debounce class="w-full border border-[#e0d0b0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#800000]">
			</div>
		</div>
		<?php if ( $has_active ) : ?>
			<a href="<?php echo esc_url( home_url( '/shop' ) ); ?>" class="w-full flex items-center justify-center gap-2 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors"><?php echo sh_icon( 'x', 13 ); // phpcs:ignore ?> Clear All Filters</a>
		<?php endif; ?>
	</div>
	<?php
};

$build_url = static function ( $pg ) {
	$params = array();
	foreach ( array( 'category', 'sort', 'minPrice', 'maxPrice', 'search' ) as $k ) {
		if ( isset( $_GET[ $k ] ) && '' !== $_GET[ $k ] ) {
			$params[ $k ] = sanitize_text_field( wp_unslash( $_GET[ $k ] ) );
		}
	}
	$params['page'] = $pg;
	return home_url( '/shop?' . http_build_query( $params ) );
};

get_header();
?>
<div class="max-w-7xl mx-auto px-4 md:px-5 py-4 md:py-6">

	<div class="mb-3">
		<h1 style="font-size:clamp(20px, 4vw, 26px);font-weight:700;color:#222831;font-family:'Open Sans',sans-serif"><?php echo esc_html( $shop_title ); ?></h1>
		<p style="color:#888;font-size:13px;margin-top:2px"><?php echo (int) $total; ?> product<?php echo 1 !== $total ? 's' : ''; ?> found</p>
	</div>

	<form method="get" class="relative w-full md:max-w-sm">
		<?php echo sh_icon( 'search', 15, 'color:#aaa', 2, 'absolute left-3.5 top-1/2 -translate-y-1/2' ); // phpcs:ignore ?>
		<input type="text" name="search" value="<?php echo esc_attr( $search ); ?>" placeholder="Search products..." class="sh-shop-search" style="width:100%;padding-left:36px;padding-right:14px;padding-top:9px;padding-bottom:9px;border-radius:999px;border:1px solid #CCC;outline:none;font-size:13px;color:#333;background-color:#fff;font-family:'Open Sans',sans-serif">
	</form>

	<div class="flex flex-col md:flex-row gap-3 md:gap-6 mt-3 md:mt-5">
		<div class="w-full md:w-56 md:flex-shrink-0">
			<div class="hidden md:block bg-white rounded-xl border border-[#e0d0b0] p-5 sticky top-24">
				<div class="flex items-center gap-2 mb-4"><?php echo sh_icon( 'sliders-horizontal', 15, '', 2, 'text-[#800000]' ); // phpcs:ignore ?><h2 class="font-bold text-sm" style="color:#1a1208">Filters</h2></div>
				<?php $render_panel( 'd' ); ?>
			</div>

			<div class="md:hidden flex items-center gap-2">
				<button type="button" data-sh-open-filters class="flex items-center gap-1.5 px-3 py-2 border border-[#e0d0b0] rounded-full text-sm bg-white flex-shrink-0" style="color:#4a2c0a"><?php echo sh_icon( 'filter', 13 ); // phpcs:ignore ?> Filters<?php echo $has_active ? '<span class="bg-[#800000] text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">!</span>' : ''; ?></button>
				<select data-sh-filter="sort" class="flex-1 border border-[#e0d0b0] rounded-full px-3 py-2 text-sm outline-none bg-white" style="color:#4a2c0a">
					<?php foreach ( $sort_opts as $val => $label ) : ?><option value="<?php echo esc_attr( $val ); ?>" <?php selected( $sort, $val ); ?>><?php echo esc_html( $label ); ?></option><?php endforeach; ?>
				</select>
			</div>

			<div data-sh-filter-backdrop hidden class="fixed inset-0 bg-black/50 z-50 md:hidden"></div>
			<div data-sh-filter-drawer hidden class="fixed inset-y-0 right-0 z-[60] w-72 bg-white p-5 overflow-y-auto md:hidden shadow-xl">
				<div class="flex items-center justify-between mb-5">
					<h2 class="font-bold" style="color:#1a1208">Filters</h2>
					<button type="button" data-sh-close-filters><?php echo sh_icon( 'x', 20, 'color:#7a6045' ); // phpcs:ignore ?></button>
				</div>
				<?php $render_panel( 'm' ); ?>
				<button type="button" data-sh-close-filters class="mt-6 w-full py-3 rounded-xl font-semibold text-white" style="background-color:#800000">View Results</button>
			</div>
		</div>

		<div class="flex-1 min-w-0">
			<?php if ( ! $products ) : ?>
				<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 0;text-align:center">
					<div style="font-size:48px;margin-bottom:16px">🔍</div>
					<h3 style="font-size:18px;font-weight:700;color:#222831;margin-bottom:8px">No products found</h3>
					<p style="font-size:13px;color:#888;max-width:280px"><?php
					if ( $search ) {
						echo esc_html( sprintf( 'No results for "%s".', $search ) );
					} elseif ( $active_cat ) {
						echo esc_html( sprintf( 'No products in "%s" right now.', $active_cat->name ) );
					} else {
						echo 'No products match the selected filters.';
					}
					?></p>
					<a href="<?php echo esc_url( home_url( '/shop' ) ); ?>" style="margin-top:20px;display:inline-block;background-color:#800000;color:#fff;padding:10px 24px;border-radius:999px;font-size:13px;font-weight:600;text-decoration:none">View All Products</a>
				</div>
			<?php else : ?>
				<div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
					<?php foreach ( $products as $p ) { get_template_part( 'template-parts/product-card', null, array( 'product' => $p ) ); } ?>
				</div>
				<?php if ( $total_pages > 1 ) : ?>
					<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:32px">
						<?php if ( $page > 1 ) : ?><a href="<?php echo esc_url( $build_url( $page - 1 ) ); ?>" style="padding:8px 16px;border:1px solid #CCC;border-radius:8px;font-size:13px;color:#222831;text-decoration:none">← Prev</a><?php endif; ?>
						<?php for ( $i = 1; $i <= $total_pages; $i++ ) : if ( abs( $i - $page ) > 2 ) { continue; } $cur = $i === $page; ?>
							<a href="<?php echo esc_url( $build_url( $i ) ); ?>" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:13px;font-weight:500;text-decoration:none;background-color:<?php echo $cur ? '#800000' : 'transparent'; ?>;color:<?php echo $cur ? '#fff' : '#222831'; ?>;border:<?php echo $cur ? 'none' : '1px solid #CCC'; ?>"><?php echo (int) $i; ?></a>
						<?php endfor; ?>
						<?php if ( $page < $total_pages ) : ?><a href="<?php echo esc_url( $build_url( $page + 1 ) ); ?>" style="padding:8px 16px;border:1px solid #CCC;border-radius:8px;font-size:13px;color:#222831;text-decoration:none">Next →</a><?php endif; ?>
					</div>
				<?php endif; ?>
			<?php endif; ?>
		</div>
	</div>
</div>
<?php
get_footer();
