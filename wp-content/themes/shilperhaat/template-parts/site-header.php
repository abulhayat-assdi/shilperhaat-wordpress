<?php
/**
 * Desktop + mobile header, mobile drawer. Markup/inline styles mirror components/layout/Header.tsx.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
$layout = sh_layout();
$cats   = sh_categories();
$logo   = sh_media_url( $layout['logoUrl'] );
$name   = $layout['siteName'];
$letter = $layout['logoLetter'];
$nav    = array();
foreach ( $cats as $c ) {
	$nav[] = array( 'href' => '/shop?category=' . $c->slug, 'label' => $c->name );
}
$badge = static function ( $style ) {
	return '<span data-sh-cart-count hidden style="' . esc_attr( $style ) . '"></span>';
};
?>
<!-- ════════ DESKTOP HEADER (md and up) ════════ -->
<header class="hidden md:block bg-white" style="box-shadow:0 2px 8px rgba(0,0,0,0.06)">
	<div class="bg-white" data-sh-header-middle style="border-bottom:1px solid #f0f0f0">
		<div class="max-w-7xl mx-auto px-5" style="height:72px;display:flex;align-items:center;gap:24px">
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>" style="flex-shrink:0;display:flex;align-items:center;gap:10px;text-decoration:none">
				<?php if ( $logo ) : ?>
					<img src="<?php echo esc_url( $logo ); ?>" alt="<?php echo esc_attr( $name ); ?>" style="max-height:48px;max-width:160px;width:auto;height:auto;object-fit:contain;display:block">
				<?php else : ?>
					<div style="width:44px;height:44px;border-radius:50%;background-color:#800000;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:20px;flex-shrink:0"><?php echo esc_html( $letter ); ?></div>
				<?php endif; ?>
			</a>

			<form data-sh-search action="<?php echo esc_url( home_url( '/shop' ) ); ?>" method="get" style="flex:1;min-width:0">
				<div class="sh-search" style="display:flex;align-items:center;border:1px solid #ddd;border-radius:4px;height:44px;overflow:hidden;background-color:#fff;transition:border-color 0.2s">
					<input type="text" name="search" placeholder="Search in..." autocomplete="off" style="flex:1;min-width:0;outline:none;border:none;padding:0 14px;font-size:14px;color:#333;font-family:'Open Sans',sans-serif;background-color:transparent">
					<button type="submit" aria-label="Search" style="flex-shrink:0;height:100%;padding:0 18px;background-color:#800000;border:none;cursor:pointer;color:#fff;display:flex;align-items:center;justify-content:center"><?php echo sh_icon( 'search', 18 ); // phpcs:ignore ?></button>
				</div>
			</form>

			<div style="display:flex;align-items:center;gap:20px;flex-shrink:0">
				<a href="<?php echo esc_url( home_url( '/track-order' ) ); ?>" class="sh-icon-link" style="display:flex;flex-direction:column;align-items:center;gap:3px;text-decoration:none;flex-shrink:0">
					<?php echo sh_icon( 'package', 22 ); // phpcs:ignore ?><span style="font-size:11px;color:inherit;white-space:nowrap;font-family:'Open Sans',sans-serif">Track Order</span>
				</a>
				<a href="<?php echo esc_url( home_url( '/account' ) ); ?>" class="sh-icon-link" style="display:flex;flex-direction:column;align-items:center;gap:3px;text-decoration:none;flex-shrink:0">
					<?php echo sh_icon( 'user', 22 ); // phpcs:ignore ?><span style="font-size:11px;color:inherit;white-space:nowrap;font-family:'Open Sans',sans-serif">Sign In</span>
				</a>

				<button type="button" data-sh-open-cart aria-label="Open cart" class="sh-icon-link" style="display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;cursor:pointer;padding:0;flex-shrink:0">
					<div style="position:relative">
						<?php echo sh_icon( 'shopping-cart', 22 ); // phpcs:ignore ?>
						<?php echo $badge( 'position:absolute;top:-6px;right:-8px;background-color:#800000;color:#fff;font-size:10px;font-weight:700;width:17px;height:17px;border-radius:50%;align-items:center;justify-content:center' ); // phpcs:ignore ?>
					</div>
					<span style="font-size:11px;color:inherit;white-space:nowrap">Cart</span>
				</button>

				<div data-sh-more style="position:relative;flex-shrink:0">
					<button type="button" data-sh-more-toggle aria-expanded="false" style="display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;cursor:pointer;color:#333;padding:0">
						<span data-sh-more-icon-menu><?php echo sh_icon( 'menu', 22 ); // phpcs:ignore ?></span>
						<span data-sh-more-icon-close hidden><?php echo sh_icon( 'x', 22 ); // phpcs:ignore ?></span>
						<span style="font-size:11px;color:inherit;white-space:nowrap">More</span>
					</button>
					<div data-sh-more-menu hidden style="position:absolute;right:0;top:calc(100% + 12px);background-color:#fff;border-radius:8px;border:1px solid #eee;box-shadow:0 8px 24px rgba(0,0,0,0.12);min-width:200px;z-index:1000;overflow:hidden">
						<a class="sh-more-item" href="<?php echo esc_url( home_url( '/about' ) ); ?>"><?php echo sh_icon( 'info', 16 ); // phpcs:ignore ?><span>About Us</span></a>
						<a class="sh-more-item" href="<?php echo esc_url( home_url( '/blog' ) ); ?>"><?php echo sh_icon( 'book-open', 16 ); // phpcs:ignore ?><span>Blog</span></a>
						<a class="sh-more-item" href="<?php echo esc_url( home_url( '/faq' ) ); ?>"><?php echo sh_icon( 'help-circle', 16 ); // phpcs:ignore ?><span>FAQs</span></a>
						<a class="sh-more-item" href="<?php echo esc_url( sh_phone_url( $layout['phone'] ) ); ?>"><?php echo sh_icon( 'phone', 16 ); // phpcs:ignore ?><span>Call Us</span></a>
						<a class="sh-more-item" href="<?php echo esc_url( sh_whatsapp_url( $layout['whatsappNumber'] ) ); ?>" target="_blank" rel="noopener noreferrer"><?php echo sh_icon( 'message-circle', 16, 'color:#25D366' ); // phpcs:ignore ?><span>WhatsApp</span></a>
					</div>
				</div>
			</div>
		</div>
	</div>

	<nav data-sh-nav style="background-color:#041F1E;height:48px;width:100%;position:relative;z-index:10">
		<div class="max-w-7xl mx-auto px-5 h-full overflow-x-auto" style="scrollbar-width:none">
			<ul style="display:flex;align-items:stretch;height:100%;list-style:none;margin:0;padding:0;min-width:max-content">
				<?php foreach ( $nav as $item ) : ?>
					<li style="position:relative;flex-shrink:0">
						<a class="sh-nav-link" href="<?php echo esc_url( sh_url( $item['href'] ) ); ?>" style="display:flex;align-items:center;gap:4px;height:100%;padding:0 16px;font-size:14px;font-weight:500;font-family:'Open Sans',sans-serif;text-decoration:none;white-space:nowrap;transition:color 0.15s"><?php echo esc_html( $item['label'] ); ?></a>
					</li>
				<?php endforeach; ?>
			</ul>
		</div>
	</nav>
</header>

<!-- ════════ MOBILE HEADER (below md) ════════ -->
<header class="md:hidden sticky top-0 z-50 bg-white" style="box-shadow:0 2px 8px rgba(0,0,0,0.08)">
	<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;min-height:52px">
		<button type="button" data-sh-open-menu aria-label="Open menu" style="flex-shrink:0;padding:6px;background:none;border:none;cursor:pointer"><?php echo sh_icon( 'menu', 22, 'color:#333' ); // phpcs:ignore ?></button>

		<a href="<?php echo esc_url( home_url( '/' ) ); ?>" style="flex-shrink:0;display:flex;align-items:center;gap:6px;text-decoration:none">
			<?php if ( $logo ) : ?>
				<img src="<?php echo esc_url( $logo ); ?>" alt="<?php echo esc_attr( $name ); ?>" style="max-height:40px;max-width:130px;width:auto;height:auto;object-fit:contain;display:block">
			<?php else : ?>
				<div style="width:28px;height:28px;border-radius:50%;background-color:#800000;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:13px"><?php echo esc_html( $letter ); ?></div>
			<?php endif; ?>
		</a>

		<form data-sh-search action="<?php echo esc_url( home_url( '/shop' ) ); ?>" method="get" style="flex:1;display:flex;align-items:stretch;border:1px solid #ddd;border-radius:4px;overflow:hidden;min-width:0">
			<input type="text" name="search" placeholder="Search..." autocomplete="off" style="flex:1;min-width:0;outline:none;border:none;padding:6px 12px;font-size:12px;color:#333;font-family:'Open Sans',sans-serif">
			<button type="submit" aria-label="Search" style="flex-shrink:0;padding:0 10px;background-color:#800000;border:none;cursor:pointer;color:#fff;display:flex;align-items:center"><?php echo sh_icon( 'search', 13 ); // phpcs:ignore ?></button>
		</form>

		<button type="button" data-sh-open-cart aria-label="Cart" style="flex-shrink:0;position:relative;padding:6px;color:#333;background:none;border:none;cursor:pointer">
			<?php echo sh_icon( 'shopping-cart', 22 ); // phpcs:ignore ?>
			<?php echo $badge( 'position:absolute;top:0;right:0;background-color:#800000;color:#fff;font-size:9px;font-weight:700;width:15px;height:15px;border-radius:50%;align-items:center;justify-content:center' ); // phpcs:ignore ?>
		</button>
	</div>

	<div class="overflow-x-auto" style="background-color:#041F1E;scrollbar-width:none">
		<div style="display:flex;align-items:center;padding:0 8px;min-width:max-content">
			<?php foreach ( $nav as $item ) : ?>
				<a href="<?php echo esc_url( sh_url( $item['href'] ) ); ?>" style="color:white;font-size:12px;font-weight:500;padding:8px 12px;text-decoration:none;white-space:nowrap;flex-shrink:0;font-family:'Open Sans',sans-serif"><?php echo esc_html( $item['label'] ); ?></a>
			<?php endforeach; ?>
		</div>
	</div>
</header>

<!-- ════════ MOBILE DRAWER ════════ -->
<div data-sh-menu-backdrop class="fixed inset-0 z-[60]" style="background-color:rgba(0,0,0,0.5);opacity:0;pointer-events:none;transition:opacity 0.2s ease"></div>
<div data-sh-menu class="fixed inset-y-0 left-0 z-[70] flex flex-col bg-white" style="width:80%;max-width:300px;transform:translateX(-100%);transition:transform 0.28s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.28s">
	<div style="background-color:#800000;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0">
		<div style="display:flex;align-items:center;gap:10px">
			<div style="width:34px;height:34px;border-radius:50%;background-color:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:15px">S</div>
			<span style="color:white;font-weight:700;font-size:18px">Shilperhaat</span>
		</div>
		<button type="button" data-sh-close-menu aria-label="Close menu" style="background:none;border:none;color:white;cursor:pointer;padding:4px"><?php echo sh_icon( 'x', 22 ); // phpcs:ignore ?></button>
	</div>

	<a href="<?php echo esc_url( home_url( '/account' ) ); ?>" style="display:flex;align-items:center;gap:14px;padding:14px 20px;background-color:#fff3e0;text-decoration:none;border-bottom:1px solid #eee;flex-shrink:0">
		<div style="width:44px;height:44px;border-radius:50%;background-color:#800000;display:flex;align-items:center;justify-content:center;flex-shrink:0"><?php echo sh_icon( 'user', 22, 'color:white' ); // phpcs:ignore ?></div>
		<div>
			<div style="font-size:14px;font-weight:600;color:#333">Hello there!</div>
			<div style="font-size:13px;color:#800000;font-weight:500">Sign in / Register →</div>
		</div>
	</a>

	<nav style="flex:1;overflow-y:auto">
		<?php foreach ( array_merge( $nav, array( array( 'href' => '/blog', 'label' => 'Blog' ) ) ) as $item ) : ?>
			<a class="sh-mm-link" href="<?php echo esc_url( sh_url( $item['href'] ) ); ?>" style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;text-decoration:none;border-bottom:1px solid #eee;font-size:15px;font-weight:500;transition:background-color 0.15s,color 0.15s">
				<span><?php echo esc_html( $item['label'] ); ?></span>
				<?php echo sh_icon( 'chevron-right', 16, 'color:#bbb;flex-shrink:0' ); // phpcs:ignore ?>
			</a>
		<?php endforeach; ?>

		<div style="padding:20px 20px 8px">
			<p style="font-size:11px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:12px">GET IN TOUCH</p>
			<a href="<?php echo esc_url( sh_whatsapp_url( $layout['whatsappNumber'] ) ); ?>" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;gap:10px;padding:10px 0;color:#25D366;text-decoration:none;font-size:14px;font-weight:500">
				<?php echo sh_icon( 'message-circle', 20 ); // phpcs:ignore ?><span>Chat on WhatsApp</span>
			</a>
		</div>
	</nav>

	<div style="padding:12px 20px;border-top:1px solid #eee;background-color:#f9f9f9;flex-shrink:0">
		<p style="font-size:11px;color:#bbb;text-align:center">© 2025 Shilperhaat. Handcraft Marketplace.</p>
	</div>
</div>
