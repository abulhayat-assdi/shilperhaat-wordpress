<?php
// Dev-time: converts the pg_dump COPY blocks in data/seed/shilperhaat_seed.sql into the JSON the
// plugin importer reads (wp-content/plugins/shilperhaat-cms/data/seed.json).
// usage: php seed-to-json.php
$src = __DIR__ . '/../data/seed/shilperhaat_seed.sql';
$out = __DIR__ . '/../wp-content/plugins/shilperhaat-cms/data/seed.json';
$keep = [ 'categories', 'products', 'product_images', 'banners', 'blog_posts', 'pages', 'reviews', 'coupons', 'site_content', 'site_settings' ];

function unescape_pg( string $v ) {
	if ( '\N' === $v ) { return null; }
	return preg_replace_callback( '/\\\\(.)/s', function ( $m ) {
		return [ 'n' => "\n", 't' => "\t", 'r' => "\r", 'b' => "\x08", 'f' => "\f", 'v' => "\x0b" ][ $m[1] ] ?? $m[1];
	}, $v );
}
function parse_pg_array( ?string $v ): array {
	if ( null === $v || '{}' === $v ) { return []; }
	$v = substr( $v, 1, -1 );
	$out = []; $cur = ''; $q = false; $esc = false; $had = false;
	for ( $i = 0, $n = strlen( $v ); $i < $n; $i++ ) {
		$c = $v[ $i ];
		if ( $esc ) { $cur .= $c; $esc = false; continue; }
		if ( '\\' === $c ) { $esc = true; continue; }
		if ( '"' === $c ) { $q = ! $q; $had = true; continue; }
		if ( ',' === $c && ! $q ) { $out[] = $cur; $cur = ''; $had = false; continue; }
		$cur .= $c;
	}
	if ( '' !== $cur || $had ) { $out[] = $cur; }
	return $out;
}

$lines = file( $src, FILE_IGNORE_NEW_LINES );
$tables = []; $cur = null; $cols = [];
foreach ( $lines as $line ) {
	if ( null === $cur ) {
		if ( preg_match( '/^COPY public\.(\w+) \((.*)\) FROM stdin;$/', $line, $m ) ) {
			$cur = $m[1]; $cols = array_map( fn( $c ) => trim( $c, '" ' ), explode( ',', $m[2] ) ); $tables[ $cur ] = [];
		}
		continue;
	}
	if ( '\.' === $line ) { $cur = null; continue; }
	$vals = explode( "\t", $line );
	$row = [];
	foreach ( $cols as $i => $c ) { $row[ $c ] = unescape_pg( $vals[ $i ] ?? '\N' ); }
	$tables[ $cur ][] = $row;
}
$json = [];
foreach ( $keep as $t ) {
	$rows = $tables[ $t ] ?? [];
	foreach ( $rows as &$r ) {
		if ( 'products' === $t ) { $r['tags'] = parse_pg_array( $r['tags'] ); }
		if ( 'blog_posts' === $t ) { $r['tags'] = parse_pg_array( $r['tags'] ); }
		if ( 'pages' === $t ) { $r['sections'] = json_decode( $r['sections'], true ); }
		if ( 'site_content' === $t ) { $r['value'] = json_decode( $r['value'], true ); }
		if ( 'site_settings' === $t ) { $r['socialLinks'] = $r['socialLinks'] ? json_decode( $r['socialLinks'], true ) : null; }
	}
	unset( $r );
	$json[ $t ] = $rows;
}
unset( $json['blog_posts'] ); // blog feature was dropped
file_put_contents( $out, json_encode( $json, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT ) );
foreach ( $json as $t => $rows ) { echo $t, ': ', count( $rows ), "\n"; }
