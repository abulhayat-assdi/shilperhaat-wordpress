<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function sh_order_status_pill( $status ) {
	$map = array( 'PENDING' => 'yellow', 'CONFIRMED' => 'blue', 'PROCESSING' => 'purple', 'SHIPPED' => 'indigo', 'DELIVERED' => 'green', 'CANCELLED' => 'red' );
	return '<span class="sh-pill ' . esc_attr( isset( $map[ $status ] ) ? $map[ $status ] : 'gray' ) . '">' . esc_html( ucfirst( strtolower( $status ) ) ) . '</span>';
}

function sh_admin_page_orders() {
	global $wpdb;
	// phpcs:disable WordPress.Security.NonceVerification
	$view = isset( $_GET['view'] ) ? sanitize_text_field( wp_unslash( $_GET['view'] ) ) : '';
	if ( $view ) {
		sh_admin_order_detail( $view );
		return;
	}
	$status = isset( $_GET['status'] ) ? sanitize_text_field( wp_unslash( $_GET['status'] ) ) : 'PENDING';
	$s      = isset( $_GET['s'] ) ? sanitize_text_field( wp_unslash( $_GET['s'] ) ) : '';
	$paged  = max( 1, (int) ( isset( $_GET['paged'] ) ? $_GET['paged'] : 1 ) );
	$per    = 25;
	$t      = sh_table( 'orders' );
	$where  = array( '1=1' );
	if ( $status && 'ALL' !== $status ) {
		$where[] = $wpdb->prepare( 'status = %s', $status );
	}
	if ( $s ) {
		$like    = '%' . $wpdb->esc_like( $s ) . '%';
		$where[] = $wpdb->prepare( '(order_number LIKE %s OR customer_name LIKE %s OR phone LIKE %s)', $like, $like, $like );
	}
	$w     = implode( ' AND ', $where );
	$total = (int) $wpdb->get_var( "SELECT COUNT(*) FROM $t WHERE $w" ); // phpcs:ignore WordPress.DB
	$rows  = (array) $wpdb->get_results( "SELECT * FROM $t WHERE $w ORDER BY created_at DESC LIMIT " . ( ( $paged - 1 ) * $per ) . ", $per" ); // phpcs:ignore WordPress.DB
	sh_admin_title( 'Orders' );
	?>
	<form method="get" class="sh-filter">
		<input type="hidden" name="page" value="shilperhaat-orders">
		<select name="status"><option value="ALL">All statuses</option><?php foreach ( array( 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED' ) as $st ) : ?><option value="<?php echo esc_attr( $st ); ?>" <?php selected( $status, $st ); ?>><?php echo esc_html( ucfirst( strtolower( $st ) ) ); ?></option><?php endforeach; ?></select>
		<input type="search" name="s" value="<?php echo esc_attr( $s ); ?>" placeholder="Order #, name or phone">
		<button class="button">Filter</button>
	</form>
	<table class="sh-table">
		<thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Date</th><th>Status</th><th></th></tr></thead>
		<tbody>
		<?php foreach ( $rows as $o ) : ?>
			<tr>
				<td><strong><a href="<?php echo esc_url( sh_admin_url( 'orders', array( 'view' => $o->id ) ) ); ?>">#<?php echo esc_html( $o->order_number ); ?></a></strong></td>
				<td><?php echo esc_html( $o->customer_name ); ?><br><span class="sh-muted"><?php echo esc_html( $o->phone ); ?></span></td>
				<td><?php echo esc_html( sh_format_price( $o->total ) ); ?></td>
				<td><?php echo esc_html( get_date_from_gmt( $o->created_at, 'M j, Y g:i a' ) ); ?></td>
				<td><?php echo sh_order_status_pill( $o->status ); // phpcs:ignore ?><?php echo $o->courier_tracking_code ? ' <span class="sh-pill blue">Courier</span>' : ''; // phpcs:ignore ?></td>
				<td class="sh-row-actions"><a href="<?php echo esc_url( sh_admin_url( 'orders', array( 'view' => $o->id ) ) ); ?>">View</a></td>
			</tr>
		<?php endforeach; ?>
		<?php if ( ! $rows ) : ?><tr><td colspan="6" class="sh-muted">No orders found.</td></tr><?php endif; ?>
		</tbody>
	</table>
	<?php sh_pager( $total, $per, $paged, 'orders', array( 'status' => $status, 's' => $s ) ); ?>
	<?php
}

function sh_admin_order_detail( $id ) {
	global $wpdb;
	$o = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . sh_table( 'orders' ) . ' WHERE id = %s', $id ) ); // phpcs:ignore WordPress.DB
	if ( ! $o ) {
		echo '<p>Order not found.</p>';
		return;
	}
	$items = (array) $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . sh_table( 'order_items' ) . ' WHERE order_id = %s', $id ) ); // phpcs:ignore WordPress.DB
	sh_admin_title( 'Order #' . $o->order_number, '<a class="button" href="' . esc_url( sh_admin_url( 'orders' ) ) . '">← Back</a>' );
	?>
	<div class="sh-grid" style="grid-template-columns:2fr 1fr;align-items:start">
		<div>
			<div class="sh-card">
				<h2>Items</h2>
				<table class="sh-table sh-order-items"><thead><tr><th></th><th>Product</th><th>Price</th><th>Qty</th><th>Total</th></tr></thead><tbody>
				<?php foreach ( $items as $i ) : ?>
					<tr><td><img class="sh-thumb" style="width:40px;height:40px" src="<?php echo esc_url( sh_image_url( $i->product_image ) ); ?>" alt=""></td><td><?php echo esc_html( $i->product_title ); ?></td><td><?php echo esc_html( sh_format_price( $i->price ) ); ?></td><td><?php echo (int) $i->quantity; ?></td><td><?php echo esc_html( sh_format_price( $i->line_total ) ); ?></td></tr>
				<?php endforeach; ?>
				</tbody></table>
				<p style="text-align:right;margin-top:12px">
					Subtotal: <strong><?php echo esc_html( sh_format_price( $o->subtotal ) ); ?></strong><br>
					Delivery: <strong><?php echo esc_html( sh_format_price( $o->delivery_charge ) ); ?></strong><br>
					<?php if ( (float) $o->discount > 0 ) : ?>Discount (<?php echo esc_html( $o->coupon_code ); ?>): <strong>−<?php echo esc_html( sh_format_price( $o->discount ) ); ?></strong><br><?php endif; ?>
					<span style="font-size:18px;color:#800000">Total: <strong><?php echo esc_html( sh_format_price( $o->total ) ); ?></strong></span>
				</p>
			</div>
			<div class="sh-card">
				<h2>Customer</h2>
				<p><strong><?php echo esc_html( $o->customer_name ); ?></strong><br>📞 <a href="tel:<?php echo esc_attr( $o->phone ); ?>"><?php echo esc_html( $o->phone ); ?></a><br>📍 <?php echo esc_html( $o->address ); ?><br>💵 <?php echo esc_html( 'COD' === $o->payment_method ? 'Cash on Delivery' : $o->payment_method ); ?>
				<?php if ( $o->notes ) : ?><br>📝 <em><?php echo esc_html( $o->notes ); ?></em><?php endif; ?></p>
				<p class="sh-muted">Placed <?php echo esc_html( get_date_from_gmt( $o->created_at, 'M j, Y g:i a' ) ); ?></p>
			</div>
		</div>
		<div>
			<div class="sh-card">
				<h2>Status</h2>
				<p><?php echo sh_order_status_pill( $o->status ); // phpcs:ignore ?></p>
				<?php sh_form_open( 'order_update', array( 'id' => $o->id ) ); ?>
					<div class="sh-field"><label>Change status</label><select name="status"><?php foreach ( array( 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED' ) as $st ) : ?><option value="<?php echo esc_attr( $st ); ?>" <?php selected( $o->status, $st ); ?>><?php echo esc_html( ucfirst( strtolower( $st ) ) ); ?></option><?php endforeach; ?></select><div class="hint">Cancelling an order returns its items to stock.</div></div>
					<div class="sh-field"><label>Note for the customer (shown on Track Order)</label><textarea name="adminNote" rows="3"><?php echo esc_textarea( $o->admin_note ); ?></textarea></div>
					<button class="button button-primary">Update</button>
				</form>
			</div>
			<div class="sh-card">
				<h2>Steadfast courier</h2>
				<?php if ( $o->courier_tracking_code ) : ?>
					<p>✓ Sent <?php echo $o->courier_sent_at ? esc_html( get_date_from_gmt( $o->courier_sent_at, 'M j, g:i a' ) ) : ''; ?><br>Consignment: <strong><?php echo esc_html( $o->courier_consignment_id ); ?></strong><br>Tracking: <strong><?php echo esc_html( $o->courier_tracking_code ); ?></strong><br>
					<a target="_blank" rel="noopener" href="<?php echo esc_url( 'https://steadfast.com.bd/t/' . rawurlencode( $o->courier_tracking_code ) ); ?>">Track on Steadfast →</a></p>
				<?php else : ?>
					<?php sh_form_open( 'order_courier', array( 'id' => $o->id ), 'data-sh-confirm="Send this order to Steadfast Courier?"' ); ?><button class="button">Send to Steadfast</button></form>
					<?php if ( '' === sh_integrations()['steadfast_api_key'] ) : ?><p class="hint">Add your Steadfast keys in <a href="<?php echo esc_url( sh_admin_url( 'settings' ) ); ?>">Settings</a> first.</p><?php endif; ?>
				<?php endif; ?>
			</div>
			<div class="sh-card">
				<?php sh_form_open( 'order_delete', array( 'id' => $o->id ), 'data-sh-confirm="Delete this order permanently?"' ); ?><button class="sh-link-danger">Delete order</button></form>
			</div>
		</div>
	</div>
	<?php
}

/** Returns reserved stock for an order's items (used on cancel/delete). */
function sh_order_restore_stock( $order_id ) {
	global $wpdb;
	$items = (array) $wpdb->get_results( $wpdb->prepare( 'SELECT product_id, quantity FROM ' . sh_table( 'order_items' ) . ' WHERE order_id = %s', $order_id ) ); // phpcs:ignore WordPress.DB
	foreach ( $items as $i ) {
		if ( $i->product_id ) {
			$wpdb->query( $wpdb->prepare( 'UPDATE ' . sh_table( 'products' ) . ' SET stock = stock + %d WHERE id = %s', $i->quantity, $i->product_id ) ); // phpcs:ignore WordPress.DB
		}
	}
}

sh_admin_action( 'order_update', 'orders', function () {
	global $wpdb;
	$id     = sh_post_text( 'id' );
	$status = sh_post_text( 'status' );
	if ( ! in_array( $status, array( 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED' ), true ) ) {
		sh_admin_redirect( 'orders', array( 'view' => $id ) );
	}
	$existing = $wpdb->get_row( $wpdb->prepare( 'SELECT status FROM ' . sh_table( 'orders' ) . ' WHERE id = %s', $id ) ); // phpcs:ignore WordPress.DB
	if ( $existing && 'CANCELLED' === $status && 'CANCELLED' !== $existing->status ) {
		sh_order_restore_stock( $id );
	}
	$wpdb->update( sh_table( 'orders' ), array( 'status' => $status, 'admin_note' => sanitize_textarea_field( sh_post( 'adminNote' ) ), 'updated_at' => current_time( 'mysql', true ) ), array( 'id' => $id ) );
	sh_admin_notice_flash( 'success', 'Order updated.' );
	sh_admin_redirect( 'orders', array( 'view' => $id ) );
} );

sh_admin_action( 'order_courier', 'orders', function () {
	global $wpdb;
	$id = sh_post_text( 'id' );
	$o  = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . sh_table( 'orders' ) . ' WHERE id = %s', $id ) ); // phpcs:ignore WordPress.DB
	if ( $o ) {
		$res = sh_steadfast_create_order( $o );
		if ( is_wp_error( $res ) ) {
			sh_admin_notice_flash( 'error', $res->get_error_message() );
		} else {
			$wpdb->update( sh_table( 'orders' ), array(
				'courier_consignment_id' => (string) $res['consignmentId'],
				'courier_tracking_code'  => (string) $res['trackingCode'],
				'courier_status'         => (string) $res['status'],
				'courier_sent_at'        => current_time( 'mysql', true ),
				'updated_at'             => current_time( 'mysql', true ),
			), array( 'id' => $id ) );
			sh_admin_notice_flash( 'success', '✓ Order sent to Steadfast! Tracking ID: ' . $res['trackingCode'] );
		}
	}
	sh_admin_redirect( 'orders', array( 'view' => $id ) );
} );

sh_admin_action( 'order_delete', 'orders', function () {
	global $wpdb;
	$id = sh_post_text( 'id' );
	$o  = $wpdb->get_row( $wpdb->prepare( 'SELECT status FROM ' . sh_table( 'orders' ) . ' WHERE id = %s', $id ) ); // phpcs:ignore WordPress.DB
	if ( $o ) {
		if ( 'CANCELLED' !== $o->status ) {
			sh_order_restore_stock( $id );
		}
		$wpdb->delete( sh_table( 'order_items' ), array( 'order_id' => $id ) );
		$wpdb->delete( sh_table( 'orders' ), array( 'id' => $id ) );
	}
	sh_admin_notice_flash( 'success', 'Order deleted.' );
	sh_admin_redirect( 'orders' );
} );
