<?php
/**
 * Tiny declarative CRUD screen builder used by Categories, Banners, Reviews and Coupons.
 *
 * $cfg = array(
 *   'table' => 'categories', 'title' => 'Categories', 'singular' => 'Category',
 *   'order' => 'sort_order ASC',
 *   'columns' => array( 'Label' => callable( $row ) => html ),
 *   'fields'  => array( array( 'col'=>'name', 'label'=>'Name', 'type'=>'text|number|textarea|checkbox|select|media|datetime|slug', 'required'=>true, 'options'=>[...], 'hint'=>'', 'default'=>'' ) ),
 *   'before_save' => callable( array $data, string $id ) => array|WP_Error,
 *   'after_delete' => callable( string $id ),
 * )
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function sh_crud_register( $key, $cfg ) {
	$GLOBALS['sh_crud'][ $key ] = $cfg;
	sh_admin_action( 'crud_save_' . $key, $key, function () use ( $key ) {
		sh_crud_save( $key );
	} );
	sh_admin_action( 'crud_delete_' . $key, $key, function () use ( $key ) {
		sh_crud_delete( $key );
	} );
}

function sh_crud_render( $key ) {
	global $wpdb;
	$cfg  = $GLOBALS['sh_crud'][ $key ];
	$t    = sh_table( $cfg['table'] );
	// phpcs:disable WordPress.Security.NonceVerification
	$edit = isset( $_GET['edit'] ) ? sanitize_text_field( wp_unslash( $_GET['edit'] ) ) : '';
	if ( $edit ) {
		$row = 'new' === $edit ? null : $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $t WHERE id = %s", $edit ) ); // phpcs:ignore WordPress.DB
		sh_admin_title( ( $row ? 'Edit ' : 'Add ' ) . $cfg['singular'], '<a class="button" href="' . esc_url( sh_admin_url( $key ) ) . '">← Back</a>' );
		sh_form_open( 'crud_save_' . $key, array( 'id' => $row ? $row->id : '' ) );
		echo '<div class="sh-card"><div class="sh-grid sh-grid-2">';
		foreach ( $cfg['fields'] as $f ) {
			sh_crud_field( $f, $row );
		}
		echo '</div></div><button class="button button-primary">Save</button></form>';
		return;
	}
	$paged = max( 1, (int) ( isset( $_GET['paged'] ) ? $_GET['paged'] : 1 ) );
	$per   = 30;
	$total = (int) $wpdb->get_var( "SELECT COUNT(*) FROM $t" ); // phpcs:ignore WordPress.DB
	$rows  = (array) $wpdb->get_results( "SELECT * FROM $t ORDER BY {$cfg['order']} LIMIT " . ( ( $paged - 1 ) * $per ) . ", $per" ); // phpcs:ignore WordPress.DB
	sh_admin_title( $cfg['title'], '<a class="button button-primary" href="' . esc_url( sh_admin_url( $key, array( 'edit' => 'new' ) ) ) . '">+ Add ' . esc_html( $cfg['singular'] ) . '</a>' );
	echo '<table class="sh-table"><thead><tr>';
	foreach ( array_keys( $cfg['columns'] ) as $label ) {
		echo '<th>' . esc_html( $label ) . '</th>';
	}
	echo '<th></th></tr></thead><tbody>';
	foreach ( $rows as $r ) {
		echo '<tr>';
		foreach ( $cfg['columns'] as $cb ) {
			echo '<td>' . call_user_func( $cb, $r ) . '</td>'; // phpcs:ignore
		}
		echo '<td class="sh-row-actions"><a href="' . esc_url( sh_admin_url( $key, array( 'edit' => $r->id ) ) ) . '">Edit</a>';
		if ( ! empty( $cfg['extra_actions'] ) ) {
			echo call_user_func( $cfg['extra_actions'], $r ); // phpcs:ignore
		}
		sh_form_open( 'crud_delete_' . $key, array( 'id' => $r->id ), 'style="display:inline" data-sh-confirm="Delete this ' . esc_attr( strtolower( $cfg['singular'] ) ) . '?"' );
		echo '<button class="sh-link-danger">Delete</button></form></td></tr>';
	}
	if ( ! $rows ) {
		echo '<tr><td colspan="' . ( count( $cfg['columns'] ) + 1 ) . '" class="sh-muted">Nothing here yet.</td></tr>';
	}
	echo '</tbody></table>';
	sh_pager( $total, $per, $paged, $key );
}

function sh_crud_field( $f, $row ) {
	$col = $f['col'];
	$val = $row && isset( $row->$col ) ? $row->$col : ( isset( $f['default'] ) ? $f['default'] : '' );
	$req = ! empty( $f['required'] ) ? 'required' : '';
	echo '<div class="sh-field' . ( ! empty( $f['wide'] ) ? '" style="grid-column:1/-1' : '' ) . '">';
	switch ( $f['type'] ) {
		case 'checkbox':
			echo '<label><input type="checkbox" name="' . esc_attr( $col ) . '" value="1" ' . checked( (int) $val, 1, false ) . '> ' . esc_html( $f['label'] ) . '</label>';
			break;
		case 'textarea':
			echo '<label>' . esc_html( $f['label'] ) . '</label><textarea name="' . esc_attr( $col ) . '" rows="4" ' . $req . '>' . esc_textarea( $val ) . '</textarea>'; // phpcs:ignore
			break;
		case 'select':
			echo '<label>' . esc_html( $f['label'] ) . '</label><select name="' . esc_attr( $col ) . '">';
			foreach ( $f['options'] as $ov => $ol ) {
				echo '<option value="' . esc_attr( $ov ) . '" ' . selected( (string) $val, (string) $ov, false ) . '>' . esc_html( $ol ) . '</option>';
			}
			echo '</select>';
			break;
		case 'media':
			echo '<label>' . esc_html( $f['label'] ) . '</label>';
			sh_media_field( $col, $val, false, 'Choose image' );
			break;
		case 'datetime':
			$dt = $val ? gmdate( 'Y-m-d\TH:i', strtotime( $val . ' UTC' ) ) : '';
			echo '<label>' . esc_html( $f['label'] ) . '</label><input type="datetime-local" name="' . esc_attr( $col ) . '" value="' . esc_attr( $dt ) . '">';
			break;
		default:
			$type = 'number' === $f['type'] ? 'number' : 'text';
			echo '<label>' . esc_html( $f['label'] ) . '</label><input type="' . esc_attr( $type ) . '" name="' . esc_attr( $col ) . '" value="' . esc_attr( $val ) . '" ' . ( 'number' === $type && isset( $f['step'] ) ? 'step="' . esc_attr( $f['step'] ) . '"' : '' ) . ' ' . $req . '>'; // phpcs:ignore
	}
	if ( ! empty( $f['hint'] ) ) {
		echo '<div class="hint">' . esc_html( $f['hint'] ) . '</div>';
	}
	echo '</div>';
}

function sh_crud_save( $key ) {
	global $wpdb;
	$cfg  = $GLOBALS['sh_crud'][ $key ];
	$id   = sh_post_text( 'id' );
	$data = array();
	foreach ( $cfg['fields'] as $f ) {
		$col = $f['col'];
		switch ( $f['type'] ) {
			case 'checkbox':
				$data[ $col ] = sh_post_bool( $col );
				break;
			case 'number':
				$raw          = sh_post( $col );
				$data[ $col ] = '' === $raw || ! is_numeric( $raw ) ? ( ! empty( $f['nullable'] ) ? null : 0 ) : $raw + 0;
				break;
			case 'textarea':
				$data[ $col ] = sanitize_textarea_field( sh_post( $col ) );
				break;
			case 'media':
				$data[ $col ] = esc_url_raw( sh_post( $col ) ) ? esc_url_raw( sh_post( $col ) ) : null;
				break;
			case 'datetime':
				$raw          = sh_post_text( $col );
				$data[ $col ] = $raw ? gmdate( 'Y-m-d H:i:s', strtotime( $raw . ' UTC' ) ) : null;
				break;
			default:
				$v            = sh_post_text( $col );
				$data[ $col ] = '' === $v && ! empty( $f['nullable'] ) ? null : $v;
		}
		if ( ! empty( $f['required'] ) && ( null === $data[ $col ] || '' === $data[ $col ] ) ) {
			sh_admin_notice_flash( 'error', $f['label'] . ' is required.' );
			sh_admin_redirect( $key, array( 'edit' => $id ? $id : 'new' ) );
		}
	}
	if ( ! empty( $cfg['before_save'] ) ) {
		$data = call_user_func( $cfg['before_save'], $data, $id );
		if ( is_wp_error( $data ) ) {
			sh_admin_notice_flash( 'error', $data->get_error_message() );
			sh_admin_redirect( $key, array( 'edit' => $id ? $id : 'new' ) );
		}
	}
	$table = sh_table( $cfg['table'] );
	$now   = current_time( 'mysql', true );
	$cols  = $wpdb->get_col( "SHOW COLUMNS FROM $table", 0 ); // phpcs:ignore WordPress.DB
	if ( in_array( 'updated_at', $cols, true ) ) {
		$data['updated_at'] = $now;
	}
	if ( $id ) {
		$wpdb->update( $table, $data, array( 'id' => $id ) );
	} else {
		$data['id'] = sh_new_id();
		if ( in_array( 'created_at', $cols, true ) ) {
			$data['created_at'] = $now;
		}
		$wpdb->insert( $table, $data );
	}
	wp_cache_delete( 'sh_categories', 'shilperhaat' );
	sh_admin_notice_flash( 'success', $cfg['singular'] . ' saved.' );
	sh_admin_redirect( $key );
}

function sh_crud_delete( $key ) {
	global $wpdb;
	$cfg = $GLOBALS['sh_crud'][ $key ];
	$id  = sh_post_text( 'id' );
	$wpdb->delete( sh_table( $cfg['table'] ), array( 'id' => $id ) );
	if ( ! empty( $cfg['after_delete'] ) ) {
		call_user_func( $cfg['after_delete'], $id );
	}
	wp_cache_delete( 'sh_categories', 'shilperhaat' );
	sh_admin_notice_flash( 'success', $cfg['singular'] . ' deleted.' );
	sh_admin_redirect( $key );
}
