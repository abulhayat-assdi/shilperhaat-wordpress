<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
sh_crud_register( 'categories', array(
	'table'    => 'categories',
	'title'    => 'Categories',
	'singular' => 'Category',
	'order'    => 'sort_order ASC, name ASC',
	'columns'  => array(
		''         => static function ( $r ) {
			return '<img class="sh-thumb" src="' . esc_url( sh_image_url( $r->image_url ) ) . '" alt="">';
		},
		'Name'     => static function ( $r ) {
			return '<strong>' . esc_html( $r->name ) . '</strong><br><span class="sh-muted">/' . esc_html( $r->slug ) . '</span>';
		},
		'Featured' => static function ( $r ) {
			return $r->is_featured ? '<span class="sh-pill green">Yes</span>' : '<span class="sh-pill gray">No</span>';
		},
		'Order'    => static function ( $r ) {
			return (int) $r->sort_order;
		},
		'Products' => static function ( $r ) {
			global $wpdb;
			return (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM ' . sh_table( 'products' ) . ' WHERE category_id = %s', $r->id ) ); // phpcs:ignore WordPress.DB
		},
	),
	'fields'   => array(
		array( 'col' => 'name', 'label' => 'Name', 'type' => 'text', 'required' => true ),
		array( 'col' => 'slug', 'label' => 'Slug', 'type' => 'text', 'hint' => 'Leave empty to generate from the name.' ),
		array( 'col' => 'image_url', 'label' => 'Image', 'type' => 'media', 'wide' => true ),
		array( 'col' => 'sort_order', 'label' => 'Sort order (lower first)', 'type' => 'number', 'default' => 0 ),
		array( 'col' => 'is_featured', 'label' => 'Featured on home page', 'type' => 'checkbox' ),
	),
	'before_save' => static function ( $d, $id ) {
		$d['slug'] = sh_unique_slug( 'categories', sh_slugify( $d['slug'] ? $d['slug'] : $d['name'] ), $id );
		return $d;
	},
	'after_delete' => static function ( $id ) {
		global $wpdb;
		$wpdb->update( sh_table( 'products' ), array( 'category_id' => null ), array( 'category_id' => $id ) );
	},
) );
