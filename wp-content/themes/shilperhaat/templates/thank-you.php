<?php
/**
 * Thank-you page. Mirrors app/(public)/thank-you + ThankYouClient (order details come from localStorage "sh_last_order").
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
$GLOBALS['sh_head'] = array(
	'title'       => 'Order Placed Successfully — Shilperhaat',
	'description' => 'Your order has been placed successfully',
	'canonical'   => home_url( '/thank-you' ),
);
get_header();
?>
<div class="max-w-2xl mx-auto px-4 py-10" data-sh-thankyou>
	<div class="flex flex-col items-center text-center mb-8 thankyou-pop">
		<div class="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4"><?php echo sh_icon( 'check-circle', 40, '', 2, 'text-green-600' ); // phpcs:ignore ?></div>
		<h1 class="text-2xl md:text-3xl font-bold text-[#1a1208] mb-2">Order Placed Successfully! 🎉</h1>
		<p class="text-[#7a6045] text-sm">Your order has been received. We will contact you shortly to confirm.</p>
		<div data-ty-number hidden class="mt-3 bg-[#fdf8f3] border border-[#e0d0b0] rounded-xl px-6 py-3">
			<p class="text-xs text-[#7a6045]">Order Number</p>
			<p class="font-bold text-[#800000] text-lg" data-ty-number-text></p>
		</div>
	</div>

	<div data-ty-details></div>

	<div class="flex flex-col sm:flex-row gap-3 mt-8">
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="flex items-center justify-center gap-2 flex-1 bg-[#800000] text-white font-bold py-3.5 rounded-xl hover:bg-[#5C0000] transition-colors"><?php echo sh_icon( 'home', 18 ); // phpcs:ignore ?> Back to Home</a>
		<a href="<?php echo esc_url( home_url( '/shop' ) ); ?>" class="flex items-center justify-center gap-2 flex-1 border-2 border-[#800000] text-[#800000] font-bold py-3.5 rounded-xl hover:bg-[#800000] hover:text-white transition-colors"><?php echo sh_icon( 'shopping-bag', 18 ); // phpcs:ignore ?> Shop More</a>
	</div>
</div>
<?php
get_footer();
