<?php
/**
 * Read-side data access used by the storefront templates.
 * Return shapes mirror the objects the original Prisma queries produced.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function sh_format_price( $price ) {
	return '৳' . number_format( (float) round( (float) $price ), 0, '.', ',' );
}

function sh_calc_discount( $price, $compare ) {
	$price   = (float) $price;
	$compare = (float) $compare;
	if ( ! $compare || $compare <= $price ) {
		return 0;
	}
	return (int) round( ( ( $compare - $price ) / $compare ) * 100 );
}

/** Product image URL with the original's placeholder fallback. */
function sh_image_url( $url ) {
	if ( ! $url ) {
		return function_exists( 'get_template_directory_uri' ) ? get_template_directory_uri() . '/assets/img/placeholder-product.svg' : '';
	}
	return sh_media_url( $url );
}

function sh_banners( $only_active = true ) {
	global $wpdb;
	$where = $only_active ? 'WHERE is_active = 1' : '';
	return (array) $wpdb->get_results( 'SELECT * FROM ' . sh_table( 'banners' ) . " $where ORDER BY sort_order ASC, created_at ASC" ); // phpcs:ignore WordPress.DB
}

function sh_reviews( $args = array() ) {
	global $wpdb;
	$args  = wp_parse_args( $args, array( 'visible' => true, 'product_id' => null, 'site_wide' => false, 'limit' => 0 ) );
	$where = array();
	if ( $args['visible'] ) {
		$where[] = 'is_visible = 1';
	}
	if ( $args['product_id'] ) {
		$where[] = $wpdb->prepare( 'product_id = %s', $args['product_id'] );
	}
	$sql = 'SELECT * FROM ' . sh_table( 'reviews' ) . ( $where ? ' WHERE ' . implode( ' AND ', $where ) : '' ) . ' ORDER BY sort_order ASC, created_at DESC';
	if ( $args['limit'] ) {
		$sql .= ' LIMIT ' . (int) $args['limit'];
	}
	return (array) $wpdb->get_results( $sql ); // phpcs:ignore WordPress.DB
}

/**
 * Active products (newest first) with category + images attached.
 *
 * @param array $args category_slug, search, sort, ids, limit
 * @return object[] each: ->category (object|null), ->images (object[])
 */
function sh_products( $args = array() ) {
	global $wpdb;
	$args = wp_parse_args( $args, array( 'status' => 'ACTIVE', 'ids' => null ) );
	$p    = sh_table( 'products' );
	$c    = sh_table( 'categories' );

	$where = array( '1=1' );
	if ( $args['status'] ) {
		$where[] = $wpdb->prepare( 'p.status = %s', $args['status'] );
	}
	if ( $args['ids'] ) {
		$ids     = array_map( 'strval', (array) $args['ids'] );
		$where[] = $wpdb->prepare( 'p.id IN (' . implode( ',', array_fill( 0, count( $ids ), '%s' ) ) . ')', $ids ); // phpcs:ignore WordPress.DB
	}
	$sql  = "SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM $p p LEFT JOIN $c c ON c.id = p.category_id WHERE " . implode( ' AND ', $where ) . ' ORDER BY p.created_at DESC';
	$rows = (array) $wpdb->get_results( $sql ); // phpcs:ignore WordPress.DB
	return sh_attach_product_relations( $rows );
}

function sh_attach_product_relations( $rows ) {
	global $wpdb;
	if ( ! $rows ) {
		return array();
	}
	$ids = wp_list_pluck( $rows, 'id' );
	$in  = implode( ',', array_fill( 0, count( $ids ), '%s' ) );
	$img = (array) $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . sh_table( 'product_images' ) . " WHERE product_id IN ($in) ORDER BY sort_order ASC", $ids ) ); // phpcs:ignore WordPress.DB
	$by  = array();
	foreach ( $img as $i ) {
		$by[ $i->product_id ][] = $i;
	}
	foreach ( $rows as $r ) {
		$r->images   = isset( $by[ $r->id ] ) ? $by[ $r->id ] : array();
		$r->category = $r->category_id ? (object) array( 'id' => $r->category_id, 'name' => $r->category_name, 'slug' => $r->category_slug ) : null;
		$r->tags     = $r->tags ? json_decode( $r->tags, true ) : array();
	}
	return $rows;
}

function sh_get_product_by_slug( $slug ) {
	global $wpdb;
	$p   = sh_table( 'products' );
	$c   = sh_table( 'categories' );
	$row = $wpdb->get_row( $wpdb->prepare( "SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM $p p LEFT JOIN $c c ON c.id = p.category_id WHERE p.slug = %s", $slug ) ); // phpcs:ignore WordPress.DB
	if ( ! $row ) {
		return null;
	}
	$rows = sh_attach_product_relations( array( $row ) );
	return $rows[0];
}

