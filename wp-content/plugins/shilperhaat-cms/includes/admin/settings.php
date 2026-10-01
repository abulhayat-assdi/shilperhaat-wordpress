<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function sh_admin_page_settings() {
	$s   = array_merge( array( 'siteName' => 'Shilperhaat', 'logoUrl' => '', 'faviconUrl' => '', 'footerCopyright' => '', 'whatsappNumber' => '', 'deliveryCharge' => 0, 'freeDeliveryMin' => '' ), sh_site_settings() );
	$int = sh_integrations();
	$secret = static function ( $key ) use ( $int ) {
		return '' !== $int[ $key ] ? '<span class="sh-secret-set">✓ saved (' . esc_html( sh_mask_secret( $int[ $key ] ) ) . ')</span>' : '<span class="sh-muted">not set</span>';
	};
	sh_admin_title( 'Settings' );
	sh_form_open( 'settings_save' );
	?>
	<div class="sh-card">
		<h2>Site</h2>
		<div class="sh-grid sh-grid-2">
			<div class="sh-field"><label>Site name</label><input type="text" name="siteName" value="<?php echo esc_attr( $s['siteName'] ); ?>"></div>
			<div class="sh-field"><label>WhatsApp (Settings)</label><input type="text" name="whatsappNumber" value="<?php echo esc_attr( $s['whatsappNumber'] ); ?>"></div>
			<div class="sh-field"><label>Logo</label><?php sh_media_field( 'logoUrl', $s['logoUrl'], false, 'Choose logo' ); ?></div>
			<div class="sh-field"><label>Favicon</label><?php sh_media_field( 'faviconUrl', $s['faviconUrl'], false, 'Choose favicon' ); ?></div>
			<div class="sh-field" style="grid-column:1/-1"><label>Footer copyright (optional)</label><input type="text" name="footerCopyright" value="<?php echo esc_attr( $s['footerCopyright'] ); ?>"></div>
		</div>
	</div>
	<div class="sh-card">
		<h2>Delivery</h2>
		<div class="sh-grid sh-grid-2">
			<div class="sh-field"><label>Default delivery charge (৳) — used in the cart</label><input type="number" step="0.01" min="0" name="deliveryCharge" value="<?php echo esc_attr( $s['deliveryCharge'] ); ?>"></div>
			<div class="sh-field"><label>Free delivery above (৳)</label><input type="number" step="0.01" min="0" name="freeDeliveryMin" value="<?php echo esc_attr( $s['freeDeliveryMin'] ); ?>"><div class="hint">Empty = 2000 (original default). Checkout uses ৳100 for Dhaka and ৳150 elsewhere.</div></div>
		</div>
	</div>

	<?php if ( sh_is_super_admin() ) : ?>
	<div class="sh-card">
		<h2>Meta (Facebook) Pixel &amp; Conversions API</h2>
		<div class="sh-grid sh-grid-2">
			<div class="sh-field"><label>Pixel ID</label><input type="text" name="meta_pixel_id" value="<?php echo esc_attr( $int['meta_pixel_id'] ); ?>" placeholder="1234567890"></div>
			<div class="sh-field"><label>Test event code (optional)</label><input type="text" name="meta_test_event_code" value="<?php echo esc_attr( $int['meta_test_event_code'] ); ?>" placeholder="TEST12345"><div class="hint">Only while testing in Meta Events Manager. Clear it for live traffic.</div></div>
			<div class="sh-field" style="grid-column:1/-1"><label>Conversions API access token <?php echo $secret( 'meta_capi_token' ); // phpcs:ignore ?></label><input type="password" name="meta_capi_token" autocomplete="new-password" placeholder="Leave empty to keep the saved token"><div class="hint">Stored encrypted, used only on the server. Type <code>__clear__</code> to remove it.</div></div>
		</div>
		<p><button type="button" class="button" data-sh-ajax="sh_test_meta" data-nonce="<?php echo esc_attr( wp_create_nonce( 'sh_test' ) ); ?>" data-sh-out="#sh-meta-out">Test connection</button> <span id="sh-meta-out"></span></p>
	</div>
	<div class="sh-card">
		<h2>Steadfast courier</h2>
		<div class="sh-grid sh-grid-2">
			<div class="sh-field"><label>API key <?php echo $secret( 'steadfast_api_key' ); // phpcs:ignore ?></label><input type="password" name="steadfast_api_key" autocomplete="new-password" placeholder="Leave empty to keep the saved key"></div>
			<div class="sh-field"><label>Secret key <?php echo $secret( 'steadfast_secret_key' ); // phpcs:ignore ?></label><input type="password" name="steadfast_secret_key" autocomplete="new-password" placeholder="Leave empty to keep the saved key"></div>
		</div>
		<p class="hint">Stored encrypted, used only on the server. Type <code>__clear__</code> to remove a key.</p>
		<p><button type="button" class="button" data-sh-ajax="sh_test_steadfast" data-nonce="<?php echo esc_attr( wp_create_nonce( 'sh_test' ) ); ?>" data-sh-out="#sh-sf-out">Test connection</button> <span id="sh-sf-out"></span></p>
	</div>
	<?php endif; ?>
	<button class="button button-primary">Save settings</button>
	</form>
	<?php
}

