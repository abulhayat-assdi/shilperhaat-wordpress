<?php
defined( 'ABSPATH' ) || exit;

/**
 * Activation, DB schema (dbDelta) and roles.
 */
class SH_Install {

	const DB_VERSION = '1.0.0';

	/** Admin-panel page keys (mirrors lib/admin-pages.ts in the original app). */
	const ADMIN_PAGES = [
		'dashboard'      => 'Dashboard',
		'products'       => 'Products',
		'categories'     => 'Categories',
		'banners'        => 'Banners',
		'reviews'        => 'Reviews',
		'orders'         => 'Orders',
		'coupons'        => 'Coupon Codes',
		'pages'          => 'Pages',
		'site-layout'    => 'Site Layout',
		'contact-widget' => 'Contact Widget',
		'settings'       => 'Settings',
	];

	public static function activate(): void {
		self::create_tables();
		self::create_roles();
		if ( '' === get_option( 'permalink_structure' ) ) {
			update_option( 'permalink_structure', '/%postname%/' );
		}
		add_option( 'sh_settings', sh_default_settings(), '', false );
		update_option( 'sh_db_version', self::DB_VERSION );
		flush_rewrite_rules();
	}

	public static function maybe_upgrade(): void {
		if ( get_option( 'sh_db_version' ) !== self::DB_VERSION ) {
			self::create_tables();
			self::create_roles();
			update_option( 'sh_db_version', self::DB_VERSION );
		}
	}

	public static function create_tables(): void {
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		$c = $wpdb->get_charset_collate();

		$sql = [];

		$t     = sh_table( 'product_images' );
		$sql[] = "CREATE TABLE $t (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			product_id BIGINT UNSIGNED NOT NULL,
			image_url VARCHAR(500) NOT NULL,
			sort_order INT NOT NULL DEFAULT 0,
			alt_text VARCHAR(255) NULL,
			PRIMARY KEY  (id),
			KEY product_id (product_id)
		) $c;";

		$t     = sh_table( 'reviews' );
		$sql[] = "CREATE TABLE $t (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			product_id BIGINT UNSIGNED NULL,
			name VARCHAR(191) NOT NULL,
			title VARCHAR(255) NULL,
			rating TINYINT NOT NULL DEFAULT 5,
			content LONGTEXT NOT NULL,
			avatar_url VARCHAR(500) NULL,
			role VARCHAR(191) NULL,
			is_visible TINYINT(1) NOT NULL DEFAULT 1,
			sort_order INT NOT NULL DEFAULT 0,
			created_at DATETIME NOT NULL,
			updated_at DATETIME NOT NULL,
			PRIMARY KEY  (id),
			KEY product_id (product_id)
		) $c;";

		$t     = sh_table( 'banners' );
		$sql[] = "CREATE TABLE $t (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			title VARCHAR(255) NULL,
			subtitle TEXT NULL,
			image_url VARCHAR(500) NOT NULL,
			mobile_image_url VARCHAR(500) NULL,
			button_text VARCHAR(191) NULL,
			button_link VARCHAR(500) NULL,
			sort_order INT NOT NULL DEFAULT 0,
			is_active TINYINT(1) NOT NULL DEFAULT 1,
			created_at DATETIME NOT NULL,
			updated_at DATETIME NOT NULL,
			PRIMARY KEY  (id)
		) $c;";

		$t     = sh_table( 'pages' );
		$sql[] = "CREATE TABLE $t (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			slug VARCHAR(191) NOT NULL,
			title VARCHAR(255) NOT NULL,
			subtitle VARCHAR(500) NOT NULL DEFAULT '',
			sections LONGTEXT NOT NULL,
			meta_title VARCHAR(255) NOT NULL DEFAULT '',
			meta_description VARCHAR(500) NOT NULL DEFAULT '',
			is_published TINYINT(1) NOT NULL DEFAULT 1,
			updated_at DATETIME NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY slug (slug)
		) $c;";

		$t     = sh_table( 'site_content' );
		$sql[] = "CREATE TABLE $t (
			content_key VARCHAR(100) NOT NULL,
			value LONGTEXT NOT NULL,
			updated_at DATETIME NOT NULL,
			PRIMARY KEY  (content_key)
		) $c;";

		foreach ( $sql as $s ) {
			dbDelta( $s );
		}
	}

	public static function create_roles(): void {
		if ( ! get_role( 'sh_staff' ) ) {
			add_role( 'sh_staff', 'Shilperhaat Staff', [ 'read' => true ] );
		}
	}
}
