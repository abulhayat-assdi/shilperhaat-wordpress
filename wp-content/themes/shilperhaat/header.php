<?php
/**
 * Storefront header (desktop + mobile). Markup mirrors components/layout/Header.tsx.
 */
defined( 'ABSPATH' ) || exit;

$layout = sh_layout();
$cats   = SH_Catalog::categories();
$logo   = $layout['logoUrl'] ? sh_asset_url( $layout['logoUrl'] ) : '';
$nav    = array_map( static fn( $c ) => [ 'href' => home_url( '/shop?category=' . $c['slug'] ), 'label' => $c['name'] ], $cats );
$logoEl = static function ( int $maxH, int $maxW, int $circle, int $font ) use ( $layout, $logo ) {
	if ( $logo ) {
		echo '<img src="' . esc_url( $logo ) . '" alt="' . esc_attr( $layout['siteName'] ) . '" style="max-height:' . $maxH . 'px;max-width:' . $maxW . 'px;width:auto;height:auto;object-fit:contain;display:block">';
	} else {
		echo '<div style="width:' . $circle . 'px;height:' . $circle . 'px;border-radius:50%;background-color:#800000;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:' . $font . 'px;flex-shrink:0">' . esc_html( $layout['logoLetter'] ) . '</div>';
	}
};
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<?php wp_head(); ?>
</head>
<body class="antialiased overflow-x-hidden">
<div class="flex flex-col min-h-screen" style="background-color:#FAF0E6">

<!-- ═══ DESKTOP HEADER (md and up) ═══ -->
<header class="hidden md:block bg-white" style="box-shadow:0 2px 8px rgba(0,0,0,0.06)">
	<div id="sh-header-mid" class="bg-white" style="border-bottom:1px solid #f0f0f0">
		<div class="max-w-7xl mx-auto px-5" style="height:72px;display:flex;align-items:center;gap:24px">
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>" style="flex-shrink:0;display:flex;align-items:center;gap:10px;text-decoration:none"><?php $logoEl( 48, 160, 44, 20 ); ?></a>

			<form action="<?php echo esc_url( home_url( '/shop' ) ); ?>" method="get" class="sh-search-form" style="flex:1;min-width:0">
				<div class="sh-hsearch">
					<input type="text" name="search" placeholder="Search in..." style="flex:1;min-width:0;outline:none;border:none;padding:0 14px;font-size:14px;color:#333;font-family:'Open Sans',sans-serif;background-color:transparent">
					<button type="submit" aria-label="Search" style="flex-shrink:0;height:100%;padding:0 18px;background-color:#800000;border:none;cursor:pointer;color:#fff;display:flex;align-items:center;justify-content:center"><?php echo sh_icon( 'search', 18 ); ?></button>
				</div>
			</form>

			<div style="display:flex;align-items:center;gap:20px;flex-shrink:0">
				<a href="<?php echo esc_url( home_url( '/track-order' ) ); ?>" class="sh-hicon"><?php echo sh_icon( 'package', 22 ); ?><span class="lbl">Track Order</span></a>
				<a href="<?php echo esc_url( home_url( '/account' ) ); ?>" class="sh-hicon"><?php echo sh_icon( 'user', 22 ); ?><span class="lbl">Sign In</span></a>

				<button type="button" class="sh-hicon" data-sh-open-cart aria-label="Open cart">
					<div style="position:relative"><?php echo sh_icon( 'shopping-cart', 22 ); ?><span class="sh-cart-badge sh-badge-d" data-sh-cart-badge hidden></span></div>
					<span class="lbl">Cart</span>
				</button>

				<div id="sh-more" style="position:relative;flex-shrink:0">
					<button type="button" id="sh-more-btn" class="sh-hicon" aria-expanded="false">
						<span class="sh-more-ico-menu"><?php echo sh_icon( 'menu', 22 ); ?></span>
						<span class="sh-more-ico-x" style="display:none"><?php echo sh_icon( 'x', 22 ); ?></span>
						<span class="lbl">More</span>
					</button>
					<div id="sh-more-menu" style="display:none;position:absolute;right:0;top:calc(100% + 12px);background-color:#fff;border-radius:8px;border:1px solid #eee;box-shadow:0 8px 24px rgba(0,0,0,0.12);min-width:200px;z-index:1000;overflow:hidden">
						<a class="sh-more-item" href="<?php echo esc_url( home_url( '/about' ) ); ?>"><?php echo sh_icon( 'info', 16 ); ?><span>About Us</span></a>
						<a class="sh-more-item" href="<?php echo esc_url( home_url( '/faq' ) ); ?>"><?php echo sh_icon( 'help-circle', 16 ); ?><span>FAQs</span></a>
						<a class="sh-more-item" href="<?php echo esc_attr( sh_format_phone_url( $layout['phone'] ) ); ?>"><?php echo sh_icon( 'phone', 16 ); ?><span>Call Us</span></a>
						<a class="sh-more-item" href="<?php echo esc_url( sh_format_whatsapp_url( $layout['whatsappNumber'] ) ); ?>" target="_blank" rel="noopener noreferrer"><?php echo sh_icon( 'message-circle', 16, 'color:#25D366' ); ?><span>WhatsApp</span></a>
					</div>
				</div>
			</div>
		</div>
	</div>

	<nav id="sh-nav" style="background-color:#041F1E;height:48px;width:100%;position:relative;z-index:10">
		<div class="max-w-7xl mx-auto px-5 h-full overflow-x-auto" style="scrollbar-width:none">
			<ul style="display:flex;align-items:stretch;height:100%;list-style:none;margin:0;padding:0;min-width:max-content">
				<?php foreach ( $nav as $item ) : ?>
					<li style="position:relative;flex-shrink:0"><a class="sh-nav-link" href="<?php echo esc_url( $item['href'] ); ?>"><?php echo esc_html( $item['label'] ); ?></a></li>
				<?php endforeach; ?>
			</ul>
		</div>
	</nav>
