<?php
/**
 * Blog index. Mirrors app/(public)/blog/page.tsx (category filter handled by theme.js).
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
$posts      = sh_blog_posts();
$categories = array_values( array_unique( wp_list_pluck( $posts, 'category' ) ) );
$GLOBALS['sh_head'] = array( 'title' => 'Blog', 'canonical' => home_url( '/blog' ) );
$fmt = static function ( $d ) {
	return gmdate( 'M j, Y', strtotime( $d ) );
};
get_header();
?>
<div class="min-h-screen bg-gray-50">
	<div class="relative overflow-hidden py-16 px-4" style="background:linear-gradient(135deg, #800000 0%, #5C0000 50%, #1a0808 100%)">
		<div class="absolute inset-0 opacity-10">
			<div class="absolute top-0 right-0 w-72 h-72 rounded-full bg-white translate-x-1/3 -translate-y-1/3"></div>
			<div class="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white -translate-x-1/3 translate-y-1/3"></div>
		</div>
		<div class="relative max-w-4xl mx-auto text-center">
			<p class="text-[#f5d0d0] text-sm font-semibold uppercase tracking-widest mb-3">শিল্পেরহাট ব্লগ</p>
			<h1 class="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">বাংলার হস্তশিল্পের গল্প</h1>
			<p class="text-[#fce8e8] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">আমাদের কারিগরদের গল্প, টেক্সটাইলের ইতিহাস এবং হস্তশিল্পের যত্নের টিপস—সবই এখানে।</p>
		</div>
	</div>

	<div class="max-w-6xl mx-auto px-4 py-10" data-sh-blog>
		<?php if ( count( $categories ) > 0 ) : ?>
			<div class="flex flex-wrap gap-2 mb-8" data-sh-blog-filters>
				<?php foreach ( array_merge( array( 'All' ), $categories ) as $i => $cat ) : ?>
					<button type="button" data-cat="<?php echo esc_attr( $cat ); ?>" class="sh-blog-cat px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 <?php echo 0 === $i ? 'text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#800000] hover:text-[#800000]'; ?>" style="<?php echo 0 === $i ? 'background-color:#800000' : ''; ?>"><?php echo esc_html( $cat ); ?></button>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-sh-blog-grid <?php echo $posts ? '' : 'hidden'; ?>>
			<?php foreach ( $posts as $post ) : ?>
				<a data-cat="<?php echo esc_attr( $post->category ); ?>" href="<?php echo esc_url( home_url( '/blog/' . $post->slug ) ); ?>" class="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col">
					<div class="overflow-hidden" style="aspect-ratio:16/9">
						<img src="<?php echo esc_url( sh_media_url( $post->cover_image ) ); ?>" alt="<?php echo esc_attr( $post->title ); ?>" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
					</div>
					<div class="flex flex-col flex-1 p-5">
						<span class="self-start text-xs font-semibold px-3 py-1 rounded-full text-white mb-3" style="background-color:#800000"><?php echo esc_html( $post->category ); ?></span>
						<h2 class="font-bold text-gray-900 text-base leading-snug mb-2" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden"><?php echo esc_html( $post->title ); ?></h2>
						<p class="text-gray-500 text-sm leading-relaxed mb-4 flex-1" style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden"><?php echo esc_html( $post->excerpt ); ?></p>
						<div class="flex items-center gap-2 pt-3 border-t border-gray-100">
							<span class="inline-flex items-center justify-center w-7 h-7 rounded-full text-white font-bold text-xs flex-shrink-0" style="background-color:#800000"><?php echo esc_html( mb_substr( $post->author, 0, 1 ) ); ?></span>
							<span class="text-xs text-gray-600 font-medium truncate flex-1"><?php echo esc_html( $post->author ); ?></span>
							<span class="text-xs text-gray-400 flex-shrink-0"><?php echo esc_html( $fmt( $post->published_at ) ); ?></span>
							<span class="text-xs text-gray-400 flex-shrink-0">· <?php echo (int) $post->read_time; ?> min read</span>
						</div>
					</div>
				</a>
			<?php endforeach; ?>
		</div>

		<div data-sh-blog-empty <?php echo $posts ? 'hidden' : ''; ?> class="flex flex-col items-center justify-center py-24 text-gray-400">
			<div class="text-6xl mb-4">📝</div>
			<p class="text-xl font-semibold text-gray-600">কোনো পোস্ট পাওয়া যায়নি</p>
			<p class="text-sm mt-2">এই ক্যাটাগরিতে এখনও কোনো পোস্ট প্রকাশিত হয়নি।</p>
			<button type="button" data-sh-blog-all hidden class="mt-4 px-5 py-2 rounded-full text-sm font-semibold text-white" style="background-color:#800000">সব পোস্ট দেখুন</button>
		</div>
	</div>
</div>
<?php
get_footer();
