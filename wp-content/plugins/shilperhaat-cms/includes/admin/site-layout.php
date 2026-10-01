<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function sh_admin_page_site_layout() {
	$l      = sh_layout();
	$groups = array( 'information' => 'Information', 'shop' => 'Shop By (fallback — categories are used automatically)', 'support' => 'Support', 'policy' => 'Consumer Policy' );
	sh_admin_title( 'Site Layout', '<a class="button" target="_blank" href="' . esc_url( home_url( '/' ) ) . '">View site ↗</a>' );
	sh_form_open( 'layout_save' );
	?>
	<div class="sh-card">
		<h2>Brand</h2>
		<div class="sh-grid sh-grid-2">
			<div class="sh-field"><label>Site name</label><input type="text" name="siteName" value="<?php echo esc_attr( $l['siteName'] ); ?>"></div>
			<div class="sh-field"><label>Tagline</label><input type="text" name="tagline" value="<?php echo esc_attr( $l['tagline'] ); ?>"></div>
			<div class="sh-field"><label>Logo letter (when no logo image)</label><input type="text" name="logoLetter" maxlength="2" value="<?php echo esc_attr( $l['logoLetter'] ); ?>"></div>
			<div class="sh-field"><label>Logo image</label><?php sh_media_field( 'logoUrl', $l['logoUrl'], false, 'Choose logo' ); ?></div>
		</div>
	</div>
	<div class="sh-card">
		<h2>Contact</h2>
		<div class="sh-grid sh-grid-2">
			<div class="sh-field"><label>Phone</label><input type="text" name="phone" value="<?php echo esc_attr( $l['phone'] ); ?>"></div>
			<div class="sh-field"><label>WhatsApp number</label><input type="text" name="whatsappNumber" value="<?php echo esc_attr( $l['whatsappNumber'] ); ?>"></div>
			<div class="sh-field"><label>Email</label><input type="text" name="email" value="<?php echo esc_attr( $l['email'] ); ?>"></div>
			<div class="sh-field"><label>Address</label><input type="text" name="address" value="<?php echo esc_attr( $l['address'] ); ?>"></div>
		</div>
	</div>
	<div class="sh-card">
		<h2>Social links</h2>
		<div class="sh-grid sh-grid-3">
			<div class="sh-field"><label>Facebook</label><input type="url" name="facebookUrl" value="<?php echo esc_attr( $l['facebookUrl'] ); ?>"></div>
			<div class="sh-field"><label>Twitter / X</label><input type="url" name="twitterUrl" value="<?php echo esc_attr( $l['twitterUrl'] ); ?>"></div>
			<div class="sh-field"><label>Instagram</label><input type="url" name="instagramUrl" value="<?php echo esc_attr( $l['instagramUrl'] ); ?>"></div>
		</div>
	</div>
	<div class="sh-card">
		<h2>Footer</h2>
		<div class="sh-field"><label>Description</label><textarea name="footerDescription" rows="2"><?php echo esc_textarea( $l['footerDescription'] ); ?></textarea></div>
		<div class="sh-field"><label>Copyright text</label><input type="text" name="footerCopyright" value="<?php echo esc_attr( $l['footerCopyright'] ); ?>"></div>
		<div class="sh-grid sh-grid-2" style="margin-top:12px">
			<?php foreach ( $groups as $g => $label ) : $rows = isset( $l['footerLinks'][ $g ] ) ? $l['footerLinks'][ $g ] : array(); ?>
				<div>
					<h3 style="margin:0 0 8px"><?php echo esc_html( $label ); ?></h3>
					<div class="sh-repeat">
						<?php foreach ( $rows as $i => $r ) : ?>
							<div class="sh-repeat-row"><input type="text" name="footerLinks[<?php echo esc_attr( $g ); ?>][<?php echo (int) $i; ?>][label]" value="<?php echo esc_attr( $r['label'] ); ?>" placeholder="Label"><input type="text" name="footerLinks[<?php echo esc_attr( $g ); ?>][<?php echo (int) $i; ?>][href]" value="<?php echo esc_attr( $r['href'] ); ?>" placeholder="/link"><button type="button" class="button sh-repeat-del">×</button></div>
						<?php endforeach; ?>
					</div>
					<button type="button" class="button" data-sh-repeat-add="#tpl-<?php echo esc_attr( $g ); ?>">+ Add link</button>
					<script type="text/template" id="tpl-<?php echo esc_attr( $g ); ?>"><div class="sh-repeat-row"><input type="text" name="footerLinks[<?php echo esc_attr( $g ); ?>][__I__][label]" placeholder="Label"><input type="text" name="footerLinks[<?php echo esc_attr( $g ); ?>][__I__][href]" placeholder="/link"><button type="button" class="button sh-repeat-del">×</button></div></script>
				</div>
			<?php endforeach; ?>
		</div>
		<p class="hint">Internal links such as <code>/naim</code> automatically get an editable page under Pages.</p>
	</div>
	<button class="button button-primary">Save layout</button>
	</form>
	<?php
}

sh_admin_action( 'layout_save', 'site-layout', function () {
	$cur   = sh_layout();
	$links = array();
	$in    = isset( $_POST['footerLinks'] ) && is_array( $_POST['footerLinks'] ) ? wp_unslash( $_POST['footerLinks'] ) : array(); // phpcs:ignore WordPress.Security
	$all   = array();
	foreach ( array( 'information', 'shop', 'support', 'policy' ) as $g ) {
		$links[ $g ] = array();
		foreach ( isset( $in[ $g ] ) && is_array( $in[ $g ] ) ? $in[ $g ] : array() as $r ) {
			$label = sanitize_text_field( isset( $r['label'] ) ? $r['label'] : '' );
			$href  = trim( sanitize_text_field( isset( $r['href'] ) ? $r['href'] : '' ) );
			if ( '' === $label || '' === $href ) {
				continue;
			}
			$links[ $g ][] = array( 'href' => $href, 'label' => $label );
			$all[]         = array( 'href' => $href, 'label' => $label );
		}
	}
	$new = array_merge( $cur, array(
		'siteName'          => sh_post_text( 'siteName' ),
		'tagline'           => sh_post_text( 'tagline' ),
		'logoLetter'        => sh_post_text( 'logoLetter' ),
		'logoUrl'           => esc_url_raw( sh_post( 'logoUrl' ) ),
		'phone'             => sh_post_text( 'phone' ),
		'whatsappNumber'    => sh_post_text( 'whatsappNumber' ),
		'email'             => sanitize_email( sh_post( 'email' ) ),
		'address'           => sh_post_text( 'address' ),
		'facebookUrl'       => esc_url_raw( sh_post( 'facebookUrl' ) ),
		'twitterUrl'        => esc_url_raw( sh_post( 'twitterUrl' ) ),
		'instagramUrl'      => esc_url_raw( sh_post( 'instagramUrl' ) ),
		'footerDescription' => sanitize_textarea_field( sh_post( 'footerDescription' ) ),
		'footerCopyright'   => sh_post_text( 'footerCopyright' ),
		'footerLinks'       => $links,
	) );
	update_option( 'sh_site_layout', $new, false );
	sh_ensure_pages_for_links( $all );
	sh_admin_notice_flash( 'success', 'Site layout saved.' );
	sh_admin_redirect( 'site-layout' );
} );
