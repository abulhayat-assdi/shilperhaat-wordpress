<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function sh_estimate_read_time( $html ) {
	$text  = wp_strip_all_tags( (string) $html );
	$words = count( array_filter( preg_split( '/\s+/u', trim( $text ) ) ) );
	return max( 1, (int) round( $words / 200 ) );
}

function sh_admin_page_blog() {
	global $wpdb;
	// phpcs:disable WordPress.Security.NonceVerification
	$edit = isset( $_GET['edit'] ) ? sanitize_text_field( wp_unslash( $_GET['edit'] ) ) : '';
	$t    = sh_table( 'blog_posts' );
	if ( $edit ) {
		$p = 'new' === $edit ? null : $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $t WHERE id = %s", $edit ) ); // phpcs:ignore WordPress.DB
		$v = static function ( $k, $d = '' ) use ( $p ) {
			return $p && isset( $p->$k ) ? $p->$k : $d;
		};
		$tags = $p && $p->tags ? implode( ', ', (array) json_decode( $p->tags, true ) ) : '';
		sh_admin_title( $p ? 'Edit Post' : 'New Post', '<a class="button" href="' . esc_url( sh_admin_url( 'blog' ) ) . '">← Back</a>' );
		sh_form_open( 'blog_save', array( 'id' => $p ? $p->id : '' ) );
		?>
		<div class="sh-grid" style="grid-template-columns:2fr 1fr;align-items:start">
			<div class="sh-card">
				<div class="sh-field"><label>Title *</label><input type="text" name="title" required value="<?php echo esc_attr( $v( 'title' ) ); ?>" data-sh-slug-from="#sh-slug"></div>
				<div class="sh-field"><label>Slug</label><input type="text" id="sh-slug" name="slug" data-sh-slug value="<?php echo esc_attr( $v( 'slug' ) ); ?>"></div>
				<div class="sh-field"><label>Excerpt</label><textarea name="excerpt" rows="3"><?php echo esc_textarea( $v( 'excerpt' ) ); ?></textarea></div>
				<div class="sh-field"><label>Content</label><?php wp_editor( (string) $v( 'content' ), 'sh_blog_content', array( 'textarea_name' => 'content', 'textarea_rows' => 18 ) ); ?></div>
			</div>
			<div>
				<div class="sh-card"><h2>Cover image</h2><?php sh_media_field( 'cover_image', $v( 'cover_image' ), false ); ?></div>
				<div class="sh-card">
					<h2>Details</h2>
					<div class="sh-field"><label>Author</label><input type="text" name="author" value="<?php echo esc_attr( $v( 'author' ) ); ?>"></div>
					<div class="sh-field"><label>Category</label><input type="text" name="category" value="<?php echo esc_attr( $v( 'category' ) ); ?>"></div>
					<div class="sh-field"><label>Tags (comma separated)</label><input type="text" name="tags" value="<?php echo esc_attr( $tags ); ?>"></div>
					<div class="sh-field"><label>Published at (UTC)</label><input type="datetime-local" name="published_at" value="<?php echo esc_attr( $p ? gmdate( 'Y-m-d\TH:i', strtotime( $p->published_at . ' UTC' ) ) : gmdate( 'Y-m-d\TH:i' ) ); ?>"></div>
					<p><label><input type="checkbox" name="is_published" value="1" <?php checked( (int) $v( 'is_published', 1 ), 1 ); ?>> Published</label></p>
				</div>
				<button class="button button-primary button-hero" style="width:100%">Save post</button>
			</div>
		</div></form>
		<?php
		return;
	}
	$rows = (array) $wpdb->get_results( "SELECT * FROM $t ORDER BY published_at DESC" ); // phpcs:ignore WordPress.DB
	sh_admin_title( 'Blog', '<a class="button button-primary" href="' . esc_url( sh_admin_url( 'blog', array( 'edit' => 'new' ) ) ) . '">+ New Post</a>' );
	echo '<table class="sh-table"><thead><tr><th></th><th>Title</th><th>Category</th><th>Date</th><th>Status</th><th></th></tr></thead><tbody>';
	foreach ( $rows as $r ) {
		printf(
			'<tr><td>%s</td><td><strong><a href="%s">%s</a></strong><br><span class="sh-muted">/blog/%s</span></td><td>%s</td><td>%s</td><td>%s</td><td class="sh-row-actions"><a href="%s">Edit</a><a target="_blank" href="%s">View</a>',
			$r->cover_image ? '<img class="sh-thumb" src="' . esc_url( sh_media_url( $r->cover_image ) ) . '" alt="">' : '', // phpcs:ignore
			esc_url( sh_admin_url( 'blog', array( 'edit' => $r->id ) ) ),
			esc_html( $r->title ),
			esc_html( $r->slug ),
			esc_html( $r->category ),
			esc_html( gmdate( 'M j, Y', strtotime( $r->published_at ) ) ),
			$r->is_published ? '<span class="sh-pill green">Published</span>' : '<span class="sh-pill gray">Draft</span>', // phpcs:ignore
			esc_url( sh_admin_url( 'blog', array( 'edit' => $r->id ) ) ),
			esc_url( home_url( '/blog/' . $r->slug ) )
		);
		sh_form_open( 'blog_delete', array( 'id' => $r->id ), 'style="display:inline" data-sh-confirm="Delete this post?"' );
		echo '<button class="sh-link-danger">Delete</button></form></td></tr>';
	}
	if ( ! $rows ) {
		echo '<tr><td colspan="6" class="sh-muted">No posts yet.</td></tr>';
	}
	echo '</tbody></table>';
}

