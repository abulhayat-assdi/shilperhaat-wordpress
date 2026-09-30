<?php
/** Not found (mirrors Next's default 404 body, rendered inside the storefront layout). */
defined( 'ABSPATH' ) || exit;
status_header( 404 );
get_header();
?>
<div style="font-family:system-ui,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;height:60vh;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#000;background:#fff">
	<div>
		<h1 style="display:inline-block;margin:0 20px 0 0;padding:0 23px 0 0;font-size:24px;font-weight:500;vertical-align:top;line-height:49px;border-right:1px solid rgba(0,0,0,.3)">404</h1>
		<div style="display:inline-block"><h2 style="font-size:14px;font-weight:400;line-height:49px;margin:0">This page could not be found.</h2></div>
	</div>
</div>
<?php
get_footer();
