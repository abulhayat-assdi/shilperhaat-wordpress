<?php
// Required by WordPress. All storefront routes are rendered by inc/router.php.
get_header();
echo '<div class="container-wrapper" style="padding-top:48px;padding-bottom:48px"><h1>' . esc_html( get_the_title() ) . '</h1></div>';
get_footer();
