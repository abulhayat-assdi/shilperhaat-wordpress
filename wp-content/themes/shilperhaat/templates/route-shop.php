<?php
/**
 * Shop listing — mirrors app/(public)/shop/page.tsx + components/shop/*.
 */
defined( 'ABSPATH' ) || exit;

$get    = static fn( string $k ) => isset( $_GET[ $k ] ) ? sanitize_text_field( wp_unslash( $_GET[ $k ] ) ) : ''; // phpcs:ignore
$cat    = $get( 'category' );
$sort   = $get( 'sort' ) ?: 'newest';
$minP   = $get( 'minPrice' );
$maxP   = $get( 'maxPrice' );
$search = $get( 'search' );
$page   = max( 1, (int) ( $get( 'page' ) ?: 1 ) );
$limit  = 12;

$res        = SH_Catalog::query( [ 'status' => 'ACTIVE', 'category' => rawurldecode( $cat ), 'sort' => $sort, 'minPrice' => $minP, 'maxPrice' => $maxP, 'search' => $search, 'page' => $page, 'limit' => $limit ] );
$products   = $res['products'];
$total      = $res['total'];
$totalPages = (int) ceil( $total / $limit );
$categories = SH_Catalog::categories();
$activeCat  = null;
foreach ( $categories as $c ) {
	if ( $c['slug'] === rawurldecode( $cat ) ) {
		$activeCat = $c;
	}
}
$hasActive = $cat || $minP || $maxP || $search;
$sortOptions = [ 'newest' => 'Newest First', 'price_asc' => 'Price: Low to High', 'price_desc' => 'Price: High to Low', 'best_selling' => 'Best Selling' ];

/** Filter panel (used by the desktop sidebar and the mobile drawer). $sfx keeps radio groups separate. */
$panel = static function ( string $sfx ) use ( $sort, $cat, $minP, $maxP, $categories, $sortOptions, $hasActive ) {
	?>
	<div class="space-y-5" data-shop-panel>
		<div>
			<h3 class="font-semibold text-sm mb-2" style="color:#1a1208">Sort By</h3>
			<div class="space-y-1.5">
				<?php foreach ( $sortOptions as $v => $l ) : ?>
					<label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="sort<?php echo esc_attr( $sfx ); ?>" value="<?php echo esc_attr( $v ); ?>" data-filter="sort" class="accent-[#800000]"<?php checked( $sort, $v ); ?>><span class="text-sm" style="color:#4a2c0a"><?php echo esc_html( $l ); ?></span></label>
				<?php endforeach; ?>
			</div>
		</div>
		<div>
			<h3 class="font-semibold text-sm mb-2" style="color:#1a1208">Category</h3>
			<div class="space-y-1.5">
				<label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="category<?php echo esc_attr( $sfx ); ?>" value="" data-filter="category" class="accent-[#800000]"<?php checked( ! $cat ); ?>><span class="text-sm" style="color:#4a2c0a">All Categories</span></label>
				<?php foreach ( $categories as $c ) : ?>
					<label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="category<?php echo esc_attr( $sfx ); ?>" value="<?php echo esc_attr( $c['slug'] ); ?>" data-filter="category" class="accent-[#800000]"<?php checked( $cat, $c['slug'] ); ?>><span class="text-sm" style="color:#4a2c0a"><?php echo esc_html( $c['name'] ); ?></span></label>
				<?php endforeach; ?>
			</div>
		</div>
		<div>
			<h3 class="font-semibold text-sm mb-2" style="color:#1a1208">Price Range (৳)</h3>
			<div class="flex items-center gap-2">
				<input type="number" placeholder="Min" value="<?php echo esc_attr( $minP ); ?>" data-filter="minPrice" class="w-full border border-[#e0d0b0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#800000]">
				<span class="text-sm flex-shrink-0" style="color:#7a6045">—</span>
				<input type="number" placeholder="Max" value="<?php echo esc_attr( $maxP ); ?>" data-filter="maxPrice" class="w-full border border-[#e0d0b0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#800000]">
			</div>
		</div>
		<?php if ( $hasActive ) : ?>
			<button type="button" data-shop-clear class="w-full flex items-center justify-center gap-2 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors"><?php echo sh_icon( 'x', 13 ); ?> Clear All Filters</button>
		<?php endif; ?>
	</div>
	<?php
};

$pageUrl = static function ( int $p ) use ( $cat, $sort, $minP, $maxP, $search ): string {
	$q = array_filter( [ 'category' => $cat, 'sort' => ( 'newest' === $sort && ! isset( $_GET['sort'] ) ) ? '' : $sort, 'minPrice' => $minP, 'maxPrice' => $maxP, 'search' => $search ] ); // phpcs:ignore
	$q['page'] = $p;
	return home_url( '/shop?' . http_build_query( $q, '', '&', PHP_QUERY_RFC3986 ) );
};

