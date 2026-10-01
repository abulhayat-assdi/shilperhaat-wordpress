<?php
/**
 * Admin panel foundation: menu, per-page access control, UI helpers, notices.
 *
 * - WordPress administrators are "super admins" (all pages + Access Management + Settings secrets).
 * - Role "Shilperhaat Manager" (sh_manager) can only open the pages ticked for them in Access Management.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Admin pages (same keys/labels as the original admin panel). */
function sh_admin_pages() {
	return array(
		'dashboard'      => array( 'label' => 'Dashboard', 'icon' => 'dashicons-chart-area' ),
		'products'       => array( 'label' => 'Products', 'icon' => 'dashicons-products' ),
		'categories'     => array( 'label' => 'Categories', 'icon' => 'dashicons-category' ),
		'banners'        => array( 'label' => 'Banners', 'icon' => 'dashicons-images-alt2' ),
		'reviews'        => array( 'label' => 'Reviews', 'icon' => 'dashicons-star-filled' ),
		'orders'         => array( 'label' => 'Orders', 'icon' => 'dashicons-cart' ),
		'coupons'        => array( 'label' => 'Coupon Codes', 'icon' => 'dashicons-tickets-alt' ),
		'pages'          => array( 'label' => 'Pages', 'icon' => 'dashicons-admin-page' ),
		'blog'           => array( 'label' => 'Blog', 'icon' => 'dashicons-edit' ),
		'site-layout'    => array( 'label' => 'Site Layout', 'icon' => 'dashicons-layout' ),
		'contact-widget' => array( 'label' => 'Contact Widget', 'icon' => 'dashicons-format-chat' ),
		'settings'       => array( 'label' => 'Settings', 'icon' => 'dashicons-admin-generic' ),
	);
}

function sh_is_super_admin( $user_id = 0 ) {
	$user_id = $user_id ? $user_id : get_current_user_id();
	return $user_id && user_can( $user_id, 'manage_options' );
}

function sh_user_page_access( $user_id = 0 ) {
	$user_id = $user_id ? $user_id : get_current_user_id();
	$a       = get_user_meta( $user_id, 'sh_page_access', true );
	return is_array( $a ) ? $a : array();
}

function sh_user_can_page( $key, $user_id = 0 ) {
	if ( sh_is_super_admin( $user_id ) ) {
		return true;
	}
	$user_id = $user_id ? $user_id : get_current_user_id();
	return user_can( $user_id, 'sh_admin' ) && in_array( $key, sh_user_page_access( $user_id ), true );
}

/** Role + capability setup (idempotent, runs on activation and when the plugin version changes). */
function sh_admin_setup_roles() {
	if ( ! get_role( 'sh_manager' ) ) {
		add_role( 'sh_manager', 'Shilperhaat Manager', array( 'read' => true, 'sh_admin' => true, 'upload_files' => true ) );
	}
	$admin = get_role( 'administrator' );
	if ( $admin && ! $admin->has_cap( 'sh_admin' ) ) {
		$admin->add_cap( 'sh_admin' );
	}
}
add_action( 'init', function () {
	if ( get_option( 'sh_cms_roles_version' ) !== SH_CMS_VERSION ) {
		sh_admin_setup_roles();
		update_option( 'sh_cms_roles_version', SH_CMS_VERSION, false );
	}
} );

add_action( 'admin_menu', function () {
	if ( ! current_user_can( 'sh_admin' ) ) {
		return;
	}
	$first = null;
	foreach ( sh_admin_pages() as $key => $def ) {
		if ( sh_user_can_page( $key ) ) {
			$first = $key;
			break;
		}
	}
	if ( null === $first && ! sh_is_super_admin() ) {
		return;
	}
	$parent = 'shilperhaat-' . ( null === $first ? 'access' : $first );
	add_menu_page( 'Shilperhaat', 'Shilperhaat', 'sh_admin', $parent, 'sh_admin_render_page', 'dashicons-store', 3 );
	foreach ( sh_admin_pages() as $key => $def ) {
		if ( ! sh_user_can_page( $key ) ) {
			continue;
		}
		add_submenu_page( $parent, $def['label'], $def['label'], 'sh_admin', 'shilperhaat-' . $key, 'sh_admin_render_page' );
	}
	if ( sh_is_super_admin() ) {
		add_submenu_page( $parent, 'Access Management', 'Access Management', 'sh_admin', 'shilperhaat-access', 'sh_admin_render_page' );
		add_submenu_page( $parent, 'Import data', 'Import data', 'sh_admin', 'shilperhaat-import', 'sh_admin_render_page' );
	}
}, 9 );

