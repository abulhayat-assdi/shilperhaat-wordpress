<?php
/**
 * Track order. Mirrors app/(public)/track-order + TrackOrderClient (results rendered by track.js).
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
$GLOBALS['sh_head'] = array(
	'title'       => 'Track Your Order — Shilperhaat',
	'description' => 'Track your order status with real-time updates on your shipment progress.',
	'canonical'   => home_url( '/track-order' ),
);
// phpcs:ignore WordPress.Security.NonceVerification
$initial = isset( $_GET['order'] ) ? sanitize_text_field( wp_unslash( $_GET['order'] ) ) : '';
get_header();
?>
<div class="min-h-screen" style="background-color:#FAF0E6" data-sh-track>
	<div class="bg-white border-b border-gray-100 shadow-sm">
		<div class="max-w-5xl mx-auto px-4 py-8 md:py-10">
			<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
				<div>
					<div class="flex items-center gap-2 mb-2">
						<span class="w-2 h-2 rounded-full bg-[#800000] animate-pulse"></span>
						<span class="text-xs font-semibold text-[#800000] tracking-widest uppercase">Live Order Tracking</span>
					</div>
					<h1 class="text-3xl md:text-4xl font-bold text-[#1a1208]">Track Your Order</h1>
					<p class="text-[#7a6045] mt-1 text-sm md:text-base">Real-time updates on your shipment progress</p>
				</div>
				<form data-track-form class="flex gap-2 w-full md:w-auto">
					<div class="relative flex-1 md:w-72">
						<?php echo sh_icon( 'search', 16, '', 2, 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' ); // phpcs:ignore ?>
						<input type="text" data-track-input value="<?php echo esc_attr( $initial ); ?>" placeholder="Enter order number..." class="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#800000]/30 focus:border-[#800000] bg-gray-50">
					</div>
					<button type="submit" data-track-btn class="px-5 py-3 bg-[#800000] text-white font-semibold rounded-xl text-sm hover:bg-[#5C0000] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"><span data-track-btn-icon><?php echo sh_icon( 'search', 16 ); // phpcs:ignore ?></span> Search</button>
				</form>
			</div>
		</div>
	</div>

	<div class="max-w-5xl mx-auto px-4 py-8" data-track-result>
		<div class="flex flex-col items-center justify-center py-16 text-center">
			<div class="w-20 h-20 rounded-full bg-[#f0e8d8] flex items-center justify-center mb-5"><?php echo sh_icon( 'package', 36, 'color:#800000' ); // phpcs:ignore ?></div>
			<h2 class="text-lg font-bold text-[#1a1208] mb-2">Enter Your Order Number</h2>
			<p class="text-[#7a6045] text-sm max-w-xs">Type your order number (e.g. SH26052812345) in the search box above to see your order status.</p>
		</div>
	</div>
</div>
<?php
get_footer();