</header>

<!-- ═══ MOBILE HEADER (below md) ═══ -->
<header class="md:hidden sticky top-0 z-50 bg-white" style="box-shadow:0 2px 8px rgba(0,0,0,0.08)">
	<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;min-height:52px">
		<button type="button" data-sh-open-menu aria-label="Open menu" style="flex-shrink:0;padding:6px;background:none;border:none;cursor:pointer"><?php echo sh_icon( 'menu', 22, 'color:#333' ); ?></button>
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>" style="flex-shrink:0;display:flex;align-items:center;gap:6px;text-decoration:none"><?php $logoEl( 40, 130, 28, 13 ); ?></a>
		<form action="<?php echo esc_url( home_url( '/shop' ) ); ?>" method="get" class="sh-search-form" style="flex:1;display:flex;align-items:stretch;border:1px solid #ddd;border-radius:4px;overflow:hidden;min-width:0">
			<input type="text" name="search" placeholder="Search..." style="flex:1;min-width:0;outline:none;border:none;padding:6px 12px;font-size:12px;color:#333;font-family:'Open Sans',sans-serif">
			<button type="submit" style="flex-shrink:0;padding:0 10px;background-color:#800000;border:none;cursor:pointer;color:#fff;display:flex;align-items:center"><?php echo sh_icon( 'search', 13 ); ?></button>
		</form>
		<button type="button" data-sh-open-cart aria-label="Cart" style="flex-shrink:0;position:relative;padding:6px;color:#333;background:none;border:none;cursor:pointer"><?php echo sh_icon( 'shopping-cart', 22 ); ?><span class="sh-cart-badge sh-badge-m" data-sh-cart-badge hidden></span></button>
	</div>
	<div class="overflow-x-auto" style="background-color:#041F1E;scrollbar-width:none">
		<div style="display:flex;align-items:center;padding:0 8px;min-width:max-content">
			<?php foreach ( $nav as $item ) : ?>
				<a href="<?php echo esc_url( $item['href'] ); ?>" style="color:white;font-size:12px;font-weight:500;padding:8px 12px;text-decoration:none;white-space:nowrap;flex-shrink:0;font-family:'Open Sans',sans-serif"><?php echo esc_html( $item['label'] ); ?></a>
			<?php endforeach; ?>
		</div>
	</div>
</header>

<!-- pb-16 on mobile for bottom nav -->
<main class="flex-1 pb-16 md:pb-0" style="background-color:#FAF0E6">
