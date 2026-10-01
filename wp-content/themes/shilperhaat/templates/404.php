<?php
/**
 * Not found (mirrors the Next.js default 404 the original site shows).
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
status_header( 404 );
get_header();
?>
<div style="min-height:60vh;display:flex;align-items:center;justify-content:center;text-align:center;font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#fff;color:#000">
	<div>
		<h1 style="display:inline-block;margin:0 20px 0 0;padding:0 23px 0 0;font-size:24px;font-weight:500;vertical-align:top;line-height:49px;border-right:1px solid rgba(0,0,0,.3);color:#000">404</h1>
		<div style="display:inline-block"><h2 style="font-size:14px;font-weight:400;line-height:49px;margin:0;color:#000">This page could not be found.</h2></div>
	</div>
</div>
<?php
get_footer();
