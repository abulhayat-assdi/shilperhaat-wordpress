<?php
/** My Account — static sign-in card (app/(public)/account/page.tsx). */
defined( 'ABSPATH' ) || exit;
get_header();
?>
<div class="min-h-screen bg-gray-50">
	<div class="max-w-[1280px] mx-auto px-6 py-14">
		<div class="max-w-md mx-auto bg-white rounded-xl shadow-sm p-8">
			<h1 class="text-2xl font-bold text-gray-800 mb-6 text-center">My Account</h1>
			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Phone or Email</label>
					<input type="text" placeholder="Enter your phone or email" class="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#800000]">
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
					<input type="password" placeholder="Enter your password" class="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#800000]">
				</div>
				<button type="button" class="w-full text-white py-3 rounded-lg font-semibold transition-colors bg-[#800000] hover:bg-[#5C0000]">Sign In</button>
				<p class="text-center text-sm text-gray-500">New customer? <a href="#" class="text-[#800000] font-medium hover:underline">Create account</a></p>
			</div>
		</div>
	</div>
</div>
<?php
get_footer();
