<?php
/**
 * Storefront footer, mobile menu, bottom nav and floating contact widget.
 * Mirrors components/layout/{Footer,MobileMenu,BottomNav}.tsx and components/ui/FloatingContact.tsx.
 */
defined( 'ABSPATH' ) || exit;

$layout = sh_layout();
$cats   = SH_Catalog::categories();
$logo   = $layout['logoUrl'] ? sh_asset_url( $layout['logoUrl'] ) : '';
$fl     = $layout['footerLinks'];
$shop   = $cats ? array_map( static fn( $c ) => [ 'href' => '/shop?category=' . $c['slug'], 'label' => $c['name'] ], $cats ) : $fl['shop'];
$href   = static fn( $h ) => str_starts_with( $h, '/' ) ? home_url( $h ) : $h;
$active = static function ( string $name ): bool {
	return SH_Router::name() === $name;
};
$flist  = static function ( array $links ) use ( $href ) {
	foreach ( $links as $l ) {
		echo '<li><a class="sh-flink" href="' . esc_url( $href( $l['href'] ) ) . '">' . esc_html( $l['label'] ) . '</a></li>';
	}
};
$fb = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>';
$ig = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>';
$tw = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';
$socials = array_filter( [
	[ 'href' => $layout['facebookUrl'], 'icon' => $fb, 'label' => 'Facebook' ],
	[ 'href' => $layout['twitterUrl'], 'icon' => $tw, 'label' => 'Twitter' ],
	[ 'href' => $layout['instagramUrl'], 'icon' => $ig, 'label' => 'Instagram' ],
], static fn( $s ) => ! empty( $s['href'] ) );
$copyright = $layout['footerCopyright'] ?: '© ' . gmdate( 'Y' ) . ' ' . $layout['siteName'] . '. All rights reserved.';
$widget    = sh_contact_widget();
?>
</main>

<!-- ═══ FOOTER ═══ -->
<footer style="background-color:#f9f9f9;border-top:1px solid #eee">
	<div class="w-full max-w-7xl mx-auto px-4 md:px-5" style="padding-top:48px;padding-bottom:40px">
		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5" style="gap:32px">
			<div class="col-span-2 md:col-span-3 lg:col-span-1">
				<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
					<?php if ( $logo ) : ?>
						<img src="<?php echo esc_url( $logo ); ?>" alt="<?php echo esc_attr( $layout['siteName'] ); ?>" style="max-height:44px;max-width:140px;width:auto;height:auto;object-fit:contain;display:block">
					<?php else : ?>
						<div style="width:44px;height:44px;border-radius:50%;background-color:#800000;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:20px;flex-shrink:0"><?php echo esc_html( $layout['logoLetter'] ); ?></div>
					<?php endif; ?>
				</div>
				<p style="font-size:13px;color:#666;line-height:1.7;margin-bottom:16px;max-width:240px;font-family:'Open Sans',sans-serif"><?php echo esc_html( $layout['footerDescription'] ); ?></p>
				<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
					<a class="sh-fcontact" href="<?php echo esc_url( sh_format_whatsapp_url( $layout['whatsappNumber'] ) ); ?>" target="_blank" rel="noopener noreferrer"><?php echo sh_icon( 'phone', 13, 'flex-shrink:0' ); ?><span><?php echo esc_html( $layout['phone'] ); ?></span></a>
					<?php if ( $layout['email'] ) : ?>
						<a class="sh-fcontact" href="mailto:<?php echo esc_attr( $layout['email'] ); ?>"><?php echo sh_icon( 'mail', 13, 'flex-shrink:0' ); ?><span><?php echo esc_html( $layout['email'] ); ?></span></a>
					<?php endif; ?>
					<?php if ( $layout['address'] ) : ?>
						<div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#666"><?php echo sh_icon( 'map-pin', 13, 'flex-shrink:0' ); ?><span><?php echo esc_html( $layout['address'] ); ?></span></div>
					<?php endif; ?>
				</div>
				<div style="display:flex;gap:10px">
					<?php foreach ( $socials as $s ) : ?>
						<a class="sh-fsocial" href="<?php echo esc_url( $s['href'] ); ?>" target="_blank" rel="noopener noreferrer" aria-label="<?php echo esc_attr( $s['label'] ); ?>"><?php echo $s['icon']; // phpcs:ignore ?></a>
					<?php endforeach; ?>
				</div>
			</div>

			<div><h3 class="sh-fhead">Information</h3><ul style="list-style:none;padding:0;margin:0"><?php $flist( $fl['information'] ); ?></ul></div>
			<div><h3 class="sh-fhead">Shop By</h3><ul style="list-style:none;padding:0;margin:0"><?php $flist( $shop ); ?></ul></div>
			<div><h3 class="sh-fhead">Support</h3><ul style="list-style:none;padding:0;margin:0"><?php $flist( $fl['support'] ); ?></ul></div>
			<div><h3 class="sh-fhead">Consumer Policy</h3><ul style="list-style:none;padding:0;margin:0"><?php $flist( $fl['policy'] ); ?></ul></div>
		</div>
	</div>
	<div style="border-top:1px solid #eee">
		<div class="w-full max-w-7xl mx-auto px-4 md:px-5" style="padding:16px 20px;text-align:center">
			<p style="font-size:12px;color:#999;font-family:'Open Sans',sans-serif"><?php echo esc_html( $copyright ); ?> · Made with ❤️ to support Bangladesh's artisans</p>
		</div>
	</div>
