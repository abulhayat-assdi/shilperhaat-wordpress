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
		<h2>2 · Images &amp; videos — download from the live site</h2>
		<p>Fetches every image/video referenced by the imported data from the old site (while it is still online) into <code><?php echo esc_html( $dest ); ?>/</code>. Safe to run repeatedly; files already downloaded are skipped.</p>
		<p><input type="url" id="sh-media-base" value="https://shilperhaat.com" style="min-width:320px"> <button type="button" class="button button-primary" id="sh-media-start" data-nonce="<?php echo esc_attr( wp_create_nonce( 'sh_media_import' ) ); ?>">Download files</button></p>
		<div id="sh-media-progress" style="display:none"><progress id="sh-media-bar" value="0" max="100" style="width:100%;max-width:420px"></progress> <span id="sh-media-text"></span><pre id="sh-media-log" style="max-height:160px;overflow:auto;background:#fafafa;border:1px solid #eee;padding:8px"></pre></div>
	</div>
	<div class="sh-card">
		<h2>2b · Images &amp; videos — manual copy (alternative)</h2>
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


/** Every original-site upload path referenced by the current data (e.g. "/uploads/products/x.webp"). */
function sh_collect_upload_paths() {
	global $wpdb;
	$paths = array();
	$add   = static function ( $v ) use ( &$paths ) {
		if ( is_string( $v ) && 0 === strpos( $v, '/uploads/' ) ) {
			$paths[ $v ] = true;
		}
	};
	$cols = array(
		'product_images' => array( 'image_url' ),
		'categories'     => array( 'image_url' ),
		'banners'        => array( 'image_url', 'mobile_image_url' ),
		'blog_posts'     => array( 'cover_image' ),
		'reviews'        => array( 'avatar_url' ),
		'products'       => array( 'video_url' ),
	);
	foreach ( $cols as $table => $fields ) {
		foreach ( $fields as $f ) {
			foreach ( (array) $wpdb->get_col( "SELECT DISTINCT $f FROM " . sh_table( $table ) . " WHERE $f LIKE '/uploads/%'" ) as $v ) { // phpcs:ignore WordPress.DB
				$add( $v );
			}
		}
	}
	$add( sh_layout()['logoUrl'] );
	$s = sh_site_settings();
	$add( isset( $s['logoUrl'] ) ? $s['logoUrl'] : '' );
	$add( isset( $s['faviconUrl'] ) ? $s['faviconUrl'] : '' );
	// Rich text (product descriptions, pages, blog) may embed /uploads/ images too.
	foreach ( array( array( 'products', 'description' ), array( 'blog_posts', 'content' ), array( 'pages', 'sections' ) ) as $c ) {
		foreach ( (array) $wpdb->get_col( 'SELECT ' . $c[1] . ' FROM ' . sh_table( $c[0] ) . ' WHERE ' . $c[1] . " LIKE '%/uploads/%'" ) as $html ) { // phpcs:ignore WordPress.DB
			if ( preg_match_all( '#/uploads/[A-Za-z0-9_\-./%]+\.(?:webp|png|jpe?g|gif|svg|mp4|webm)#', (string) $html, $m ) ) {
				foreach ( $m[0] as $u ) {
					$add( str_replace( '\\/', '/', $u ) );
				}
			}
		}
	}
	$list = array_keys( $paths );
	sort( $list );
	return $list;
}

add_action( 'wp_ajax_sh_media_batch', function () {
	check_ajax_referer( 'sh_media_import' );
	if ( ! sh_is_super_admin() ) {
		wp_send_json_error( 'Forbidden', 403 );
	}
	@set_time_limit( 120 ); // phpcs:ignore
	$base   = isset( $_POST['base'] ) ? esc_url_raw( wp_unslash( $_POST['base'] ) ) : 'https://shilperhaat.com';
	$base   = untrailingslashit( $base );
	$offset = isset( $_POST['offset'] ) ? max( 0, (int) $_POST['offset'] ) : 0;
	$list   = sh_collect_upload_paths();
	$total  = count( $list );
	$up     = wp_get_upload_dir();
	$dest   = trailingslashit( $up['basedir'] ) . 'shilperhaat/';
	$done   = 0;
	$log    = array();
	foreach ( array_slice( $list, $offset, 4 ) as $path ) {
		++$done;
		$rel = ltrim( substr( rawurldecode( $path ), strlen( '/uploads/' ) ), '/' );
		if ( false !== strpos( $rel, '..' ) ) {
			$log[] = 'skip (unsafe) ' . $path;
			continue;
		}
		$file = $dest . $rel;
		if ( file_exists( $file ) && filesize( $file ) > 0 ) {
			$log[] = '= ' . $rel;
			continue;
		}
		wp_mkdir_p( dirname( $file ) );
		$res = wp_remote_get( $base . $path, array( 'timeout' => 60, 'stream' => true, 'filename' => $file ) );
		if ( is_wp_error( $res ) || 200 !== (int) wp_remote_retrieve_response_code( $res ) ) {
			if ( file_exists( $file ) ) {
				wp_delete_file( $file );
			}
			$log[] = '✗ ' . $rel . ' (' . ( is_wp_error( $res ) ? $res->get_error_message() : 'HTTP ' . wp_remote_retrieve_response_code( $res ) ) . ')';
		} else {
			$log[] = '✓ ' . $rel;
		}
	}
	wp_send_json_success( array( 'total' => $total, 'next' => $offset + $done, 'done' => $offset + $done >= $total, 'log' => $log ) );
} );
