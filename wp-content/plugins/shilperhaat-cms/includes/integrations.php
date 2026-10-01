<?php
/**
 * Third-party integrations configured from the plugin's Settings screen
 * (nothing is read from environment variables or committed to the repo):
 *   - Meta Pixel + Conversions API
 *   - Steadfast courier
 *
 * Secret values are stored encrypted (libsodium, key derived from the site's WordPress salts)
 * and are only ever used server-side.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const SH_INTEGRATIONS_OPTION = 'sh_integrations';

/** Fields that are secrets (stored encrypted, masked in the UI). */
function sh_integration_secret_keys() {
	return array( 'meta_capi_token', 'steadfast_api_key', 'steadfast_secret_key' );
}

function sh_integration_defaults() {
	return array(
		'meta_pixel_id'        => '',
		'meta_capi_token'      => '',
		'meta_test_event_code' => '',
		'steadfast_api_key'    => '',
		'steadfast_secret_key' => '',
	);
}

function sh_crypto_key() {
	return sodium_crypto_generichash( wp_salt( 'secure_auth' ) . wp_salt( 'auth' ), '', SODIUM_CRYPTO_SECRETBOX_KEYBYTES );
}

function sh_encrypt( $plain ) {
	if ( '' === (string) $plain ) {
		return '';
	}
	$nonce = random_bytes( SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
	return 'v1:' . base64_encode( $nonce . sodium_crypto_secretbox( (string) $plain, $nonce, sh_crypto_key() ) ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions
}

function sh_decrypt( $stored ) {
	$stored = (string) $stored;
	if ( 0 !== strpos( $stored, 'v1:' ) ) {
		return '';
	}
	$raw = base64_decode( substr( $stored, 3 ), true ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions
	if ( false === $raw || strlen( $raw ) <= SODIUM_CRYPTO_SECRETBOX_NONCEBYTES ) {
		return '';
	}
	$nonce  = substr( $raw, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
	$cipher = substr( $raw, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
	$plain  = sodium_crypto_secretbox_open( $cipher, $nonce, sh_crypto_key() );
	return false === $plain ? '' : $plain;
}

/** Decrypted integration settings (server-side use only). */
function sh_integrations() {
	static $cache = null;
	if ( null !== $cache ) {
		return $cache;
	}
	$saved = get_option( SH_INTEGRATIONS_OPTION, array() );
	$saved = is_array( $saved ) ? $saved : array();
	$out   = sh_integration_defaults();
	foreach ( $out as $k => $_ ) {
		if ( isset( $saved[ $k ] ) ) {
			$out[ $k ] = in_array( $k, sh_integration_secret_keys(), true ) ? sh_decrypt( $saved[ $k ] ) : (string) $saved[ $k ];
		}
	}
	$cache = $out;
	return $cache;
}

/**
 * Saves posted values. Empty secret fields keep the stored value; pass '__clear__' to delete.
 *
 * @param array $in Raw input keyed like sh_integration_defaults().
 */
function sh_save_integrations( $in ) {
	$current = get_option( SH_INTEGRATIONS_OPTION, array() );
	$current = is_array( $current ) ? $current : array();
	foreach ( sh_integration_defaults() as $k => $_ ) {
		if ( ! array_key_exists( $k, $in ) ) {
			continue;
		}
		$val = trim( (string) wp_unslash( $in[ $k ] ) );
		if ( in_array( $k, sh_integration_secret_keys(), true ) ) {
			if ( '' === $val ) {
				continue;
			}
			$current[ $k ] = '__clear__' === $val ? '' : sh_encrypt( $val );
		} else {
			$current[ $k ] = sanitize_text_field( $val );
		}
	}
	update_option( SH_INTEGRATIONS_OPTION, $current, false );
}

/** "••••abcd" style mask for a secret (never reveals more than the last 4 chars). */
function sh_mask_secret( $secret ) {
	$secret = (string) $secret;
	if ( '' === $secret ) {
		return '';
	}
	return str_repeat( '•', 8 ) . ( strlen( $secret ) > 8 ? substr( $secret, -4 ) : '' );
}

/* ───────────────────────── Meta Conversions API ───────────────────────── */

function sh_meta_normalize_phone( $raw ) {
	$d = preg_replace( '/\D/', '', (string) $raw );
	if ( 0 === strpos( $d, '880' ) ) {
		return $d;
	}
	if ( 0 === strpos( $d, '0' ) ) {
		return '880' . substr( $d, 1 );
	}
	if ( 0 === strpos( $d, '1' ) && 10 === strlen( $d ) ) {
		return '880' . $d;
	}
	return $d;
}

function sh_client_ip() {
	$xff = isset( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) : '';
	if ( $xff ) {
		return trim( explode( ',', $xff )[0] );
	}
	if ( ! empty( $_SERVER['HTTP_X_REAL_IP'] ) ) {
		return sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_REAL_IP'] ) );
	}
	return isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
}

/**
 * Sends one event to the Conversions API. Silent no-op when Pixel ID / token are not configured.
 *
 * @param array $o event_name, event_id, source_url, user (phone, first_name), custom
 */
function sh_meta_send_event( $o ) {
	$cfg = sh_integrations();
	if ( '' === $cfg['meta_pixel_id'] || '' === $cfg['meta_capi_token'] ) {
		return;
	}
	$user = array();
	$u    = isset( $o['user'] ) ? $o['user'] : array();
	if ( ! empty( $u['phone'] ) ) {
		$user['ph'] = hash( 'sha256', sh_meta_normalize_phone( $u['phone'] ) );
	}
	if ( ! empty( $u['first_name'] ) ) {
		$user['fn'] = hash( 'sha256', strtolower( trim( $u['first_name'] ) ) );
	}
	if ( ! empty( $_COOKIE['_fbp'] ) ) {
		$user['fbp'] = sanitize_text_field( wp_unslash( $_COOKIE['_fbp'] ) );
	}
	if ( ! empty( $_COOKIE['_fbc'] ) ) {
		$user['fbc'] = sanitize_text_field( wp_unslash( $_COOKIE['_fbc'] ) );
	}
	$ip = sh_client_ip();
	if ( $ip ) {
		$user['client_ip_address'] = $ip;
	}
	if ( ! empty( $_SERVER['HTTP_USER_AGENT'] ) ) {
		$user['client_user_agent'] = sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) );
	}

	$event = array(
		'event_name'    => $o['event_name'],
		'event_time'    => time(),
		'event_id'      => $o['event_id'],
		'action_source' => 'website',
		'user_data'     => (object) $user,
	);
	if ( ! empty( $o['source_url'] ) ) {
		$event['event_source_url'] = $o['source_url'];
	}
	if ( ! empty( $o['custom'] ) ) {
		$event['custom_data'] = $o['custom'];
	}
	$body = array( 'data' => array( $event ) );
	if ( '' !== $cfg['meta_test_event_code'] ) {
		$body['test_event_code'] = $cfg['meta_test_event_code'];
	}
	$res = wp_remote_post(
		'https://graph.facebook.com/v21.0/' . rawurlencode( $cfg['meta_pixel_id'] ) . '/events?access_token=' . rawurlencode( $cfg['meta_capi_token'] ),
		array( 'timeout' => 8, 'headers' => array( 'Content-Type' => 'application/json' ), 'body' => wp_json_encode( $body ) )
	);
	if ( is_wp_error( $res ) || (int) wp_remote_retrieve_response_code( $res ) >= 400 ) {
		error_log( '[shilperhaat meta-capi] ' . $o['event_name'] . ' failed: ' . ( is_wp_error( $res ) ? $res->get_error_message() : wp_remote_retrieve_body( $res ) ) ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions
	}
}

/* ───────────────────────── Steadfast courier ───────────────────────── */

function sh_steadfast_request( $path, $method = 'GET', $body = null ) {
	$cfg = sh_integrations();
	if ( '' === $cfg['steadfast_api_key'] || '' === $cfg['steadfast_secret_key'] ) {
		return new WP_Error( 'sh_steadfast_missing', 'Steadfast API credentials not configured. Add them in Shilperhaat → Settings.' );
	}
	$args = array(
		'method'  => $method,
		'timeout' => 20,
		'headers' => array(
			'Api-Key'      => $cfg['steadfast_api_key'],
			'Secret-Key'   => $cfg['steadfast_secret_key'],
			'Content-Type' => 'application/json',
			'Accept'       => 'application/json',
		),
	);
	if ( null !== $body ) {
		$args['body'] = wp_json_encode( $body );
	}
	$res = wp_remote_request( 'https://portal.packzy.com/api/v1' . $path, $args );
	if ( is_wp_error( $res ) ) {
		return new WP_Error( 'sh_steadfast_net', 'Could not reach Steadfast API: ' . $res->get_error_message() );
	}
	$code = (int) wp_remote_retrieve_response_code( $res );
	$text = wp_remote_retrieve_body( $res );
	$json = json_decode( $text, true );
	if ( $code < 200 || $code >= 300 ) {
		$msg = '';
		if ( is_array( $json ) ) {
			$msg = isset( $json['message'] ) ? $json['message'] : ( isset( $json['error'] ) ? $json['error'] : '' );
			if ( ! $msg && ! empty( $json['errors'] ) ) {
				$flat = array();
				array_walk_recursive( $json['errors'], static function ( $v ) use ( &$flat ) {
					$flat[] = $v;
				} );
				$msg = implode( ' ', $flat );
			}
		}
		if ( ! $msg ) {
			$msg = $text ? mb_substr( $text, 0, 200 ) : 'Steadfast returned HTTP ' . $code;
		}
		return new WP_Error( 'sh_steadfast_http', $msg, array( 'status' => $code ) );
	}
	if ( ! is_array( $json ) ) {
		return new WP_Error( 'sh_steadfast_bad', 'Steadfast returned an unexpected response. Please try again.' );
	}
	return $json;
}

function sh_steadfast_phone( $raw ) {
	$p = preg_replace( '/[^\d]/', '', (string) $raw );
	if ( 0 === strpos( $p, '88' ) && 13 === strlen( $p ) ) {
		$p = substr( $p, 2 );
	}
	return $p;
}

/** Creates a consignment for an order row. @return array|WP_Error {consignmentId, trackingCode, status} */
function sh_steadfast_create_order( $order ) {
	$res = sh_steadfast_request( '/create_order', 'POST', array(
		'invoice'           => $order->order_number,
		'recipient_name'    => $order->customer_name,
		'recipient_phone'   => sh_steadfast_phone( $order->phone ),
		'recipient_address' => $order->address,
		'cod_amount'        => (float) $order->total,
		'note'              => (string) $order->notes,
	) );
	if ( is_wp_error( $res ) ) {
		return $res;
	}
	$c = isset( $res['consignment'] ) ? $res['consignment'] : array();
	return array(
		'consignmentId' => isset( $c['consignment_id'] ) ? $c['consignment_id'] : ( isset( $c['id'] ) ? $c['id'] : ( isset( $res['consignment_id'] ) ? $res['consignment_id'] : '' ) ),
		'trackingCode'  => isset( $c['tracking_code'] ) ? $c['tracking_code'] : ( isset( $res['tracking_code'] ) ? $res['tracking_code'] : '' ),
		'status'        => isset( $res['status'] ) ? $res['status'] : '',
	);
}

function sh_steadfast_balance() {
	$res = sh_steadfast_request( '/get_balance' );
	return is_wp_error( $res ) ? $res : ( isset( $res['current_balance'] ) ? $res['current_balance'] : 0 );
}

/* ───────────────────────── Meta Pixel snippet ───────────────────────── */

add_action( 'wp_head', function () {
	if ( is_admin() ) {
		return;
	}
	$id = sh_integrations()['meta_pixel_id'];
	if ( '' === $id || ! preg_match( '/^[0-9]{5,20}$/', $id ) ) {
		return;
	}
	?>
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '<?php echo esc_js( $id ); ?>');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none" alt="" src="<?php echo esc_url( 'https://www.facebook.com/tr?id=' . rawurlencode( $id ) . '&ev=PageView&noscript=1' ); ?>"></noscript>
	<?php
}, 4 );
