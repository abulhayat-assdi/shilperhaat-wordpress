<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
sh_crud_register( 'reviews', array(
	'table'    => 'reviews',
	'title'    => 'Reviews',
	'singular' => 'Review',
	'order'    => 'is_visible ASC, created_at DESC',
	'columns'  => array(
		'Reviewer' => static function ( $r ) {
			return '<strong>' . esc_html( $r->name ) . '</strong>' . ( $r->role ? '<br><span class="sh-muted">' . esc_html( $r->role ) . '</span>' : '' );
		},
		'Rating'   => static function ( $r ) {
			return str_repeat( '★', (int) $r->rating ) . str_repeat( '☆', 5 - (int) $r->rating );
		},
		'Review'   => static function ( $r ) {
			return esc_html( mb_substr( $r->content, 0, 140 ) );
		},
		'For'      => static function ( $r ) {
			global $wpdb;
			if ( ! $r->product_id ) {
				return '<span class="sh-pill blue">Home testimonial</span>';
			}
			$t = $wpdb->get_var( $wpdb->prepare( 'SELECT title FROM ' . sh_table( 'products' ) . ' WHERE id = %s', $r->product_id ) ); // phpcs:ignore WordPress.DB
			return esc_html( $t ? mb_substr( $t, 0, 40 ) : 'Product' );
		},
		'Status'   => static function ( $r ) {
			return $r->is_visible ? '<span class="sh-pill green">Visible</span>' : '<span class="sh-pill yellow">Pending</span>';
		},
	),
	'extra_actions' => static function ( $r ) {
		ob_start();
		sh_form_open( 'review_toggle', array( 'id' => $r->id ), 'style="display:inline"' );
		echo '<button class="button-link">' . ( $r->is_visible ? 'Hide' : 'Approve' ) . '</button></form>';
		return ob_get_clean();
	},
	'fields'   => array(
		array( 'col' => 'name', 'label' => 'Name', 'type' => 'text', 'required' => true ),
		array( 'col' => 'role', 'label' => 'Role / location', 'type' => 'text', 'nullable' => true ),
		array( 'col' => 'title', 'label' => 'Title', 'type' => 'text', 'nullable' => true ),
		array( 'col' => 'rating', 'label' => 'Rating (1–5)', 'type' => 'number', 'default' => 5, 'required' => true ),
		array( 'col' => 'content', 'label' => 'Review', 'type' => 'textarea', 'required' => true, 'wide' => true ),
		array( 'col' => 'avatar_url', 'label' => 'Avatar', 'type' => 'media' ),
		array( 'col' => 'sort_order', 'label' => 'Sort order', 'type' => 'number', 'default' => 0 ),
		array( 'col' => 'is_visible', 'label' => 'Visible on the site', 'type' => 'checkbox', 'default' => 1 ),
	),
	'before_save' => static function ( $d ) {
		$d['rating'] = max( 1, min( 5, (int) $d['rating'] ) );
		return $d;
	},
) );

sh_admin_action( 'review_toggle', 'reviews', function () {
	global $wpdb;
	$id = sh_post_text( 'id' );
	$wpdb->query( $wpdb->prepare( 'UPDATE ' . sh_table( 'reviews' ) . ' SET is_visible = 1 - is_visible, updated_at = %s WHERE id = %s', current_time( 'mysql', true ), $id ) ); // phpcs:ignore WordPress.DB
	sh_admin_notice_flash( 'success', 'Review updated.' );
	sh_admin_redirect( 'reviews' );
} );
