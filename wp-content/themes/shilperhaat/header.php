<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?><!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="preload" href="<?php echo esc_url( SH_THEME_URI . '/assets/fonts/open-sans-latin-400-normal.woff2' ); ?>" as="font" type="font/woff2" crossorigin>
	<?php wp_head(); ?>
</head>
<body <?php body_class( 'antialiased overflow-x-hidden' ); ?>>
<?php wp_body_open(); ?>
<?php if ( ! function_exists( 'sh_layout' ) ) : ?>
	<p style="padding:24px;font-family:sans-serif">Shilperhaat CMS প্লাগিনটি অ্যাক্টিভ করুন।</p>
	</body></html>
	<?php return; ?>
<?php endif; ?>
<div class="flex flex-col min-h-screen" style="background-color:#FAF0E6">
	<?php get_template_part( 'template-parts/site-header' ); ?>
	<main class="flex-1 pb-16 md:pb-0" style="background-color:#FAF0E6">
