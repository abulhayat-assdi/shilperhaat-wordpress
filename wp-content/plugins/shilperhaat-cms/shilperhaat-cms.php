<?php
/**
 * Plugin Name: Shilperhaat CMS
 * Description: Shilperhaat-এর কাস্টম CMS ও অ্যাডমিন প্যানেল (প্রোডাক্ট, ক্যাটাগরি, অর্ডার, সেটিংস)। থিম `shilperhaat`-এর সাথে ব্যবহার করুন।
 * Version: 0.1.0
 * Requires PHP: 8.1
 * Author: Shilperhaat
 * License: GPL-2.0-or-later
 * Text Domain: shilperhaat-cms
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'SH_CMS_VERSION', '0.1.0' );
define( 'SH_CMS_FILE', __FILE__ );
define( 'SH_CMS_DIR', plugin_dir_path( __FILE__ ) );
define( 'SH_CMS_URL', plugin_dir_url( __FILE__ ) );

require_once SH_CMS_DIR . 'includes/schema.php';
require_once SH_CMS_DIR . 'includes/settings.php';
require_once SH_CMS_DIR . 'includes/helpers.php';
require_once SH_CMS_DIR . 'includes/import.php';
require_once SH_CMS_DIR . 'includes/data.php';
require_once SH_CMS_DIR . 'includes/rest.php';
require_once SH_CMS_DIR . 'includes/integrations.php';
require_once SH_CMS_DIR . 'includes/orders.php';

register_activation_hook( __FILE__, 'sh_cms_activate' );

function sh_cms_activate() {
	sh_cms_install_schema();
	// Original site used clean URLs (/shop, /product/slug ...).
	update_option( 'permalink_structure', '/%postname%/' );
	flush_rewrite_rules();
}

// Keep the schema current after plugin updates / manual file uploads.
add_action( 'plugins_loaded', function () {
	if ( get_option( 'sh_cms_db_version' ) !== SH_CMS_DB_VERSION ) {
		sh_cms_install_schema();
	}
} );
