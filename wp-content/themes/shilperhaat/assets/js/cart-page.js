/* Cart page (components/cart/CartPageClient.tsx). */
(function () {
	'use strict';
	var UI = window.ShUI, Cart = window.ShCart, esc = UI.esc, fmt = UI.fmt, icon = UI.icon;
	var root = document.getElementById('sh-cart-page');
	if (!root) return;
	var confirmItem = null;

	function empty() {
		return '<div class="flex flex-col items-center justify-center py-20 text-center px-4">' +
			'<div class="text-7xl mb-4">🛒</div><h2 class="text-2xl font-bold text-[#1a1208] mb-2">Your cart is empty</h2>' +
			'<p class="text-[#7a6045] text-sm max-w-xs mb-8">You haven\'t added any products yet. Browse our collection and pick your favourites.</p>' +
			'<a href="' + UI.homeUrl('/shop') + '" class="flex items-center gap-2 bg-[#800000] text-white font-bold px-8 py-3.5 rounded-full hover:bg-[#5C0000] transition-colors">' + icon('shopping-bag', 18) + 'Start Shopping</a></div>';
	}

	function render() {
		var items = Cart.items;
		if (!items.length) { root.innerHTML = empty(); return; }
		var sub = Cart.subtotal, del = Cart.deliveryCharge, total = Cart.total, free = Cart.freeDeliveryMin;
		var h = '<div class="max-w-5xl mx-auto px-4 py-6">';
		if (confirmItem) {
			h += '<div data-c-bg class="fixed inset-0 z-[200] flex items-center justify-center" style="background-color:rgba(0,0,0,0.45)">' +
				'<div data-c-box class="bg-white rounded-xl p-7 text-center" style="max-width:320px;width:90%;box-shadow:0 8px 32px rgba(128,0,0,0.18);border:2px solid #800000">' +
				'<div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style="background-color:#fff0f0;border:2px solid #800000">' + icon('trash-2', 22, '', '', { stroke: '#800000' }) + '</div>' +
				'<h3 class="text-base font-bold text-[#1a1208] mb-2">Remove Item?</h3>' +
				'<p class="text-sm text-[#7a6045] mb-5 leading-relaxed">“' + esc(confirmItem.title) + '” কার্ট থেকে সরিয়ে দেবেন?</p>' +
				'<div class="flex gap-3"><button type="button" data-c-no class="flex-1 py-2.5 rounded-lg font-bold text-sm border-2 border-[#800000] text-[#800000] bg-white hover:bg-[#fff0f0] transition-colors">No</button>' +
				'<button type="button" data-c-yes class="flex-1 py-2.5 rounded-lg font-bold text-sm bg-[#800000] text-white hover:bg-[#5C0000] transition-colors">Yes, Remove</button></div></div></div>';
		}
		h += '<h1 class="text-2xl md:text-3xl font-bold text-[#1a1208] mb-6">My Cart (' + items.length + ' ' + (items.length === 1 ? 'item' : 'items') + ')</h1>';
		h += '<div class="flex flex-col lg:flex-row gap-6"><div class="flex-1 space-y-3">';
		items.forEach(function (it) {
			var pu = UI.homeUrl('/product/' + encodeURIComponent(it.slug));
			var max = it.quantity >= it.stock;
			h += '<div class="bg-white rounded-xl border border-[#f0e8d8] p-4 flex items-start gap-4 shadow-sm">' +
				'<a href="' + pu + '"><div class="relative w-20 h-20 rounded-lg overflow-hidden bg-[#f0e8d8] flex-shrink-0"><img src="' + esc(UI.imgUrl(it.image)) + '" alt="' + esc(it.title) + '" class="object-cover" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" onerror="' + esc(UI.onerr) + '"></div></a>' +
				'<div class="flex-1 min-w-0"><a href="' + pu + '"><h3 class="font-semibold text-[#1a1208] text-sm md:text-base line-clamp-2 hover:text-[#800000] transition-colors">' + esc(it.title) + '</h3></a>' +
				'<div class="flex items-center gap-2 mt-1"><span class="font-bold text-[#800000]">' + fmt(it.price) + '</span>' + (it.compareAtPrice ? '<span class="text-xs text-gray-400 line-through">' + fmt(it.compareAtPrice) + '</span>' : '') + '</div>' +
				'<div class="flex items-center justify-between mt-3"><div class="flex items-center border border-[#e0d0b0] rounded-lg overflow-hidden">' +
				'<button type="button" data-c-dec="' + esc(it.productId) + '" class="w-8 h-8 flex items-center justify-center text-[#4a2c0a] hover:bg-[#f0e8d8] transition-colors" aria-label="Decrease quantity">' + icon('minus', 14) + '</button>' +
				'<span class="w-8 text-center text-sm font-semibold text-[#1a1208]">' + it.quantity + '</span>' +
				'<button type="button" data-c-inc="' + esc(it.productId) + '"' + (max ? ' disabled' : '') + ' class="w-8 h-8 flex items-center justify-center text-[#4a2c0a] hover:bg-[#f0e8d8] disabled:opacity-40 transition-colors" aria-label="Increase quantity">' + icon('plus', 14) + '</button></div>' +
				'<div class="flex items-center gap-3"><span class="text-sm font-bold text-[#1a1208]">' + fmt(it.price * it.quantity) + '</span>' +
				'<button type="button" data-c-rm="' + esc(it.productId) + '" class="text-red-400 hover:text-red-600 transition-colors" aria-label="Remove ' + esc(it.title) + '">' + icon('trash-2', 16) + '</button></div></div></div></div>';
		});
		h += '<div class="pt-2"><a href="' + UI.homeUrl('/shop') + '" class="text-[#800000] text-sm font-medium hover:underline flex items-center gap-1">← Continue Shopping</a></div></div>';
		h += '<div class="lg:w-80"><div class="bg-white rounded-xl border border-[#f0e8d8] p-5 shadow-sm sticky top-24"><h2 class="font-bold text-[#1a1208] text-lg mb-4">Order Summary</h2><div class="space-y-3 text-sm">' +
			'<div class="flex justify-between text-[#4a2c0a]"><span>Subtotal</span><span>' + fmt(sub) + '</span></div>' +
			'<div class="flex justify-between text-[#4a2c0a]"><span>Delivery Charge</span><span>' + (del === 0 ? '<span class="text-green-600 font-semibold">Free</span>' : fmt(del)) + '</span></div>' +
			(del > 0 && free ? '<p class="text-xs text-[#7a6045] bg-[#fdf8f3] p-2 rounded-lg">Add ' + fmt(free - sub) + ' more to get free delivery!</p>' : '') +
			'<div class="border-t border-[#f0e8d8] pt-3"><div class="flex justify-between font-bold text-[#1a1208] text-base"><span>Total</span><span class="text-[#800000] text-lg">' + fmt(total) + '</span></div></div></div>' +
			'<a href="' + UI.homeUrl('/checkout') + '" class="mt-5 flex items-center justify-center gap-2 w-full bg-[#800000] hover:bg-[#5C0000] text-white font-bold py-4 rounded-xl transition-colors">Place Order' + icon('arrow-right', 18) + '</a>' +
			'<div class="mt-3 flex items-center justify-center gap-2 text-xs text-[#7a6045]"><span>🔒</span><span>Secure Cash on Delivery</span></div></div></div></div></div>';
		root.innerHTML = h;
	}
	root.addEventListener('click', function (e) {
		var t = e.target;
		var dec = t.closest('[data-c-dec]'), inc = t.closest('[data-c-inc]'), rm = t.closest('[data-c-rm]');
		if (dec) { var di = Cart.find(dec.getAttribute('data-c-dec')); if (di) Cart.setQty(di.productId, di.quantity - 1); return; }
		if (inc) { var ii = Cart.find(inc.getAttribute('data-c-inc')); if (ii && ii.quantity < ii.stock) Cart.setQty(ii.productId, ii.quantity + 1); return; }
		if (rm) { var ri = Cart.find(rm.getAttribute('data-c-rm')); if (ri) { confirmItem = { id: ri.productId, title: ri.title }; render(); } return; }
		if (t.closest('[data-c-yes]')) { UI.toast.info('"' + confirmItem.title + '" removed from cart'); var id = confirmItem.id; confirmItem = null; Cart.remove(id); return; }
		if (t.closest('[data-c-no]') || (t.hasAttribute && t.hasAttribute('data-c-bg'))) { confirmItem = null; render(); }
	});
	Cart.on(render);
	render();
})();
