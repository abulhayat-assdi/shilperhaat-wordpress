<?php
/** CMS page — mirrors components/layout/StaticPage.tsx (sections come from wp_sh_pages). */
defined( 'ABSPATH' ) || exit;
$page = SH_Router::data( 'page' );
get_header();
?>
<div class="min-h-screen bg-white">
	<div class="bg-gray-50 border-b border-gray-200 py-3">
		<div class="max-w-[1280px] mx-auto px-6">
			<nav class="text-sm text-gray-500 flex items-center gap-2">
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="hover:text-[#800000] transition-colors">Home</a>
				<span>›</span>
				<span class="text-gray-800 font-medium"><?php echo esc_html( $page['title'] ); ?></span>
			</nav>
		</div>
	</div>

	<div style="background:linear-gradient(135deg, #5C0000 0%, #800000 50%, #a00000 100%);padding:56px 0 52px;position:relative;overflow:hidden">
		<div style="position:absolute;top:-40px;right:-40px;width:200px;height:200px;border-radius:50%;background-color:rgba(255,255,255,0.05);pointer-events:none"></div>
		<div style="position:absolute;bottom:-60px;left:-30px;width:260px;height:260px;border-radius:50%;background-color:rgba(255,255,255,0.04);pointer-events:none"></div>
		<div class="max-w-[1280px] mx-auto px-6 text-center" style="position:relative;z-index:1">
			<h1 style="font-size:clamp(26px, 5vw, 40px);font-weight:800;color:#ffffff;margin-bottom:12px;font-family:'Open Sans', sans-serif;letter-spacing:-0.3px;text-shadow:0 2px 8px rgba(0,0,0,0.35);line-height:1.25"><?php echo esc_html( $page['title'] ); ?></h1>
			<?php if ( $page['subtitle'] ) : ?>
				<p style="font-size:16px;color:rgba(255,255,255,0.88);font-family:'Open Sans', sans-serif;font-weight:400;max-width:520px;margin:0 auto;line-height:1.6;text-shadow:0 1px 4px rgba(0,0,0,0.25)"><?php echo esc_html( $page['subtitle'] ); ?></p>
			<?php endif; ?>
			<div style="width:52px;height:3px;background-color:rgba(255,255,255,0.55);border-radius:99px;margin:18px auto 0"></div>
		</div>
	</div>

	<div class="max-w-[1280px] mx-auto px-6 py-14">
		<div class="max-w-4xl mx-auto">
			<?php if ( ! empty( $page['sections'] ) ) : ?>
				<div class="space-y-10">
					<?php foreach ( $page['sections'] as $section ) :
						if ( empty( $section['content'] ) ) {
							continue;
						}
						?>
						<div class="prose prose-lg max-w-none prose-headings:text-gray-800 prose-headings:font-bold prose-h2:text-2xl prose-h2:border-b prose-h2:border-[#e6b3b3] prose-h2:pb-2 prose-h2:mb-6 prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-gray-800"><?php echo wp_kses_post( $section['content'] ); ?></div>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>
		</div>
	</div>
</div>
<?php
get_footer();
