<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Routes that are real storefront pages and cannot be CMS pages (same list as the original). */
function sh_reserved_slugs() {
	return array( 'account', 'blog', 'cart', 'checkout', 'product', 'shop', 'thank-you', 'track-order', 'admin', 'api', 'uploads', 'wp-admin', 'wp-content', 'wp-json', 'wp-login' );
}

function sh_admin_page_pages() {
	global $wpdb;
	// phpcs:disable WordPress.Security.NonceVerification
	$t    = sh_table( 'pages' );
	$edit = isset( $_GET['edit'] ) ? sanitize_text_field( wp_unslash( $_GET['edit'] ) ) : '';
	if ( $edit ) {
		$p        = 'new' === $edit ? null : $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $t WHERE id = %s", $edit ) ); // phpcs:ignore WordPress.DB
		$sections = $p ? json_decode( (string) $p->sections, true ) : array();
		$sections = is_array( $sections ) && $sections ? $sections : array( array( 'id' => 's1', 'title' => 'Main Content', 'content' => '', 'order' => 1 ) );
		if ( isset( $_GET['add_section'] ) ) {
			$sections[] = array( 'id' => 's' . ( count( $sections ) + 1 ), 'title' => 'New Section', 'content' => '', 'order' => count( $sections ) + 1 );
		}
		$v = static function ( $k, $d = '' ) use ( $p ) {
			return $p && isset( $p->$k ) ? $p->$k : $d;
		};
		sh_admin_title( $p ? 'Edit Page' : 'New Page', '<a class="button" href="' . esc_url( sh_admin_url( 'pages' ) ) . '">← Back</a>' );
		sh_form_open( 'page_save', array( 'id' => $p ? $p->id : '' ) );
		?>
		<div class="sh-grid" style="grid-template-columns:2fr 1fr;align-items:start">
			<div>
				<div class="sh-card">
					<div class="sh-field"><label>Title *</label><input type="text" name="title" required value="<?php echo esc_attr( $v( 'title' ) ); ?>" data-sh-slug-from="#sh-slug"></div>
					<div class="sh-field"><label>Subtitle</label><input type="text" name="subtitle" value="<?php echo esc_attr( $v( 'subtitle' ) ); ?>"></div>
				</div>
				<?php foreach ( $sections as $i => $sec ) : ?>
					<div class="sh-section">
						<div class="sh-field"><label>Section <?php echo (int) $i + 1; ?> title</label><input type="text" name="sections[<?php echo (int) $i; ?>][title]" value="<?php echo esc_attr( isset( $sec['title'] ) ? $sec['title'] : '' ); ?>"></div>
						<input type="hidden" name="sections[<?php echo (int) $i; ?>][id]" value="<?php echo esc_attr( isset( $sec['id'] ) ? $sec['id'] : 's' . ( $i + 1 ) ); ?>">
						<?php wp_editor( isset( $sec['content'] ) ? $sec['content'] : '', 'sh_sec_' . $i, array( 'textarea_name' => 'sections[' . $i . '][content]', 'textarea_rows' => 10 ) ); ?>
						<p><label><input type="checkbox" name="sections[<?php echo (int) $i; ?>][remove]" value="1"> Remove this section</label></p>
					</div>
				<?php endforeach; ?>
				<p><button type="submit" name="add_section" value="1" class="button">+ Add section</button></p>
			</div>
			<div>
				<div class="sh-card">
					<h2>Page</h2>
					<div class="sh-field"><label>Slug *</label><input type="text" id="sh-slug" name="slug" required data-sh-slug value="<?php echo esc_attr( $v( 'slug' ) ); ?>"><div class="hint">URL: /<em>slug</em></div></div>
					<p><label><input type="checkbox" name="is_published" value="1" <?php checked( (int) $v( 'is_published', 1 ), 1 ); ?>> Published</label></p>
				</div>
				<div class="sh-card">
					<h2>SEO</h2>
					<div class="sh-field"><label>Meta title</label><input type="text" name="meta_title" value="<?php echo esc_attr( $v( 'meta_title' ) ); ?>"></div>
					<div class="sh-field"><label>Meta description</label><textarea name="meta_description" rows="3"><?php echo esc_textarea( $v( 'meta_description' ) ); ?></textarea></div>
				</div>
				<button class="button button-primary button-hero" style="width:100%">Save page</button>
			</div>
		</div></form>
		<?php
		return;
	}
	$rows = (array) $wpdb->get_results( "SELECT * FROM $t ORDER BY title ASC" ); // phpcs:ignore WordPress.DB
	sh_admin_title( 'Pages', '<a class="button button-primary" href="' . esc_url( sh_admin_url( 'pages', array( 'edit' => 'new' ) ) ) . '">+ New Page</a>' );
	echo '<table class="sh-table"><thead><tr><th>Title</th><th>URL</th><th>Status</th><th></th></tr></thead><tbody>';
	foreach ( $rows as $r ) {
		printf(
			'<tr><td><strong><a href="%s">%s</a></strong></td><td>/%s</td><td>%s</td><td class="sh-row-actions"><a href="%s">Edit</a><a target="_blank" href="%s">View</a>',
			esc_url( sh_admin_url( 'pages', array( 'edit' => $r->id ) ) ),
			esc_html( $r->title ),
			esc_html( $r->slug ),
			$r->is_published ? '<span class="sh-pill green">Published</span>' : '<span class="sh-pill gray">Hidden</span>', // phpcs:ignore
			esc_url( sh_admin_url( 'pages', array( 'edit' => $r->id ) ) ),
			esc_url( home_url( '/' . $r->slug ) )
		);
		sh_form_open( 'page_delete', array( 'id' => $r->id ), 'style="display:inline" data-sh-confirm="Delete this page?"' );
		echo '<button class="sh-link-danger">Delete</button></form></td></tr>';
	}
	echo '</tbody></table>';
}

