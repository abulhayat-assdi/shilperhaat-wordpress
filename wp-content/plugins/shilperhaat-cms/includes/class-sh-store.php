<?php
defined( 'ABSPATH' ) || exit;

/**
 * Data access for the custom tables: banners, reviews, CMS pages.
 * Payload shapes mirror the original Prisma models (camelCase).
 */
class SH_Store {

	/* ─────────────────────────── Banners ─────────────────────────── */

	public static function banner_to_array( object $r ): array {
		return [
			'id'             => (string) $r->id,
			'title'          => $r->title,
			'subtitle'       => $r->subtitle,
			'imageUrl'       => $r->image_url,
			'mobileImageUrl' => $r->mobile_image_url ?: null,
			'buttonText'     => $r->button_text,
			'buttonLink'     => $r->button_link,
			'sortOrder'      => (int) $r->sort_order,
			'isActive'       => (bool) $r->is_active,
			'createdAt'      => mysql2date( 'c', $r->created_at, false ),
			'updatedAt'      => mysql2date( 'c', $r->updated_at, false ),
		];
	}

	public static function banners( bool $activeOnly = false ): array {
		global $wpdb;
		$t     = sh_table( 'banners' );
		$where = $activeOnly ? 'WHERE is_active = 1' : '';
		$rows  = $wpdb->get_results( "SELECT * FROM $t $where ORDER BY sort_order ASC, id ASC" ); // phpcs:ignore
		return array_map( [ self::class, 'banner_to_array' ], $rows );
	}

	public static function save_banner( array $d, int $id = 0 ): int {
		global $wpdb;
		$t   = sh_table( 'banners' );
		$now = current_time( 'mysql', true );
		$row = [
			'title'            => isset( $d['title'] ) && '' !== $d['title'] ? (string) $d['title'] : null,
			'subtitle'         => isset( $d['subtitle'] ) && '' !== $d['subtitle'] ? (string) $d['subtitle'] : null,
			'image_url'        => (string) ( $d['imageUrl'] ?? '' ),
			'mobile_image_url' => ! empty( $d['mobileImageUrl'] ) ? (string) $d['mobileImageUrl'] : null,
			'button_text'      => isset( $d['buttonText'] ) && '' !== $d['buttonText'] ? (string) $d['buttonText'] : null,
			'button_link'      => isset( $d['buttonLink'] ) && '' !== $d['buttonLink'] ? (string) $d['buttonLink'] : null,
			'sort_order'       => (int) ( $d['sortOrder'] ?? 0 ),
			'is_active'        => ! isset( $d['isActive'] ) || $d['isActive'] ? 1 : 0,
			'updated_at'       => $now,
		];
		if ( $id ) {
			$wpdb->update( $t, $row, [ 'id' => $id ] );
			return $id;
		}
		$row['created_at'] = ! empty( $d['createdAt'] ) ? gmdate( 'Y-m-d H:i:s', strtotime( $d['createdAt'] ) ) : $now;
		$wpdb->insert( $t, $row );
		return (int) $wpdb->insert_id;
	}

	public static function delete_banner( int $id ): void {
		global $wpdb;
		$wpdb->delete( sh_table( 'banners' ), [ 'id' => $id ] );
	}

	/* ─────────────────────────── Reviews ─────────────────────────── */

	public static function review_to_array( object $r ): array {
		$out = [
			'id'        => (string) $r->id,
			'name'      => $r->name,
			'title'     => $r->title ?: null,
			'rating'    => (int) $r->rating,
			'content'   => $r->content,
			'avatarUrl' => $r->avatar_url ?: null,
			'role'      => $r->role ?: null,
			'isVisible' => (bool) $r->is_visible,
			'sortOrder' => (int) $r->sort_order,
			'productId' => $r->product_id ? (string) $r->product_id : null,
			'createdAt' => mysql2date( 'c', $r->created_at, false ),
			'updatedAt' => mysql2date( 'c', $r->updated_at, false ),
		];
		if ( $r->product_id ) {
			$post = get_post( (int) $r->product_id );
			$out['product'] = $post ? [ 'title' => html_entity_decode( $post->post_title, ENT_QUOTES, 'UTF-8' ), 'slug' => rawurldecode( $post->post_name ) ] : null;
		} else {
			$out['product'] = null;
		}
		return $out;
	}

