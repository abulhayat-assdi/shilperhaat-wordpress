<?php
defined( 'ABSPATH' ) || exit;

/**
 * Imports the shop content dumped from the old PostgreSQL database (data/seed.json) into
 * WooCommerce + the plugin tables. Safe to re-run: products/categories/pages/coupons are upserted
 * by their legacy key; banners/reviews are only imported into empty tables.
 *
 * Media files are NOT part of this import: extract shilperhaat-uploads.zip into
 * wp-content/uploads/shilperhaat/ (see docs/INSTALL-bn.md). Paths stay "/uploads/..." in the database.
 */
class SH_Importer {

	/** @return array<string,mixed> summary */
	public static function run( bool $reset = false ): array {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return [ 'error' => 'WooCommerce is not active.' ];
		}
		$file = SH_CMS_DIR . 'data/seed.json';
		if ( ! file_exists( $file ) ) {
			return [ 'error' => 'data/seed.json not found.' ];
		}
		$d = json_decode( (string) file_get_contents( $file ), true );
		if ( ! is_array( $d ) ) {
			return [ 'error' => 'seed.json is not valid JSON.' ];
		}
		global $wpdb;
		SH_Install::create_tables();
		$sum = [];

		if ( $reset ) {
			foreach ( [ 'banners', 'reviews', 'product_images' ] as $t ) {
				$wpdb->query( 'TRUNCATE TABLE ' . sh_table( $t ) ); // phpcs:ignore
			}
		}

		// Site content (site-layout, contact-widget).
		foreach ( $d['site_content'] ?? [] as $row ) {
			sh_set_content( $row['key'], $row['value'] );
		}
		$sum['site_content'] = count( $d['site_content'] ?? [] );

		// Site settings.
		$ss = ( $d['site_settings'][0] ?? null );
		if ( $ss ) {
			$cur = sh_settings();
			update_option( 'sh_settings', array_merge( $cur, [
				'siteName'        => $ss['siteName'] ?: $cur['siteName'],
				'logoUrl'         => (string) $ss['logoUrl'],
				'faviconUrl'      => (string) $ss['faviconUrl'],
				'footerCopyright' => (string) $ss['footerCopyright'],
				'whatsappNumber'  => (string) $ss['whatsappNumber'],
				'socialLinks'     => $ss['socialLinks'],
				'deliveryCharge'  => (float) $ss['deliveryCharge'],
				'freeDeliveryMin' => null === $ss['freeDeliveryMin'] ? null : (float) $ss['freeDeliveryMin'],
			] ), false );
		}

		// Categories.
		$catMap = [];
		foreach ( $d['categories'] ?? [] as $c ) {
			$existing = get_terms( [ 'taxonomy' => 'product_cat', 'hide_empty' => false, 'meta_key' => 'sh_legacy_id', 'meta_value' => $c['id'], 'number' => 1 ] );
			$tid      = ( $existing && ! is_wp_error( $existing ) ) ? (int) $existing[0]->term_id : 0;
			$res      = SH_Catalog::save_category( [
				'name'       => $c['name'],
				'slug'       => $c['slug'],
				'imageUrl'   => $c['imageUrl'] ?? '',
				'isFeatured' => 't' === $c['isFeatured'],
				'sortOrder'  => (int) $c['sortOrder'],
			], $tid );
			if ( is_wp_error( $res ) ) {
				// Term with this slug already exists (e.g. re-run without legacy meta): reuse it.
				$t   = get_term_by( 'slug', $c['slug'], 'product_cat' );
				$res = $t ? (int) $t->term_id : 0;
			}
			if ( $res ) {
				update_term_meta( $res, 'sh_legacy_id', $c['id'] );
				$catMap[ $c['id'] ] = (int) $res;
			}
		}
		$sum['categories'] = count( $catMap );

		// Products.
		$prodMap = [];
		$imgs    = [];
		foreach ( $d['product_images'] ?? [] as $im ) {
			$imgs[ $im['productId'] ][] = [ 'imageUrl' => $im['imageUrl'], 'sortOrder' => (int) $im['sortOrder'], 'altText' => $im['altText'] ];
		}
		foreach ( $d['products'] ?? [] as $p ) {
			$existing = get_posts( [ 'post_type' => 'product', 'post_status' => 'any', 'meta_key' => '_sh_legacy_id', 'meta_value' => $p['id'], 'numberposts' => 1, 'fields' => 'ids' ] );
			$pid      = SH_Catalog::save_product( [
				'title'          => $p['title'],
				'slug'           => $p['slug'],
				'description'    => $p['description'] ?? '',
				'price'          => (float) $p['price'],
				'compareAtPrice' => null === $p['compareAtPrice'] ? null : (float) $p['compareAtPrice'],
				'stock'          => (int) $p['stock'],
				'categoryId'     => $p['categoryId'] ? ( $catMap[ $p['categoryId'] ] ?? null ) : null,
				'isFeatured'     => 't' === $p['isFeatured'],
				'isBestSelling'  => 't' === $p['isBestSelling'],
				'status'         => $p['status'],
				'sku'            => $p['sku'] ?? null,
				'tags'           => $p['tags'],
				'videoUrl'       => $p['videoUrl'],
				'youtubeUrl'     => $p['youtubeUrl'],
				'youtubeVideoId' => $p['youtubeVideoId'],
				'createdAt'      => $p['createdAt'] . ' UTC',
				'legacyId'       => $p['id'],
				'images'         => $imgs[ $p['id'] ] ?? [],
			], $existing ? (int) $existing[0] : 0 );
			if ( ! is_wp_error( $pid ) ) {
				$prodMap[ $p['id'] ] = (int) $pid;
			}
		}
		$sum['products'] = count( $prodMap );