/**
 * Shop listing query (port of the Prisma query in app/(public)/shop/page.tsx).
 *
 * @return array{products:object[],total:int}
 */
function sh_query_products( $a ) {
	global $wpdb;
	$a = wp_parse_args( $a, array( 'category' => '', 'min' => '', 'max' => '', 'search' => '', 'sort' => 'newest', 'page' => 1, 'limit' => 12 ) );
	$p = sh_table( 'products' );
	$c = sh_table( 'categories' );

	$where = array( "p.status = 'ACTIVE'" );
	if ( '' !== $a['category'] ) {
		$where[] = $wpdb->prepare( 'c.slug = %s', $a['category'] );
	}
	if ( '' !== $a['min'] && is_numeric( $a['min'] ) ) {
		$where[] = $wpdb->prepare( 'p.price >= %f', (float) $a['min'] );
	}
	if ( '' !== $a['max'] && is_numeric( $a['max'] ) ) {
		$where[] = $wpdb->prepare( 'p.price <= %f', (float) $a['max'] );
	}
	if ( '' !== $a['search'] ) {
		$like    = '%' . $wpdb->esc_like( $a['search'] ) . '%';
		$where[] = $wpdb->prepare( '(p.title LIKE %s OR p.description LIKE %s)', $like, $like );
	}
	$order = array(
		'price_asc'    => 'p.price ASC',
		'price_desc'   => 'p.price DESC',
		'best_selling' => 'p.is_best_selling DESC, p.created_at DESC',
	);
	$order_by = isset( $order[ $a['sort'] ] ) ? $order[ $a['sort'] ] : 'p.created_at DESC';
	$page     = max( 1, (int) $a['page'] );
	$limit    = max( 1, (int) $a['limit'] );
	$w        = implode( ' AND ', $where );

	$total = (int) $wpdb->get_var( "SELECT COUNT(*) FROM $p p LEFT JOIN $c c ON c.id = p.category_id WHERE $w" ); // phpcs:ignore WordPress.DB
	$rows  = (array) $wpdb->get_results( "SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM $p p LEFT JOIN $c c ON c.id = p.category_id WHERE $w ORDER BY $order_by LIMIT " . ( ( $page - 1 ) * $limit ) . ", $limit" ); // phpcs:ignore WordPress.DB
	return array( 'products' => sh_attach_product_relations( $rows ), 'total' => $total );
}

function sh_related_products( $product, $limit = 4 ) {
	global $wpdb;
	if ( ! $product->category_id ) {
		return array();
	}
	$p    = sh_table( 'products' );
	$c    = sh_table( 'categories' );
	$rows = (array) $wpdb->get_results( $wpdb->prepare( "SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM $p p LEFT JOIN $c c ON c.id = p.category_id WHERE p.category_id = %s AND p.id <> %s AND p.status = 'ACTIVE' ORDER BY p.created_at DESC LIMIT %d", $product->category_id, $product->id, $limit ) ); // phpcs:ignore WordPress.DB
	return sh_attach_product_relations( $rows );
}

/* ───────── CMS pages ───────── */

/** Published page (sections decoded) or null. */
function sh_get_page( $slug ) {
	global $wpdb;
	$row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . sh_table( 'pages' ) . ' WHERE slug = %s AND is_published = 1', $slug ) ); // phpcs:ignore WordPress.DB
	if ( ! $row ) {
		return null;
	}
	$sections       = json_decode( (string) $row->sections, true );
	$row->sections  = is_array( $sections ) ? $sections : array();
	return $row;
}

function sh_page_exists( $slug ) {
	global $wpdb;
	return (bool) $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM ' . sh_table( 'pages' ) . ' WHERE slug = %s AND is_published = 1', $slug ) ); // phpcs:ignore WordPress.DB
}

/* ───────── Blog ───────── */

function sh_blog_posts( $published_only = true ) {
	global $wpdb;
	$where = $published_only ? 'WHERE is_published = 1' : '';
	$rows  = (array) $wpdb->get_results( 'SELECT * FROM ' . sh_table( 'blog_posts' ) . " $where ORDER BY published_at DESC" ); // phpcs:ignore WordPress.DB
	foreach ( $rows as $r ) {
		$r->tags = $r->tags ? json_decode( $r->tags, true ) : array();
	}
	return $rows;
}

function sh_get_blog_post( $slug ) {
	global $wpdb;
	$r = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . sh_table( 'blog_posts' ) . ' WHERE slug = %s AND is_published = 1', $slug ) ); // phpcs:ignore WordPress.DB
	if ( $r ) {
		$r->tags = $r->tags ? json_decode( $r->tags, true ) : array();
	}
	return $r;
}
