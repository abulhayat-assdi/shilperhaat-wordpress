<?php
/**
 * Importer for the PostgreSQL seed dump (pg_dump COPY blocks) of the original Next.js site.
 * Idempotent (REPLACE INTO). Customer data (orders) is never required; empty tables are skipped.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** "imageUrl" -> "image_url" */
function sh_import_snake( $col ) {
	return strtolower( preg_replace( '/(?<!^)([A-Z])/', '_$1', trim( $col, '"' ) ) );
}

function sh_import_unescape( $v ) {
	if ( '\N' === $v ) {
		return null;
	}
	return preg_replace_callback(
		'/\\\\(.)/s',
		static function ( $m ) {
			$map = array( 'n' => "\n", 't' => "\t", 'r' => "\r", 'b' => "\x08", 'f' => "\x0c", 'v' => "\x0b", '\\' => '\\' );
			return isset( $map[ $m[1] ] ) ? $map[ $m[1] ] : $m[1];
		},
		$v
	);
}

/** Postgres text[] literal -> PHP array. */
function sh_import_pg_array( $v ) {
	$v = trim( (string) $v );
	if ( '' === $v || '{}' === $v ) {
		return array();
	}
	$v   = substr( $v, 1, -1 );
	$out = array();
	if ( preg_match_all( '/"((?:[^"\\\\]|\\\\.)*)"|([^,]+)/', $v, $m, PREG_SET_ORDER ) ) {
		foreach ( $m as $x ) {
			$out[] = isset( $x[2] ) && '' !== $x[2] ? $x[2] : stripcslashes( $x[1] );
		}
	}
	return $out;
}

/** @return array<string,array{cols:string[],rows:array[]}> table => parsed COPY block */
function sh_import_parse_dump( $sql ) {
	$tables = array();
	if ( ! preg_match_all( '/^COPY public\.(\w+) \((.*?)\) FROM stdin;\n(.*?)^\\\\\.$/ms', $sql, $blocks, PREG_SET_ORDER ) ) {
		return $tables;
	}
	foreach ( $blocks as $b ) {
		$cols = array_map( 'sh_import_snake', array_map( 'trim', explode( ',', $b[2] ) ) );
		$rows = array();
		foreach ( explode( "\n", rtrim( $b[3], "\n" ) ) as $line ) {
			if ( '' === $line ) {
				continue;
			}
			$vals = array_map( 'sh_import_unescape', explode( "\t", $line ) );
			if ( count( $vals ) !== count( $cols ) ) {
				continue;
			}
			$rows[] = array_combine( $cols, $vals );
		}
		$tables[ $b[1] ] = array( 'cols' => $cols, 'rows' => $rows );
	}
	return $tables;
}

function sh_import_value( $col, $val ) {
	if ( null === $val ) {
		return null;
	}
	if ( 0 === strpos( $col, 'is_' ) ) {
		return 't' === $val ? 1 : 0;
	}
	if ( 'tags' === $col ) {
		return wp_json_encode( sh_import_pg_array( $val ), JSON_UNESCAPED_UNICODE );
	}
	if ( preg_match( '/(_at|^published_at)$/', $col ) ) {
		return substr( $val, 0, 19 );
	}
	return $val;
}

/**
 * @param string $file Path to shilperhaat_seed.sql
 * @return array<string,int|string> table => rows imported
 */