</footer>

<!-- ═══ BOTTOM NAV (mobile) ═══ -->
<?php $shopActive = $active( 'shop' ); $homeActive = $active( 'home' ); ?>
<nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#EEEEEE] safe-area-inset-bottom" style="padding-bottom:env(safe-area-inset-bottom)">
	<div class="flex items-center justify-around h-16 px-2">
		<a href="<?php echo esc_url( home_url( '/shop' ) ); ?>" class="flex flex-col items-center gap-0.5 px-2" aria-label="Menu">
			<div class="w-8 h-8 flex items-center justify-center"><?php echo sh_icon( 'menu', 22, 'color:' . ( $shopActive ? '#800000' : '#888888' ), '', [ 'stroke-width' => $shopActive ? '2.5' : '1.75' ] ); ?></div>
			<span class="text-xs" style="color:<?php echo $shopActive ? '#800000' : '#888888'; ?>;font-weight:<?php echo $shopActive ? 600 : 400; ?>">Menu</span>
		</a>
		<button type="button" data-sh-open-cart class="flex flex-col items-center gap-0.5 px-2" aria-label="Cart" style="background:none;border:none;cursor:pointer;padding:0 8px">
			<div class="relative w-8 h-8 flex items-center justify-center">
				<span data-sh-bn-cart-icon><?php echo sh_icon( 'shopping-cart', 22, 'color:#888888', '', [ 'stroke-width' => '1.75' ] ); ?></span>
				<span data-sh-cart-badge class="absolute -top-1.5 -right-1.5 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold" style="background-color:#800000" hidden></span>
			</div>
			<span class="text-xs" data-sh-bn-cart-label style="color:#888888;font-weight:400">Cart</span>
		</button>
		<div class="relative flex flex-col items-center">
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="Home">
				<div class="sh-bn-home w-14 h-14 rounded-full shadow-lg flex items-center justify-center -mt-5 border-4 border-white" style="background-color:<?php echo $homeActive ? '#800000' : '#041F1E'; ?>"><?php echo sh_icon( 'home', 24, '', 'text-white' ); ?></div>
			</a>
			<span class="text-xs mt-0.5" style="color:#888888">Home</span>
		</div>
		<a href="<?php echo esc_url( sh_format_whatsapp_url( $layout['whatsappNumber'] ) ); ?>" target="_blank" rel="noopener noreferrer" class="flex flex-col items-center gap-0.5 px-2" aria-label="WhatsApp">
			<div class="w-8 h-8 flex items-center justify-center"><?php echo sh_icon( 'message-circle', 22, '', 'text-[#16a34a]' ); ?></div>
			<span class="text-xs" style="color:#888888">WhatsApp</span>
		</a>
		<button type="button" data-sh-open-contact class="flex flex-col items-center gap-0.5 px-2" aria-label="Contact" style="background:none;border:none;cursor:pointer;padding:0 8px">
			<div class="w-8 h-8 flex items-center justify-center"><?php echo sh_icon( 'message-square', 22, 'color:#888888', '', [ 'stroke-width' => '1.75' ] ); ?></div>
			<span class="text-xs" style="color:#888888">Contact</span>
		</button>
	</div>
