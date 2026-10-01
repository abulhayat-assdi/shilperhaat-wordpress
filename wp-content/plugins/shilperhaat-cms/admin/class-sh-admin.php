<?php
defined( 'ABSPATH' ) || exit;

require_once __DIR__ . '/class-sh-admin-rest.php';

/**
 * Admin panel shell + authentication.
 *
 * The UI is the original Next.js admin (components bundled into admin/assets/admin.js); this class serves the
 * HTML shell at /admin/* and decides who may use which page. Identity model:
 *   super_admin = WordPress administrator (all pages + Access Management)
 *   admin       = WordPress "Shilperhaat Staff" user with a per-page allow-list (user meta sh_page_access)
 */
class SH_Admin {

	public static function init(): void {
		SH_Admin_Rest::init();
	}

	/** The logged-in panel user, or null. */
	public static function user(): ?array {
		$u = wp_get_current_user();
		if ( ! $u || ! $u->exists() ) {
			return null;
		}
		$super = user_can( $u, 'manage_options' );
		if ( ! $super && ! in_array( 'sh_staff', (array) $u->roles, true ) ) {
			return null;
		}
		$pages = $super ? array_keys( SH_Install::ADMIN_PAGES ) : array_values( array_intersect( (array) get_user_meta( $u->ID, 'sh_page_access', true ), array_keys( SH_Install::ADMIN_PAGES ) ) );
		return [
			'id'           => (string) $u->ID,
			'name'         => $u->display_name ?: $u->user_login,
			'email'        => $u->user_email,
			'role'         => $super ? 'super_admin' : 'admin',
			'allowedPages' => $pages,
		];
	}

	public static function is_super(): bool {
		$u = self::user();
		return $u && 'super_admin' === $u['role'];
	}

	/** Can the current user use the given page key (dashboard is open to every panel user)? */
	public static function can( string $pageKey ): bool {
		$u = self::user();
		if ( ! $u ) {
			return false;
		}
		if ( 'super_admin' === $u['role'] || 'dashboard' === $pageKey ) {
			return true;
		}
		return in_array( $pageKey, $u['allowedPages'], true );
	}

	public static function render( string $sub ): void {
		$user = self::user();
		nocache_headers();
		if ( '' === $sub ) {
			wp_safe_redirect( home_url( $user ? '/admin/dashboard' : '/admin/login' ) );
			exit;
		}
		if ( 'login' === $sub && $user ) {
			wp_safe_redirect( home_url( '/admin/dashboard' ) );
			exit;
		}
		if ( 'login' !== $sub && ! $user ) {
			wp_safe_redirect( home_url( '/admin/login' ) );
			exit;
		}
		$url = SH_CMS_URL . 'admin/assets/';
		$ver = static fn( $f ) => file_exists( SH_CMS_DIR . 'admin/assets/' . $f ) ? filemtime( SH_CMS_DIR . 'admin/assets/' . $f ) : SH_CMS_VERSION;
		$cfg = [
			'user'        => $user ? [ 'id' => $user['id'], 'name' => $user['name'], 'email' => $user['email'], 'role' => $user['role'] ] : null,
			'allowedPages' => $user ? $user['allowedPages'] : [],
			'restUrl'     => esc_url_raw( rest_url( SH_Rest::NS . '/' ) ),
			'nonce'       => wp_create_nonce( 'wp_rest' ),
			'uploadsBase' => sh_uploads_url(),
			'siteUrl'     => home_url( '/' ),
		];
		header( 'Content-Type: text/html; charset=utf-8' );
		header( 'X-Robots-Tag: noindex' );
		?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Admin — Shilperhaat</title>
<link rel="icon" href="<?php echo esc_url( home_url( '/favicon.ico' ) ); ?>">
<link rel="stylesheet" href="<?php echo esc_url( $url . 'admin.css?v=' . $ver( 'admin.css' ) ); ?>">
</head>
<body>
<div id="sh-admin-root"></div>
<script>window.SH_ADMIN=<?php echo wp_json_encode( $cfg, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ); ?>;</script>
<script src="<?php echo esc_url( $url . 'admin.js?v=' . $ver( 'admin.js' ) ); ?>" defer></script>
</body>
</html>
		<?php
		exit;
	}
}