get_header();
?>
<div class="max-w-7xl mx-auto px-4 md:px-5 py-4 md:py-6" id="sh-shop" data-path="<?php echo esc_url( home_url( '/shop' ) ); ?>">
	<div class="mb-3">
		<h1 style="font-size:clamp(20px, 4vw, 26px);font-weight:700;color:#222831;font-family:'Open Sans', sans-serif"><?php echo esc_html( $activeCat ? $activeCat['name'] : 'All Products' ); ?></h1>
		<p style="color:#888;font-size:13px;margin-top:2px"><?php echo (int) $total; ?> product<?php echo 1 !== $total ? 's' : ''; ?> found</p>
	</div>

	<form method="get" action="<?php echo esc_url( home_url( '/shop' ) ); ?>" class="relative w-full md:max-w-sm">
		<?php echo sh_icon( 'search', 15, 'color:#aaa', 'absolute left-3.5 top-1/2 -translate-y-1/2' ); ?>
		<input type="text" name="search" value="<?php echo esc_attr( $search ); ?>" placeholder="Search products..." class="sh-shop-search" style="width:100%;padding-left:36px;padding-right:14px;padding-top:9px;padding-bottom:9px;border-radius:999px;font-size:13px;color:#333;background-color:#fff;font-family:'Open Sans', sans-serif">
	</form>

	<div class="flex flex-col md:flex-row gap-3 md:gap-6 mt-3 md:mt-5">
		<div class="w-full md:w-56 md:flex-shrink-0">
			<div class="hidden md:block bg-white rounded-xl border border-[#e0d0b0] p-5 sticky top-24">
				<div class="flex items-center gap-2 mb-4"><?php echo sh_icon( 'sliders-horizontal', 15, '', 'text-[#800000]' ); ?><h2 class="font-bold text-sm" style="color:#1a1208">Filters</h2></div>
				<?php $panel( '' ); ?>
			</div>

			<div class="md:hidden flex items-center gap-2">
				<button type="button" data-shop-open class="flex items-center gap-1.5 px-3 py-2 border border-[#e0d0b0] rounded-full text-sm bg-white flex-shrink-0" style="color:#4a2c0a"><?php echo sh_icon( 'filter', 13 ); ?> Filters<?php if ( $hasActive ) : ?><span class="bg-[#800000] text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">!</span><?php endif; ?></button>
				<select data-filter="sort" class="flex-1 border border-[#e0d0b0] rounded-full px-3 py-2 text-sm outline-none bg-white" style="color:#4a2c0a">
					<?php foreach ( $sortOptions as $v => $l ) : ?><option value="<?php echo esc_attr( $v ); ?>"<?php selected( $sort, $v ); ?>><?php echo esc_html( $l ); ?></option><?php endforeach; ?>
				</select>
			</div>

			<div id="sh-shop-drawer" style="display:none">
				<div data-shop-close class="fixed inset-0 bg-black/50 z-50 md:hidden"></div>
				<div class="fixed inset-y-0 right-0 z-[60] w-72 bg-white p-5 overflow-y-auto md:hidden shadow-xl">
					<div class="flex items-center justify-between mb-5"><h2 class="font-bold" style="color:#1a1208">Filters</h2><button type="button" data-shop-close><?php echo sh_icon( 'x', 20, 'color:#7a6045' ); ?></button></div>
					<?php $panel( '-m' ); ?>
					<button type="button" data-shop-close class="mt-6 w-full py-3 rounded-xl font-semibold text-white" style="background-color:#800000">View Results</button>
				</div>
			</div>
		</div>

		<div class="flex-1 min-w-0">
			<?php if ( ! $products ) : ?>
				<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 0;text-align:center">
					<div style="font-size:48px;margin-bottom:16px">🔍</div>
					<h3 style="font-size:18px;font-weight:700;color:#222831;margin-bottom:8px">No products found</h3>
					<p style="font-size:13px;color:#888;max-width:280px"><?php
					if ( $search ) {
						echo esc_html( 'No results for "' . $search . '".' );
					} elseif ( $activeCat ) {
						echo esc_html( 'No products in "' . $activeCat['name'] . '" right now.' );
					} else {
						echo 'No products match the selected filters.';
					}
					?></p>
					<a href="<?php echo esc_url( home_url( '/shop' ) ); ?>" style="margin-top:20px;display:inline-block;background-color:#800000;color:#fff;padding:10px 24px;border-radius:999px;font-size:13px;font-weight:600;text-decoration:none">View All Products</a>
				</div>
			<?php else : ?>
				<div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
					<?php foreach ( $products as $p ) { sh_product_card( $p ); } ?>
				</div>
				<?php if ( $totalPages > 1 ) : ?>
					<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:32px">
						<?php if ( $page > 1 ) : ?><a href="<?php echo esc_url( $pageUrl( $page - 1 ) ); ?>" style="padding:8px 16px;border:1px solid #CCC;border-radius:8px;font-size:13px;color:#222831;text-decoration:none">← Prev</a><?php endif; ?>
						<?php for ( $i = 1; $i <= $totalPages; $i++ ) : if ( abs( $i - $page ) > 2 ) { continue; } $on = $i === $page; ?>
							<a href="<?php echo esc_url( $pageUrl( $i ) ); ?>" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:13px;font-weight:500;text-decoration:none;background-color:<?php echo $on ? '#800000' : 'transparent'; ?>;color:<?php echo $on ? '#fff' : '#222831'; ?>;border:<?php echo $on ? 'none' : '1px solid #CCC'; ?>"><?php echo (int) $i; ?></a>
						<?php endfor; ?>
						<?php if ( $page < $totalPages ) : ?><a href="<?php echo esc_url( $pageUrl( $page + 1 ) ); ?>" style="padding:8px 16px;border:1px solid #CCC;border-radius:8px;font-size:13px;color:#222831;text-decoration:none">Next →</a><?php endif; ?>
					</div>
				<?php endif; ?>
			<?php endif; ?>
		</div>
	</div>
</div>
<?php
get_footer();