</nav>

<!-- ═══ MOBILE MENU DRAWER ═══ -->
<div id="sh-mm-backdrop" class="fixed inset-0 z-[60]" style="background-color:rgba(0,0,0,0.5);opacity:0;pointer-events:none;transition:opacity 0.2s ease"></div>
<div id="sh-mm" class="fixed inset-y-0 left-0 z-[70] flex flex-col bg-white" style="width:80%;max-width:300px;box-shadow:4px 0 24px rgba(0,0,0,0.15);transform:translateX(-100%);transition:transform 0.28s cubic-bezier(0.2, 0, 0, 1)">
	<div style="background-color:#800000;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0">
		<div style="display:flex;align-items:center;gap:10px">
			<div style="width:34px;height:34px;border-radius:50%;background-color:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:15px">S</div>
			<span style="color:white;font-weight:700;font-size:18px">Shilperhaat</span>
		</div>
		<button type="button" data-sh-close-menu aria-label="Close menu" style="background:none;border:none;color:white;cursor:pointer;padding:4px"><?php echo sh_icon( 'x', 22 ); ?></button>
	</div>
	<a href="<?php echo esc_url( home_url( '/account' ) ); ?>" style="display:flex;align-items:center;gap:14px;padding:14px 20px;background-color:#fff3e0;text-decoration:none;border-bottom:1px solid #eee;flex-shrink:0">
		<div style="width:44px;height:44px;border-radius:50%;background-color:#800000;display:flex;align-items:center;justify-content:center;flex-shrink:0"><?php echo sh_icon( 'user', 22, 'color:white' ); ?></div>
		<div><div style="font-size:14px;font-weight:600;color:#333">Hello there!</div><div style="font-size:13px;color:#800000;font-weight:500">Sign in / Register →</div></div>
	</a>
	<nav style="flex:1;overflow-y:auto">
		<?php foreach ( $cats as $c ) : ?>
			<a class="sh-mm-link" href="<?php echo esc_url( home_url( '/shop?category=' . $c['slug'] ) ); ?>"><span><?php echo esc_html( $c['name'] ); ?></span><?php echo sh_icon( 'chevron-right', 16, 'color:#bbb;flex-shrink:0' ); ?></a>
		<?php endforeach; ?>
		<div style="padding:20px 20px 8px">
			<p style="font-size:11px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:12px">GET IN TOUCH</p>
			<a href="<?php echo esc_url( sh_format_whatsapp_url( $layout['whatsappNumber'] ) ); ?>" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;gap:10px;padding:10px 0;color:#25D366;text-decoration:none;font-size:14px;font-weight:500"><?php echo sh_icon( 'message-circle', 20 ); ?><span>Chat on WhatsApp</span></a>
		</div>
	</nav>
	<div style="padding:12px 20px;border-top:1px solid #eee;background-color:#f9f9f9;flex-shrink:0"><p style="font-size:11px;color:#bbb;text-align:center">© 2025 Shilperhaat. Handcraft Marketplace.</p></div>
</div>

<?php if ( ! empty( $widget['widgetEnabled'] ) ) :
	$left    = 'bottom-left' === $widget['buttonPosition'];
	$wa      = '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
	$ms      = '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.13 3.26L19.752 8l-6.561 6.963z"/></svg>';
	$contacts = [
		[ 'WhatsApp', 'Chat with us on WhatsApp', $widget['whatsappUrl'], '#25D366', $wa, true ],
		[ 'Call Us', 'Talk to our team directly', 'tel:' . $widget['phoneNumber'], '#1a73e8', sh_icon( 'phone', 18 ), false ],
		[ 'Messenger', 'Message us on Facebook', $widget['messengerUrl'], '#0084FF', $ms, true ],
		[ 'Email Us', 'Send us an email', 'mailto:' . $widget['emailAddress'], '#EA4335', sh_icon( 'mail', 18 ), false ],
	];
	?>