		// Banners (only into an empty table).
		$t = sh_table( 'banners' );
		if ( ! (int) $wpdb->get_var( "SELECT COUNT(*) FROM $t" ) ) { // phpcs:ignore
			foreach ( $d['banners'] ?? [] as $b ) {
				SH_Store::save_banner( [
					'title' => $b['title'], 'subtitle' => $b['subtitle'], 'imageUrl' => $b['imageUrl'], 'mobileImageUrl' => $b['mobileImageUrl'],
					'buttonText' => $b['buttonText'], 'buttonLink' => $b['buttonLink'], 'sortOrder' => (int) $b['sortOrder'],
					'isActive' => 't' === $b['isActive'], 'createdAt' => $b['createdAt'] . ' UTC',
				] );
			}
		}
		$sum['banners'] = (int) $wpdb->get_var( "SELECT COUNT(*) FROM $t" ); // phpcs:ignore

		// Reviews (only into an empty table).
		$t = sh_table( 'reviews' );
		if ( ! (int) $wpdb->get_var( "SELECT COUNT(*) FROM $t" ) ) { // phpcs:ignore
			foreach ( $d['reviews'] ?? [] as $r ) {
				SH_Store::save_review( [
					'name' => $r['name'], 'title' => $r['title'], 'rating' => (int) $r['rating'], 'content' => $r['content'],
					'avatarUrl' => $r['avatarUrl'], 'role' => $r['role'], 'isVisible' => 't' === $r['isVisible'], 'sortOrder' => (int) $r['sortOrder'],
					'productId' => $r['productId'] ? ( $prodMap[ $r['productId'] ] ?? null ) : null, 'createdAt' => $r['createdAt'] . ' UTC',
				] );
			}
		}
		$sum['reviews'] = (int) $wpdb->get_var( "SELECT COUNT(*) FROM $t" ); // phpcs:ignore

		// Coupons.
		$n = 0;
		foreach ( $d['coupons'] ?? [] as $c ) {
			$id  = SH_Coupons::find_id( $c['code'] );
			$res = SH_Coupons::save( [
				'code' => $c['code'], 'type' => $c['type'], 'value' => (float) $c['value'], 'minOrderAmount' => (float) $c['minOrderAmount'],
				'maxUses' => null === $c['maxUses'] ? null : (int) $c['maxUses'], 'usedCount' => (int) $c['usedCount'], 'isActive' => 't' === $c['isActive'],
				'expiresAt' => $c['expiresAt'] ? $c['expiresAt'] . ' UTC' : null, 'description' => $c['description'],
			], $id );
			if ( ! is_wp_error( $res ) ) {
				$n++;
			}
		}
		$sum['coupons'] = $n;

		// CMS pages (upsert by slug; the legacy "blog" page is skipped because the blog was dropped).
		$n = 0;
		foreach ( $d['pages'] ?? [] as $p ) {
			if ( 'blog' === $p['slug'] ) {
				continue;
			}
			SH_Store::save_page( [
				'title' => $p['title'], 'subtitle' => $p['subtitle'], 'sections' => $p['sections'],
				'metaTitle' => $p['metaTitle'], 'metaDescription' => $p['metaDescription'], 'isPublished' => 't' === $p['isPublished'],
			], $p['slug'] );
			$n++;
		}
		$sum['pages'] = $n;

		update_option( 'sh_imported_at', time(), false );
		return $sum;
	}

	/** Lists media referenced by the database that are missing on disk (for the install report). */
	public static function missing_media(): array {
		global $wpdb;
		$paths = [];
		foreach ( $wpdb->get_col( 'SELECT image_url FROM ' . sh_table( 'product_images' ) ) as $p ) { // phpcs:ignore
			$paths[] = $p;
		}
		foreach ( $wpdb->get_results( 'SELECT image_url, mobile_image_url FROM ' . sh_table( 'banners' ) ) as $b ) { // phpcs:ignore
			$paths[] = $b->image_url;
			$paths[] = $b->mobile_image_url;
		}
		$missing = [];
		foreach ( array_filter( array_unique( $paths ) ) as $p ) {
			if ( str_starts_with( $p, '/uploads/' ) && ! file_exists( sh_uploads_dir() . '/' . substr( $p, 9 ) ) ) {
				$missing[] = $p;
			}
		}
		return $missing;
	}
}

if ( defined( 'WP_CLI' ) && WP_CLI ) {
	/** wp shilperhaat import [--reset] */
	class SH_Importer_CLI {
		/**
		 * Imports the bundled shop content (products, categories, banners, pages, ...).
		 *
		 * ## OPTIONS
		 *
		 * [--reset]
		 * : Empty banners/reviews/product-images tables before importing.
		 */
		public function import( $args, $assoc ) {
			$res = SH_Importer::run( ! empty( $assoc['reset'] ) );
			if ( isset( $res['error'] ) ) {
				WP_CLI::error( $res['error'] );
			}
			foreach ( $res as $k => $v ) {
				WP_CLI::log( "$k: $v" );
			}
			$missing = SH_Importer::missing_media();
			WP_CLI::log( 'missing media files: ' . count( $missing ) );
			WP_CLI::success( 'Import finished.' );
		}
	}
}
