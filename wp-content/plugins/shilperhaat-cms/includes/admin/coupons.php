<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
sh_crud_register( 'coupons', array(
	'table'    => 'coupons',
	'title'    => 'Coupon Codes',
	'singular' => 'Coupon',
	'order'    => 'created_at DESC',
	'columns'  => array(
		'Code'     => static function ( $r ) {
			return '<strong>' . esc_html( $r->code ) . '</strong><br><span class="sh-muted">' . esc_html( $r->description ) . '</span>';
		},
		'Discount' => static function ( $r ) {
			return 'PERCENTAGE' === $r->type ? esc_html( rtrim( rtrim( number_format( (float) $r->value, 2 ), '0' ), '.' ) ) . '%' : esc_html( sh_format_price( $r->value ) );
		},
		'Min order' => static function ( $r ) {
			return esc_html( sh_format_price( $r->min_order_amount ) );
		},
		'Used'     => static function ( $r ) {
			return (int) $r->used_count . ( null !== $r->max_uses ? ' / ' . (int) $r->max_uses : '' );
		},
		'Expires'  => static function ( $r ) {
			return $r->expires_at ? esc_html( gmdate( 'M j, Y', strtotime( $r->expires_at ) ) ) : '—';
		},
		'Status'   => static function ( $r ) {
			$expired = $r->expires_at && strtotime( $r->expires_at . ' UTC' ) < time();
			return $expired ? '<span class="sh-pill red">Expired</span>' : ( $r->is_active ? '<span class="sh-pill green">Active</span>' : '<span class="sh-pill gray">Inactive</span>' );
		},
	),
	'fields'   => array(
		array( 'col' => 'code', 'label' => 'Code', 'type' => 'text', 'required' => true, 'hint' => 'Stored in upper case.' ),
		array( 'col' => 'description', 'label' => 'Description', 'type' => 'text' ),
		array( 'col' => 'type', 'label' => 'Type', 'type' => 'select', 'options' => array( 'FIXED' => 'Fixed amount (৳)', 'PERCENTAGE' => 'Percentage (%)' ) ),
		array( 'col' => 'value', 'label' => 'Value', 'type' => 'number', 'step' => '0.01', 'required' => true ),
		array( 'col' => 'min_order_amount', 'label' => 'Minimum order amount (৳)', 'type' => 'number', 'step' => '0.01', 'default' => 0 ),
		array( 'col' => 'max_uses', 'label' => 'Max uses (empty = unlimited)', 'type' => 'number', 'nullable' => true ),
		array( 'col' => 'expires_at', 'label' => 'Expires at (UTC)', 'type' => 'datetime' ),
		array( 'col' => 'is_active', 'label' => 'Active', 'type' => 'checkbox', 'default' => 1 ),
	),
	'before_save' => static function ( $d, $id ) {
		global $wpdb;
		$d['code'] = strtoupper( preg_replace( '/\s+/', '', $d['code'] ) );
		if ( $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM ' . sh_table( 'coupons' ) . ' WHERE code = %s AND id <> %s', $d['code'], $id ) ) ) { // phpcs:ignore WordPress.DB
			return new WP_Error( 'dup', 'A coupon with this code already exists.' );
		}
		if ( 'PERCENTAGE' === $d['type'] && $d['value'] > 100 ) {
			return new WP_Error( 'pct', 'Percentage cannot exceed 100.' );
		}
		return $d;
	},
) );
