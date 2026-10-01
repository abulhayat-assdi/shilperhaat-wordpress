<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Super admin: import the original site's data (pg_dump seed) — for hosts without WP-CLI. */
function sh_admin_page_import() {
	$up   = wp_get_upload_dir();
	$dest = trailingslashit( $up['basedir'] ) . 'shilperhaat';
	sh_admin_title( 'Import data' );
	?>
	<div class="sh-card">
		<h2>1 · Database (products, categories, banners, pages, blog, reviews, coupons, layout)</h2>
		<p>Upload <code>shilperhaat_seed.sql</code> (the PostgreSQL dump from <code>data/seed/</code>). Existing rows with the same IDs are replaced; orders are never touched.</p>
		<?php sh_form_open( 'import_seed', array(), 'enctype="multipart/form-data"' ); ?>
			<input type="file" name="seed" accept=".sql" required> <button class="button button-primary" data-sh-confirm="Import this file now?">Import</button>
		</form>
	</div>
	<div class="sh-card">
		<h2>2 · Images &amp; videos</h2>
		<p>Copy the contents of <code>assets/uploads/</code> (banners, blog, brand, categories, products, site, videos) into:</p>
		<p><code><?php echo esc_html( $dest ); ?>/</code></p>
		<p>Use SFTP / File Manager (cPanel) or <code>wp shilperhaat import-seed --file=… --uploads=…</code>. The storefront then resolves the old <code>/uploads/…</code> paths automatically.</p>
		<?php
		$n = is_dir( $dest ) ? count( glob( $dest . '/*', GLOB_ONLYDIR ) ) : 0;
		echo '<p>' . ( $n ? '<span class="sh-pill green">✓ ' . (int) $n . ' folders found</span>' : '<span class="sh-pill red">folder not found yet</span>' ) . '</p>';
		?>
	</div>
	<?php
}

add_action( 'admin_post_sh_import_seed', function () {
	if ( ! sh_is_super_admin() ) {
		wp_die( 'Forbidden', 403 );
	}
	check_admin_referer( 'sh_import_seed' );
	if ( empty( $_FILES['seed']['tmp_name'] ) || ! is_uploaded_file( $_FILES['seed']['tmp_name'] ) ) { // phpcs:ignore
		sh_admin_notice_flash( 'error', 'No file uploaded.' );
		sh_admin_redirect( 'import' );
	}
	$res = sh_import_seed( $_FILES['seed']['tmp_name'] ); // phpcs:ignore
	if ( isset( $res['error'] ) ) {
		sh_admin_notice_flash( 'error', $res['error'] );
	} else {
		$parts = array();
		foreach ( $res as $k => $v ) {
			$parts[] = $k . ': ' . $v;
		}
		sh_admin_notice_flash( 'success', 'Imported — ' . implode( ', ', $parts ) );
	}
	sh_admin_redirect( 'import' );
} );
