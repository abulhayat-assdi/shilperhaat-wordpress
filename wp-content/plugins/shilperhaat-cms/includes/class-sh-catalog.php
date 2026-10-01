<?php
defined( 'ABSPATH' ) || exit;

/**
 * Products & categories. Products are WooCommerce "simple" products; everything the storefront
 * needs beyond Woo's model (status flag, best-selling flag, video links, ordered image list)
 * is stored as post meta / in wp_sh_product_images. The shape returned matches the original
 * Prisma payloads so the storefront code stays 1:1 with the Next.js components.
 */
class SH_Catalog {

	const TAX = 'product_cat';

	/* ─────────────────────────── Categories ─────────────────────────── */

	public static function term_to_array( WP_Term $t, ?int $count = null ): array {
		return [
			'id'         => (string) $t->term_id,
			'name'       => html_entity_decode( $t->name, ENT_QUOTES, 'UTF-8' ),
			'slug'       => rawurldecode( $t->slug ),
			'imageUrl'   => get_term_meta( $t->term_id, 'sh_image_url', true ) ?: null,
			'isFeatured' => (bool) get_term_meta( $t->term_id, 'sh_featured', true ),
			'sortOrder'  => (int) get_term_meta( $t->term_id, 'sh_sort_order', true ),
			'_count'     => [ 'products' => null === $count ? (int) $t->count : $count ],
		];
	}

	/** All categories ordered by sortOrder asc (then id), like Prisma's orderBy sortOrder. */
	public static function categories(): array {
		static $cache = null;
		if ( null !== $cache ) {
			return $cache;
		}
		$terms = get_terms( [ 'taxonomy' => self::TAX, 'hide_empty' => false, 'orderby' => 'none' ] );
		if ( is_wp_error( $terms ) ) {
			return [];
		}
		$def   = (int) get_option( 'default_product_cat' );
		$terms = array_filter( $terms, static fn( $t ) => (int) $t->term_id !== $def );
		$out   = array_map( [ self::class, 'term_to_array' ], $terms );
		usort( $out, static fn( $a, $b ) => $a['sortOrder'] <=> $b['sortOrder'] ?: (int) $a['id'] <=> (int) $b['id'] );
		return $cache = $out;
	}

	public static function reset_cache(): void {
		// Static caches are per-request; nothing persistent to clear.
	}

	public static function category_by_slug( string $slug ): ?array {
		foreach ( self::categories() as $c ) {
			if ( $c['slug'] === $slug ) {
				return $c;
			}
		}
		return null;
	}

	public static function save_category( array $d, ?int $id = null ) {
		$name = trim( (string) ( $d['name'] ?? '' ) );
		$slug = trim( (string) ( $d['slug'] ?? '' ) );
		$args = [ 'slug' => $slug ];
		if ( $id ) {
			$args['name'] = $name;
			$res          = wp_update_term( $id, self::TAX, $args );
		} else {
			$res = wp_insert_term( $name, self::TAX, $args );
		}
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		$tid = (int) $res['term_id'];
		if ( array_key_exists( 'imageUrl', $d ) ) {
			update_term_meta( $tid, 'sh_image_url', (string) $d['imageUrl'] );
		}
		if ( array_key_exists( 'isFeatured', $d ) ) {
			update_term_meta( $tid, 'sh_featured', $d['isFeatured'] ? 1 : 0 );
		}
		if ( array_key_exists( 'sortOrder', $d ) ) {
			update_term_meta( $tid, 'sh_sort_order', (int) $d['sortOrder'] );
		}
		return $tid;
	}

	/* ─────────────────────────── Products: read ─────────────────────────── */

	public static function product_id_by_slug( string $slug ): int {
		global $wpdb;
		$slug    = rawurldecode( $slug );
		$encoded = sanitize_title( $slug );
		$id      = $wpdb->get_var( $wpdb->prepare( "SELECT ID FROM {$wpdb->posts} WHERE post_type = 'product' AND post_status IN ('publish','draft','private') AND post_name IN (%s, %s) LIMIT 1", $encoded, $slug ) ); // phpcs:ignore
		return (int) $id;
	}

