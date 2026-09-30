<?php
defined( 'ABSPATH' ) || exit;

/**
 * Steadfast courier integration (port of app/api/courier/steadfast/route.ts).
 * Credentials live server-side: env vars STEADFAST_API_KEY / STEADFAST_SECRET_KEY or the Settings page.
 */
class SH_Courier {

	const BASE = 'https://portal.packzy.com/api/v1';

	public static function key(): string {
		return trim( sh_secret( 'STEADFAST_API_KEY', 'steadfastApiKey' ) );
	}

	public static function secret(): string {
		return trim( sh_secret( 'STEADFAST_SECRET_KEY', 'steadfastSecretKey' ) );
	}

	private static function request( string $method, string $path, string $key, string $secret, ?array $body = null ): array {
		$res = wp_remote_request( self::BASE . $path, [
			'method'  => $method,
			'timeout' => 20,
			'headers' => [ 'Api-Key' => $key, 'Secret-Key' => $secret, 'Content-Type' => 'application/json', 'Accept' => 'application/json' ],
			'body'    => null === $body ? null : wp_json_encode( $body ),
		] );
		if ( is_wp_error( $res ) ) {
			return [ 'status' => 0, 'ok' => false, 'json' => null, 'text' => '', 'error' => $res->get_error_message() ];
		}
		$status = (int) wp_remote_retrieve_response_code( $res );
		$text   = (string) wp_remote_retrieve_body( $res );
		return [ 'status' => $status, 'ok' => $status >= 200 && $status < 300, 'json' => json_decode( $text, true ), 'text' => $text ];
	}

	public static function handle( WP_REST_Request $r ) {
		$err = static fn( string $m, int $s ) => new WP_REST_Response( [ 'error' => $m ], $s );

		if ( 'GET' === $r->get_method() ) { // connectivity test
			$key    = self::key() ?: trim( (string) $r->get_param( 'apiKey' ) );
			$secret = self::secret() ?: trim( (string) $r->get_param( 'secretKey' ) );
			// Credentials typed in the form (not yet saved) win over stored ones for the test.
			if ( $r->get_param( 'apiKey' ) ) {
				$key = trim( (string) $r->get_param( 'apiKey' ) );
			}
			if ( $r->get_param( 'secretKey' ) ) {
				$secret = trim( (string) $r->get_param( 'secretKey' ) );
			}
			if ( '' === $key || '' === $secret ) {
				return $err( 'API credentials not provided', 400 );
			}
			$res = self::request( 'GET', '/get_balance', $key, $secret );
			if ( ! empty( $res['error'] ) ) {
				return $err( 'Could not reach Steadfast API: ' . $res['error'], 502 );
			}
			if ( ! $res['ok'] || ! $res['json'] ) {
				return $err( $res['json']['message'] ?? mb_substr( $res['text'], 0, 200 ) ?: 'Invalid credentials', $res['status'] ?: 401 );
			}
			return new WP_REST_Response( [ 'success' => true, 'balance' => $res['json']['current_balance'] ?? null ] );
		}

		$b = $r->get_json_params();
		if ( ! is_array( $b ) ) {
			return $err( 'Invalid request body', 400 );
		}
		$key    = self::key();
		$secret = self::secret();
		if ( '' === $key || '' === $secret ) {
			return $err( 'Steadfast API credentials not configured. Add them in Settings (or set STEADFAST_API_KEY and STEADFAST_SECRET_KEY in the server environment).', 400 );
		}
		$phone = preg_replace( '/[^\d]/', '', (string) ( $b['customerPhone'] ?? '' ) );
		if ( str_starts_with( $phone, '88' ) && 13 === strlen( $phone ) ) {
			$phone = substr( $phone, 2 );
		}
		$res = self::request( 'POST', '/create_order', $key, $secret, [
			'invoice'           => (string) ( $b['orderId'] ?? '' ),
			'recipient_name'    => (string) ( $b['customerName'] ?? '' ),
			'recipient_phone'   => $phone,
			'recipient_address' => (string) ( $b['address'] ?? '' ),
			'cod_amount'        => (float) ( $b['total'] ?? 0 ),
			'note'              => (string) ( $b['specialNotes'] ?? '' ),
		] );
		if ( ! empty( $res['error'] ) ) {
			return $err( 'Could not reach Steadfast API: ' . $res['error'], 502 );
		}
		if ( ! $res['ok'] ) {
			$msg = $res['json']['message'] ?? $res['json']['error'] ?? '';
			if ( ! $msg && ! empty( $res['json']['errors'] ) ) {
				$flat = [];
				array_walk_recursive( $res['json']['errors'], static function ( $v ) use ( &$flat ) { $flat[] = $v; } );
				$msg = implode( ' ', $flat );
			}
			return $err( $msg ?: ( mb_substr( $res['text'], 0, 200 ) ?: 'Steadfast returned HTTP ' . $res['status'] ), $res['status'] ?: 502 );
		}
		if ( ! $res['json'] ) {
			return $err( 'Steadfast returned an unexpected response. Please try again.', 502 );
		}
		$j = $res['json'];
		return new WP_REST_Response( [
			'success'       => true,
			'consignmentId' => $j['consignment']['consignment_id'] ?? $j['consignment']['id'] ?? $j['consignment_id'] ?? null,
			'trackingCode'  => $j['consignment']['tracking_code'] ?? $j['tracking_code'] ?? null,
			'status'        => $j['status'] ?? null,
		] );
	}
}
