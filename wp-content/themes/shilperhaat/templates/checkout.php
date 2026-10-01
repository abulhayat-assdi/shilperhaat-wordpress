<?php
/**
 * Checkout. Mirrors components/checkout/CheckoutPageClient.tsx; dynamic parts are driven by checkout.js.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
$GLOBALS['sh_head'] = array(
	'title'       => 'Checkout — Shilperhaat',
	'description' => 'Complete your order at Shilperhaat',
	'canonical'   => home_url( '/checkout' ),
);
$input = 'width:100%;height:42px;border:1px solid #e0e0e0;border-radius:6px;padding:0 14px;font-size:14px;background:#fff;color:#333;outline:none;transition:border-color .15s';
$card  = 'class="bg-white rounded-lg mb-4" style="border:1px solid #e8e8e8;padding:20px;box-shadow:none"';
$title = static function ( $text, $extra = '' ) {
	echo '<div class="flex items-center gap-2 mb-4"><h2 style="border-left:3px solid #800000;padding-left:10px;font-size:15px;font-weight:700;color:#222;line-height:1.3">' . esc_html( $text ) . '</h2>' . $extra . '</div>'; // phpcs:ignore
};
get_header();
?>
<div style="background-color:#f7f7f7;min-height:100vh" data-sh-checkout>

	<div data-co-empty hidden class="flex flex-col items-center justify-center py-24 text-center px-4">
		<div class="text-6xl mb-4">🛒</div>
		<h2 class="text-xl font-bold text-[#222] mb-2">Your cart is empty</h2>
		<p class="text-sm mb-6" style="color:#777">Add products to your cart before checking out.</p>
		<a href="<?php echo esc_url( home_url( '/shop' ) ); ?>" class="text-white px-6 py-3 rounded-lg font-semibold transition-colors" style="background-color:#800000">Shop Now</a>
	</div>

	<div data-co-main>
		<div class="text-center pt-6 pb-5">
			<h1 style="font-size:26px;font-weight:700;color:#222;margin-bottom:4px">Checkout</h1>
			<p style="font-size:13px;color:#999"><a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="hover:text-[#800000] transition-colors">Home</a><span class="mx-1.5" style="color:#bbb">&gt;</span><span style="color:#800000">Checkout</span></p>
		</div>

		<div class="max-w-[1200px] mx-auto px-4 pb-8">
			<div class="bg-white flex flex-wrap items-center justify-between gap-3 mb-5" style="border:1px solid #e8e8e8;border-radius:6px;padding:12px 20px">
				<span style="font-size:14px;color:#555">Have any account? please login or register</span>
				<div class="flex gap-2">
					<button type="button" style="border:1px solid #ddd;background:white;color:#333;padding:7px 18px;border-radius:4px;font-size:13px;cursor:pointer">Login</button>
					<button type="button" style="background:#800000;color:white;border:none;padding:7px 18px;border-radius:4px;font-size:13px;font-weight:500;cursor:pointer">Register</button>
				</div>
			</div>

			<form data-co-form novalidate>
				<div class="flex flex-col lg:flex-row gap-5">
					<div class="w-full lg:w-[58%]">
						<div <?php echo $card; // phpcs:ignore ?>>
							<?php $title( 'Order review' ); ?>
							<div class="space-y-4" data-co-items></div>
						</div>

						<div <?php echo $card; // phpcs:ignore ?>>
							<?php $title( 'Shipping Address' ); ?>
							<div class="space-y-3">
								<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<div>
										<input name="customerName" type="text" placeholder="Your Full Name *" class="w-full bg-white text-[#333] text-sm outline-none transition-colors placeholder:text-[#aaa] focus:border-[#800000]" style="<?php echo esc_attr( $input ); ?>">
										<p data-err="customerName" hidden class="text-red-500 text-xs mt-1"></p>
									</div>
									<div>
										<div class="relative">
											<span class="absolute top-1/2 -translate-y-1/2 select-none" style="left:12px;font-size:14px;color:#555;border-right:1px solid #e0e0e0;padding-right:8px;line-height:20px">88</span>
											<input name="phone" type="tel" placeholder="017********" class="w-full bg-white text-[#333] text-sm outline-none transition-colors placeholder:text-[#aaa] focus:border-[#800000]" style="<?php echo esc_attr( $input ); ?>;padding-left:46px">
										</div>
										<p data-err="phone" hidden class="text-red-500 text-xs mt-1"></p>
									</div>
								</div>
								<div>
									<input name="houseAddress" type="text" placeholder="ex: House no. / building / street / area" class="w-full bg-white text-[#333] text-sm outline-none transition-colors placeholder:text-[#aaa] focus:border-[#800000]" style="<?php echo esc_attr( $input ); ?>">
									<p data-err="houseAddress" hidden class="text-red-500 text-xs mt-1"></p>
								</div>
								<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<div>
										<div data-select="district" data-placeholder="Select District *"></div>
										<p data-err="district" hidden class="text-red-500 text-xs mt-1"></p>
									</div>
									<div><div data-select="thana" data-placeholder="Select Thana (Optional)"></div></div>
								</div>
							</div>
						</div>

						<div <?php echo $card; // phpcs:ignore ?>>
							<?php $title( 'Special notes', '<span style="font-size:12px;color:#999">(Optional)</span>' ); ?>
							<textarea name="notes" maxlength="90" placeholder="Any special instructions..." class="w-full outline-none transition-colors resize-y focus:border-[#800000]" style="height:80px;border:1px solid #e0e0e0;border-radius:6px;padding:10px 14px;font-size:14px;color:#333;resize:vertical;display:block"></textarea>
							<p style="font-size:12px;color:#999;margin-top:4px;text-align:right"><span data-co-notes-count>0</span> / 90 characters</p>
						</div>
					</div>

					<div class="w-full lg:w-[42%]">
						<div <?php echo $card; // phpcs:ignore ?>>
							<?php $title( 'Payment method' ); ?>
							<div class="flex items-center gap-3" style="border:1px solid #800000;border-radius:8px;padding:14px 16px;background:#fff8f0">
								<span style="font-size:26px;line-height:1;color:#800000">💵</span>
								<div class="flex-1">
									<p style="font-size:14px;font-weight:700;color:#222;margin-bottom:2px">Cash On Delivery</p>
									<p style="font-size:12px;color:#888">Pay when you receive your order</p>
								</div>
								<span class="flex items-center justify-center flex-shrink-0" style="width:22px;height:22px;border-radius:50%;background:#800000"><svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true"><path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
							</div>
						</div>

						<div class="bg-white mb-4 overflow-hidden" style="border:1px solid #e8e8e8;border-radius:8px">
							<button type="button" data-co-coupon-toggle class="w-full flex items-center justify-between transition-colors" style="padding:12px 16px;font-size:14px;color:#444;cursor:pointer">
								<span>Have any coupon or gift voucher?</span>
								<span data-co-coupon-chevron><?php echo sh_icon( 'chevron-down', 16 ); // phpcs:ignore ?></span>
							</button>
							<div data-co-coupon-body hidden style="padding:12px 16px 16px;border-top:1px solid #f0f0f0"></div>
						</div>

						<div <?php echo $card; // phpcs:ignore ?> data-co-summary></div>

						<div class="bg-white" style="border:1px solid #e8e8e8;border-radius:8px;padding:20px">
							<label class="flex items-start gap-[10px] cursor-pointer mb-4">
								<input type="checkbox" data-co-terms checked class="accent-[#800000] flex-shrink-0" style="width:16px;height:16px;margin-top:2px">
								<span style="font-size:13px;color:#555;line-height:1.5">I have read and agree to the <a class="sh-co-link" href="<?php echo esc_url( home_url( '/terms-of-use' ) ); ?>" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>, <a class="sh-co-link" href="<?php echo esc_url( home_url( '/privacy-policy' ) ); ?>" target="_blank" rel="noopener noreferrer">Privacy Policy</a> &amp; <a class="sh-co-link" href="<?php echo esc_url( home_url( '/refund-policy' ) ); ?>" target="_blank" rel="noopener noreferrer">Refund and Return Policy</a>.</span>
							</label>
							<p data-co-terms-err hidden class="text-red-500 text-xs mb-3">You must accept the terms to continue.</p>
							<p data-co-district-hint class="text-xs mb-3" style="color:#aaa">Please select a district to enable the order button.</p>
							<button type="submit" data-co-submit disabled class="w-full flex items-center justify-center gap-2 transition-colors" style="height:50px;background:#ccc;color:white;border:none;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:0.5px;cursor:not-allowed;margin-top:4px">PLACE ORDER</button>
						</div>
					</div>
				</div>
			</form>
		</div>
	</div>
</div>
<?php
get_footer();
