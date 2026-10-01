<?php
defined( 'ABSPATH' ) || exit;

/**
 * Meta (Facebook) Pixel snippet + server-side Conversions API (port of lib/meta-capi.ts).
 * Pixel id / token come from env vars META_PIXEL_ID / META_CAPI_ACCESS_TOKEN / META_TEST_EVENT_CODE
 * (Coolify) or from the Settings page of the admin panel.
 */
class SH_Meta {

	const GRAPH_VERSION = 'v21.0';

	public static function pixel_id(): string {
		return sh_secret( 'META_PIXEL_ID', 'metaPixelId' );
	}

	public static function pixel_snippet(): void {
		$id = self::pixel_id();
		if ( '' === $id || ! preg_match( '/^[0-9]+$/', $id ) ) {
			return;
		}
		echo "<script id=\"meta-pixel\">!function(f,b,e,v,n,t,s)\n{if(f.fbq)return;n=f.fbq=function(){n.callMethod?\nn.callMethod.apply(n,arguments):n.queue.push(arguments)};\nif(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';\nn.queue=[];t=b.createElement(e);t.async=!0;\nt.src=v;s=b.getElementsByTagName(e)[0];\ns.parentNode.insertBefore(t,s)}(window, document,'script',\n'https://connect.facebook.net/en_US/fbevents.js');\nfbq('init', '" . esc_js( $id ) . "');\nfbq('track', 'PageView');</script>\n";
		echo '<noscript><img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=' . esc_attr( $id ) . '&amp;ev=PageView&amp;noscript=1"/></noscript>' . "\n";
	}

	private static function normalize_phone( string $raw ): string {
		$d = preg_replace( '/\D/', '', $raw );
		if ( str_starts_with( $d, '880' ) ) {
			return $d;
		}
		if ( str_starts_with( $d, '0' ) ) {
			return '880' . substr( $d, 1 );
		}
		if ( str_starts_with( $d, '1' ) && 10 === strlen( $d ) ) {
			return '880' . $d;
		}
		return $d;
	}

	/** @param array $o eventName, eventId, eventSourceUrl, userData[], customData[] */
	public static function send_event( array $o ): void {
		$pixel = self::pixel_id();
		$token = sh_secret( 'META_CAPI_ACCESS_TOKEN', 'metaCapiToken' );
		if ( '' === $pixel || '' === $token ) {
			return; // CAPI not configured — silent no-op.
		}
		$u  = $o['userData'] ?? [];
		$ud = [];
		if ( ! empty( $u['phone'] ) ) {
			$ud['ph'] = hash( 'sha256', self::normalize_phone( $u['phone'] ) );
		}
		if ( ! empty( $u['firstName'] ) ) {
			$ud['fn'] = hash( 'sha256', strtolower( trim( $u['firstName'] ) ) );
		}
		foreach ( [ 'fbp' => 'fbp', 'fbc' => 'fbc', 'clientIp' => 'client_ip_address', 'userAgent' => 'client_user_agent' ] as $k => $mk ) {
			if ( ! empty( $u[ $k ] ) ) {
				$ud[ $mk ] = $u[ $k ];
			}
		}
		$ev = [
			'event_name'    => $o['eventName'],
			'event_time'    => time(),
			'event_id'      => $o['eventId'],
			'action_source' => $o['actionSource'] ?? 'website',
			'user_data'     => (object) $ud,
		];
		if ( ! empty( $o['eventSourceUrl'] ) ) {
			$ev['event_source_url'] = $o['eventSourceUrl'];
		}
		if ( ! empty( $o['customData'] ) ) {
			$ev['custom_data'] = $o['customData'];
		}
		$body = [ 'data' => [ $ev ] ];
		$test = sh_secret( 'META_TEST_EVENT_CODE', 'metaTestEventCode' );
		if ( '' !== $test ) {
			$body['test_event_code'] = $test;
		}
		$res = wp_remote_post( 'https://graph.facebook.com/' . self::GRAPH_VERSION . '/' . rawurlencode( $pixel ) . '/events?access_token=' . rawurlencode( $token ), [
			'timeout' => 8,
			'headers' => [ 'Content-Type' => 'application/json' ],
			'body'    => wp_json_encode( $body ),
		] );
		if ( is_wp_error( $res ) || wp_remote_retrieve_response_code( $res ) >= 300 ) {
			error_log( '[shilperhaat meta-capi] ' . $o['eventName'] . ' failed: ' . ( is_wp_error( $res ) ? $res->get_error_message() : wp_remote_retrieve_body( $res ) ) ); // phpcs:ignore
		}
	}

	public static function user_data_from_request( array $extra = [] ): array {
		return array_merge( [
			'fbp'       => isset( $_COOKIE['_fbp'] ) ? sanitize_text_field( wp_unslash( $_COOKIE['_fbp'] ) ) : null,
			'fbc'       => isset( $_COOKIE['_fbc'] ) ? sanitize_text_field( wp_unslash( $_COOKIE['_fbc'] ) ) : null,
			'clientIp'  => sh_client_ip(),
			'userAgent' => isset( $_SERVER['HTTP_USER_AGENT'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) ) : null,
		], $extra );
	}
}