sh_admin_action( 'settings_save', 'settings', function () {
	$free = sh_post( 'freeDeliveryMin' );
	update_option( 'sh_site_settings', array_merge( sh_site_settings(), array(
		'siteName'        => sh_post_text( 'siteName' ),
		'logoUrl'         => esc_url_raw( sh_post( 'logoUrl' ) ),
		'faviconUrl'      => esc_url_raw( sh_post( 'faviconUrl' ) ),
		'footerCopyright' => sh_post_text( 'footerCopyright' ),
		'whatsappNumber'  => sh_post_text( 'whatsappNumber' ),
		'deliveryCharge'  => max( 0, (float) sh_post( 'deliveryCharge', 0 ) ),
		'freeDeliveryMin' => is_numeric( $free ) && (float) $free > 0 ? (float) $free : null,
	) ), false );
	if ( sh_is_super_admin() ) {
		sh_save_integrations( array(
			'meta_pixel_id'        => sh_post( 'meta_pixel_id' ),
			'meta_capi_token'      => sh_post( 'meta_capi_token' ),
			'meta_test_event_code' => sh_post( 'meta_test_event_code' ),
			'steadfast_api_key'    => sh_post( 'steadfast_api_key' ),
			'steadfast_secret_key' => sh_post( 'steadfast_secret_key' ),
		) );
	}
	sh_admin_notice_flash( 'success', 'Settings saved.' );
	sh_admin_redirect( 'settings' );
} );

add_action( 'wp_ajax_sh_test_steadfast', function () {
	check_ajax_referer( 'sh_test' );
	if ( ! sh_is_super_admin() ) {
		wp_send_json_error( 'Forbidden', 403 );
	}
	$b = sh_steadfast_balance();
	is_wp_error( $b ) ? wp_send_json_error( $b->get_error_message() ) : wp_send_json_success( '✓ Connected — balance ৳' . $b );
} );

add_action( 'wp_ajax_sh_test_meta', function () {
	check_ajax_referer( 'sh_test' );
	if ( ! sh_is_super_admin() ) {
		wp_send_json_error( 'Forbidden', 403 );
	}
	$c = sh_integrations();
	if ( '' === $c['meta_pixel_id'] || '' === $c['meta_capi_token'] ) {
		wp_send_json_error( 'Save the Pixel ID and access token first.' );
	}
	$res  = wp_remote_get( 'https://graph.facebook.com/v21.0/' . rawurlencode( $c['meta_pixel_id'] ) . '?fields=name&access_token=' . rawurlencode( $c['meta_capi_token'] ), array( 'timeout' => 10 ) );
	$json = is_wp_error( $res ) ? null : json_decode( wp_remote_retrieve_body( $res ), true );
	if ( is_wp_error( $res ) ) {
		wp_send_json_error( $res->get_error_message() );
	}
	if ( ! empty( $json['name'] ) ) {
		wp_send_json_success( '✓ Connected to pixel “' . $json['name'] . '”' );
	}
	wp_send_json_error( isset( $json['error']['message'] ) ? $json['error']['message'] : 'Could not verify the token.' );
} );
