<?php
/**
 * Database schema (custom tables, prefix-aware). Mirrors the original Prisma models.
 * Tables are added step by step; dbDelta keeps this idempotent.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'SH_CMS_DB_VERSION', '2' );

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

	$sql[] = 'CREATE TABLE ' . sh_table( 'products' ) . " (
		id varchar(32) NOT NULL,
		title varchar(255) NOT NULL,
		slug varchar(191) NOT NULL,
		description longtext NULL,
		price decimal(10,2) NOT NULL DEFAULT 0,
		compare_at_price decimal(10,2) NULL,
		stock int NOT NULL DEFAULT 0,
		category_id varchar(32) NULL,
		is_featured tinyint(1) NOT NULL DEFAULT 0,
		is_best_selling tinyint(1) NOT NULL DEFAULT 0,
		status varchar(20) NOT NULL DEFAULT 'ACTIVE',
		sku varchar(191) NULL,
		tags longtext NULL,
		video_url text NULL,
		youtube_url text NULL,
		youtube_video_id varchar(64) NULL,
		created_at datetime NOT NULL,
		updated_at datetime NOT NULL,
		PRIMARY KEY  (id),
		UNIQUE KEY slug (slug),
		UNIQUE KEY sku (sku),
		KEY category_id (category_id),
		KEY status (status),
		KEY created_at (created_at)
	) $charset;";

	$sql[] = 'CREATE TABLE ' . sh_table( 'product_images' ) . " (
		id varchar(32) NOT NULL,
		product_id varchar(32) NOT NULL,
		image_url text NOT NULL,
		sort_order int NOT NULL DEFAULT 0,
		alt_text varchar(255) NULL,
		PRIMARY KEY  (id),
		KEY product_id (product_id)
	) $charset;";

	$sql[] = 'CREATE TABLE ' . sh_table( 'reviews' ) . " (
		id varchar(32) NOT NULL,
		name varchar(191) NOT NULL,
		title varchar(255) NULL,
		rating int NOT NULL DEFAULT 5,
		content longtext NOT NULL,
		avatar_url text NULL,
		role varchar(191) NULL,
		is_visible tinyint(1) NOT NULL DEFAULT 1,
		sort_order int NOT NULL DEFAULT 0,
		product_id varchar(32) NULL,
		created_at datetime NOT NULL,
		updated_at datetime NOT NULL,
		PRIMARY KEY  (id),
		KEY product_id (product_id)
	) $charset;";

	$sql[] = 'CREATE TABLE ' . sh_table( 'orders' ) . " (
		id varchar(32) NOT NULL,
		order_number varchar(64) NOT NULL,
		customer_name varchar(191) NOT NULL,
		phone varchar(40) NOT NULL,
		address text NOT NULL,
		notes text NULL,
		subtotal decimal(10,2) NOT NULL DEFAULT 0,
		delivery_charge decimal(10,2) NOT NULL DEFAULT 0,
		total decimal(10,2) NOT NULL DEFAULT 0,
		payment_method varchar(40) NOT NULL DEFAULT 'COD',
		status varchar(20) NOT NULL DEFAULT 'PENDING',
		admin_note text NULL,
		courier_consignment_id varchar(100) NULL,
		courier_tracking_code varchar(100) NULL,
		courier_sent_at datetime NULL,
		courier_status varchar(100) NULL,
		coupon_code varchar(64) NULL,
		discount decimal(10,2) NOT NULL DEFAULT 0,
		created_at datetime NOT NULL,
		updated_at datetime NOT NULL,
		PRIMARY KEY  (id),
		UNIQUE KEY order_number (order_number),
		KEY phone (phone),
		KEY status (status),
		KEY created_at (created_at)
	) $charset;";

	$sql[] = 'CREATE TABLE ' . sh_table( 'order_items' ) . " (
		id varchar(32) NOT NULL,
		order_id varchar(32) NOT NULL,
		product_id varchar(32) NULL,
		product_title varchar(255) NOT NULL,
		product_image text NULL,
		price decimal(10,2) NOT NULL DEFAULT 0,
		quantity int NOT NULL DEFAULT 1,
		line_total decimal(10,2) NOT NULL DEFAULT 0,
		PRIMARY KEY  (id),
		KEY order_id (order_id)
	) $charset;";

	$sql[] = 'CREATE TABLE ' . sh_table( 'banners' ) . " (
		id varchar(32) NOT NULL,
		title varchar(255) NULL,
		subtitle varchar(255) NULL,
		image_url text NOT NULL,
		mobile_image_url text NULL,
		button_text varchar(191) NULL,
		button_link text NULL,
		sort_order int NOT NULL DEFAULT 0,
		is_active tinyint(1) NOT NULL DEFAULT 1,
		created_at datetime NOT NULL,
		updated_at datetime NOT NULL,
		PRIMARY KEY  (id),
		KEY sort_order (sort_order)
	) $charset;";

	$sql[] = 'CREATE TABLE ' . sh_table( 'coupons' ) . " (
		id varchar(32) NOT NULL,
		code varchar(64) NOT NULL,
		type varchar(20) NOT NULL DEFAULT 'FIXED',
		value decimal(10,2) NOT NULL DEFAULT 0,
		min_order_amount decimal(10,2) NOT NULL DEFAULT 0,
		max_uses int NULL,
		used_count int NOT NULL DEFAULT 0,
		is_active tinyint(1) NOT NULL DEFAULT 1,
		expires_at datetime NULL,
		description varchar(255) NOT NULL DEFAULT '',
		created_at datetime NOT NULL,
		updated_at datetime NOT NULL,
		PRIMARY KEY  (id),
		UNIQUE KEY code (code)
	) $charset;";

	$sql[] = 'CREATE TABLE ' . sh_table( 'pages' ) . " (
		id varchar(32) NOT NULL,
		slug varchar(191) NOT NULL,
		title varchar(255) NOT NULL,
		subtitle varchar(255) NOT NULL DEFAULT '',
		sections longtext NOT NULL,
		meta_title varchar(255) NOT NULL DEFAULT '',
		meta_description text NOT NULL,
		is_published tinyint(1) NOT NULL DEFAULT 1,
		updated_at datetime NOT NULL,
		PRIMARY KEY  (id),
		UNIQUE KEY slug (slug)
	) $charset;";

	$sql[] = 'CREATE TABLE ' . sh_table( 'blog_posts' ) . " (
		id varchar(32) NOT NULL,
		slug varchar(191) NOT NULL,
		title varchar(255) NOT NULL,
		excerpt text NOT NULL,
		content longtext NOT NULL,
		cover_image text NOT NULL,
		author varchar(191) NOT NULL DEFAULT '',
		category varchar(191) NOT NULL DEFAULT '',
		tags longtext NULL,
		is_published tinyint(1) NOT NULL DEFAULT 1,
		read_time int NOT NULL DEFAULT 3,
		published_at datetime NOT NULL,
		created_at datetime NOT NULL,
		updated_at datetime NOT NULL,
		PRIMARY KEY  (id),
		UNIQUE KEY slug (slug),
		KEY published_at (published_at)
	) $charset;";

	foreach ( $sql as $statement ) {
		dbDelta( $statement );
	}
	update_option( 'sh_cms_db_version', SH_CMS_DB_VERSION );
}
