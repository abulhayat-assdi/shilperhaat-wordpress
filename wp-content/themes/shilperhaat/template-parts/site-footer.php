<?php
/**
 * Footer. Mirrors components/layout/Footer.tsx.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
$layout = sh_layout();
$links  = $layout['footerLinks'];
$logo   = sh_media_url( $layout['logoUrl'] );

// "Shop By" is built from the store's categories; configured links are only a fallback.
$shop_links = array();
foreach ( sh_categories() as $c ) {
	$shop_links[] = array( 'href' => '/shop?category=' . $c->slug, 'label' => $c->name );
}
if ( ! $shop_links ) {
	$shop_links = isset( $links['shop'] ) ? $links['shop'] : array();
}

// Always offer the blog under Information unless the admin already linked it somewhere in the footer.
$has_blog = false;
foreach ( $links as $group ) {
	foreach ( (array) $group as $l ) {
		if ( '/blog' === $l['href'] || 0 === strpos( $l['href'], '/blog?' ) ) {
			$has_blog = true;
		}
	}
}
$info_links = isset( $links['information'] ) ? $links['information'] : array();
if ( ! $has_blog ) {
	$info_links[] = array( 'href' => '/blog', 'label' => 'Blog' );
}

$socials = array_filter( array(
	array( 'href' => $layout['facebookUrl'], 'label' => 'Facebook', 'svg' => '<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>' ),
	array( 'href' => $layout['twitterUrl'], 'label' => 'Twitter', 'svg' => '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>' ),
	array( 'href' => $layout['instagramUrl'], 'label' => 'Instagram', 'svg' => '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>' ),
), static function ( $s ) {
	return ! empty( $s['href'] );
} );

$render_links = static function ( $items ) {
	foreach ( $items as $link ) {
		printf(
			'<li><a class="sh-footer-link" href="%s">%s</a></li>',
			esc_url( sh_url( $link['href'] ) ),
			esc_html( $link['label'] )
		);
	}
};
$copyright = $layout['footerCopyright'] ? $layout['footerCopyright'] : '© ' . gmdate( 'Y' ) . ' ' . $layout['siteName'] . '. All rights reserved.';
?>
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
					<a class="sh-footer-contact" href="<?php echo esc_url( 'https://wa.me/' . $layout['whatsappNumber'] ); ?>" target="_blank" rel="noopener noreferrer"><?php echo sh_icon( 'phone', 13, 'flex-shrink:0' ); // phpcs:ignore ?><span><?php echo esc_html( $layout['phone'] ); ?></span></a>
					<?php if ( $layout['email'] ) : ?>
						<a class="sh-footer-contact" href="<?php echo esc_url( 'mailto:' . $layout['email'] ); ?>"><?php echo sh_icon( 'mail', 13, 'flex-shrink:0' ); // phpcs:ignore ?><span><?php echo esc_html( $layout['email'] ); ?></span></a>
					<?php endif; ?>
					<?php if ( $layout['address'] ) : ?>
						<div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#666"><?php echo sh_icon( 'map-pin', 13, 'flex-shrink:0' ); // phpcs:ignore ?><span><?php echo esc_html( $layout['address'] ); ?></span></div>
					<?php endif; ?>
				</div>

				<div style="display:flex;gap:10px">
					<?php foreach ( $socials as $s ) : ?>
						<a class="sh-social" href="<?php echo esc_url( $s['href'] ); ?>" target="_blank" rel="noopener noreferrer" aria-label="<?php echo esc_attr( $s['label'] ); ?>">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><?php echo $s['svg']; // phpcs:ignore ?></svg>
						</a>
					<?php endforeach; ?>
				</div>
			</div>

			<div>
				<h3 class="sh-footer-heading">Information</h3>
				<ul style="list-style:none;padding:0;margin:0"><?php $render_links( $info_links ); ?></ul>
			</div>
			<div>
				<h3 class="sh-footer-heading">Shop By</h3>
				<ul style="list-style:none;padding:0;margin:0"><?php $render_links( $shop_links ); ?></ul>
			</div>
			<div>
				<h3 class="sh-footer-heading">Support</h3>
				<ul style="list-style:none;padding:0;margin:0"><?php $render_links( isset( $links['support'] ) ? $links['support'] : array() ); ?></ul>
			</div>
			<div>
				<h3 class="sh-footer-heading">Consumer Policy</h3>
				<ul style="list-style:none;padding:0;margin:0"><?php $render_links( isset( $links['policy'] ) ? $links['policy'] : array() ); ?></ul>
			</div>
		</div>
	</div>

	<div style="border-top:1px solid #eee">
		<div class="w-full max-w-7xl mx-auto px-4 md:px-5" style="padding:16px 20px;text-align:center">
			<p style="font-size:12px;color:#999;font-family:'Open Sans',sans-serif"><?php echo esc_html( $copyright ); ?> · Made with ❤️ to support Bangladesh's artisans</p>
		</div>
	</div>
</footer>
