<?php
/**
 * Blog post. Mirrors app/(public)/blog/[slug]/page.tsx.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
$post = sh_get_blog_post( sh_route_param( 'slug' ) );
if ( ! $post ) {
	sh_not_found();
}
$image = $post->cover_image ? sh_media_url( $post->cover_image ) : '';
$url   = home_url( '/blog/' . $post->slug );
$desc  = $post->excerpt ? mb_substr( $post->excerpt, 0, 160 ) : $post->title;

$article = array(
	'@context'         => 'https://schema.org',
	'@type'            => 'BlogPosting',
	'headline'         => $post->title,
	'datePublished'    => gmdate( 'c', strtotime( $post->published_at ) ),
	'dateModified'     => gmdate( 'c', strtotime( $post->updated_at ) ),
	'publisher'        => array( '@type' => 'Organization', 'name' => 'Shilperhaat' ),
	'mainEntityOfPage' => array( '@type' => 'WebPage', '@id' => $url ),
	'keywords'         => implode( ', ', $post->tags ),
);
if ( $post->excerpt ) {
	$article['description'] = $post->excerpt;
}
if ( $image ) {
	$article['image'] = array( $image );
}
if ( $post->author ) {
	$article['author'] = array( '@type' => 'Person', 'name' => $post->author );
}
$breadcrumb = array(
	'@context'        => 'https://schema.org',
	'@type'           => 'BreadcrumbList',
	'itemListElement' => array(
		array( '@type' => 'ListItem', 'position' => 1, 'name' => 'Home', 'item' => home_url( '/' ) ),
		array( '@type' => 'ListItem', 'position' => 2, 'name' => 'Blog', 'item' => home_url( '/blog' ) ),
		array( '@type' => 'ListItem', 'position' => 3, 'name' => $post->title, 'item' => $url ),
	),
);
$GLOBALS['sh_head'] = array(
	'title'       => $post->title,
	'description' => $desc,
	'canonical'   => $url,
	'og_title'    => $post->title,
	'og_image'    => $image,
	'jsonld'      => array( $article, $breadcrumb ),
);
get_header();
?>
<div class="min-h-screen bg-gray-50">
	<div class="bg-white border-b border-gray-100">
		<div class="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="hover:text-[#800000] transition-colors">Home</a>
			<span>/</span>
			<a href="<?php echo esc_url( home_url( '/blog' ) ); ?>" class="hover:text-[#800000] transition-colors">Blog</a>
			<span>/</span>
			<span class="text-gray-800 font-medium truncate max-w-xs"><?php echo esc_html( $post->title ); ?></span>
		</div>
	</div>

	<?php if ( $image ) : ?>
		<div class="w-full overflow-hidden" style="max-height:480px"><img src="<?php echo esc_url( $image ); ?>" alt="<?php echo esc_attr( $post->title ); ?>" class="w-full object-cover" style="max-height:480px"></div>
	<?php endif; ?>

	<div class="max-w-4xl mx-auto px-4 py-10">
		<article class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
			<?php if ( $post->category ) : ?><span class="inline-block text-xs font-semibold px-3 py-1 rounded-full text-white mb-4" style="background-color:#800000"><?php echo esc_html( $post->category ); ?></span><?php endif; ?>
			<h1 class="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-5"><?php echo esc_html( $post->title ); ?></h1>

			<div class="flex flex-wrap items-center gap-3 pb-6 border-b border-gray-100 mb-8">
				<?php if ( $post->author ) : ?>
					<span class="inline-flex items-center justify-center w-9 h-9 rounded-full text-white font-bold text-sm flex-shrink-0" style="background-color:#800000"><?php echo esc_html( mb_substr( $post->author, 0, 1 ) ); ?></span>
					<span class="text-sm font-semibold text-gray-700"><?php echo esc_html( $post->author ); ?></span>
					<span class="text-gray-300">|</span>
				<?php endif; ?>
				<span class="text-sm text-gray-500"><?php echo esc_html( gmdate( 'F j, Y', strtotime( $post->published_at ) ) ); ?></span>
				<span class="text-gray-300">|</span>
				<span class="text-sm text-gray-500"><?php echo (int) $post->read_time; ?> min read</span>
			</div>

			<?php if ( $post->tags ) : ?>
				<div class="flex flex-wrap gap-2 mb-6">
					<?php foreach ( $post->tags as $tag ) : ?><span class="text-xs px-3 py-1 rounded-full bg-[#FFF0F0] text-[#800000] border border-[#f5d0d0]">#<?php echo esc_html( $tag ); ?></span><?php endforeach; ?>
				</div>
			<?php endif; ?>

			<div class="blog-content text-gray-700 leading-relaxed"><?php echo wp_kses( $post->content, sh_allowed_html() ); ?></div>

			<div class="mt-10 pt-6 border-t border-gray-100">
				<a href="<?php echo esc_url( home_url( '/blog' ) ); ?>" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-semibold text-sm transition-all border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white">← Back to Blog</a>
			</div>
		</article>
	</div>
</div>
<?php
get_footer();