	/** Build the storefront payload for one product. $images may be preloaded (id => rows). */
	public static function to_array( $product, ?array $images = null ): ?array {
		$p = $product instanceof WC_Product ? $product : wc_get_product( $product );
		if ( ! $p ) {
			return null;
		}
		$id    = $p->get_id();
		$post  = get_post( $id );
		$price = get_post_meta( $id, '_sh_price', true );
		$cmp   = get_post_meta( $id, '_sh_compare_at', true );

		if ( null === $images ) {
			$images = self::images_for( [ $id ] );
		}
		$cats = get_the_terms( $id, self::TAX );
		$cat  = null;
		$def  = (int) get_option( 'default_product_cat' );
		$cats = $cats && ! is_wp_error( $cats ) ? array_values( array_filter( $cats, static fn( $t ) => (int) $t->term_id !== $def ) ) : [];
		if ( $cats ) {
			$t   = $cats[0];
			$cat = [ 'id' => (string) $t->term_id, 'name' => html_entity_decode( $t->name, ENT_QUOTES, 'UTF-8' ), 'slug' => rawurldecode( $t->slug ) ];
		}
		$tags = wp_get_post_terms( $id, 'product_tag', [ 'fields' => 'names' ] );

		$rows = $images[ $id ] ?? [];
		return [
			'id'             => (string) $id,
			'title'          => html_entity_decode( $post->post_title, ENT_QUOTES, 'UTF-8' ),
			'slug'           => rawurldecode( $post->post_name ),
			'description'    => $post->post_content ?: null,
			'price'          => '' === $price ? (float) $p->get_price() : (float) $price,
			'compareAtPrice' => ( '' === $cmp || ! (float) $cmp ) ? null : (float) $cmp,
			'stock'          => (int) $p->get_stock_quantity(),
			'categoryId'     => $cat ? $cat['id'] : null,
			'isFeatured'     => $p->is_featured(),
			'isBestSelling'  => (bool) get_post_meta( $id, '_sh_best_selling', true ),
			'status'         => get_post_meta( $id, '_sh_status', true ) ?: 'ACTIVE',
			'sku'            => $p->get_sku() ?: null,
			'tags'           => is_wp_error( $tags ) ? [] : array_values( array_map( static fn( $n ) => html_entity_decode( $n, ENT_QUOTES, 'UTF-8' ), $tags ) ),
			'videoUrl'       => get_post_meta( $id, '_sh_video_url', true ) ?: null,
			'youtubeUrl'     => get_post_meta( $id, '_sh_youtube_url', true ) ?: null,
			'youtubeVideoId' => get_post_meta( $id, '_sh_youtube_id', true ) ?: null,
			'createdAt'      => mysql2date( 'c', $post->post_date_gmt, false ),
			'updatedAt'      => mysql2date( 'c', $post->post_modified_gmt, false ),
			'category'       => $cat,
			'images'         => array_map( static fn( $r ) => [
				'id'        => (string) $r->id,
				'productId' => (string) $r->product_id,
				'imageUrl'  => $r->image_url,
				'sortOrder' => (int) $r->sort_order,
				'altText'   => $r->alt_text ?: null,
			], $rows ),
		];
	}

	/** @return array<int, object[]> product_id => ordered rows */
	public static function images_for( array $ids ): array {
		global $wpdb;
		if ( ! $ids ) {
			return [];
		}
		$t     = sh_table( 'product_images' );
		$in    = implode( ',', array_map( 'intval', $ids ) );
		$rows  = $wpdb->get_results( "SELECT * FROM $t WHERE product_id IN ($in) ORDER BY sort_order ASC, id ASC" ); // phpcs:ignore
		$by    = [];
		foreach ( $rows as $r ) {
			$by[ (int) $r->product_id ][] = $r;
		}
		return $by;
	}

	public static function by_slug( string $slug ): ?array {
		$id = self::product_id_by_slug( $slug );
		return $id ? self::to_array( $id ) : null;
	}

	public static function by_id( int $id ): ?array {
		return 'product' === get_post_type( $id ) ? self::to_array( $id ) : null;
	}

