/* Thank-you page (components/checkout/ThankYouClient.tsx) + browser-side Meta Purchase event. */
(function () {
	'use strict';
	var UI = window.ShUI, esc = UI.esc, fmt = UI.fmt, icon = UI.icon;
	var root = document.getElementById('sh-thankyou');
	if (!root) return;
	var qs = new URLSearchParams(location.search), orderNumber = qs.get('order');
	var order = null;
	try {
		var saved = localStorage.getItem('sh_last_order');
		if (saved) {
			order = JSON.parse(saved);
			var key = 'sh_purchase_tracked_' + order.orderNumber;
			if (order.orderNumber && !localStorage.getItem(key)) {
				window.ShTrack.fbq('Purchase', {
					content_type: 'product',
					content_ids: order.items.map(function (i) { return i.productId; }).filter(Boolean),
					contents: order.items.filter(function (i) { return i.productId; }).map(function (i) { return { id: i.productId, quantity: i.quantity, item_price: i.price }; }),
					num_items: order.items.reduce(function (n, i) { return n + i.quantity; }, 0),
					value: order.total, currency: 'BDT', order_id: order.orderNumber
				}, 'purchase_' + order.orderNumber);
				localStorage.setItem(key, '1');
			}
		}
	} catch (e) { order = null; }

	var num = orderNumber || (order && order.orderNumber);
	var h = '<div class="max-w-2xl mx-auto px-4 py-10"><div class="flex flex-col items-center text-center mb-8 thankyou-pop">' +
		'<div class="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">' + icon('check-circle', 40, '', 'text-green-600') + '</div>' +
		'<h1 class="text-2xl md:text-3xl font-bold text-[#1a1208] mb-2">Order Placed Successfully! 🎉</h1>' +
		'<p class="text-[#7a6045] text-sm">Your order has been received. We will contact you shortly to confirm.</p>' +
		(num ? '<div class="mt-3 bg-[#fdf8f3] border border-[#e0d0b0] rounded-xl px-6 py-3"><p class="text-xs text-[#7a6045]">Order Number</p><p class="font-bold text-[#800000] text-lg">' + esc(num) + '</p></div>' : '') + '</div>';
	if (order) {
		h += '<div class="space-y-4 thankyou-slide"><div class="bg-white rounded-xl border border-[#f0e8d8] p-5 shadow-sm"><h2 class="font-bold text-[#1a1208] mb-4 flex items-center gap-2">' + icon('package', 18, '', 'text-[#800000]') + 'Ordered Items</h2><div class="space-y-3">';
		order.items.forEach(function (it) {
			h += '<div class="flex items-center gap-3"><div class="relative w-12 h-12 rounded-lg overflow-hidden bg-[#f0e8d8] flex-shrink-0">' +
				(it.productImage ? '<img src="' + esc(UI.imgUrl(it.productImage)) + '" alt="' + esc(it.productTitle) + '" class="object-cover" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent">' : '') + '</div>' +
				'<div class="flex-1 min-w-0"><p class="text-sm font-medium text-[#1a1208] line-clamp-1">' + esc(it.productTitle) + '</p><p class="text-xs text-[#7a6045]">' + it.quantity + 'x × ' + fmt(it.price) + '</p></div>' +
				'<span class="font-bold text-[#1a1208] text-sm">' + fmt(it.lineTotal) + '</span></div>';
		});
		h += '</div><div class="border-t border-[#f0e8d8] mt-4 pt-4 space-y-2 text-sm"><div class="flex justify-between text-[#4a2c0a]"><span>Subtotal</span><span>' + fmt(order.subtotal) + '</span></div>' +
			'<div class="flex justify-between text-[#4a2c0a]"><span>Delivery</span><span>' + (order.deliveryCharge === 0 ? '<span class="text-green-600">Free</span>' : fmt(order.deliveryCharge)) + '</span></div>' +
			(order.couponCode ? '' : '') +
			'<div class="flex justify-between font-bold text-base text-[#1a1208]"><span>Total</span><span class="text-[#800000]">' + fmt(order.total) + '</span></div></div></div>' +
			'<div class="bg-white rounded-xl border border-[#f0e8d8] p-5 shadow-sm"><h2 class="font-bold text-[#1a1208] mb-4">Delivery Information</h2><div class="space-y-2 text-sm">' +
			'<div class="flex items-start gap-3"><div class="w-5 h-5 rounded-full bg-[#f0e8d8] flex items-center justify-center flex-shrink-0 mt-0.5"><span class="text-xs">👤</span></div><span class="text-[#1a1208] font-medium">' + esc(order.customerName) + '</span></div>' +
			'<div class="flex items-start gap-3">' + icon('phone', 16, '', 'text-[#800000] flex-shrink-0 mt-0.5') + '<span class="text-[#4a2c0a]">' + esc(order.phone) + '</span></div>' +
			'<div class="flex items-start gap-3">' + icon('map-pin', 16, '', 'text-[#800000] flex-shrink-0 mt-0.5') + '<span class="text-[#4a2c0a]">' + esc(order.address) + '</span></div>' +
			'<div class="flex items-start gap-3"><span class="text-base">💵</span><span class="text-[#4a2c0a]">' + (order.paymentMethod === 'COD' ? 'Cash on Delivery' : esc(order.paymentMethod)) + '</span></div></div></div>' +
			'<div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800"><p class="font-semibold mb-1">What happens next:</p><ul class="space-y-1 text-xs list-disc list-inside"><li>We will call you soon to confirm your order</li><li>Your order will arrive within 3–5 business days</li><li>Pay the delivery person when you receive your package</li></ul></div></div>';
	}
	h += '<div class="flex flex-col sm:flex-row gap-3 mt-8"><a href="' + UI.homeUrl('/') + '" class="flex items-center justify-center gap-2 flex-1 bg-[#800000] text-white font-bold py-3.5 rounded-xl hover:bg-[#5C0000] transition-colors">' + icon('home', 18) + 'Back to Home</a>' +
		'<a href="' + UI.homeUrl('/shop') + '" class="flex items-center justify-center gap-2 flex-1 border-2 border-[#800000] text-[#800000] font-bold py-3.5 rounded-xl hover:bg-[#800000] hover:text-white transition-colors">' + icon('shopping-bag', 18) + 'Shop More</a></div></div>';
	root.innerHTML = h;
})();