function sh_import_seed( $file ) {
	global $wpdb;
	$sql = file_get_contents( $file );
	if ( false === $sql ) {
		return array( 'error' => 'Cannot read ' . $file );
	}
	sh_cms_install_schema();
	$tables = sh_import_parse_dump( $sql );
	$report = array();

	$map = array(
		'categories'     => 'categories',
		'products'       => 'products',
		'product_images' => 'product_images',
		'reviews'        => 'reviews',
		'banners'        => 'banners',
		'coupons'        => 'coupons',
		'pages'          => 'pages',
		'blog_posts'     => 'blog_posts',
	);
	foreach ( $map as $src => $dst ) {
		if ( empty( $tables[ $src ]['rows'] ) ) {
			$report[ $dst ] = 0;
			continue;
		}
		$known = $wpdb->get_col( 'SHOW COLUMNS FROM ' . sh_table( $dst ), 0 ); // phpcs:ignore WordPress.DB
		$n     = 0;
		foreach ( $tables[ $src ]['rows'] as $row ) {
			$data = array();
			foreach ( $row as $col => $val ) {
				if ( in_array( $col, $known, true ) ) {
					$data[ $col ] = sh_import_value( $col, $val );
				}
			}
			if ( $wpdb->replace( sh_table( $dst ), $data ) ) {
				++$n;
			}
		}
		$report[ $dst ] = $n;
	}

	// site_content (site-layout / contact-widget) and site_settings -> options.
	foreach ( $tables['site_content']['rows'] ?? array() as $row ) {
		$opt = array( 'site-layout' => 'sh_site_layout', 'contact-widget' => 'sh_contact_widget' );
		if ( isset( $opt[ $row['key'] ] ) ) {
			update_option( $opt[ $row['key'] ], json_decode( $row['value'], true ), false );
			$report[ $opt[ $row['key'] ] ] = 1;
		}
	}
	if ( ! empty( $tables['site_settings']['rows'][0] ) ) {
		$s = $tables['site_settings']['rows'][0];
		update_option( 'sh_site_settings', array(
			'siteName'        => $s['site_name'],
			'logoUrl'         => $s['logo_url'],
			'faviconUrl'      => $s['favicon_url'],
			'footerCopyright' => $s['footer_copyright'],
			'whatsappNumber'  => $s['whatsapp_number'],
			'socialLinks'     => json_decode( (string) $s['social_links'], true ),
			'deliveryCharge'  => (float) $s['delivery_charge'],
			'freeDeliveryMin' => null === $s['free_delivery_min'] ? null : (float) $s['free_delivery_min'],
		), false );
		$report['sh_site_settings'] = 1;
	}
	wp_cache_flush();
	return $report;
}

/** Copies the original uploads folder into wp-content/uploads/shilperhaat (keeps sub-folders). */
function sh_import_uploads( $source_dir ) {
	$up   = wp_get_upload_dir();
	$dest = trailingslashit( $up['basedir'] ) . 'shilperhaat';
	if ( ! is_dir( $source_dir ) ) {
		return 0;
	}
	wp_mkdir_p( $dest );
	$count = 0;
	$it    = new RecursiveIteratorIterator( new RecursiveDirectoryIterator( $source_dir, FilesystemIterator::SKIP_DOTS ), RecursiveIteratorIterator::SELF_FIRST );
	foreach ( $it as $item ) {
		$rel = substr( $item->getPathname(), strlen( rtrim( $source_dir, '/' ) ) + 1 );
		$to  = $dest . '/' . $rel;
		if ( $item->isDir() ) {
			wp_mkdir_p( $to );
		} elseif ( ! file_exists( $to ) || filesize( $to ) !== $item->getSize() ) {
			copy( $item->getPathname(), $to );
			++$count;
		}
	}
	return $count;
}

if ( defined( 'WP_CLI' ) && WP_CLI ) {
	/**
	 * Imports the original site's seed data.
	 *
	 * ## OPTIONS
	 * [--file=<path>]    pg_dump seed file (default data/seed/shilperhaat_seed.sql next to the plugin repo)
	 * [--uploads=<dir>]  folder with the original /uploads content (banners, products ...)
	 */
	WP_CLI::add_command( 'shilperhaat import-seed', function ( $args, $assoc ) {
		$file = $assoc['file'] ?? '';
		if ( ! $file || ! file_exists( $file ) ) {
			WP_CLI::error( 'Provide --file=/path/to/shilperhaat_seed.sql' );
		}
		foreach ( sh_import_seed( $file ) as $k => $v ) {
			WP_CLI::log( sprintf( '%-20s %s', $k, $v ) );
		}
		if ( ! empty( $assoc['uploads'] ) ) {
			WP_CLI::log( 'uploads copied: ' . sh_import_uploads( $assoc['uploads'] ) );
		}
		WP_CLI::success( 'Import finished.' );
	} );
}
