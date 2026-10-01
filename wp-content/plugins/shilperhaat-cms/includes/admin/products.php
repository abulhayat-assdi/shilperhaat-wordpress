<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function sh_youtube_id( $url ) {
	$url = trim( (string) $url );
	foreach ( array( '#youtube\.com/watch\?v=([^&\s]+)#', '#youtu\.be/([^?\s]+)#', '#youtube\.com/embed/([^?\s]+)#', '#youtube\.com/shorts/([^?\s]+)#' ) as $re ) {
		if ( preg_match( $re, $url, $m ) ) {
			return $m[1];
		}
	}
	return '';
}

function sh_admin_page_products() {
	global $wpdb;
	// phpcs:disable WordPress.Security.NonceVerification
	$edit = isset( $_GET['edit'] ) ? sanitize_text_field( wp_unslash( $_GET['edit'] ) ) : '';
	if ( $edit ) {
		sh_admin_product_form( 'new' === $edit ? null : sh_admin_load_product( $edit ) );
		return;
	}
	$s     = isset( $_GET['s'] ) ? sanitize_text_field( wp_unslash( $_GET['s'] ) ) : '';
	$paged = max( 1, (int) ( isset( $_GET['paged'] ) ? $_GET['paged'] : 1 ) );
	$per   = 20;
	$p     = sh_table( 'products' );
	$where = $s ? $wpdb->prepare( 'WHERE p.title LIKE %s', '%' . $wpdb->esc_like( $s ) . '%' ) : '';
	$total = (int) $wpdb->get_var( "SELECT COUNT(*) FROM $p p $where" ); // phpcs:ignore WordPress.DB
	$rows  = sh_attach_product_relations( (array) $wpdb->get_results( "SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM $p p LEFT JOIN " . sh_table( 'categories' ) . " c ON c.id=p.category_id $where ORDER BY p.created_at DESC LIMIT " . ( ( $paged - 1 ) * $per ) . ", $per" ) ); // phpcs:ignore WordPress.DB
	sh_admin_title( 'Products', '<a class="button button-primary" href="' . esc_url( sh_admin_url( 'products', array( 'edit' => 'new' ) ) ) . '">+ Add Product</a>' );
	?>
	<form method="get" class="sh-filter"><input type="hidden" name="page" value="shilperhaat-products"><input type="search" name="s" value="<?php echo esc_attr( $s ); ?>" placeholder="Search products…"><button class="button">Search</button></form>
	<table class="sh-table">
		<thead><tr><th></th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead>
		<tbody>
		<?php foreach ( $rows as $r ) : ?>
			<tr>
				<td><img class="sh-thumb" src="<?php echo esc_url( sh_image_url( $r->images ? $r->images[0]->image_url : '' ) ); ?>" alt=""></td>
				<td><strong><a href="<?php echo esc_url( sh_admin_url( 'products', array( 'edit' => $r->id ) ) ); ?>"><?php echo esc_html( $r->title ); ?></a></strong>
					<?php echo $r->is_best_selling ? '<span class="sh-pill yellow">Best seller</span>' : ''; ?><?php echo $r->is_featured ? ' <span class="sh-pill blue">Featured</span>' : ''; ?></td>
				<td><?php echo esc_html( $r->category ? $r->category->name : '—' ); ?></td>
				<td><?php echo esc_html( sh_format_price( $r->price ) ); ?><?php echo $r->compare_at_price ? ' <s class="sh-muted">' . esc_html( sh_format_price( $r->compare_at_price ) ) . '</s>' : ''; ?></td>
				<td><?php echo (int) $r->stock; ?></td>
				<td><span class="sh-pill <?php echo 'ACTIVE' === $r->status ? 'green' : ( 'INACTIVE' === $r->status ? 'gray' : 'red' ); ?>"><?php echo esc_html( $r->status ); ?></span></td>
				<td class="sh-row-actions">
					<a href="<?php echo esc_url( sh_admin_url( 'products', array( 'edit' => $r->id ) ) ); ?>">Edit</a>
					<a href="<?php echo esc_url( home_url( '/product/' . $r->slug ) ); ?>" target="_blank">View</a>
					<?php sh_form_open( 'product_delete', array( 'id' => $r->id ), 'style="display:inline" data-sh-confirm="Delete this product?"' ); ?><button class="sh-link-danger">Delete</button></form>
				</td>
			</tr>
		<?php endforeach; ?>
		<?php if ( ! $rows ) : ?><tr><td colspan="7" class="sh-muted">No products yet.</td></tr><?php endif; ?>
		</tbody>
	</table>
	<?php sh_pager( $total, $per, $paged, 'products', array( 's' => $s ) ); ?>
	<?php
}

