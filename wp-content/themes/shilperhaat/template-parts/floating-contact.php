<?php
/**
 * Floating contact widget. Mirrors components/ui/FloatingContact.tsx.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
$cs = sh_contact_settings();
if ( empty( $cs['widgetEnabled'] ) ) {
	return;
}
$layout   = sh_layout();
$logo     = sh_media_url( $layout['logoUrl'] );
$left     = 'bottom-left' === $cs['buttonPosition'];
$contacts = array(
	array( 'label' => 'WhatsApp', 'sub' => 'Chat with us on WhatsApp', 'href' => $cs['whatsappUrl'], 'bg' => '#25D366', 'blank' => true,
		'icon' => '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>' ),
	array( 'label' => 'Call Us', 'sub' => 'Talk to our team directly', 'href' => 'tel:' . $cs['phoneNumber'], 'bg' => '#1a73e8', 'blank' => false, 'icon' => sh_icon( 'phone', 18 ) ),
	array( 'label' => 'Messenger', 'sub' => 'Message us on Facebook', 'href' => $cs['messengerUrl'], 'bg' => '#0084FF', 'blank' => true,
		'icon' => '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/></svg>' ),
	array( 'label' => 'Email Us', 'sub' => 'Send us an email', 'href' => 'mailto:' . $cs['emailAddress'], 'bg' => '#EA4335', 'blank' => false, 'icon' => sh_icon( 'mail', 18 ) ),
);
?>
<div data-sh-contact class="fixed bottom-6 z-[9999] <?php echo $left ? 'left-6 right-auto' : 'right-6 left-auto'; ?>">
	<div data-sh-contact-card hidden class="absolute bottom-16 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden" style="right:<?php echo $left ? 'auto' : '0'; ?>;left:<?php echo $left ? '0' : 'auto'; ?>;animation:contactPopIn 0.2s ease-out">
		<div class="relative px-5 pt-5 pb-6" style="background:linear-gradient(135deg, #800000 0%, #5C0000 100%)">
			<button type="button" data-sh-contact-close class="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors" aria-label="Close"><?php echo sh_icon( 'x', 14 ); // phpcs:ignore ?></button>
			<div class="flex items-center gap-3 mb-3">
				<?php if ( $logo ) : ?>
					<img src="<?php echo esc_url( $logo ); ?>" alt="<?php echo esc_attr( $layout['siteName'] ); ?>" style="height:36px;width:auto;max-width:100px;object-fit:contain">
				<?php else : ?>
					<div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg"><?php echo esc_html( $layout['logoLetter'] ? $layout['logoLetter'] : 'S' ); ?></div>
				<?php endif; ?>
				<div>
					<div class="font-bold text-white text-sm"><?php echo esc_html( $layout['siteName'] ? $layout['siteName'] : 'Shilperhaat' ); ?></div>
					<div class="text-white/80 text-xs"><?php echo esc_html( $layout['tagline'] ? $layout['tagline'] : 'Handcraft Marketplace' ); ?></div>
				</div>
			</div>
			<p class="text-white font-semibold text-base"><?php echo esc_html( $cs['welcomeMessage'] ); ?></p>
		</div>
		<div class="py-2">
			<?php foreach ( $contacts as $c ) : ?>
				<a href="<?php echo esc_url( $c['href'] ); ?>" <?php echo $c['blank'] ? 'target="_blank"' : ''; ?> rel="noopener noreferrer" class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
					<div class="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0" style="background:<?php echo esc_attr( $c['bg'] ); ?>"><?php echo $c['icon']; // phpcs:ignore ?></div>
					<div class="flex-1 min-w-0">
						<div class="font-semibold text-gray-800 text-sm"><?php echo esc_html( $c['label'] ); ?></div>
						<div class="text-gray-400 text-xs"><?php echo esc_html( $c['sub'] ); ?></div>
					</div>
					<?php echo sh_icon( 'chevron-right', 16, '', 2, 'text-gray-300 flex-shrink-0' ); // phpcs:ignore ?>
				</a>
			<?php endforeach; ?>
		</div>
		<div class="px-4 py-3 border-t border-gray-100 text-center"><p class="text-gray-400 text-xs">We usually reply within a few minutes</p></div>
	</div>

	<button type="button" data-sh-contact-toggle aria-label="Contact us" class="relative hidden md:flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95" style="width:60px;height:60px;background:none;border:none;padding:0">
		<span data-sh-contact-pulse class="absolute inset-0" style="border-radius:50% 50% 50% 12px / 50% 50% 50% 12px;background:#800000;animation:contactPulse 2s ease-out infinite;opacity:0"></span>
		<span data-sh-contact-blob class="absolute inset-0 flex items-center justify-center" style="background:linear-gradient(135deg, #800000 0%, #5C0000 100%);border-radius:50% 50% 12px 50%;transition:border-radius 0.25s ease;box-shadow:0 4px 18px rgba(128,0,0,0.55)"></span>
		<span class="relative z-10 flex items-center justify-center">
			<span data-sh-contact-icon-open><svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M13 2C7.477 2 3 6.03 3 11c0 2.56 1.13 4.87 2.96 6.52L5 23l5.55-2.46C11 20.84 12 21 13 21c5.523 0 10-4.03 10-9s-4.477-9-10-9z" fill="white" fill-opacity="0.95"/><circle cx="9" cy="11" r="1.4" fill="#800000"/><circle cx="13" cy="11" r="1.4" fill="#800000"/><circle cx="17" cy="11" r="1.4" fill="#800000"/></svg></span>
			<span data-sh-contact-icon-close hidden><?php echo sh_icon( 'x', 22, '', 2.5 ); // phpcs:ignore ?></span>
		</span>
	</button>
</div>
