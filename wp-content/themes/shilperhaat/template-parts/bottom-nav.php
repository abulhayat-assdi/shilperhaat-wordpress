<?php
/**
 * Mobile bottom navigation. Mirrors components/layout/BottomNav.tsx.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
$layout   = sh_layout();
$wa_url   = sh_whatsapp_url( $layout['whatsappNumber'] );
$shop_on  = sh_is_active( '/shop' );
$home_on  = sh_is_active( '/' );
$c_on     = '#800000';
$c_off    = '#888888';
?>
<nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#EEEEEE] safe-area-inset-bottom" style="padding-bottom:env(safe-area-inset-bottom)">
	<div class="flex items-center justify-around h-16 px-2">
		<a href="<?php echo esc_url( home_url( '/shop' ) ); ?>" class="flex flex-col items-center gap-0.5 px-2" aria-label="Menu">
			<div class="w-8 h-8 flex items-center justify-center"><?php echo sh_icon( 'menu', 22, 'color:' . ( $shop_on ? $c_on : $c_off ), $shop_on ? 2.5 : 1.75 ); // phpcs:ignore ?></div>
			<span class="text-xs" style="color:<?php echo $shop_on ? $c_on : $c_off; ?>;font-weight:<?php echo $shop_on ? 600 : 400; ?>">Menu</span>
		</a>

		<button type="button" data-sh-open-cart class="flex flex-col items-center gap-0.5 px-2" aria-label="Cart" style="background:none;border:none;cursor:pointer;padding:0 8px">
			<div class="relative w-8 h-8 flex items-center justify-center">
				<span data-sh-cart-icon style="display:flex"><?php echo sh_icon( 'shopping-cart', 22, 'color:#888888', 1.75 ); // phpcs:ignore ?></span>
				<span data-sh-cart-count hidden class="absolute -top-1.5 -right-1.5 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold" style="background-color:#800000"></span>
			</div>
			<span data-sh-cart-label class="text-xs" style="color:#888888;font-weight:400">Cart</span>
		</button>

		<div class="relative flex flex-col items-center">
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="Home">
				<div class="sh-home-btn w-14 h-14 rounded-full shadow-lg flex items-center justify-center -mt-5 border-4 border-white" style="background-color:<?php echo $home_on ? '#800000' : '#041F1E'; ?>;transition:transform 0.1s ease, background-color 0.2s">
					<?php echo sh_icon( 'home', 24, '', 2, 'text-white' ); // phpcs:ignore ?>
				</div>
			</a>
			<span class="text-xs mt-0.5" style="color:#888888">Home</span>
		</div>

		<a href="<?php echo esc_url( $wa_url ); ?>" target="_blank" rel="noopener noreferrer" class="flex flex-col items-center gap-0.5 px-2" aria-label="WhatsApp">
			<div class="w-8 h-8 flex items-center justify-center"><?php echo sh_icon( 'message-circle', 22, '', 2, 'text-[#16a34a]' ); // phpcs:ignore ?></div>
			<span class="text-xs" style="color:#888888">WhatsApp</span>
		</a>

		<button type="button" data-sh-open-contact class="flex flex-col items-center gap-0.5 px-2" aria-label="Contact" style="background:none;border:none;cursor:pointer;padding:0 8px">
			<div class="w-8 h-8 flex items-center justify-center"><?php echo sh_icon( 'message-square', 22, 'color:#888888', 1.75 ); // phpcs:ignore ?></div>
			<span class="text-xs" style="color:#888888">Contact</span>
		</button>
	</div>
</nav>