function sh_admin_load_product( $id ) {
	global $wpdb;
	$row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . sh_table( 'products' ) . ' WHERE id = %s', $id ) ); // phpcs:ignore WordPress.DB
	if ( ! $row ) {
		return null;
	}
	$rows = sh_attach_product_relations( array( $row ) );
	return $rows[0];
}

function sh_admin_product_form( $p ) {
	$cats = sh_categories();
	sh_admin_title( $p ? 'Edit Product' : 'Add Product', '<a class="button" href="' . esc_url( sh_admin_url( 'products' ) ) . '">← Back</a>' );
	sh_form_open( 'product_save', array( 'id' => $p ? $p->id : '' ) );
	$v = static function ( $k, $d = '' ) use ( $p ) {
		return $p && isset( $p->$k ) && null !== $p->$k ? $p->$k : $d;
	};
	?>
	<div class="sh-grid" style="grid-template-columns:2fr 1fr;align-items:start">
		<div>
			<div class="sh-card">
				<h2>Basic info</h2>
				<div class="sh-field"><label>Title *</label><input type="text" name="title" required value="<?php echo esc_attr( $v( 'title' ) ); ?>" data-sh-slug-from="#sh-slug"></div>
				<div class="sh-field"><label>Slug *</label><input type="text" id="sh-slug" name="slug" required data-sh-slug value="<?php echo esc_attr( $v( 'slug' ) ); ?>"><div class="hint">Used in the URL: /product/<em>slug</em></div></div>
				<div class="sh-field"><label>Description</label><?php wp_editor( (string) $v( 'description' ), 'sh_description', array( 'textarea_name' => 'description', 'textarea_rows' => 12, 'media_buttons' => true ) ); ?></div>
			</div>
			<div class="sh-card">
				<h2>Images</h2>
				<?php sh_media_field( 'images', $p ? wp_list_pluck( $p->images, 'image_url' ) : array(), true, 'Add images' ); ?>
				<div class="hint">Drag to reorder — the first image is the main image.</div>
			</div>
			<div class="sh-card">
				<h2>Video</h2>
				<div class="sh-grid sh-grid-2">
					<div class="sh-field"><label>YouTube URL</label><input type="url" name="youtubeUrl" value="<?php echo esc_attr( $v( 'youtube_url' ) ); ?>" placeholder="https://www.youtube.com/watch?v=…"><div class="hint">youtube.com/watch?v=… and youtu.be/… are accepted.</div></div>
					<div class="sh-field"><label>Or uploaded video</label><?php sh_media_field( 'videoUrl', $v( 'video_url' ), false, 'Choose video', 'video' ); ?></div>
				</div>
			</div>
		</div>
		<div>
			<div class="sh-card">
				<h2>Pricing &amp; stock</h2>
				<div class="sh-field"><label>Price (৳) *</label><input type="number" step="0.01" min="0.01" name="price" required value="<?php echo esc_attr( $v( 'price' ) ); ?>"></div>
				<div class="sh-field"><label>Compare-at price (৳)</label><input type="number" step="0.01" min="0" name="compareAtPrice" value="<?php echo esc_attr( $v( 'compare_at_price' ) ); ?>"></div>
				<div class="sh-field"><label>Stock *</label><input type="number" min="0" name="stock" required value="<?php echo esc_attr( $v( 'stock', 0 ) ); ?>"></div>
				<div class="sh-field"><label>SKU</label><input type="text" name="sku" value="<?php echo esc_attr( $v( 'sku' ) ); ?>"></div>
			</div>
			<div class="sh-card">
				<h2>Organisation</h2>
				<div class="sh-field"><label>Category</label><select name="categoryId"><option value="">— None —</option>
					<?php foreach ( $cats as $c ) : ?><option value="<?php echo esc_attr( $c->id ); ?>" <?php selected( $v( 'category_id' ), $c->id ); ?>><?php echo esc_html( $c->name ); ?></option><?php endforeach; ?></select></div>
				<div class="sh-field"><label>Status</label><select name="status"><?php foreach ( array( 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK' ) as $s ) : ?><option <?php selected( $v( 'status', 'ACTIVE' ), $s ); ?>><?php echo esc_html( $s ); ?></option><?php endforeach; ?></select></div>
				<div class="sh-field"><label>Tags (comma separated)</label><input type="text" name="tags" value="<?php echo esc_attr( $p ? implode( ', ', (array) $p->tags ) : '' ); ?>"></div>
				<p><label><input type="checkbox" name="isFeatured" value="1" <?php checked( (int) $v( 'is_featured', 0 ), 1 ); ?>> Featured</label><br>
				<label><input type="checkbox" name="isBestSelling" value="1" <?php checked( (int) $v( 'is_best_selling', 0 ), 1 ); ?>> Best selling</label></p>
			</div>
			<button class="button button-primary button-hero" style="width:100%">Save product</button>
		</div>
	</div>
	</form>
	<?php
}

sh_admin_action( 'product_save', 'products', function () {
	global $wpdb;
	$id    = sh_post_text( 'id' );
	$title = sh_post_text( 'title' );
	$price = (float) sh_post( 'price', 0 );
	if ( '' === $title || $price <= 0 ) {
		sh_admin_notice_flash( 'error', 'Title and a positive price are required.' );
		sh_admin_redirect( 'products', array( 'edit' => $id ? $id : 'new' ) );
	}
	$slug = sh_slugify( sh_post_text( 'slug' ) ? sh_post_text( 'slug' ) : $title );
	$slug = sh_unique_slug( 'products', $slug, $id );
	$yt   = esc_url_raw( sh_post( 'youtubeUrl' ) );
	$sku  = sh_post_text( 'sku' );
	if ( $sku && $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM ' . sh_table( 'products' ) . ' WHERE sku = %s AND id <> %s', $sku, $id ) ) ) { // phpcs:ignore WordPress.DB
		sh_admin_notice_flash( 'error', 'This SKU is already used by another product.' );
		sh_admin_redirect( 'products', array( 'edit' => $id ? $id : 'new' ) );
	}
	$compare = sh_post( 'compareAtPrice' );
	$tags    = array_values( array_filter( array_map( 'trim', explode( ',', sh_post_text( 'tags' ) ) ) ) );
	$now     = current_time( 'mysql', true );
	$data    = array(
		'title'            => $title,
		'slug'             => $slug,
		'description'      => '' !== trim( (string) sh_post( 'description' ) ) ? wp_kses( sh_post( 'description' ), sh_allowed_html_admin() ) : null,
		'price'            => $price,
		'compare_at_price' => is_numeric( $compare ) && (float) $compare > 0 ? (float) $compare : null,
		'stock'            => max( 0, (int) sh_post( 'stock', 0 ) ),
		'category_id'      => sh_post_text( 'categoryId' ) ? sh_post_text( 'categoryId' ) : null,
		'is_featured'      => sh_post_bool( 'isFeatured' ),
		'is_best_selling'  => sh_post_bool( 'isBestSelling' ),
		'status'           => in_array( sh_post( 'status' ), array( 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK' ), true ) ? sh_post( 'status' ) : 'ACTIVE',
		'sku'              => $sku ? $sku : null,
		'tags'             => wp_json_encode( $tags, JSON_UNESCAPED_UNICODE ),
		'video_url'        => esc_url_raw( sh_post( 'videoUrl' ) ) ? esc_url_raw( sh_post( 'videoUrl' ) ) : null,
		'youtube_url'      => $yt ? $yt : null,
		'youtube_video_id' => sh_youtube_id( $yt ) ? sh_youtube_id( $yt ) : null,
		'updated_at'       => $now,
	);
	if ( $id ) {
		$wpdb->update( sh_table( 'products' ), $data, array( 'id' => $id ) );
	} else {
		$id                = sh_new_id();
		$data['id']        = $id;
		$data['created_at'] = $now;
		$wpdb->insert( sh_table( 'products' ), $data );
	}
	// Images: replace the list in the submitted order.
	$wpdb->delete( sh_table( 'product_images' ), array( 'product_id' => $id ) );
	$imgs = isset( $_POST['images'] ) && is_array( $_POST['images'] ) ? array_map( 'esc_url_raw', wp_unslash( $_POST['images'] ) ) : array(); // phpcs:ignore WordPress.Security
	foreach ( array_values( array_filter( $imgs ) ) as $i => $url ) {
		$wpdb->insert( sh_table( 'product_images' ), array( 'id' => sh_new_id(), 'product_id' => $id, 'image_url' => $url, 'sort_order' => $i ) );
	}
	sh_admin_notice_flash( 'success', 'Product saved.' );
	sh_admin_redirect( 'products' );
} );

sh_admin_action( 'product_delete', 'products', function () {
	global $wpdb;
	$id = sh_post_text( 'id' );
	$wpdb->delete( sh_table( 'product_images' ), array( 'product_id' => $id ) );
	$wpdb->delete( sh_table( 'reviews' ), array( 'product_id' => $id ) );
	$wpdb->update( sh_table( 'order_items' ), array( 'product_id' => null ), array( 'product_id' => $id ) );
	$wpdb->delete( sh_table( 'products' ), array( 'id' => $id ) );
	sh_admin_notice_flash( 'success', 'Product deleted.' );
	sh_admin_redirect( 'products' );
} );

/** Rich text coming from the admin editor: keep formatting, drop scripts (superset of wp_kses_post). */
function sh_allowed_html_admin() {
	$a             = wp_kses_allowed_html( 'post' );
	$a['font']     = array( 'color' => true, 'size' => true, 'face' => true, 'style' => true );
	$a['iframe']   = array( 'src' => true, 'width' => true, 'height' => true, 'allow' => true, 'allowfullscreen' => true, 'frameborder' => true );
	return $a;
}