/** Which admin key does the current request ask for? */
function sh_admin_current_key() {
	$page = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
	if ( false ) {
		foreach ( sh_admin_pages() as $key => $def ) {
			if ( sh_user_can_page( $key ) ) {
				return $key;
			}
		}
		return sh_is_super_admin() ? 'access' : '';
	}
	return 0 === strpos( $page, 'shilperhaat-' ) ? substr( $page, 12 ) : '';
}

function sh_admin_render_page() {
	$key = sh_admin_current_key();
	if ( 'access' === $key || 'import' === $key ) {
		if ( ! sh_is_super_admin() ) {
			wp_die( 'Forbidden', 403 );
		}
	} elseif ( ! $key || ! sh_user_can_page( $key ) ) {
		wp_die( esc_html__( 'You do not have access to this page. Ask the super admin to enable it for you.', 'shilperhaat-cms' ), 403 );
	}
	$fn = 'sh_admin_page_' . str_replace( '-', '_', $key );
	echo '<div class="wrap sh-admin">';
	sh_admin_notices();
	if ( isset( $GLOBALS['sh_crud'][ $key ] ) ) {
		sh_crud_render( $key );
	} elseif ( function_exists( $fn ) ) {
		$fn();
	} else {
		echo '<p>Unknown page.</p>';
	}
	echo '</div>';
}

add_action( 'admin_enqueue_scripts', function ( $hook ) {
	if ( false === strpos( (string) $hook, 'shilperhaat' ) ) {
		return;
	}
	wp_enqueue_style( 'sh-admin', SH_CMS_URL . 'assets/admin.css', array(), SH_CMS_VERSION );
	wp_enqueue_media();
	wp_enqueue_script( 'sh-admin', SH_CMS_URL . 'assets/admin.js', array( 'jquery' ), SH_CMS_VERSION, true );
} );

/* ─────────────── helpers used by every admin screen ─────────────── */

function sh_admin_url( $key, $args = array() ) {
	$slug = 'shilperhaat-' . $key;
	return add_query_arg( array_merge( array( 'page' => $slug ), $args ), admin_url( 'admin.php' ) );
}

function sh_admin_redirect( $key, $args = array() ) {
	wp_safe_redirect( sh_admin_url( $key, $args ) );
	exit;
}

function sh_admin_notice_flash( $type, $msg ) {
	set_transient( 'sh_flash_' . get_current_user_id(), array( $type, $msg ), 60 );
}

function sh_admin_notices() {
	$f = get_transient( 'sh_flash_' . get_current_user_id() );
	if ( $f ) {
		delete_transient( 'sh_flash_' . get_current_user_id() );
		printf( '<div class="notice notice-%s is-dismissible"><p>%s</p></div>', esc_attr( 'error' === $f[0] ? 'error' : 'success' ), esc_html( $f[1] ) );
	}
}

/** Register an admin-post action that checks nonce + page access. */
function sh_admin_action( $action, $page_key, $callback ) {
	add_action( 'admin_post_sh_' . $action, function () use ( $action, $page_key, $callback ) {
		if ( ! is_user_logged_in() || ! sh_user_can_page( $page_key ) ) {
			wp_die( 'Forbidden', 403 );
		}
		check_admin_referer( 'sh_' . $action );
		call_user_func( $callback );
	} );
}

function sh_form_open( $action, $extra_hidden = array(), $attrs = '' ) {
	echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '" ' . $attrs . '>'; // phpcs:ignore
	echo '<input type="hidden" name="action" value="sh_' . esc_attr( $action ) . '">';
	wp_nonce_field( 'sh_' . $action );
	foreach ( $extra_hidden as $k => $v ) {
		echo '<input type="hidden" name="' . esc_attr( $k ) . '" value="' . esc_attr( $v ) . '">';
	}
}

function sh_post( $key, $default = '' ) {
	return isset( $_POST[ $key ] ) ? wp_unslash( $_POST[ $key ] ) : $default; // phpcs:ignore WordPress.Security
}