	/**
	 * Listing query.
	 *
	 * @param array $a status, category (slug), categoryId, minPrice, maxPrice, search, sort, page, limit, exclude, all
	 * @return array{products: array, total: int}
	 */
	public static function query( array $a = [] ): array {
		$args = [
			'post_type'              => 'product',
			'post_status'            => [ 'publish', 'draft', 'private' ],
			'fields'                 => 'ids',
			'posts_per_page'         => isset( $a['limit'] ) ? (int) $a['limit'] : 12,
			'paged'                  => max( 1, (int) ( $a['page'] ?? 1 ) ),
			'no_found_rows'          => false,
			'ignore_sticky_posts'    => true,
			'suppress_filters'       => false,
			'update_post_term_cache' => false,
			'sh_query'               => true,
		];
		if ( ! empty( $a['all'] ) ) {
			$args['posts_per_page'] = -1;
		}
		$meta = [ 'relation' => 'AND' ];
		$st   = $a['status'] ?? 'ACTIVE';
		if ( $st && 'ALL' !== $st ) {
			$meta[] = [ 'key' => '_sh_status', 'value' => $st ];
		}
		if ( isset( $a['minPrice'] ) && '' !== $a['minPrice'] ) {
			$meta[] = [ 'key' => '_sh_price', 'value' => (float) $a['minPrice'], 'compare' => '>=', 'type' => 'DECIMAL(10,2)' ];
		}
		if ( isset( $a['maxPrice'] ) && '' !== $a['maxPrice'] ) {
			$meta[] = [ 'key' => '_sh_price', 'value' => (float) $a['maxPrice'], 'compare' => '<=', 'type' => 'DECIMAL(10,2)' ];
		}
		$sort = $a['sort'] ?? 'newest';
		if ( 'price_asc' === $sort || 'price_desc' === $sort ) {
			$meta['sh_price'] = [ 'key' => '_sh_price', 'type' => 'DECIMAL(10,2)' ];
			$args['orderby']  = [ 'sh_price' => 'price_asc' === $sort ? 'ASC' : 'DESC', 'ID' => 'DESC' ];
		} elseif ( 'best_selling' === $sort ) {
			$meta['sh_best'] = [ 'key' => '_sh_best_selling', 'type' => 'NUMERIC' ];
			$args['orderby'] = [ 'sh_best' => 'DESC', 'date' => 'DESC' ];
		} else {
			$args['orderby'] = [ 'date' => 'DESC', 'ID' => 'DESC' ];
		}
		$args['meta_query'] = $meta;

		$tax = [];
		if ( ! empty( $a['category'] ) ) {
			$cat = self::category_by_slug( (string) $a['category'] );
			$tax[] = [ 'taxonomy' => self::TAX, 'field' => 'term_id', 'terms' => $cat ? [ (int) $cat['id'] ] : [ 0 ] ];
		}
		if ( ! empty( $a['categoryId'] ) ) {
			$tax[] = [ 'taxonomy' => self::TAX, 'field' => 'term_id', 'terms' => [ (int) $a['categoryId'] ] ];
		}
		if ( $tax ) {
			$args['tax_query'] = $tax;
		}
		if ( ! empty( $a['exclude'] ) ) {
			$args['post__not_in'] = array_map( 'intval', (array) $a['exclude'] );
		}

		$search = isset( $a['search'] ) ? trim( (string) $a['search'] ) : '';
		$filter = null;
		if ( '' !== $search ) {
			$filter = static function ( $where, $q ) use ( $search ) {
				global $wpdb;
				if ( ! $q->get( 'sh_query' ) ) {
					return $where;
				}
				$like = '%' . $wpdb->esc_like( $search ) . '%';
				return $where . $wpdb->prepare( " AND ({$wpdb->posts}.post_title LIKE %s OR {$wpdb->posts}.post_content LIKE %s)", $like, $like );
			};
			add_filter( 'posts_where', $filter, 10, 2 );
		}

		$q = new WP_Query( $args );
		if ( $filter ) {
			remove_filter( 'posts_where', $filter, 10 );
		}
		$ids    = array_map( 'intval', $q->posts );
		$images = self::images_for( $ids );
		_prime_post_caches( $ids, true, true );
		$out = [];
		foreach ( $ids as $id ) {
			$row = self::to_array( $id, $images );
			if ( $row ) {
				$out[] = $row;
			}
		}
		return [ 'products' => $out, 'total' => (int) $q->found_posts ];
	}

	/* ─────────────────────────── Products: write ─────────────────────────── */

