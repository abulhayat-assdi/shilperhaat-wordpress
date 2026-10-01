<?php
/**
 * Site-wide content settings (port of the original `site_content` rows:
 * "site-layout" and "contact-widget"). Stored in wp_options as arrays.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function sh_layout_defaults() {
	return array(
		'siteName'          => 'Shilperhaat',
		'tagline'           => 'Handcraft Marketplace',
		'logoLetter'        => 'S',
		'logoUrl'           => '',
		'logoWidth'         => 140,
		'logoHeight'        => 50,
		'phone'             => '01700000000',
		'whatsappNumber'    => '01700000000',
		'email'             => 'info@shilperhaat.com',
		'address'           => 'Dhaka, Bangladesh',
		'facebookUrl'       => 'https://facebook.com/shilperhaat',
		'twitterUrl'        => 'https://twitter.com/shilperhaat',
		'instagramUrl'      => 'https://instagram.com/shilperhaat',
		'footerDescription' => "Bringing Bangladesh's traditional handcraft textiles to your doorstep. Premium-quality Katha, Chadar & Blankets.",
		'footerCopyright'   => '© 2025 Shilperhaat. All rights reserved.',
		'footerLinks'       => array(
			'information' => array(
				array( 'href' => '/about', 'label' => 'About Us' ),
				array( 'href' => '/contact', 'label' => 'Contact Us' ),
				array( 'href' => '/about', 'label' => 'Company Information' ),
				array( 'href' => '/blog', 'label' => 'Blog' ),
				array( 'href' => '/terms-of-use', 'label' => 'Terms & Conditions' ),
				array( 'href' => '/privacy-policy', 'label' => 'Privacy Policy' ),
				array( 'href' => '/careers', 'label' => 'Careers' ),
			),
			'shop'        => array(
				array( 'href' => '/shop?category=katha', 'label' => 'Katha' ),
				array( 'href' => '/shop?category=nakshi-katha', 'label' => 'Nakshi Katha' ),
				array( 'href' => '/shop?category=chador', 'label' => 'Chadar' ),
				array( 'href' => '/shop?category=kambal', 'label' => 'Blanket' ),
				array( 'href' => '/shop?category=muslin', 'label' => 'Muslin' ),
				array( 'href' => '/shop?category=jamdani', 'label' => 'Jamdani' ),
			),
			'support'     => array(
				array( 'href' => '/support', 'label' => 'Support Center' ),
				array( 'href' => '/how-to-order', 'label' => 'How to Order' ),
				array( 'href' => '/track-order', 'label' => 'Order Tracking' ),
				array( 'href' => '/delivery-policy', 'label' => 'Payment' ),
				array( 'href' => '/shipping-info', 'label' => 'Shipping' ),
				array( 'href' => '/faq', 'label' => 'FAQ' ),
			),
			'policy'      => array(
				array( 'href' => '/privacy-policy', 'label' => 'Privacy Policy' ),
				array( 'href' => '/terms-of-use', 'label' => 'Terms of Use' ),
				array( 'href' => '/refund-policy', 'label' => 'Refund Policy' ),
				array( 'href' => '/delivery-policy', 'label' => 'Delivery Policy' ),
			),
		),
	);
}

function sh_contact_defaults() {
	return array(
		'whatsappUrl'    => 'https://wa.me/8801700000000',
		'phoneNumber'    => '01700000000',
		'messengerUrl'   => 'https://m.me/shilperhaat',
		'emailAddress'   => 'info@shilperhaat.com',
		'widgetEnabled'  => true,
		'welcomeMessage' => 'আমাদের সাথে যোগাযোগ করুন',
		'buttonPosition' => 'bottom-right',
	);
}

/** Shallow merge, same as the original `{...DEFAULT, ...saved}`. */
function sh_layout() {
	static $cache = null;
	if ( null === $cache ) {
		$saved = get_option( 'sh_site_layout', array() );
		$cache = array_merge( sh_layout_defaults(), is_array( $saved ) ? $saved : array() );
	}
	return $cache;
}

function sh_contact_settings() {
	static $cache = null;
	if ( null === $cache ) {
		$saved = get_option( 'sh_contact_widget', array() );
		$cache = array_merge( sh_contact_defaults(), is_array( $saved ) ? $saved : array() );
	}
	return $cache;
}