	/** Site-wide testimonials shown on the home page: visible, ordered by sortOrder. */
	public static function visible_reviews(): array {
		global $wpdb;
		$t    = sh_table( 'reviews' );
		$rows = $wpdb->get_results( "SELECT * FROM $t WHERE is_visible = 1 ORDER BY sort_order ASC, id ASC" ); // phpcs:ignore
		return array_map( [ self::class, 'review_to_array' ], $rows );
	}

	public static function product_reviews( int $productId ): array {
		global $wpdb;
		$t    = sh_table( 'reviews' );
		$rows = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $t WHERE product_id = %d AND is_visible = 1 ORDER BY created_at DESC, id DESC", $productId ) ); // phpcs:ignore
		return array_map( [ self::class, 'review_to_array' ], $rows );
	}

	public static function all_reviews(): array {
		global $wpdb;
		$t    = sh_table( 'reviews' );
		$rows = $wpdb->get_results( "SELECT * FROM $t ORDER BY sort_order ASC, created_at DESC" ); // phpcs:ignore
		return array_map( [ self::class, 'review_to_array' ], $rows );
	}

	public static function save_review( array $d, int $id = 0 ): int {
		global $wpdb;
		$t   = sh_table( 'reviews' );
		$now = current_time( 'mysql', true );
		$row = [
			'name'       => (string) ( $d['name'] ?? '' ),
			'title'      => isset( $d['title'] ) && '' !== $d['title'] ? (string) $d['title'] : null,
			'rating'     => max( 1, min( 5, (int) ( $d['rating'] ?? 5 ) ) ),
			'content'    => (string) ( $d['content'] ?? '' ),
			'avatar_url' => ! empty( $d['avatarUrl'] ) ? (string) $d['avatarUrl'] : null,
			'role'       => isset( $d['role'] ) && '' !== $d['role'] ? (string) $d['role'] : null,
			'is_visible' => ! isset( $d['isVisible'] ) || $d['isVisible'] ? 1 : 0,
			'sort_order' => (int) ( $d['sortOrder'] ?? 0 ),
			'product_id' => ! empty( $d['productId'] ) ? (int) $d['productId'] : null,
			'updated_at' => $now,
		];
		if ( $id ) {
			$wpdb->update( $t, $row, [ 'id' => $id ] );
			return $id;
		}
		$row['created_at'] = ! empty( $d['createdAt'] ) ? gmdate( 'Y-m-d H:i:s', strtotime( $d['createdAt'] ) ) : $now;
		$wpdb->insert( $t, $row );
		return (int) $wpdb->insert_id;
	}

	public static function delete_review( int $id ): void {
		global $wpdb;
		$wpdb->delete( sh_table( 'reviews' ), [ 'id' => $id ] );
	}

	/* ─────────────────────────── CMS pages ─────────────────────────── */

	public static function page_to_array( object $r ): array {
		$sections = json_decode( (string) $r->sections, true );
		return [
			'id'              => (string) $r->id,
			'slug'            => $r->slug,
			'title'           => $r->title,
			'subtitle'        => $r->subtitle,
			'sections'        => is_array( $sections ) ? $sections : [],
			'metaTitle'       => $r->meta_title,
			'metaDescription' => $r->meta_description,
			'isPublished'     => (bool) $r->is_published,
			'updatedAt'       => mysql2date( 'c', $r->updated_at, false ),
		];
	}

	public static function pages(): array {
		global $wpdb;
		$t = sh_table( 'pages' );
		return array_map( [ self::class, 'page_to_array' ], $wpdb->get_results( "SELECT * FROM $t ORDER BY id ASC" ) ); // phpcs:ignore
	}

