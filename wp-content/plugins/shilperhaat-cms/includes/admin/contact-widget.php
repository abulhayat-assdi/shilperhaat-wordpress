<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function sh_admin_page_contact_widget() {
	$c = sh_contact_settings();
	sh_admin_title( 'Contact Widget' );
	sh_form_open( 'contact_save' );
	?>
	<div class="sh-card">
		<div class="sh-grid sh-grid-2">
			<div class="sh-field"><label>WhatsApp link or number</label><input type="text" name="whatsappUrl" value="<?php echo esc_attr( $c['whatsappUrl'] ); ?>" placeholder="https://wa.me/8801XXXXXXXXX"></div>
			<div class="sh-field"><label>Phone number</label><input type="text" name="phoneNumber" value="<?php echo esc_attr( $c['phoneNumber'] ); ?>"></div>
			<div class="sh-field"><label>Messenger link</label><input type="text" name="messengerUrl" value="<?php echo esc_attr( $c['messengerUrl'] ); ?>" placeholder="https://m.me/yourpage"></div>
			<div class="sh-field"><label>Email address</label><input type="text" name="emailAddress" value="<?php echo esc_attr( $c['emailAddress'] ); ?>"></div>
			<div class="sh-field"><label>Welcome message</label><input type="text" name="welcomeMessage" value="<?php echo esc_attr( $c['welcomeMessage'] ); ?>"></div>
			<div class="sh-field"><label>Button position</label><select name="buttonPosition"><option value="bottom-right" <?php selected( $c['buttonPosition'], 'bottom-right' ); ?>>Bottom right</option><option value="bottom-left" <?php selected( $c['buttonPosition'], 'bottom-left' ); ?>>Bottom left</option></select></div>
		</div>
		<p><label><input type="checkbox" name="widgetEnabled" value="1" <?php checked( ! empty( $c['widgetEnabled'] ) ); ?>> Show the floating contact widget</label></p>
	</div>
	<button class="button button-primary">Save</button>
	</form>
	<?php
}

sh_admin_action( 'contact_save', 'contact-widget', function () {
	update_option( 'sh_contact_widget', array(
		'whatsappUrl'    => sh_post_text( 'whatsappUrl' ),
		'phoneNumber'    => sh_post_text( 'phoneNumber' ),
		'messengerUrl'   => sh_post_text( 'messengerUrl' ),
		'emailAddress'   => sanitize_email( sh_post( 'emailAddress' ) ),
		'widgetEnabled'  => (bool) sh_post_bool( 'widgetEnabled' ),
		'welcomeMessage' => sh_post_text( 'welcomeMessage' ),
		'buttonPosition' => 'bottom-left' === sh_post( 'buttonPosition' ) ? 'bottom-left' : 'bottom-right',
	), false );
	sh_admin_notice_flash( 'success', 'Contact widget saved.' );
	sh_admin_redirect( 'contact-widget' );
} );