	/**
	 * Create/update a product from the admin payload (same field names as the Prisma model).
	 *
	 * @return int|WP_Error product (post) ID
	 */
	public static function save_product( array $d, int $id = 0 ) {
		$product = $id ? wc_get_product( $id ) : new WC_Product_Simple();
		if ( ! $product ) {
			return new WP_Error( 'not_found', 'Product not found' );
		}
		$status = in_array( $d['status'] ?? 'ACTIVE', [ 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK' ], true ) ? $d['status'] : 'ACTIVE';

		if ( isset( $d['title'] ) ) {
			$product->set_name( wp_unslash( (string) $d['title'] ) );
		}
		if ( isset( $d['slug'] ) && '' !== $d['slug'] ) {
			$product->set_slug( (string) $d['slug'] );
		}
		if ( array_key_exists( 'description', $d ) ) {
			$product->set_description( (string) ( $d['description'] ?? '' ) );
		}
		$price = isset( $d['price'] ) ? (float) $d['price'] : (float) get_post_meta( $product->get_id(), '_sh_price', true );
		$cmp   = array_key_exists( 'compareAtPrice', $d ) ? ( $d['compareAtPrice'] ? (float) $d['compareAtPrice'] : 0 ) : (float) get_post_meta( $product->get_id(), '_sh_compare_at', true );
		if ( $cmp > $price ) {
			$product->set_regular_price( (string) $cmp );
			$product->set_sale_price( (string) $price );
		} else {
			$product->set_regular_price( (string) $price );
			$product->set_sale_price( '' );
		}
		if ( array_key_exists( 'sku', $d ) ) {
			try {
				$product->set_sku( (string) ( $d['sku'] ?? '' ) );
			} catch ( Exception $e ) {
				return new WP_Error( 'sku', $e->getMessage() );
			}
		}
		$product->set_manage_stock( true );
		if ( isset( $d['stock'] ) ) {
			$product->set_stock_quantity( max( 0, (int) $d['stock'] ) );
		}
		$stock = (int) $product->get_stock_quantity();
		$product->set_stock_status( ( $stock > 0 && 'OUT_OF_STOCK' !== $status ) ? 'instock' : 'outofstock' );
		if ( array_key_exists( 'isFeatured', $d ) ) {
			$product->set_featured( (bool) $d['isFeatured'] );
		}
		$product->set_catalog_visibility( 'visible' );
		$product->set_status( 'INACTIVE' === $status ? 'draft' : 'publish' );
		if ( ! empty( $d['createdAt'] ) ) {
			$ts = strtotime( (string) $d['createdAt'] );
			if ( $ts ) {
				$product->set_date_created( $ts );
			}
		}
		$pid = $product->save();

		update_post_meta( $pid, '_sh_status', $status );
		update_post_meta( $pid, '_sh_price', $price );
		update_post_meta( $pid, '_sh_compare_at', $cmp ?: '' );
		if ( array_key_exists( 'isBestSelling', $d ) ) {
			update_post_meta( $pid, '_sh_best_selling', $d['isBestSelling'] ? 1 : 0 );
		} elseif ( '' === get_post_meta( $pid, '_sh_best_selling', true ) ) {
			update_post_meta( $pid, '_sh_best_selling', 0 );
		}
		foreach ( [ 'videoUrl' => '_sh_video_url', 'youtubeUrl' => '_sh_youtube_url', 'youtubeVideoId' => '_sh_youtube_id' ] as $k => $mk ) {
			if ( array_key_exists( $k, $d ) ) {
				update_post_meta( $pid, $mk, (string) ( $d[ $k ] ?? '' ) );
			}
		}
		if ( ! empty( $d['legacyId'] ) ) {
			update_post_meta( $pid, '_sh_legacy_id', (string) $d['legacyId'] );
		}
		if ( array_key_exists( 'categoryId', $d ) ) {
			wp_set_object_terms( $pid, $d['categoryId'] ? [ (int) $d['categoryId'] ] : [], self::TAX );
		}
		if ( array_key_exists( 'tags', $d ) ) {
			$tags = is_array( $d['tags'] ) ? $d['tags'] : array_filter( array_map( 'trim', explode( ',', (string) $d['tags'] ) ) );
			wp_set_object_terms( $pid, array_values( $tags ), 'product_tag' );
		}
		if ( isset( $d['images'] ) && is_array( $d['images'] ) ) {
			self::set_images( $pid, $d['images'] );
		}
		return $pid;
	}

	public static function set_images( int $pid, array $images ): void {
		global $wpdb;
		$t = sh_table( 'product_images' );
		$wpdb->delete( $t, [ 'product_id' => $pid ] );
		$i = 0;
		foreach ( $images as $img ) {
			$url = is_array( $img ) ? (string) ( $img['imageUrl'] ?? '' ) : (string) $img;
			if ( '' === $url ) {
				continue;
			}
			$wpdb->insert( $t, [
				'product_id' => $pid,
				'image_url'  => $url,
				'sort_order' => is_array( $img ) && isset( $img['sortOrder'] ) ? (int) $img['sortOrder'] : $i,
				'alt_text'   => is_array( $img ) ? ( $img['altText'] ?? null ) : null,
			] );
			$i++;
		}
	}

	public static function delete_product( int $id ): bool {
		global $wpdb;
		$wpdb->delete( sh_table( 'product_images' ), [ 'product_id' => $id ] );
		return (bool) wp_delete_post( $id, true );
	}
}