sh_admin_action( 'page_save', 'pages', function () {
	global $wpdb;
	$id    = sh_post_text( 'id' );
	$title = sh_post_text( 'title' );
	$slug  = sh_slugify( sh_post_text( 'slug' ) );
	if ( '' === $title || '' === $slug ) {
		sh_admin_notice_flash( 'error', 'Title and slug are required.' );
		sh_admin_redirect( 'pages', array( 'edit' => $id ? $id : 'new' ) );
	}
	if ( in_array( $slug, sh_reserved_slugs(), true ) ) {
		sh_admin_notice_flash( 'error', 'This slug is reserved by the shop. Choose another one.' );
		sh_admin_redirect( 'pages', array( 'edit' => $id ? $id : 'new' ) );
	}
	if ( $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM ' . sh_table( 'pages' ) . ' WHERE slug = %s AND id <> %s', $slug, $id ) ) ) { // phpcs:ignore WordPress.DB
		sh_admin_notice_flash( 'error', 'A page with this slug already exists.' );
		sh_admin_redirect( 'pages', array( 'edit' => $id ? $id : 'new' ) );
	}
	$sections = array();
	$raw      = isset( $_POST['sections'] ) && is_array( $_POST['sections'] ) ? wp_unslash( $_POST['sections'] ) : array(); // phpcs:ignore WordPress.Security
	foreach ( $raw as $s ) {
		if ( ! empty( $s['remove'] ) ) {
			continue;
		}
		$sections[] = array(
			'id'      => isset( $s['id'] ) ? sanitize_key( $s['id'] ) : 's' . ( count( $sections ) + 1 ),
			'title'   => sanitize_text_field( isset( $s['title'] ) ? $s['title'] : '' ),
			'content' => wp_kses( isset( $s['content'] ) ? $s['content'] : '', sh_allowed_html_admin() ),
			'order'   => count( $sections ) + 1,
		);
	}
	$now  = current_time( 'mysql', true );
	$data = array(
		'slug'             => $slug,
		'title'            => $title,
		'subtitle'         => sh_post_text( 'subtitle' ),
		'sections'         => wp_json_encode( $sections, JSON_UNESCAPED_UNICODE ),
		'meta_title'       => sh_post_text( 'meta_title' ),
		'meta_description' => sanitize_textarea_field( sh_post( 'meta_description' ) ),
		'is_published'     => sh_post_bool( 'is_published' ),
		'updated_at'       => $now,
	);
	if ( $id ) {
		$wpdb->update( sh_table( 'pages' ), $data, array( 'id' => $id ) );
	} else {
		$data['id'] = sh_new_id();
		$wpdb->insert( sh_table( 'pages' ), $data );
		$id = $data['id'];
	}
	if ( isset( $_POST['add_section'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
		sh_admin_redirect( 'pages', array( 'edit' => $id, 'add_section' => 1 ) );
	}
	sh_admin_notice_flash( 'success', 'Page saved.' );
	sh_admin_redirect( 'pages' );
} );

sh_admin_action( 'page_delete', 'pages', function () {
	global $wpdb;
	$wpdb->delete( sh_table( 'pages' ), array( 'id' => sh_post_text( 'id' ) ) );
	sh_admin_notice_flash( 'success', 'Page deleted.' );
	sh_admin_redirect( 'pages' );
} );

/**
 * Creates a placeholder page for every internal single-segment link (Site Layout footer links),
 * so a link added in the admin never leads to a 404 (port of ensurePagesForLinks).
 */
function sh_ensure_pages_for_links( $links ) {
	global $wpdb;
	foreach ( $links as $l ) {
		$href = isset( $l['href'] ) ? (string) $l['href'] : '';
		if ( 0 !== strpos( $href, '/' ) ) {
			continue;
		}
		$path = preg_split( '/[?#]/', $href )[0];
		$segs = array_values( array_filter( explode( '/', $path ) ) );
		if ( 1 !== count( $segs ) ) {
			continue;
		}
		$slug = strtolower( $segs[0] );
		if ( ! preg_match( '/^[a-z0-9][a-z0-9-]*$/', $slug ) || in_array( $slug, sh_reserved_slugs(), true ) ) {
			continue;
		}
		if ( $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM ' . sh_table( 'pages' ) . ' WHERE slug = %s', $slug ) ) ) { // phpcs:ignore WordPress.DB
			continue;
		}
		$label = ! empty( $l['label'] ) ? $l['label'] : $slug;
		$wpdb->insert( sh_table( 'pages' ), array(
			'id'               => sh_new_id(),
			'slug'             => $slug,
			'title'            => $label,
			'subtitle'         => '',
			'sections'         => wp_json_encode( array( array( 'id' => $slug . '-s1', 'title' => 'Main Content', 'content' => '<p>Write the content for ' . esc_html( $label ) . ' here.</p>', 'order' => 1 ) ) ),
			'meta_title'       => $label . ' - Shilperhaat',
			'meta_description' => $label,
			'is_published'     => 1,
			'updated_at'       => current_time( 'mysql', true ),
		) );
	}
}