<div id="sh-fc" class="fixed bottom-6 z-[9999] <?php echo $left ? 'left-6 right-auto' : 'right-6 left-auto'; ?>" data-open="0">
	<div class="sh-fc-pop absolute bottom-16 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden" style="display:none;right:<?php echo $left ? 'auto' : '0'; ?>;left:<?php echo $left ? '0' : 'auto'; ?>;animation:contactPopIn 0.2s ease-out">
		<div class="relative px-5 pt-5 pb-6" style="background:linear-gradient(135deg, #800000 0%, #5C0000 100%)">
			<button type="button" data-sh-close-contact class="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors" aria-label="Close"><?php echo sh_icon( 'x', 14 ); ?></button>
			<div class="flex items-center gap-3 mb-3">
				<?php if ( $logo ) : ?>
					<img src="<?php echo esc_url( $logo ); ?>" alt="<?php echo esc_attr( $layout['siteName'] ); ?>" style="height:36px;width:auto;max-width:100px;object-fit:contain">
				<?php else : ?>
					<div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg"><?php echo esc_html( $layout['logoLetter'] ?: 'S' ); ?></div>
				<?php endif; ?>
				<div>
					<div class="font-bold text-white text-sm"><?php echo esc_html( $layout['siteName'] ?: 'Shilperhaat' ); ?></div>
					<div class="text-white/80 text-xs"><?php echo esc_html( $layout['tagline'] ?: 'Handcraft Marketplace' ); ?></div>
				</div>
			</div>
			<p class="text-white font-semibold text-base"><?php echo esc_html( $widget['welcomeMessage'] ); ?></p>
		</div>
		<div class="py-2">
			<?php foreach ( $contacts as $c ) : ?>
				<a href="<?php echo esc_url( $c[2], [ 'http', 'https', 'tel', 'mailto' ] ); ?>"<?php echo $c[5] ? ' target="_blank"' : ''; ?> rel="noopener noreferrer" class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
					<div class="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0" style="background:<?php echo esc_attr( $c[3] ); ?>"><?php echo $c[4]; // phpcs:ignore ?></div>
					<div class="flex-1 min-w-0"><div class="font-semibold text-gray-800 text-sm"><?php echo esc_html( $c[0] ); ?></div><div class="text-gray-400 text-xs"><?php echo esc_html( $c[1] ); ?></div></div>
					<?php echo sh_icon( 'chevron-right', 16, '', 'text-gray-300 flex-shrink-0' ); ?>
				</a>
			<?php endforeach; ?>
		</div>
		<div class="px-4 py-3 border-t border-gray-100 text-center"><p class="text-gray-400 text-xs">We usually reply within a few minutes</p></div>
	</div>
	<button type="button" data-sh-toggle-contact aria-label="Contact us" class="sh-fc-btn relative hidden md:flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95" style="width:60px;height:60px;background:none;border:none;padding:0">
		<span class="sh-fc-pulse absolute inset-0" style="border-radius:50% 50% 50% 12px / 50% 50% 50% 12px;background:#800000;animation:contactPulse 2s ease-out infinite;opacity:0"></span>
		<span class="sh-fc-blob absolute inset-0 flex items-center justify-center" style="background:linear-gradient(135deg, #800000 0%, #5C0000 100%);border-radius:50% 50% 12px 50%;transition:border-radius 0.25s ease;box-shadow:0 4px 18px rgba(128,0,0,0.55)"></span>
		<span class="relative z-10 flex items-center justify-center">
			<span class="sh-fc-ico-x" style="display:none"><?php echo sh_icon( 'x', 22, '', '', [ 'stroke-width' => '2.5' ] ); ?></span>
			<svg class="sh-fc-ico-chat" width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M13 2C7.477 2 3 6.03 3 11c0 2.56 1.13 4.87 2.96 6.52L5 23l5.55-2.46C11 20.84 12 21 13 21c5.523 0 10-4.03 10-9s-4.477-9-10-9z" fill="white" fill-opacity="0.95"/><circle cx="9" cy="11" r="1.4" fill="#800000"/><circle cx="13" cy="11" r="1.4" fill="#800000"/><circle cx="17" cy="11" r="1.4" fill="#800000"/></svg>
		</span>
	</button>
</div>
<?php endif; ?>

</div>
<div id="sh-toasts" class="fixed bottom-20 right-4 z-[9999] flex flex-col gap-2 md:bottom-6 md:right-6"></div>
<?php wp_footer(); ?>
</body>
</html>