sh_admin_action( 'blog_save', 'blog', function () {
	global $wpdb;
	$id    = sh_post_text( 'id' );
	$title = sh_post_text( 'title' );
	if ( '' === $title ) {
		sh_admin_notice_flash( 'error', 'Title is required.' );
		sh_admin_redirect( 'blog', array( 'edit' => $id ? $id : 'new' ) );
	}
	$slug = sh_slugify( sh_post_text( 'slug' ) ? sh_post_text( 'slug' ) : $title );
	if ( strlen( preg_replace( '/[^a-z0-9]/', '', $slug ) ) < 4 && '' === sh_post_text( 'slug' ) ) {
		$slug = 'post-' . base_convert( (string) time(), 10, 36 ); // all-Bengali titles fall back to a timestamp slug
	}
	$slug    = sh_unique_slug( 'blog_posts', $slug, $id );
	$content = wp_kses( sh_post( 'content' ), sh_allowed_html_admin() );
	$tags    = array_values( array_filter( array_map( 'trim', explode( ',', sh_post_text( 'tags' ) ) ) ) );
	$pub     = sh_post_text( 'published_at' );
	$now     = current_time( 'mysql', true );
	$data    = array(
		'slug'         => $slug,
		'title'        => $title,
		'excerpt'      => sanitize_textarea_field( sh_post( 'excerpt' ) ),
		'content'      => $content,
		'cover_image'  => esc_url_raw( sh_post( 'cover_image' ) ),
		'author'       => sh_post_text( 'author' ),
		'category'     => sh_post_text( 'category' ),
		'tags'         => wp_json_encode( $tags, JSON_UNESCAPED_UNICODE ),
		'is_published' => sh_post_bool( 'is_published' ),
		'read_time'    => sh_estimate_read_time( $content ),
		'published_at' => $pub ? gmdate( 'Y-m-d H:i:s', strtotime( $pub . ' UTC' ) ) : $now,
		'updated_at'   => $now,
	);
	if ( $id ) {
		$wpdb->update( sh_table( 'blog_posts' ), $data, array( 'id' => $id ) );
	} else {
		$data['id']         = sh_new_id();
		$data['created_at'] = $now;
		$wpdb->insert( sh_table( 'blog_posts' ), $data );
	}
	sh_admin_notice_flash( 'success', 'Post saved.' );
	sh_admin_redirect( 'blog' );
} );

sh_admin_action( 'blog_delete', 'blog', function () {
	global $wpdb;
	$wpdb->delete( sh_table( 'blog_posts' ), array( 'id' => sh_post_text( 'id' ) ) );
	sh_admin_notice_flash( 'success', 'Post deleted.' );
	sh_admin_redirect( 'blog' );
} );
