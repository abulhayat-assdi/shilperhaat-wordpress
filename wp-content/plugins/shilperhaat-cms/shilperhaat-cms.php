<?php
/**
 * Plugin Name:       Shilperhaat CMS
 * Description:       Custom storefront back-end and admin panel for Shilperhaat (products/orders run on WooCommerce, the storefront lives in the "shilperhaat" theme).
 * Version:           1.0.0
 * Requires at least: 6.4
 * Requires PHP:      8.1
 * Requires Plugins:  woocommerce
 * Author:            Shilperhaat
 * Text Domain:       shilperhaat-cms
 */

defined( 'ABSPATH' ) || exit;

define( 'SH_CMS_VERSION', '1.0.0' );
define( 'SH_CMS_FILE', __FILE__ );
define( 'SH_CMS_DIR', plugin_dir_path( __FILE__ ) );
define( 'SH_CMS_URL', plugin_dir_url( __FILE__ ) );

require_once SH_CMS_DIR . 'includes/helpers.php';
require_once SH_CMS_DIR . 'includes/class-sh-install.php';
require_once SH_CMS_DIR . 'includes/class-sh-store.php';
require_once SH_CMS_DIR . 'includes/class-sh-catalog.php';
require_once SH_CMS_DIR . 'includes/class-sh-orders.php';
require_once SH_CMS_DIR . 'includes/class-sh-coupons.php';
require_once SH_CMS_DIR . 'includes/class-sh-router.php';
require_once SH_CMS_DIR . 'includes/class-sh-rest.php';
require_once SH_CMS_DIR . 'includes/class-sh-meta.php';
require_once SH_CMS_DIR . 'includes/class-sh-seo.php';
require_once SH_CMS_DIR . 'includes/class-sh-importer.php';
require_once SH_CMS_DIR . 'includes/class-sh-courier.php';
require_once SH_CMS_DIR . 'admin/class-sh-admin.php';
require_once SH_CMS_DIR . 'admin/class-sh-wpadmin.php';

register_activation_hook( __FILE__, [ 'SH_Install', 'activate' ] );

add_action( 'plugins_loaded', static function () {
	SH_Install::maybe_upgrade();
	SH_WpAdmin::init();
	if ( ! class_exists( 'WooCommerce' ) ) {
		return; // storefront stays inert until WooCommerce is active (an admin notice explains why)
	}
	SH_Router::init();
	SH_Rest::init();
	SH_Orders::init();
	SH_Seo::init();
	SH_Admin::init();
	if ( defined( 'WP_CLI' ) && WP_CLI ) {
		WP_CLI::add_command( 'shilperhaat', 'SH_Importer_CLI' );
	}
}, 20 );

add_action( 'admin_notices', static function () {
	if ( ! class_exists( 'WooCommerce' ) && current_user_can( 'activate_plugins' ) ) {
		echo '<div class="notice notice-error"><p><strong>Shilperhaat CMS</strong> requires the <strong>WooCommerce</strong> plugin. Please install and activate WooCommerce.</p></div>';
	}
} );
