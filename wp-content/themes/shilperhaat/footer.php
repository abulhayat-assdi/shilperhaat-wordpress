<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
if ( ! function_exists( 'sh_layout' ) ) {
	return;
}
?>
	</main>
	<?php get_template_part( 'template-parts/site-footer' ); ?>
	<?php get_template_part( 'template-parts/bottom-nav' ); ?>
	<?php get_template_part( 'template-parts/floating-contact' ); ?>
</div>
<?php wp_footer(); ?>
</body>
</html>
