<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function sh_admin_page_dashboard() {
	global $wpdb;
	$u   = wp_get_current_user();
	$p   = sh_table( 'products' );
	$cnt = static function ( $sql ) use ( $wpdb ) {
		return (int) $wpdb->get_var( $sql ); // phpcs:ignore WordPress.DB
	};
	$stats = array(
		'Total Products'  => $cnt( "SELECT COUNT(*) FROM $p" ),
		'Active Products' => $cnt( "SELECT COUNT(*) FROM $p WHERE status='ACTIVE'" ),
		'Total Orders'    => $cnt( 'SELECT COUNT(*) FROM ' . sh_table( 'orders' ) ),
		'Pending Orders'  => $cnt( 'SELECT COUNT(*) FROM ' . sh_table( 'orders' ) . " WHERE status='PENDING'" ),
		'Categories'      => $cnt( 'SELECT COUNT(*) FROM ' . sh_table( 'categories' ) ),
		'Reviews'         => $cnt( 'SELECT COUNT(*) FROM ' . sh_table( 'reviews' ) ),
	);
	$top = sh_attach_product_relations( (array) $wpdb->get_results( "SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM $p p LEFT JOIN " . sh_table( 'categories' ) . ' c ON c.id=p.category_id WHERE p.is_best_selling=1 ORDER BY p.created_at DESC LIMIT 5' ) ); // phpcs:ignore WordPress.DB
	sh_admin_title( 'Dashboard' );
	?>
	<div class="sh-card" style="background:linear-gradient(90deg,#800000,#7a4a1a);color:#fff;border:none">
		<h2 style="color:#fff;border:none;padding:0;font-size:18px">Welcome back, <?php echo esc_html( $u->display_name ); ?>! 👋</h2>
		<p style="margin:4px 0 0;opacity:.85">Here's what's happening with Shilperhaat today.</p>
	</div>
	<div class="sh-stats">
		<?php foreach ( $stats as $label => $n ) : ?>
			<div class="sh-stat"><div class="n"><?php echo (int) $n; ?></div><div class="l"><?php echo esc_html( $label ); ?></div></div>
		<?php endforeach; ?>
	</div>
	<div class="sh-card">
		<h2>Quick Actions</h2>
		<div class="sh-grid sh-grid-4">
			<?php
			$actions = array(
				array( 'products', array( 'edit' => 'new' ), '➕ Add Product' ),
				array( 'categories', array(), '📂 Manage Categories' ),
				array( 'banners', array(), '🖼️ Update Banner' ),
				array( 'orders', array(), '📦 View Orders' ),
				array( 'contact-widget', array(), '💬 Contact Widget' ),
			);
			foreach ( $actions as $a ) {
				if ( sh_user_can_page( $a[0] ) ) {
					printf( '<a class="button" href="%s">%s</a>', esc_url( sh_admin_url( $a[0], $a[1] ) ), esc_html( $a[2] ) );
				}
			}
			?>
		</div>
	</div>
	<?php if ( $top ) : ?>
		<div class="sh-card">
			<h2>Top Selling Products</h2>
			<table class="sh-table"><tbody>
				<?php foreach ( $top as $i => $t ) : ?>
					<tr><td style="width:30px"><?php echo (int) $i + 1; ?></td><td><strong><?php echo esc_html( $t->title ); ?></strong><br><span class="sh-muted"><?php echo esc_html( $t->category ? $t->category->name : '' ); ?></span></td><td style="text-align:right;color:#800000;font-weight:700"><?php echo esc_html( sh_format_price( $t->price ) ); ?></td></tr>
				<?php endforeach; ?>
			</tbody></table>
		</div>
	<?php endif; ?>
	<?php
}
