<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Super-admin only: create managers and choose which admin pages each one may open. */
function sh_admin_page_access() {
	// phpcs:disable WordPress.Security.NonceVerification
	$edit  = isset( $_GET['edit'] ) ? absint( $_GET['edit'] ) : 0;
	$pages = sh_admin_pages();
	if ( isset( $_GET['new'] ) || $edit ) {
		$u = $edit ? get_userdata( $edit ) : null;
		sh_admin_title( $u ? 'Edit manager' : 'New manager', '<a class="button" href="' . esc_url( sh_admin_url( 'access' ) ) . '">← Back</a>' );
		$access = $u ? sh_user_page_access( $u->ID ) : array();
		sh_form_open( 'access_save', array( 'user_id' => $u ? $u->ID : 0 ) );
		?>
		<div class="sh-card"><div class="sh-grid sh-grid-2">
			<div class="sh-field"><label>Name</label><input type="text" name="name" required value="<?php echo esc_attr( $u ? $u->display_name : '' ); ?>"></div>
			<div class="sh-field"><label>Email</label><input type="email" name="email" required value="<?php echo esc_attr( $u ? $u->user_email : '' ); ?>"></div>
			<div class="sh-field"><label>Password <?php echo $u ? '(leave empty to keep)' : '*'; ?></label><input type="password" name="password" autocomplete="new-password" <?php echo $u ? '' : 'required minlength="8"'; ?>><div class="hint">At least 8 characters.</div></div>
		</div></div>
		<div class="sh-card"><h2>Pages this manager can open</h2>
			<div class="sh-grid sh-grid-3">
				<?php foreach ( $pages as $k => $def ) : ?><label><input type="checkbox" name="pages[]" value="<?php echo esc_attr( $k ); ?>" <?php checked( in_array( $k, $access, true ) ); ?>> <?php echo esc_html( $def['label'] ); ?></label><?php endforeach; ?>
			</div>
			<p class="hint">WordPress administrators are always super admins with access to everything, including Settings secrets and this screen.</p>
		</div>
		<button class="button button-primary">Save</button></form>
		<?php
		return;
	}
	$managers = get_users( array( 'role' => 'sh_manager', 'orderby' => 'registered' ) );
	$admins   = get_users( array( 'role' => 'administrator' ) );
	sh_admin_title( 'Access Management', '<a class="button button-primary" href="' . esc_url( sh_admin_url( 'access', array( 'new' => 1 ) ) ) . '">+ New manager</a>' );
	echo '<div class="sh-card"><h2>Super admins</h2><p>' . esc_html( implode( ', ', wp_list_pluck( $admins, 'user_email' ) ) ) . '</p><p class="hint">Manage these users from WordPress → Users.</p></div>';
	echo '<table class="sh-table"><thead><tr><th>Manager</th><th>Pages</th><th></th></tr></thead><tbody>';
	foreach ( $managers as $m ) {
		$labels = array();
		foreach ( sh_user_page_access( $m->ID ) as $k ) {
			if ( isset( $pages[ $k ] ) ) {
				$labels[] = $pages[ $k ]['label'];
			}
		}
		printf( '<tr><td><strong>%s</strong><br><span class="sh-muted">%s</span></td><td>%s</td><td class="sh-row-actions"><a href="%s">Edit</a>', esc_html( $m->display_name ), esc_html( $m->user_email ), esc_html( $labels ? implode( ', ', $labels ) : '—' ), esc_url( sh_admin_url( 'access', array( 'edit' => $m->ID ) ) ) );
		sh_form_open( 'access_delete', array( 'user_id' => $m->ID ), 'style="display:inline" data-sh-confirm="Delete this manager account?"' );
		echo '<button class="sh-link-danger">Delete</button></form></td></tr>';
	}
	if ( ! $managers ) {
		echo '<tr><td colspan="3" class="sh-muted">No managers yet.</td></tr>';
	}
	echo '</tbody></table>';
}

// Access management is super-admin only → registered against the "settings" key check plus an explicit guard.
add_action( 'admin_post_sh_access_save', function () {
	if ( ! sh_is_super_admin() ) {
		wp_die( 'Forbidden', 403 );
	}
	check_admin_referer( 'sh_access_save' );
	$uid   = absint( sh_post( 'user_id', 0 ) );
	$name  = sh_post_text( 'name' );
	$email = sanitize_email( sh_post( 'email' ) );
	$pass  = (string) sh_post( 'password' );
	if ( '' === $name || ! is_email( $email ) || ( ! $uid && strlen( $pass ) < 8 ) || ( $pass && strlen( $pass ) < 8 ) ) {
		sh_admin_notice_flash( 'error', 'Name, a valid email and an 8+ character password are required.' );
		sh_admin_redirect( 'access', $uid ? array( 'edit' => $uid ) : array( 'new' => 1 ) );
	}
	$valid = array_keys( sh_admin_pages() );
	$pages = array_values( array_intersect( $valid, isset( $_POST['pages'] ) && is_array( $_POST['pages'] ) ? array_map( 'sanitize_key', wp_unslash( $_POST['pages'] ) ) : array() ) ); // phpcs:ignore WordPress.Security
	if ( $uid ) {
		$u = get_userdata( $uid );
		if ( ! $u || sh_is_super_admin( $uid ) ) {
			wp_die( 'Invalid user', 400 );
		}
		$args = array( 'ID' => $uid, 'display_name' => $name, 'user_email' => $email );
		if ( $pass ) {
			$args['user_pass'] = $pass;
		}
		$r = wp_update_user( $args );
	} else {
		$r = wp_insert_user( array( 'user_login' => $email, 'user_email' => $email, 'user_pass' => $pass, 'display_name' => $name, 'role' => 'sh_manager' ) );
	}
	if ( is_wp_error( $r ) ) {
		sh_admin_notice_flash( 'error', $r->get_error_message() );
		sh_admin_redirect( 'access', $uid ? array( 'edit' => $uid ) : array( 'new' => 1 ) );
	}
	update_user_meta( (int) $r, 'sh_page_access', $pages );
	sh_admin_notice_flash( 'success', 'Manager saved.' );
	sh_admin_redirect( 'access' );
} );

add_action( 'admin_post_sh_access_delete', function () {
	if ( ! sh_is_super_admin() ) {
		wp_die( 'Forbidden', 403 );
	}
	check_admin_referer( 'sh_access_delete' );
	require_once ABSPATH . 'wp-admin/includes/user.php';
	$uid = absint( sh_post( 'user_id', 0 ) );
	$u   = get_userdata( $uid );
	if ( $u && in_array( 'sh_manager', (array) $u->roles, true ) ) {
		wp_delete_user( $uid );
	}
	sh_admin_notice_flash( 'success', 'Manager deleted.' );
	sh_admin_redirect( 'access' );
} );
