<?php
/**
 * Database schema (custom tables, prefix-aware). Mirrors the original Prisma models.
 * Tables are added step by step; dbDelta keeps this idempotent.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'SH_CMS_DB_VERSION', '1' );

function sh_table( $name ) {
	global $wpdb;
	return $wpdb->prefix . 'sh_' . $name;
}

function sh_cms_install_schema() {
	global $wpdb;
	require_once ABSPATH . 'wp-admin/includes/upgrade.php';
	$charset = $wpdb->get_charset_collate();

	$sql   = array();
	$sql[] = 'CREATE TABLE ' . sh_table( 'categories' ) . " (
		id varchar(32) NOT NULL,
		name varchar(191) NOT NULL,
		slug varchar(191) NOT NULL,
		image_url text NULL,
		is_featured tinyint(1) NOT NULL DEFAULT 0,
		sort_order int NOT NULL DEFAULT 0,
		created_at datetime NOT NULL,
		updated_at datetime NOT NULL,
		PRIMARY KEY  (id),
		UNIQUE KEY slug (slug),
		KEY sort_order (sort_order)
	) $charset;";

	foreach ( $sql as $statement ) {
		dbDelta( $statement );
	}
	update_option( 'sh_cms_db_version', SH_CMS_DB_VERSION );
}
