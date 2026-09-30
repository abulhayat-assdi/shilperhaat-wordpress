<?php
defined( 'ABSPATH' ) || exit;

/**
 * WordPress-dashboard page "Shilperhaat": first-run import, health checks and a link to the admin panel.
 */
class SH_WpAdmin {

	public static function init(): void {
		add_action( 'admin_menu', [ self::class, 'menu' ] );
		add_action( 'admin_post_sh_import', [ self::class, 'handle_import' ] );
		add_action( 'admin_init', [ self::class, 'auto_import' ] );
		add_action( 'admin_notices', [ self::class, 'notices' ] );
	}

	public static function menu(): void {
		add_menu_page( 'Shilperhaat', 'Shilperhaat', 'manage_options', 'shilperhaat', [ self::class, 'page' ], 'dashicons-store', 3 );
	}

	/** Runs the import once after activation (when WooCommerce is available and the shop is empty). */
	public static function auto_import(): void {
		if ( ! get_option( 'sh_needs_import' ) || ! class_exists( 'WooCommerce' ) || wp_doing_ajax() ) {
			return;
		}
		delete_option( 'sh_needs_import' );
		if ( get_option( 'sh_imported_at' ) ) {
			return;
		}
		$count = wp_count_posts( 'product' );
		if ( ! empty( $count->publish ) || ! empty( $count->draft ) ) {
			return; // existing catalogue: never overwrite automatically
		}
		set_transient( 'sh_import_result', SH_Importer::run(), 300 );
	}

	public static function handle_import(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Forbidden', 403 );
		}
		check_admin_referer( 'sh_import' );
		SH_Install::setup_woo();
		set_transient( 'sh_import_result', SH_Importer::run( ! empty( $_POST['reset'] ) ), 300 ); // phpcs:ignore
		wp_safe_redirect( admin_url( 'admin.php?page=shilperhaat' ) );
		exit;
	}

	public static function notices(): void {
		$res = get_transient( 'sh_import_result' );
		if ( ! $res || ! current_user_can( 'manage_options' ) ) {
			return;
		}
		delete_transient( 'sh_import_result' );
		if ( isset( $res['error'] ) ) {
			echo '<div class="notice notice-error"><p><strong>Shilperhaat import failed:</strong> ' . esc_html( $res['error'] ) . '</p></div>';
			return;
		}
		$parts = [];
		foreach ( $res as $k => $v ) {
			$parts[] = esc_html( $k . ': ' . $v );
		}
		echo '<div class="notice notice-success"><p><strong>Shilperhaat import finished</strong> — ' . implode( ' · ', $parts ) . '</p></div>';
	}

	private static function row( string $label, bool $ok, string $detail = '' ): void {
		echo '<tr><td style="width:260px">' . esc_html( $label ) . '</td><td>' . ( $ok ? '<span style="color:#15803d">✔ OK</span>' : '<span style="color:#b91c1c">✖ Problem</span>' ) . ( $detail ? ' — ' . esc_html( $detail ) : '' ) . '</td></tr>';
	}

	public static function page(): void {
		$woo      = class_exists( 'WooCommerce' );
		$pretty   = '' !== get_option( 'permalink_structure' );
		$dir      = sh_uploads_dir();
		$writable = wp_mkdir_p( $dir ) && wp_is_writable( $dir );
		$missing  = $woo ? SH_Importer::missing_media() : [];
		$count    = $woo ? wp_count_posts( 'product' ) : null;
		$imported = (int) get_option( 'sh_imported_at' );
		$ini      = static fn( $k ) => ini_get( $k );
		?>
		<div class="wrap">
			<h1>Shilperhaat</h1>
			<p><a class="button button-primary button-hero" href="<?php echo esc_url( home_url( '/admin' ) ); ?>" target="_blank">Open Shop Admin Panel →</a></p>

			<h2>Setup status</h2>
			<table class="widefat striped" style="max-width:860px"><tbody>
				<?php
				self::row( 'WooCommerce active', $woo, $woo ? 'v' . WC_VERSION : 'Install and activate the WooCommerce plugin' );
				self::row( 'Theme "Shilperhaat" active', 'shilperhaat' === get_template(), get_template() );
				self::row( 'Pretty permalinks', $pretty, $pretty ? get_option( 'permalink_structure' ) : 'Settings → Permalinks → choose "Post name"' );
				self::row( 'Media folder writable', $writable, $dir );
				self::row( 'Shop media files present', $woo && ! $missing, $woo ? ( $missing ? count( $missing ) . ' files missing — extract shilperhaat-uploads.zip into ' . $dir : 'all referenced images found' ) : '' );
				self::row( 'Products in shop', $woo && $count && ( $count->publish + $count->draft ) > 0, $count ? (int) $count->publish . ' published, ' . (int) $count->draft . ' draft' : '' );
				self::row( 'Shop data imported', (bool) $imported, $imported ? gmdate( 'Y-m-d H:i', $imported ) . ' UTC' : 'not yet' );
				self::row( 'PHP version ≥ 8.1', version_compare( PHP_VERSION, '8.1', '>=' ), PHP_VERSION );
				self::row( 'Upload limits (videos)', wp_convert_hr_to_bytes( $ini( 'upload_max_filesize' ) ) >= 64 * MB_IN_BYTES, 'upload_max_filesize=' . $ini( 'upload_max_filesize' ) . ', post_max_size=' . $ini( 'post_max_size' ) . ' (raise to ≥ 64M to upload product videos)' );
				?>
			</tbody></table>

			<h2 style="margin-top:28px">Import shop content</h2>
			<p>Imports categories, products, images list, banners, coupons, reviews, CMS pages and site layout from the old site. Safe to repeat: products, categories, pages and coupons are updated in place.</p>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<input type="hidden" name="action" value="sh_import">
				<?php wp_nonce_field( 'sh_import' ); ?>
				<label><input type="checkbox" name="reset" value="1"> Also reset banners, reviews and product image lists first</label><br><br>
				<button class="button button-secondary" <?php disabled( ! $woo ); ?>>Import / re-import shop content</button>
			</form>
			<?php if ( $missing ) : ?>
				<h3>Missing media (first 20)</h3>
				<ul style="list-style:disc;padding-left:20px"><?php foreach ( array_slice( $missing, 0, 20 ) as $m ) { echo '<li><code>' . esc_html( $m ) . '</code></li>'; } ?></ul>
			<?php endif; ?>
		</div>
		<?php
	}
}
