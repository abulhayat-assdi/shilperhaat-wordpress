<?php
/**
 * Placeholder for routes whose template is built in a later step.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
get_header();
?>
<div class="container-wrapper" style="padding-top:64px;padding-bottom:64px;text-align:center">
	<h1 style="font-size:24px;font-weight:700"><?php echo esc_html( ucwords( str_replace( '-', ' ', $GLOBALS['sh_route']['template'] ) ) ); ?></h1>
	<p style="margin-top:8px">এই পেজ পরবর্তী ধাপে যোগ হবে।</p>
</div>
<?php
get_footer();
