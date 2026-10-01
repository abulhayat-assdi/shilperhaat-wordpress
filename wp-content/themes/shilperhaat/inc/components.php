<?php
/**
 * Small reusable template helpers (ports of the shared React components).
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Section header: title + underline + "View All →" link (CategorySection / TopSellingSection style). */
function sh_section_header( $title, $href, $link_label = 'View All', $color = '#222831', $subtitle = '' ) {
	?>
	<div class="flex items-end justify-between" style="margin-bottom:24px">
		<div class="relative" style="padding-bottom:10px">
			<h2 style="font-size:22px;font-weight:600;color:<?php echo esc_attr( $color ); ?>;font-family:'Open Sans',sans-serif"><?php echo esc_html( $title ); ?></h2>
			<span class="absolute bottom-0 left-0" style="width:48px;height:3px;background-color:#800000;border-radius:2px"></span>
		</div>
		<a href="<?php echo esc_url( sh_url( $href ) ); ?>" class="flex items-center gap-1 transition-all duration-200 hover:gap-2" style="color:#800000;font-size:13px;font-weight:600;text-decoration:none;font-family:'Open Sans',sans-serif"><?php echo esc_html( $link_label ); ?> <?php echo sh_icon( 'arrow-right', 14 ); // phpcs:ignore ?></a>
	</div>
	<?php
}

/** Data attribute payload read by theme.js "add to cart" (same shape as the original CartItem minus quantity). */
function sh_cart_payload( $product ) {
	$img = ! empty( $product->images ) ? $product->images[0]->image_url : '';
	return array(
		'id'             => $product->id,
		'productId'      => $product->id,
		'title'          => $product->title,
		'price'          => (float) $product->price,
		'compareAtPrice' => $product->compare_at_price ? (float) $product->compare_at_price : null,
		'image'          => sh_image_url( $img ),
		'stock'          => (int) $product->stock,
		'slug'           => $product->slug,
	);
}

/** Renders the 404 template and stops (Next.js notFound()). */
function sh_not_found() {
	include SH_THEME_DIR . '/templates/404.php';
	exit;
}

/** Plain-text excerpt for meta descriptions (description.slice(0,160) in the original). */
function sh_meta_excerpt( $html, $len = 160 ) {
	$t = trim( preg_replace( '/\s+/', ' ', wp_strip_all_tags( html_entity_decode( (string) $html ) ) ) );
	return mb_substr( $t, 0, $len );
}

/**
 * HTML allowed in admin-authored rich text (product descriptions, CMS pages, blog posts).
 * The original rendered this HTML with DOMPurify; wp_kses with a permissive list is the equivalent.
 */
function sh_allowed_html() {
	$attrs = array( 'class' => true, 'style' => true, 'id' => true, 'title' => true, 'dir' => true, 'lang' => true );
	$tags  = array( 'p', 'br', 'div', 'span', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'ins', 'sub', 'sup', 'small', 'mark',
		'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'hr', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'figure', 'figcaption' );
	$out   = array();
	foreach ( $tags as $t ) {
		$out[ $t ] = $attrs;
	}
	$out['font']   = $attrs + array( 'color' => true, 'size' => true, 'face' => true );
	$out['a']      = $attrs + array( 'href' => true, 'target' => true, 'rel' => true );
	$out['img']    = $attrs + array( 'src' => true, 'alt' => true, 'width' => true, 'height' => true, 'loading' => true );
	$out['iframe'] = $attrs + array( 'src' => true, 'width' => true, 'height' => true, 'allow' => true, 'allowfullscreen' => true, 'frameborder' => true );
	return $out;
}

/** Product + breadcrumb JSON-LD (same shape as the original product page). */
function sh_product_jsonld( $product, $reviews ) {
	$url    = home_url( '/product/' . $product->slug );
	$images = array();
	foreach ( $product->images as $i ) {
		$images[] = sh_image_url( $i->image_url );
	}
	$count = count( $reviews );
	$prod  = array(
		'@context' => 'https://schema.org',
		'@type'    => 'Product',
		'name'     => $product->title,
		'brand'    => array( '@type' => 'Brand', 'name' => 'Shilperhaat' ),
		'offers'   => array(
			'@type'         => 'Offer',
			'url'           => $url,
			'priceCurrency' => 'BDT',
			'price'         => number_format( (float) $product->price, 2, '.', '' ),
			'availability'  => $product->stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
		),
	);
	if ( $product->description ) {
		$prod['description'] = $product->description;
	}
	if ( $images ) {
		$prod['image'] = $images;
	}
	if ( $product->sku ) {
		$prod['sku'] = $product->sku;
	}
	if ( $product->category ) {
		$prod['category'] = $product->category->name;
	}
	if ( $count ) {
		$avg                     = array_sum( wp_list_pluck( $reviews, 'rating' ) ) / $count;
		$prod['aggregateRating'] = array( '@type' => 'AggregateRating', 'ratingValue' => number_format( $avg, 1, '.', '' ), 'reviewCount' => $count );
	}
	$items   = array(
		array( '@type' => 'ListItem', 'position' => 1, 'name' => 'Home', 'item' => home_url( '/' ) ),
		array( '@type' => 'ListItem', 'position' => 2, 'name' => 'Products', 'item' => home_url( '/shop' ) ),
	);
	$pos = 3;
	if ( $product->category ) {
		$items[] = array( '@type' => 'ListItem', 'position' => $pos++, 'name' => $product->category->name, 'item' => home_url( '/shop?category=' . $product->category->slug ) );
	}
	$items[] = array( '@type' => 'ListItem', 'position' => $pos, 'name' => $product->title, 'item' => $url );
	return array( $prod, array( '@context' => 'https://schema.org', '@type' => 'BreadcrumbList', 'itemListElement' => $items ) );
}

/** Sanitised rich text with legacy "/uploads/..." references mapped to the WordPress uploads folder. */
function sh_rich_html( $html ) {
	$html = wp_kses( (string) $html, sh_allowed_html() );
	$base = untrailingslashit( sh_media_url( '/uploads/x' ) );
	$base = substr( $base, 0, -1 ); // ".../shilperhaat/" without the dummy "x"
	return preg_replace( '#(src|href)=(["\'])/uploads/#i', '$1=$2' . $base, $html );
}