	public static function page( string $slug ): ?array {
		global $wpdb;
		$t = sh_table( 'pages' );
		$r = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $t WHERE slug = %s", $slug ) ); // phpcs:ignore
		return $r ? self::page_to_array( $r ) : null;
	}

	public static function published_page( string $slug ): ?array {
		$p = self::page( $slug );
		return ( $p && $p['isPublished'] ) ? $p : null;
	}

	public static function save_page( array $d, string $slug = '' ): string {
		global $wpdb;
		$t    = sh_table( 'pages' );
		$now  = current_time( 'mysql', true );
		$slug = $slug ?: (string) ( $d['slug'] ?? '' );
		$row  = [
			'title'            => (string) ( $d['title'] ?? '' ),
			'subtitle'         => (string) ( $d['subtitle'] ?? '' ),
			'sections'         => wp_json_encode( $d['sections'] ?? [], JSON_UNESCAPED_UNICODE ),
			'meta_title'       => (string) ( $d['metaTitle'] ?? '' ),
			'meta_description' => (string) ( $d['metaDescription'] ?? '' ),
			'is_published'     => ! isset( $d['isPublished'] ) || $d['isPublished'] ? 1 : 0,
			'updated_at'       => $now,
		];
		if ( $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $t WHERE slug = %s", $slug ) ) ) { // phpcs:ignore
			$wpdb->update( $t, $row, [ 'slug' => $slug ] );
		} else {
			$row['slug'] = $slug;
			$wpdb->insert( $t, $row );
		}
		return $slug;
	}

	public static function delete_page( string $slug ): void {
		global $wpdb;
		$wpdb->delete( sh_table( 'pages' ), [ 'slug' => $slug ] );
	}

	/** Top-level app routes that must never be treated as editable CMS pages. */
	const RESERVED_SLUGS = [ 'account', 'blog', 'cart', 'checkout', 'product', 'shop', 'thank-you', 'track-order', 'admin', 'api', 'uploads', 'wp-admin', 'wp-json', 'wp-content', 'wp-includes' ];

	public static function extract_page_slug( string $href ): ?string {
		if ( '' === $href || '/' !== $href[0] ) {
			return null;
		}
		$path = preg_split( '/[?#]/', $href )[0];
		$segs = array_values( array_filter( explode( '/', $path ), 'strlen' ) );
		if ( 1 !== count( $segs ) ) {
			return null;
		}
		$slug = strtolower( $segs[0] );
		if ( ! preg_match( '/^[a-z0-9][a-z0-9-]*$/', $slug ) || in_array( $slug, self::RESERVED_SLUGS, true ) ) {
			return null;
		}
		return $slug;
	}

	/** Creates placeholder pages for internal links that do not exist yet (Site Layout → Pages). */
	public static function ensure_pages_for_links( array $links ): array {
		$by = [];
		foreach ( $links as $l ) {
			$slug = self::extract_page_slug( (string) ( $l['href'] ?? '' ) );
			if ( ! $slug || isset( $by[ $slug ] ) ) {
				continue;
			}
			$label        = isset( $l['label'] ) && is_string( $l['label'] ) && trim( $l['label'] ) ? trim( $l['label'] ) : $slug;
			$by[ $slug ]  = $label;
		}
		$created = [];
		foreach ( $by as $slug => $label ) {
			if ( self::page( $slug ) ) {
				continue;
			}
			self::save_page( [
				'title'           => $label,
				'subtitle'        => '',
				'sections'        => [ [ 'id' => $slug . '-s1', 'title' => 'Main Content', 'content' => '<p>Write the content for ' . $label . ' here.</p>', 'order' => 1 ] ],
				'metaTitle'       => $label . ' - Shilperhaat',
				'metaDescription' => $label,
				'isPublished'     => true,
			], $slug );
			$created[] = $slug;
		}
		return $created;
	}
}
