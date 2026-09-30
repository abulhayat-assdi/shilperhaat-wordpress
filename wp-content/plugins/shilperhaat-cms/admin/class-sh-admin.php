<?php
defined( 'ABSPATH' ) || exit;

/** Admin panel (clone of the Next.js admin) — implemented in the admin phase. */
class SH_Admin {
	public static function init(): void {}
	public static function render( string $sub ): void {
		wp_die( 'Admin panel is not available yet.' );
	}
}
