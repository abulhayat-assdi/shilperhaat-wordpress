<?php
defined( 'ABSPATH' ) || exit;

/**
 * Head tags (title/description/OG/JSON-LD/icons), sitemap.xml, robots.txt and the web manifest.
 * Mirrors app/layout.tsx, app/sitemap.ts, app/robots.ts and app/manifest.ts of the original app.
 */
class SH_Seo {

	const DEFAULT_DESC = "Shop Bangladesh's best handcraft textiles — Katha, Chadar, Blankets, Nakshi Katha and much more at Shilperhaat.";

	public static function init(): void {
		add_filter( 'pre_get_document_title', [ self::class, 'title' ] );
		remove_action( 'wp_head', 'wp_generator' );
		remove_action( 'wp_head', 'rsd_link' );
		remove_action( 'wp_head', 'wlwmanifest_link' );
		remove_action( 'wp_head', 'wp_shortlink_wp_head' );
		remove_action( 'wp_head', 'rest_output_link_wp_head' );
		remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );
		remove_action( 'wp_head', 'feed_links', 2 );
		remove_action( 'wp_head', 'feed_links_extra', 3 );
		remove_action( 'wp_head', 'wp_resource_hints', 2 );
		remove_action( 'wp_head', 'wp_robots' );
		remove_action( 'wp_head', 'rel_canonical' );
		remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
		remove_action( 'wp_print_styles', 'print_emoji_styles' );
		add_action( 'wp_head', [ self::class, 'head' ], 1 );
	}

	public static function site_url(): string {
		return untrailingslashit( home_url() );
	}

	public static function site_name(): string {
		$n = sh_setting( 'siteName', 'Shilperhaat' );
		return $n ?: 'Shilperhaat';
	}

	/** Per-route meta: title (without the "| site" suffix), description, canonical path, og overrides. */
	public static function meta(): array {
		$route = SH_Router::name();
		$m     = [ 'title' => self::site_name() . " — Bangladesh's Finest Handcraft Textiles", 'description' => self::DEFAULT_DESC, 'path' => '/', 'index' => true, 'og' => [] ];
		switch ( $route ) {
			case 'home':
				$m['title']       = "Shilperhaat — Bangladesh's Finest Handcraft Textiles";
				$m['description'] = 'Explore a vast collection of hand-woven Katha, Chadar, Blankets & Nakshi Katha. Premium quality, affordable prices.';
				break;
			case 'shop':
				$m['title']       = 'All Products — Shilperhaat';
				$m['description'] = "Browse Shilperhaat's full collection of hand-woven Katha, Chadar, Blankets & Nakshi Katha.";
				$m['path']        = '/shop';
				break;
			case 'product':
				$p                = SH_Router::data( 'product' );
				$desc             = trim( wp_strip_all_tags( (string) ( $p['description'] ?? '' ) ) );
				$desc             = '' !== $desc ? mb_substr( $desc, 0, 160 ) : $p['title'];
				$m['title']       = $p['title'] . ' — Shilperhaat';
				$m['description'] = $desc;
				$m['path']        = '/product/' . rawurlencode( $p['slug'] );
				$img              = ! empty( $p['images'][0]['imageUrl'] ) ? sh_absolute_url( $p['images'][0]['imageUrl'] ) : '';
				$m['og']          = [ 'title' => $p['title'], 'description' => mb_substr( trim( wp_strip_all_tags( (string) ( $p['description'] ?? '' ) ) ), 0, 160 ), 'url' => self::site_url() . $m['path'], 'image' => $img, 'site_name' => false ];
				break;
			case 'cart':
				$m['title']       = 'Cart — Shilperhaat';
				$m['description'] = 'Your shopping cart at Shilperhaat';
				$m['path']        = '/cart';
				$m['index']       = false;
				break;
			case 'checkout':
				$m['title']       = 'Checkout — Shilperhaat';
				$m['description'] = 'Complete your order at Shilperhaat';
				$m['path']        = '/checkout';
				$m['index']       = false;
				break;
			case 'thank-you':
				$m['title']       = 'Order Placed Successfully — Shilperhaat';
				$m['description'] = 'Your order has been placed successfully';
				$m['path']        = '/thank-you';
				$m['index']       = false;
				break;
			case 'track-order':
				$m['title']       = 'Track Your Order — Shilperhaat';
				$m['description'] = 'Track your order status with real-time updates on your shipment progress.';
				$m['path']        = '/track-order';
				$m['index']       = false;
				break;
			case 'account':
				$m['title']  = 'My Account - Shilperhaat';
				$m['path']   = '/account';
				$m['index']  = false;
				break;
			case 'page':
				$pg               = SH_Router::data( 'page' );
				$m['title']       = $pg['metaTitle'] ?: 'Shilperhaat';
				$m['description'] = $pg['metaDescription'] ?: self::DEFAULT_DESC;
				$m['path']        = '/' . rawurlencode( $pg['slug'] );
				break;
			case '404':
				$m['title']  = '404: This page could not be found.';
				$m['index']  = false;
				$m['path']   = '';
				break;
		}
		return $m;
	}

	public static function title( $title ) {
		if ( ! SH_Router::name() ) {
			return $title;
		}
		$m = self::meta();
		return '404' === SH_Router::name() ? $m['title'] : $m['title'] . ' | ' . self::site_name();
	}

	public static function head(): void {
		if ( ! SH_Router::name() ) {
			return;
		}
		$m        = self::meta();
		$site     = self::site_name();
		$fulltitle = self::title( '' );
		$canon    = self::site_url() . $m['path'];
		$settings = sh_settings();
		$layout   = sh_layout();
		$logo     = $settings['logoUrl'] ?: '';
		$ogImage  = $m['og']['image'] ?? ( $logo ? sh_absolute_url( $logo ) : '' );
		$ogTitle  = $m['og']['title'] ?? $fulltitle;
		$ogDesc   = $m['og']['description'] ?? $m['description'];
		$ogUrl    = $m['og']['url'] ?? '';
		$t        = get_template_directory_uri() . '/assets/img';
		$fav      = $settings['faviconUrl'] ?: '';

		echo '<meta name="description" content="' . esc_attr( $m['description'] ) . '"/>' . "\n";
		echo '<link rel="manifest" href="' . esc_url( home_url( '/manifest.webmanifest' ) ) . '"/>' . "\n";
		echo '<meta name="keywords" content="katha,nakshi katha,chadar,blanket,handcraft,bangladesh,shilperhaat,textile"/>' . "\n";
		echo '<meta name="robots" content="' . ( $m['index'] ? 'index, follow' : 'noindex' ) . '"/>' . "\n";
		if ( '404' !== SH_Router::name() ) {
			echo '<link rel="canonical" href="' . esc_url( $canon ) . '"/>' . "\n";
			echo '<meta property="og:title" content="' . esc_attr( $ogTitle ) . '"/>' . "\n";
			if ( $ogDesc ) {
				echo '<meta property="og:description" content="' . esc_attr( $ogDesc ) . '"/>' . "\n";
			}
			if ( $ogUrl ) {
				echo '<meta property="og:url" content="' . esc_url( $ogUrl ) . '"/>' . "\n";
			}
			if ( false !== ( $m['og']['site_name'] ?? true ) ) {
				echo '<meta property="og:site_name" content="' . esc_attr( $site ) . '"/>' . "\n";
				echo '<meta property="og:locale" content="en_US"/>' . "\n";
			}
			if ( $ogImage ) {
				echo '<meta property="og:image" content="' . esc_url( $ogImage ) . '"/>' . "\n";
			}
			echo '<meta property="og:type" content="website"/>' . "\n";
			echo '<meta name="twitter:card" content="summary_large_image"/>' . "\n";
			echo '<meta name="twitter:title" content="' . esc_attr( $ogTitle ) . '"/>' . "\n";
			if ( $ogImage ) {
				echo '<meta name="twitter:image" content="' . esc_url( $ogImage ) . '"/>' . "\n";
			}
		}
		echo '<link rel="icon" href="' . esc_url( home_url( '/favicon.ico' ) ) . '" sizes="48x48" type="image/x-icon"/>' . "\n";
		if ( $fav ) {
			echo '<link rel="icon" href="' . esc_url( sh_asset_url( $fav ) ) . '"/>' . "\n";
			echo '<link rel="apple-touch-icon" href="' . esc_url( sh_asset_url( $fav ) ) . '"/>' . "\n";
		} else {
			echo '<link rel="icon" href="' . esc_url( $t . '/icon-192.png' ) . '" type="image/png" sizes="192x192"/>' . "\n";
			echo '<link rel="icon" href="' . esc_url( $t . '/icon-512.png' ) . '" type="image/png" sizes="512x512"/>' . "\n";
			echo '<link rel="apple-touch-icon" href="' . esc_url( $t . '/apple-touch-icon.png' ) . '"/>' . "\n";
		}

		// Site-wide structured data.
		$social = is_array( $settings['socialLinks'] ) ? array_values( array_filter( $settings['socialLinks'] ) ) : [];
		$ld     = [
			array_filter( [ '@context' => 'https://schema.org', '@type' => 'Organization', 'name' => $site, 'url' => self::site_url(), 'logo' => $logo ? sh_absolute_url( $logo ) : null, 'sameAs' => $social ?: null ] ),
			[
				'@context'        => 'https://schema.org',
				'@type'           => 'WebSite',
				'name'            => $site,
				'url'             => self::site_url(),
				'potentialAction' => [
					'@type'       => 'SearchAction',
					'target'      => [ '@type' => 'EntryPoint', 'urlTemplate' => self::site_url() . '/shop?search={search_term_string}' ],
					'query-input' => 'required name=search_term_string',
				],
			],
		];
		self::json_ld( $ld );
		if ( 'product' === SH_Router::name() ) {
			self::json_ld( self::product_ld( SH_Router::data( 'product' ) ) );
		}
		SH_Meta::pixel_snippet();
	}

	public static function json_ld( array $data ): void {
		echo '<script type="application/ld+json">' . wp_json_encode( $data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . '</script>' . "\n";
	}

	public static function product_ld( array $p ): array {
		$url    = self::site_url() . '/product/' . rawurlencode( $p['slug'] );
		$images = array_values( array_filter( array_map( static fn( $i ) => sh_absolute_url( $i['imageUrl'] ), $p['images'] ) ) );
		$revs   = SH_Store::product_reviews( (int) $p['id'] );
		$count  = count( $revs );
		$avg    = $count ? array_sum( array_column( $revs, 'rating' ) ) / $count : 0;
		$prod   = [ '@context' => 'https://schema.org', '@type' => 'Product', 'name' => $p['title'] ];
		if ( $p['description'] ) {
			$prod['description'] = $p['description'];
		}
		if ( $images ) {
			$prod['image'] = $images;
		}
		if ( $p['sku'] ) {
			$prod['sku'] = $p['sku'];
		}
		if ( $p['category'] ) {
			$prod['category'] = $p['category']['name'];
		}
		$prod['brand']  = [ '@type' => 'Brand', 'name' => 'Shilperhaat' ];
		$prod['offers'] = [
			'@type'         => 'Offer',
			'url'           => $url,
			'priceCurrency' => 'BDT',
			'price'         => number_format( (float) $p['price'], 2, '.', '' ),
			'availability'  => $p['stock'] > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
		];
		if ( $count ) {
			$prod['aggregateRating'] = [ '@type' => 'AggregateRating', 'ratingValue' => number_format( $avg, 1, '.', '' ), 'reviewCount' => $count ];
		}
		$crumbs = [
			[ '@type' => 'ListItem', 'position' => 1, 'name' => 'Home', 'item' => self::site_url() ],
			[ '@type' => 'ListItem', 'position' => 2, 'name' => 'Products', 'item' => self::site_url() . '/shop' ],
		];
		if ( $p['category'] ) {
			$crumbs[] = [ '@type' => 'ListItem', 'position' => 3, 'name' => $p['category']['name'], 'item' => self::site_url() . '/shop?category=' . $p['category']['slug'] ];
		}
		$crumbs[] = [ '@type' => 'ListItem', 'position' => $p['category'] ? 4 : 3, 'name' => $p['title'], 'item' => $url ];
		return [ $prod, [ '@context' => 'https://schema.org', '@type' => 'BreadcrumbList', 'itemListElement' => $crumbs ] ];
	}

	/* ─────────────────────────── Machine files ─────────────────────────── */

	public static function serve( string $file ): void {
		if ( 'favicon.ico' === $file ) {
			$f = get_template_directory() . '/assets/img/favicon.ico';
			header( 'Content-Type: image/x-icon' );
			header( 'Cache-Control: public, max-age=86400' );
			if ( file_exists( $f ) ) {
				readfile( $f ); // phpcs:ignore
			}
			exit;
		}
		nocache_headers();
		switch ( $file ) {
			case 'robots.txt':
				header( 'Content-Type: text/plain; charset=utf-8' );
				$site = self::site_url();
				echo "User-Agent: *\nAllow: /\nDisallow: /admin\nDisallow: /wp-admin/\nDisallow: /account\nDisallow: /cart\nDisallow: /checkout\nDisallow: /thank-you\nDisallow: /track-order\nDisallow: /*?*add-to-cart=\n\nHost: $site\nSitemap: $site/sitemap.xml\n";
				break;
			case 'manifest.webmanifest':
				header( 'Content-Type: application/manifest+json; charset=utf-8' );
				$name = self::site_name();
				$fav  = sh_setting( 'faviconUrl', '' );
				$t    = get_template_directory_uri() . '/assets/img';
				echo wp_json_encode( [
					'name'             => $name . " — Bangladesh's Finest Handcraft Textiles",
					'short_name'       => $name,
					'description'      => "Shop Bangladesh's best handcraft textiles — Katha, Chadar, Blankets, Nakshi Katha and more.",
					'start_url'        => '/',
					'display'          => 'standalone',
					'background_color' => '#ffffff',
					'theme_color'      => '#800000',
					'icons'            => $fav ? [ [ 'src' => sh_asset_url( $fav ), 'sizes' => 'any' ] ] : [
						[ 'src' => $t . '/icon-192.png', 'sizes' => '192x192', 'type' => 'image/png' ],
						[ 'src' => $t . '/icon-512.png', 'sizes' => '512x512', 'type' => 'image/png' ],
						[ 'src' => $t . '/icon-512.png', 'sizes' => '512x512', 'type' => 'image/png', 'purpose' => 'maskable' ],
					],
				], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );
				break;
			case 'sitemap.xml':
				header( 'Content-Type: application/xml; charset=utf-8' );
				echo self::sitemap_xml(); // phpcs:ignore
				break;
		}
		exit;
	}

	public static function sitemap_xml(): string {
		$site = self::site_url();
		$now  = gmdate( 'c' );
		$urls = [];
		$add  = static function ( string $loc, string $lastmod, string $freq, float $prio, array $images = [] ) use ( &$urls ) {
			$urls[] = compact( 'loc', 'lastmod', 'freq', 'prio', 'images' );
		};
		foreach ( [ [ '', 'daily', 1 ], [ 'shop', 'daily', 0.9 ], [ 'about', 'monthly', 0.5 ], [ 'contact', 'monthly', 0.5 ], [ 'faq', 'monthly', 0.5 ], [ 'how-to-order', 'monthly', 0.5 ], [ 'support', 'monthly', 0.4 ], [ 'careers', 'monthly', 0.3 ], [ 'press', 'monthly', 0.3 ], [ 'shipping-info', 'yearly', 0.3 ], [ 'delivery-policy', 'yearly', 0.3 ], [ 'refund-policy', 'yearly', 0.3 ], [ 'privacy-policy', 'yearly', 0.3 ], [ 'terms-of-use', 'yearly', 0.3 ] ] as $r ) {
			$add( $r[0] ? "$site/{$r[0]}" : $site, $now, $r[1], $r[2] );
		}
		$staticSlugs = [ '', 'shop', 'about', 'contact', 'faq', 'how-to-order', 'support', 'careers', 'press', 'shipping-info', 'delivery-policy', 'refund-policy', 'privacy-policy', 'terms-of-use' ];
		foreach ( SH_Catalog::categories() as $c ) {
			$add( $site . '/shop?category=' . $c['slug'], $now, 'weekly', 0.8 );
		}
		$prods = SH_Catalog::query( [ 'all' => true, 'status' => 'ACTIVE' ] )['products'];
		foreach ( $prods as $p ) {
			$img = ! empty( $p['images'][0]['imageUrl'] ) ? [ sh_absolute_url( $p['images'][0]['imageUrl'] ) ] : [];
			$add( $site . '/product/' . rawurlencode( $p['slug'] ), $p['updatedAt'], 'weekly', 0.7, $img );
		}
		foreach ( SH_Store::pages() as $pg ) {
			if ( $pg['isPublished'] && ! in_array( $pg['slug'], $staticSlugs, true ) && 'blog' !== $pg['slug'] ) {
				$add( $site . '/' . rawurlencode( $pg['slug'] ), $pg['updatedAt'], 'monthly', 0.4 );
			}
		}
		$x = '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' . "\n";
		foreach ( $urls as $u ) {
			$x .= '<url><loc>' . esc_html( $u['loc'] ) . '</loc><lastmod>' . esc_html( $u['lastmod'] ) . '</lastmod><changefreq>' . $u['freq'] . '</changefreq><priority>' . $u['prio'] . '</priority>';
			foreach ( $u['images'] as $im ) {
				$x .= '<image:image><image:loc>' . esc_html( $im ) . '</image:loc></image:image>';
			}
			$x .= '</url>' . "\n";
		}
		return $x . '</urlset>';
	}
}
