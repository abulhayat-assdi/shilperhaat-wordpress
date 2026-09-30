/* Track order (components/checkout/TrackOrderClient.tsx). */
(function () {
	'use strict';
	var SH = window.SH || {}, UI = window.ShUI, esc = UI.esc, fmt = UI.fmt, icon = UI.icon;
	var root = document.getElementById('sh-track');
	if (!root) return;
	var STEPS = [['PENDING', 'Order Placed', 'shopping-bag'], ['CONFIRMED', 'Confirmed', 'check-circle'], ['PROCESSING', 'Processing', 'package'], ['SHIPPED', 'Shipped', 'truck'], ['DELIVERED', 'Delivered', 'map-pin']];
	var ORDER = STEPS.map(function (s) { return s[0]; });
	var BADGE = {
		PENDING: ['Pending', 'bg-yellow-100 text-yellow-800 border-yellow-200'], CONFIRMED: ['Confirmed', 'bg-blue-100 text-blue-800 border-blue-200'],
		PROCESSING: ['Processing', 'bg-purple-100 text-purple-800 border-purple-200'], SHIPPED: ['Shipped', 'bg-indigo-100 text-indigo-800 border-indigo-200'],
		DELIVERED: ['Delivered', 'bg-green-100 text-green-800 border-green-200'], CANCELLED: ['Cancelled', 'bg-red-100 text-red-800 border-red-200']
	};
	var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	function dateEn(s) { var d = new Date(s); return MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(); }

	var st = { input: new URLSearchParams(location.search).get('order') || '', order: null, loading: false, error: null, searched: false };

	function header() {
		return '<div class="bg-white border-b border-gray-100 shadow-sm"><div class="max-w-5xl mx-auto px-4 py-8 md:py-10"><div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6"><div>' +
			'<div class="flex items-center gap-2 mb-2"><span class="w-2 h-2 rounded-full bg-[#800000] animate-pulse"></span><span class="text-xs font-semibold text-[#800000] tracking-widest uppercase">Live Order Tracking</span></div>' +
			'<h1 class="text-3xl md:text-4xl font-bold text-[#1a1208]">Track Your Order</h1><p class="text-[#7a6045] mt-1 text-sm md:text-base">Real-time updates on your shipment progress</p></div>' +
			'<form id="sh-track-form" class="flex gap-2 w-full md:w-auto"><div class="relative flex-1 md:w-72">' + icon('search', 16, '', 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400') +
			'<input type="text" name="order" value="' + esc(st.input) + '" placeholder="Enter order number..." class="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#800000]/30 focus:border-[#800000] bg-gray-50"></div>' +
			'<button type="submit" data-track-btn class="px-5 py-3 bg-[#800000] text-white font-semibold rounded-xl text-sm hover:bg-[#5C0000] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"' + (st.loading || !st.input.trim() ? ' disabled' : '') + '>' + (st.loading ? icon('refresh-cw', 16, '', 'animate-spin') : icon('search', 16)) + 'Search</button></form></div></div></div>';
	}
	function body() {
		if (st.loading) return '<div class="flex flex-col items-center justify-center py-20 gap-4"><div class="w-12 h-12 border-4 border-[#800000] border-t-transparent rounded-full animate-spin"></div><p class="text-[#7a6045] text-sm">Looking up your order...</p></div>';
		if (st.searched && st.error) return '<div class="flex flex-col items-center justify-center py-12"><div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center max-w-md w-full"><div class="text-5xl mb-4">📦</div><h2 class="text-xl font-bold text-[#1a1208] mb-2">Order Not Found</h2><p class="text-[#7a6045] text-sm mb-6">We couldn\'t find an order with that number. Please double-check and try again.</p>' +
			'<a href="' + UI.homeUrl('/shop') + '" class="inline-flex items-center gap-2 bg-[#800000] text-white font-semibold py-3 px-6 rounded-xl text-sm hover:bg-[#5C0000] transition-colors">' + icon('shopping-bag', 16) + 'Back to Shopping</a></div></div>';
		if (st.order) return orderView(st.order);
		return '<div class="flex flex-col items-center justify-center py-16 text-center"><div class="w-20 h-20 rounded-full bg-[#f0e8d8] flex items-center justify-center mb-5">' + icon('package', 36, '', 'text-[#800000]') + '</div><h2 class="text-lg font-bold text-[#1a1208] mb-2">Enter Your Order Number</h2><p class="text-[#7a6045] text-sm max-w-xs">Type your order number (e.g. SH26052812345) in the search box above to see your order status.</p></div>';
	}
	function orderView(o) {
		var cancelled = o.status === 'CANCELLED', idx = ORDER.indexOf(o.status), b = BADGE[o.status];
		var h = '<div class="space-y-5"><div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><div><p class="text-xs text-[#7a6045] mb-1">Order Number</p><p class="text-xl font-bold text-[#800000]">#' + esc(o.orderNumber) + '</p><p class="text-xs text-gray-400 mt-1">Placed on ' + dateEn(o.createdAt) + '</p></div>' +
			'<span class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ' + b[1] + '">' + b[0] + '</span></div>' +
			(o.adminNote ? '<div class="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800"><span class="font-semibold">Note from us: </span>' + esc(o.adminNote) + '</div>' : '') + '</div>';
		if (!cancelled) {
			h += '<div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6"><h2 class="font-bold text-[#1a1208] mb-6 text-sm uppercase tracking-wide">Order Progress</h2><div class="relative"><div class="absolute top-5 left-5 right-5 h-0.5 bg-gray-100 hidden sm:block"></div>' +
				'<div class="absolute top-5 left-5 h-0.5 bg-[#800000] hidden sm:block transition-all duration-700" style="width:' + (idx <= 0 ? '0%' : (idx / (STEPS.length - 1)) * 100 + '%') + '"></div>' +
				'<div class="flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-0 relative z-10">';
			STEPS.forEach(function (s, i) {
				var done = i < idx, cur = i === idx;
				h += '<div class="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2 sm:flex-1"><div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ' + (cur ? 'bg-[#800000] text-white shadow-md shadow-[#800000]/30 scale-110' : (done ? 'bg-[#800000] text-white' : 'bg-gray-100 text-gray-400')) + '">' + icon(s[2], 18) + '</div>' +
					'<div class="sm:text-center"><p class="text-sm font-semibold ' + (cur || done ? 'text-[#1a1208]' : 'text-gray-400') + '">' + s[1] + '</p>' + (cur ? '<p class="text-xs text-[#800000] font-medium mt-0.5">Current</p>' : '') + '</div></div>';
			});
			h += '</div></div></div>';
		} else {
			h += '<div class="bg-red-50 border border-red-200 rounded-2xl p-5 md:p-6 flex items-center gap-4">' + icon('x-circle', 32, '', 'text-red-500 flex-shrink-0') + '<div><p class="font-bold text-red-800">Order Cancelled</p><p class="text-sm text-red-600">This order has been cancelled. Contact us if you have questions.</p></div></div>';
		}
		h += '<div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6"><h2 class="font-bold text-[#1a1208] mb-4 flex items-center gap-2">' + icon('package', 18, '', 'text-[#800000]') + 'Ordered Items</h2><div class="space-y-3">';
		o.items.forEach(function (it) {
			h += '<div class="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"><div class="relative w-12 h-12 rounded-lg overflow-hidden bg-[#f0e8d8] flex-shrink-0">' + (it.productImage ? '<img src="' + esc(UI.imgUrl(it.productImage)) + '" alt="' + esc(it.productTitle) + '" class="object-cover" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent">' : '') + '</div>' +
				'<div class="flex-1 min-w-0"><p class="text-sm font-medium text-[#1a1208] line-clamp-1">' + esc(it.productTitle) + '</p><p class="text-xs text-[#7a6045]">' + it.quantity + ' × ' + fmt(it.price) + '</p></div><span class="font-semibold text-[#1a1208] text-sm whitespace-nowrap">' + fmt(it.lineTotal) + '</span></div>';
		});
		h += '</div><div class="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm"><div class="flex justify-between text-[#4a2c0a]"><span>Subtotal</span><span>' + fmt(o.subtotal) + '</span></div><div class="flex justify-between text-[#4a2c0a]"><span>Delivery</span><span>' + (Number(o.deliveryCharge) === 0 ? '<span class="text-green-600">Free</span>' : fmt(o.deliveryCharge)) + '</span></div>' +
			'<div class="flex justify-between font-bold text-base text-[#1a1208]"><span>Total</span><span class="text-[#800000]">' + fmt(o.total) + '</span></div></div></div>';
		var row = function (ic, label, val) { return '<div class="flex items-start gap-3"><div class="w-8 h-8 rounded-full bg-[#f0e8d8] flex items-center justify-center flex-shrink-0">' + ic + '</div><div><p class="text-xs text-[#7a6045]">' + label + '</p><p class="font-medium text-[#1a1208]">' + val + '</p></div></div>'; };
		h += '<div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6"><h2 class="font-bold text-[#1a1208] mb-4">Delivery Information</h2><div class="space-y-3 text-sm">' +
			row('<span class="text-sm">👤</span>', 'Customer', esc(o.customerName)) + row(icon('phone', 14, '', 'text-[#800000]'), 'Phone', esc(o.phone)) + row(icon('map-pin', 14, '', 'text-[#800000]'), 'Address', esc(o.address)) +
			row(icon('clock', 14, '', 'text-[#800000]'), 'Payment', o.paymentMethod === 'COD' ? 'Cash on Delivery' : esc(o.paymentMethod)) + '</div></div>';
		h += '<div class="flex flex-col sm:flex-row gap-3 pb-4"><a href="' + UI.homeUrl('/') + '" class="flex items-center justify-center gap-2 flex-1 bg-[#800000] text-white font-bold py-3.5 rounded-xl hover:bg-[#5C0000] transition-colors text-sm">Back to Home</a>' +
			'<a href="' + UI.homeUrl('/shop') + '" class="flex items-center justify-center gap-2 flex-1 border-2 border-[#800000] text-[#800000] font-bold py-3.5 rounded-xl hover:bg-[#800000] hover:text-white transition-colors text-sm">' + icon('shopping-bag', 16) + 'Continue Shopping</a></div></div>';
		return h;
	}
	function draw() {
		var focus = document.activeElement && document.activeElement.name === 'order';
		root.innerHTML = '<div class="min-h-screen" style="background-color:#FAF0E6">' + header() + '<div class="max-w-5xl mx-auto px-4 py-8">' + body() + '</div></div>';
		if (focus) { var i = root.querySelector('input[name=order]'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
	}
	function track(num) {
		if (!num.trim()) return;
		st.loading = true; st.error = null; st.order = null; st.searched = true; draw();
		fetch(SH.restUrl + 'orders/track?orderNumber=' + encodeURIComponent(num.trim()))
			.then(function (r) { return r.json(); })
			.then(function (d) { if (d.success) st.order = d.order; else st.error = d.error || 'Order not found'; })
			.catch(function () { st.error = 'Failed to connect. Please try again.'; })
			.then(function () { st.loading = false; draw(); });
	}
	root.addEventListener('input', function (e) {
		if (e.target.name === 'order') { st.input = e.target.value; var b = root.querySelector('[data-track-btn]'); b.disabled = st.loading || !st.input.trim(); }
	});
	root.addEventListener('submit', function (e) {
		e.preventDefault();
		if (!st.input.trim()) return;
		history.pushState(null, '', UI.homeUrl('/track-order?order=' + encodeURIComponent(st.input.trim())));
		track(st.input);
	});
	draw();
	if (st.input) track(st.input);
})();
