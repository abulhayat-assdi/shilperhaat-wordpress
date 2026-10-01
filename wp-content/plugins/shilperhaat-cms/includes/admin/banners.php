<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
sh_crud_register( 'banners', array(
	'table'    => 'banners',
	'title'    => 'Banners',
	'singular' => 'Banner',
	'order'    => 'sort_order ASC, created_at ASC',
	'columns'  => array(
		'Desktop' => static function ( $r ) {
			return '<img style="width:140px;height:50px;object-fit:cover;border-radius:6px" src="' . esc_url( sh_media_url( $r->image_url ) ) . '" alt="">';
		},
		'Mobile'  => static function ( $r ) {
			return $r->mobile_image_url ? '<img class="sh-thumb" src="' . esc_url( sh_media_url( $r->mobile_image_url ) ) . '" alt="">' : '<span class="sh-muted">—</span>';
		},
		'Title'   => static function ( $r ) {
			return esc_html( $r->title ? $r->title : '—' );
		},
		'Order'   => static function ( $r ) {
			return (int) $r->sort_order;
		},
		'Active'  => static function ( $r ) {
			return $r->is_active ? '<span class="sh-pill green">Active</span>' : '<span class="sh-pill gray">Hidden</span>';
		},
	),
	'fields'   => array(
		array( 'col' => 'image_url', 'label' => 'Desktop image (1920×600 recommended)', 'type' => 'media', 'required' => true, 'wide' => true ),
		array( 'col' => 'mobile_image_url', 'label' => 'Mobile image (768×400 recommended)', 'type' => 'media', 'wide' => true ),
		array( 'col' => 'title', 'label' => 'Title (alt text)', 'type' => 'text', 'nullable' => true ),
		array( 'col' => 'subtitle', 'label' => 'Subtitle', 'type' => 'text', 'nullable' => true ),
		array( 'col' => 'button_text', 'label' => 'Button text', 'type' => 'text', 'nullable' => true ),
		array( 'col' => 'button_link', 'label' => 'Button link', 'type' => 'text', 'nullable' => true ),
		array( 'col' => 'sort_order', 'label' => 'Sort order', 'type' => 'number', 'default' => 0 ),
		array( 'col' => 'is_active', 'label' => 'Active', 'type' => 'checkbox', 'default' => 1 ),
	),
) );