function sh_post_text( $key, $default = '' ) {
	return sanitize_text_field( sh_post( $key, $default ) );
}

function sh_post_bool( $key ) {
	return isset( $_POST[ $key ] ) && '' !== $_POST[ $key ] && '0' !== $_POST[ $key ] ? 1 : 0; // phpcs:ignore WordPress.Security
}

function sh_admin_title( $title, $actions = '' ) {
	echo '<div class="sh-head"><h1>' . esc_html( $title ) . '</h1><div class="sh-head-actions">' . $actions . '</div></div>'; // phpcs:ignore
}

/** Uploads-picker field: stores one URL (single) or a JSON list (multi). */
function sh_media_field( $name, $value, $multi = false, $label = 'Choose image', $type = 'image' ) {
	$urls = $multi ? ( is_array( $value ) ? $value : array() ) : ( $value ? array( $value ) : array() );
	echo '<div class="sh-media" data-multi="' . ( $multi ? '1' : '0' ) . '" data-type="' . esc_attr( $type ) . '" data-name="' . esc_attr( $name ) . '">';
	echo '<div class="sh-media-list">';
	foreach ( $urls as $u ) {
		$thumb = 'video' === $type ? '<div class="sh-vid">🎬 ' . esc_html( basename( (string) $u ) ) . '</div>' : '<img src="' . esc_url( sh_media_url( $u ) ) . '" alt="">';
		echo '<div class="sh-media-item" draggable="true">' . $thumb . '<input type="hidden" name="' . esc_attr( $name ) . ( $multi ? '[]' : '' ) . '" value="' . esc_attr( $u ) . '"><button type="button" class="sh-media-rm" title="Remove">×</button></div>'; // phpcs:ignore
	}
	echo '</div><button type="button" class="button sh-media-add">' . esc_html( $label ) . '</button></div>';
}

function sh_pager( $total, $per, $paged, $key, $args = array() ) {
	$pages = (int) ceil( $total / $per );
	if ( $pages <= 1 ) {
		return;
	}
	echo '<div class="sh-pager">';
	for ( $i = 1; $i <= $pages; $i++ ) {
		printf( '<a class="%s" href="%s">%d</a>', $i === $paged ? 'on' : '', esc_url( sh_admin_url( $key, array_merge( $args, array( 'paged' => $i ) ) ) ), (int) $i );
	}
	echo '</div>';
}

function sh_slugify( $text ) {
	$s = mb_strtolower( trim( (string) $text ) );
	$s = preg_replace( '/[^\p{L}\p{N}\s-]/u', '', $s );
	$s = preg_replace( '/[\s_]+/', '-', $s );
	$s = trim( preg_replace( '/-+/', '-', $s ), '-' );
	return $s;
}

/** Unique slug within a table (appends -2, -3 ... like ensureUniqueSlug). */
function sh_unique_slug( $table, $slug, $exclude_id = '' ) {
	global $wpdb;
	$base = $slug ? $slug : 'item';
	$n    = 1;
	$try  = $base;
	while ( $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM ' . sh_table( $table ) . ' WHERE slug = %s AND id <> %s', $try, $exclude_id ) ) ) { // phpcs:ignore WordPress.DB
		++$n;
		$try = $base . '-' . $n;
	}
	return $try;
}

add_filter( 'login_redirect', function ( $to, $req, $user ) {
	if ( $user instanceof WP_User && in_array( 'sh_manager', (array) $user->roles, true ) ) {
		return admin_url( 'admin.php?page=shilperhaat-' . ( sh_user_can_page( 'dashboard', $user->ID ) ? 'dashboard' : ( array_values( array_intersect( array_keys( sh_admin_pages() ), sh_user_page_access( $user->ID ) ) )[0] ?? 'dashboard' ) ) );
	}
	return $to;
}, 10, 3 );

foreach ( array( 'crud', 'dashboard', 'products', 'categories', 'banners', 'reviews', 'orders', 'coupons', 'pages', 'blog', 'site-layout', 'contact-widget', 'settings', 'access', 'import' ) as $sh_admin_file ) {
	$sh_f = SH_CMS_DIR . 'includes/admin/' . $sh_admin_file . '.php';
	if ( file_exists( $sh_f ) ) {
		require_once $sh_f;
	}
}
