/* Checkout (components/checkout/CheckoutPageClient.tsx + ui/SearchableSelect.tsx): COD only. */
(function () {
	'use strict';
	var SH = window.SH || {}, UI = window.ShUI, Cart = window.ShCart, esc = UI.esc, icon = UI.icon;
	var root = document.getElementById('sh-checkout');
	if (!root) return;
	var DISTRICTS = window.SH_DISTRICTS || [];
	function fmtAmt(n) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
	function deliveryFor(d) { return !d ? 0 : (d.toLowerCase() === 'dhaka' ? 100 : 150); }
	function thanasOf(d) { var f = DISTRICTS.filter(function (x) { return x.name === d; })[0]; return f ? f.thanas : []; }

	var state = { district: '', thana: '', coupon: null, couponMsg: null, terms: true, termsError: false, submitting: false, couponOpen: false, couponApplying: false, submitted: false };
	var errors = {};
	var trackedInit = false;

	function emptyCart() {
		root.innerHTML = '<div class="flex flex-col items-center justify-center py-24 text-center px-4"><div class="text-6xl mb-4">🛒</div><h2 class="text-xl font-bold text-[#222] mb-2">Your cart is empty</h2>' +
			'<p class="text-sm mb-6" style="color:#777">Add products to your cart before checking out.</p>' +
			'<a href="' + UI.homeUrl('/shop') + '" class="text-white px-6 py-3 rounded-lg font-semibold transition-colors" style="background-color:#800000">Shop Now</a></div>';
	}

	var inputBase = 'w-full bg-white text-[#333] text-sm outline-none transition-colors placeholder:text-[#aaa]';
	var inputStyle = 'height:42px;border:1px solid #e0e0e0;border-radius:6px;padding:0 14px;font-size:14px';
	function title(t, extra) {
		return '<div class="flex items-center gap-2 mb-4"><h2 style="border-left:3px solid #800000;padding-left:10px;font-size:15px;font-weight:700;color:#222;line-height:1.3">' + t + '</h2>' + (extra || '') + '</div>';
	}
	function card(inner) { return '<div class="bg-white rounded-lg mb-4" style="border:1px solid #e8e8e8;padding:20px;box-shadow:none">' + inner + '</div>'; }

	/* Searchable select (ui/SearchableSelect.tsx) */
	function selectHtml(id, placeholder) {
		return '<div data-ss="' + id + '" style="position:relative;width:100%"><button type="button" data-ss-trigger style="width:100%;height:42px;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 12px;background:white;border:1px solid #e0e0e0;border-radius:6px;font-size:14px;color:#aaa;cursor:pointer;text-align:left;transition:border-color 0.15s;box-sizing:border-box"><span data-ss-label style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(placeholder) + '</span><span data-ss-chev>' + icon('chevron-down', 16, 'color:#999;flex-shrink:0') + '</span></button><div data-ss-menu style="display:none"></div></div>';
	}
	var ss = {
		district: { placeholder: 'Select District *', open: false, query: '', options: function () { return DISTRICTS.map(function (d) { return d.name; }); }, value: function () { return state.district; }, disabled: function () { return false; }, error: function () { return !!errors.district; }, onChange: function (v) { state.district = v; state.thana = ''; if (state.submitted) validateField('district'); draw(); updateSummary(); } },
		thana: { placeholder: 'Select Thana (Optional)', open: false, query: '', options: function () { return thanasOf(state.district); }, value: function () { return state.thana; }, disabled: function () { return !state.district; }, error: function () { return false; }, onChange: function (v) { state.thana = v; draw(); } }
	};
	function ssEl(id) { return root.querySelector('[data-ss="' + id + '"]'); }
	function drawSelect(id) {
		var c = ss[id], el = ssEl(id); if (!el) return;
		var trig = el.querySelector('[data-ss-trigger]'), val = c.value(), dis = c.disabled();
		var bc = c.error() ? '#f87171' : (c.open ? '#800000' : '#e0e0e0');
		trig.style.background = dis ? '#f9f9f9' : 'white'; trig.style.border = '1px solid ' + bc; trig.style.color = val ? '#333' : '#aaa'; trig.style.cursor = dis ? 'not-allowed' : 'pointer'; trig.disabled = dis;
		el.querySelector('[data-ss-label]').textContent = val || c.placeholder;
		el.querySelector('[data-ss-chev]').innerHTML = c.open ? icon('chevron-up', 16, 'color:#800000;flex-shrink:0') : icon('chevron-down', 16, 'color:#999;flex-shrink:0');
		var menu = el.querySelector('[data-ss-menu]');
		if (!c.open) { menu.style.display = 'none'; menu.innerHTML = ''; return; }
		var keep = menu.querySelector('input') ? menu.querySelector('input').value : '';
		var q = c.query.trim().toLowerCase();
		var opts = c.options().filter(function (o) { return !q || o.toLowerCase().indexOf(q) > -1; });
		menu.style.cssText = 'display:block;position:absolute;top:calc(100% + 4px);left:0;right:0;background:white;border:1px solid #e0e0e0;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,0.10);z-index:9999;overflow:hidden';
		var h = '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid #f0f0f0">' + icon('search', 14, 'color:#aaa;flex-shrink:0') + '<input type="text" data-ss-q placeholder="Search..." value="' + esc(c.query) + '" style="flex:1;border:none;outline:none;font-size:13px;color:#333;background:transparent"></div>';
		h += '<div style="max-height:220px;overflow-y:auto"><button type="button" data-ss-clear style="display:block;width:100%;padding:9px 14px;text-align:left;font-size:13px;color:#aaa;background:white;border:none;cursor:pointer;border-bottom:1px solid #f5f5f5">' + esc(c.placeholder) + '</button>';
		if (!opts.length) h += '<p style="padding:12px 14px;font-size:13px;color:#aaa">No results found</p>';
		opts.forEach(function (o) {
			var on = o === val;
			h += '<button type="button" data-ss-opt="' + esc(o) + '" class="' + (on ? '' : 'sh-ss-opt') + '" style="display:block;width:100%;padding:9px 14px;text-align:left;font-size:13px;color:' + (on ? '#fff' : '#333') + ';background:' + (on ? '#800000' : 'white') + ';border:none;cursor:pointer;transition:background 0.1s">' + esc(o) + '</button>';
		});
		menu.innerHTML = h + '</div>';
		var qi = menu.querySelector('[data-ss-q]'); qi.focus(); qi.setSelectionRange(qi.value.length, qi.value.length);
	}
	function closeSelects() { ['district', 'thana'].forEach(function (id) { if (ss[id].open) { ss[id].open = false; ss[id].query = ''; drawSelect(id); } }); }
	function selectHandlers() {
		root.addEventListener('click', function (e) {
			var wrap = e.target.closest('[data-ss]');
			if (!wrap) return;
			var id = wrap.getAttribute('data-ss'), c = ss[id];
			if (e.target.closest('[data-ss-trigger]')) { if (!c.disabled()) { var was = c.open; closeSelects(); c.open = !was; drawSelect(id); } return; }
			var opt = e.target.closest('[data-ss-opt]');
			if (opt) { c.open = false; c.query = ''; c.onChange(opt.getAttribute('data-ss-opt')); drawSelect(id); return; }
			if (e.target.closest('[data-ss-clear]')) { c.open = false; c.query = ''; c.onChange(''); drawSelect(id); }
		});
		root.addEventListener('input', function (e) {
			var qi = e.target.closest('[data-ss-q]'); if (!qi) return;
			var id = qi.closest('[data-ss]').getAttribute('data-ss'); ss[id].query = qi.value; drawSelect(id);
		});
		document.addEventListener('mousedown', function (e) { if (!e.target.closest('[data-ss]')) closeSelects(); });
		document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSelects(); });
	}

	/* Validation (lib/validations.ts checkoutSchema) */
	function val(name) { var el = root.querySelector('[name=' + name + ']'); return el ? el.value : ''; }
	function validateField(f) {
		var v;
		if (f === 'customerName') { v = val(f).trim(); if (v.length < 2) errors[f] = 'Full name is required'; else delete errors[f]; }
		if (f === 'phone') { if (!/^01\d{9}$/.test(val(f))) errors[f] = 'Enter a valid Bangladesh number (01XXXXXXXXX)'; else delete errors[f]; }
		if (f === 'houseAddress') { v = val(f); if (v.length < 5) errors[f] = 'House/street address is required'; else if (v.length > 300) errors[f] = 'Too long'; else delete errors[f]; }
		if (f === 'district') { if (!state.district) errors[f] = 'Select a district'; else delete errors[f]; }
		paintError(f);
	}
	function paintError(f) {
		var box = root.querySelector('[data-err="' + f + '"]');
		if (box) box.textContent = errors[f] || '';
		var inp = root.querySelector('[name=' + f + ']');
		if (inp) { inp.style.borderColor = errors[f] ? '#f87171' : '#e0e0e0'; }
		if (f === 'district') drawSelect('district');
	}

	/* Order review + summary */
	function itemsHtml() {
		return Cart.items.map(function (it) {
			var cmp = it.compareAtPrice && it.compareAtPrice > it.price ? '<span style="font-size:12px;color:#aaa;text-decoration:line-through;white-space:nowrap">৳' + fmtAmt(it.compareAtPrice * it.quantity) + '</span>' : '';
			var id = esc(it.productId);
			return '<div style="display:flex;align-items:flex-start;gap:12px"><div class="relative flex-shrink-0 overflow-hidden" style="width:60px;height:60px;border-radius:6px;border:1px solid #f0f0f0;background:#f5f5f5"><img src="' + esc(UI.imgUrl(it.image)) + '" alt="' + esc(it.title) + '" class="object-cover" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" onerror="' + esc(UI.onerr) + '"></div>' +
				'<div style="flex:1;min-width:0"><div style="display:flex;align-items:flex-start;gap:8px"><p class="line-clamp-2" style="flex:1;font-size:14px;font-weight:600;color:#333;line-height:1.4">' + esc(it.title) + '</p>' +
				'<div style="display:flex;flex-direction:column;align-items:flex-end;flex-shrink:0"><span style="font-size:14px;font-weight:700;color:#800000;white-space:nowrap">৳' + fmtAmt(it.price * it.quantity) + '</span>' + cmp + '</div>' +
				'<button type="button" data-co-rm="' + id + '" aria-label="Remove item" style="flex-shrink:0;width:28px;height:28px;background:#ff4444;color:white;border:none;border-radius:4px;display:flex;align-items:center;justify-content:center;cursor:pointer">' + icon('trash-2', 13) + '</button></div>' +
				'<div style="display:flex;align-items:center;gap:8px;margin-top:8px"><span style="font-size:13px;color:#777">Qty:</span><div style="display:flex;border:1px solid #ddd;border-radius:4px;overflow:hidden">' +
				'<button type="button" data-co-dec="' + id + '" style="width:28px;height:28px;background:white;border:none;border-right:1px solid #ddd;font-size:16px;color:#555;cursor:pointer;display:flex;align-items:center;justify-content:center">-</button>' +
				'<span style="width:32px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:500;color:#333">' + it.quantity + '</span>' +
				'<button type="button" data-co-inc="' + id + '" style="width:28px;height:28px;background:white;border:none;border-left:1px solid #ddd;font-size:16px;color:#555;cursor:pointer;display:flex;align-items:center;justify-content:center">+</button></div></div></div></div>';
		}).join('');
	}
	function computed() {
		var sub = Cart.subtotal, del = deliveryFor(state.district);
		var disc = state.coupon ? Math.min(state.coupon.discount, sub) : 0;
		return { sub: sub, del: del, disc: disc, total: sub + del - disc };
	}
	function summaryHtml() {
		var c = computed();
		return '<div class="space-y-1"><div class="flex justify-between" style="padding:8px 0;font-size:14px;color:#555"><span>Sub total</span><span>৳' + fmtAmt(c.sub) + ' BDT</span></div>' +
			'<div class="flex justify-between items-center" style="padding:8px 0;font-size:14px;color:#555"><span>Delivery cost</span>' + (state.district ? '<span style="color:#333;font-weight:500">৳' + fmtAmt(c.del) + ' BDT</span>' : '<em style="color:#aaa;font-size:13px;font-style:italic">Select district</em>') + '</div>' +
			(c.disc > 0 ? '<div class="flex justify-between" style="padding:8px 0;font-size:14px;color:#2e7d32"><span>Coupon discount (' + esc(state.coupon.code) + ')</span><span>−৳' + fmtAmt(c.disc) + ' BDT</span></div>' : '') +
			'<div class="flex justify-between" style="border-top:1px solid #eee;padding:10px 0 0;font-size:16px;font-weight:700;color:#222"><span>Total</span><span>৳' + fmtAmt(c.total) + ' BDT</span></div></div>';
	}
	function couponBody() {
		if (!state.couponOpen) return '';
		var h = '<div style="padding:12px 16px 16px;border-top:1px solid #f0f0f0">';
		if (state.coupon) {
			var c = computed();
			h += '<div class="flex items-center justify-between" style="background:#f0faf0;border:1px solid #c6e8c6;border-radius:6px;padding:10px 14px"><span style="font-size:13px;color:#2e7d32;font-weight:600">✓ ' + esc(state.coupon.code) + ' applied — ৳' + fmtAmt(c.disc) + ' off</span><button type="button" data-co-coupon-remove style="background:none;border:none;color:#c62828;font-size:12px;font-weight:600;cursor:pointer">Remove</button></div>';
		} else {
			h += '<div class="flex gap-2"><input type="text" data-co-coupon placeholder="Enter coupon code" class="flex-1 ' + inputBase + '" style="' + inputStyle + ';border-color:#e0e0e0;text-transform:uppercase" value="">' +
				'<button type="button" data-co-coupon-apply disabled class="transition-colors" style="background:#b08080;color:white;border:none;padding:0 16px;height:42px;border-radius:6px;font-size:13px;font-weight:500;cursor:not-allowed;flex-shrink:0">Apply</button></div>' +
				'<p data-co-coupon-msg style="font-size:12px;color:#c62828;margin-top:8px;display:none"></p>';
		}
		return h + '</div>';
	}
	function updateSummary() {
		var s = root.querySelector('[data-co-summary]'); if (s) s.innerHTML = summaryHtml();
		var cb = root.querySelector('[data-co-coupon-body]'); if (cb) cb.innerHTML = couponBody();
		var hint = root.querySelector('[data-co-hint]'); if (hint) hint.style.display = state.district ? 'none' : '';
		var btn = root.querySelector('[data-co-place]');
		if (btn) {
			var ok = state.terms && !!state.district;
			btn.disabled = state.submitting || !ok;
			btn.style.background = ok ? '#800000' : '#ccc';
			btn.style.cursor = ok && !state.submitting ? 'pointer' : 'not-allowed';
			btn.innerHTML = state.submitting ? icon('loader-2', 18, '', 'animate-spin') + 'Placing Order...' : 'PLACE ORDER';
		}
		var te = root.querySelector('[data-co-terms-err]'); if (te) te.style.display = state.termsError ? '' : 'none';
	}
	function draw() { drawSelect('district'); drawSelect('thana'); }

	function build() {
		var it = Cart.items;
		if (!it.length && !state.submitted) { emptyCart(); return false; }
		var notes = root.querySelector('[name=notes]') ? val('notes') : '';
		var errP = function (f) { return '<p class="text-red-500 text-xs mt-1" data-err="' + f + '"></p>'; };
		root.innerHTML = '<div style="background-color:#f7f7f7;min-height:100vh"><div class="text-center pt-6 pb-5"><h1 style="font-size:26px;font-weight:700;color:#222;margin-bottom:4px">Checkout</h1>' +
			'<p style="font-size:13px;color:#999"><a href="' + UI.homeUrl('/') + '" class="hover:text-[#800000] transition-colors">Home</a><span class="mx-1.5" style="color:#bbb">&gt;</span><span style="color:#800000">Checkout</span></p></div>' +
			'<div class="max-w-[1200px] mx-auto px-4 pb-8">' +
			'<div class="bg-white flex flex-wrap items-center justify-between gap-3 mb-5" style="border:1px solid #e8e8e8;border-radius:6px;padding:12px 20px"><span style="font-size:14px;color:#555">Have any account? please login or register</span><div class="flex gap-2">' +
			'<button type="button" style="border:1px solid #ddd;background:white;color:#333;padding:7px 18px;border-radius:4px;font-size:13px;cursor:pointer">Login</button>' +
			'<button type="button" style="background:#800000;color:white;border:none;padding:7px 18px;border-radius:4px;font-size:13px;font-weight:500;cursor:pointer">Register</button></div></div>' +
			'<form id="sh-co-form" novalidate><div class="flex flex-col lg:flex-row gap-5"><div class="w-full lg:w-[58%]">' +
			card(title('Order review') + '<div class="space-y-4" data-co-items></div>') +
			card(title('Shipping Address') + '<div class="space-y-3"><div class="grid grid-cols-1 sm:grid-cols-2 gap-3">' +
				'<div><input name="customerName" type="text" placeholder="Your Full Name *" class="' + inputBase + ' focus:border-[#800000]" style="' + inputStyle + '">' + errP('customerName') + '</div>' +
				'<div><div class="relative"><span class="absolute top-1/2 -translate-y-1/2 select-none" style="left:12px;font-size:14px;color:#555;border-right:1px solid #e0e0e0;padding-right:8px;line-height:20px">88</span>' +
				'<input name="phone" type="tel" placeholder="017********" class="' + inputBase + ' focus:border-[#800000]" style="' + inputStyle + ';padding-left:46px"></div>' + errP('phone') + '</div></div>' +
				'<div><input name="houseAddress" type="text" placeholder="ex: House no. / building / street / area" class="' + inputBase + ' focus:border-[#800000]" style="' + inputStyle + '">' + errP('houseAddress') + '</div>' +
				'<div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><div>' + selectHtml('district', ss.district.placeholder) + errP('district') + '</div><div>' + selectHtml('thana', ss.thana.placeholder) + '</div></div></div>') +
			card(title('Special notes', '<span style="font-size:12px;color:#999">(Optional)</span>') + '<textarea name="notes" maxlength="90" placeholder="Any special instructions..." class="w-full outline-none transition-colors resize-y focus:border-[#800000]" style="height:80px;border:1px solid #e0e0e0;border-radius:6px;padding:10px 14px;font-size:14px;color:#333;resize:vertical;display:block"></textarea><p data-co-notes-count style="font-size:12px;color:#999;margin-top:4px;text-align:right">0 / 90 characters</p>') +
			'</div><div class="w-full lg:w-[42%]">' +
			card(title('Payment method') + '<div class="flex items-center gap-3" style="border:1px solid #800000;border-radius:8px;padding:14px 16px;background:#fff8f0"><span style="font-size:26px;line-height:1;color:#800000">💵</span><div class="flex-1"><p style="font-size:14px;font-weight:700;color:#222;margin-bottom:2px">Cash On Delivery</p><p style="font-size:12px;color:#888">Pay when you receive your order</p></div>' +
				'<span class="flex items-center justify-center flex-shrink-0" style="width:22px;height:22px;border-radius:50%;background:#800000"><svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true"><path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div>') +
			'<div class="bg-white mb-4 overflow-hidden" style="border:1px solid #e8e8e8;border-radius:8px"><button type="button" data-co-coupon-toggle class="w-full flex items-center justify-between transition-colors" style="padding:12px 16px;font-size:14px;color:#444;cursor:pointer"><span>Have any coupon or gift voucher?</span><span data-co-coupon-chev>' + icon('chevron-down', 16) + '</span></button><div data-co-coupon-body></div></div>' +
			card('<div data-co-summary></div>') +
			'<div class="bg-white" style="border:1px solid #e8e8e8;border-radius:8px;padding:20px"><label class="flex items-start gap-[10px] cursor-pointer mb-4"><input type="checkbox" data-co-terms checked class="accent-[#800000] flex-shrink-0" style="width:16px;height:16px;margin-top:2px"><span style="font-size:13px;color:#555;line-height:1.5">I have read and agree to the <a href="' + UI.homeUrl('/terms-of-use') + '" target="_blank" rel="noopener noreferrer" class="sh-co-link" style="color:#800000;text-decoration:none">Terms and Conditions</a>, <a href="' + UI.homeUrl('/privacy-policy') + '" target="_blank" rel="noopener noreferrer" class="sh-co-link" style="color:#800000;text-decoration:none">Privacy Policy</a> &amp; <a href="' + UI.homeUrl('/refund-policy') + '" target="_blank" rel="noopener noreferrer" class="sh-co-link" style="color:#800000;text-decoration:none">Refund and Return Policy</a>.</span></label>' +
			'<p data-co-terms-err class="text-red-500 text-xs mb-3" style="display:none">You must accept the terms to continue.</p><p data-co-hint class="text-xs mb-3" style="color:#aaa">Please select a district to enable the order button.</p>' +
			'<button type="submit" data-co-place class="w-full flex items-center justify-center gap-2 transition-colors" style="height:50px;background:#ccc;color:white;border:none;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:0.5px;cursor:not-allowed;margin-top:4px" disabled>PLACE ORDER</button></div>' +
			'</div></div></form></div></div>';
		var n = root.querySelector('[name=notes]'); n.value = notes; 
		return true;
	}
	function refreshItems() {
		var box = root.querySelector('[data-co-items]'); if (box) box.innerHTML = itemsHtml();
	}

	var couponTimer = null;
	function applyCoupon(code) {
		if (!code.trim()) return Promise.resolve();
		state.couponApplying = true; state.couponMsg = null; updateCouponBtn();
		return fetch(SH.restUrl + 'coupons/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: code.trim(), subtotal: Cart.subtotal }) })
			.then(function (r) { return r.json(); })
			.then(function (d) {
				if (d.valid) { state.coupon = { code: d.code, discount: d.discount }; state.couponMsg = null; }
				else { state.coupon = null; state.couponMsg = d.message || 'Invalid coupon code.'; }
			}).catch(function () { state.coupon = null; state.couponMsg = 'Could not verify coupon. Please try again.'; })
			.then(function () { state.couponApplying = false; updateSummary(); var m = root.querySelector('[data-co-coupon-msg]'); if (m && state.couponMsg) { m.textContent = state.couponMsg; m.style.display = ''; } });
	}
	function updateCouponBtn() {
		var b = root.querySelector('[data-co-coupon-apply]'), i = root.querySelector('[data-co-coupon]'); if (!b || !i) return;
		var dis = state.couponApplying || !i.value.trim();
		b.disabled = dis; b.style.background = dis ? '#b08080' : '#800000'; b.style.cursor = dis ? 'not-allowed' : 'pointer'; b.textContent = state.couponApplying ? 'Checking...' : 'Apply';
	}

	function submit(e) {
		e.preventDefault();
		state.submitted = true;
		['customerName', 'phone', 'houseAddress', 'district'].forEach(validateField);
		if (Object.keys(errors).length) return;
		if (!state.terms) { state.termsError = true; updateSummary(); return; }
		if (state.submitting) return;
		state.submitting = true; updateSummary();
		var items = Cart.items.map(function (i) { return { productId: i.productId, productTitle: i.title, productImage: i.image, price: i.price, quantity: i.quantity, lineTotal: i.price * i.quantity }; });
		var address = [val('houseAddress'), state.thana, state.district].filter(Boolean).join(', ');
		var c = computed();
		var payload = { customerName: val('customerName'), phone: val('phone'), address: address, district: state.district, notes: val('notes') || '', subtotal: c.sub, deliveryCharge: c.del, total: c.total, couponCode: state.coupon ? state.coupon.code : null, paymentMethod: 'COD', items: items, eventSourceUrl: location.href };
		fetch(SH.restUrl + 'orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
			.then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
			.then(function (x) {
				if (!x.ok || !x.d.success) { UI.toast.error(x.d.error || 'Something went wrong. Please try again.'); return; }
				var saved = Object.assign({}, payload, { orderNumber: x.d.orderNumber, id: x.d.orderId, subtotal: x.d.subtotal, deliveryCharge: x.d.deliveryCharge, total: x.d.total });
				try { localStorage.setItem('sh_last_order', JSON.stringify(saved)); } catch (err) { /* ignore */ }
				Cart.clear();
				UI.toast.success('Order placed successfully!');
				location.href = UI.homeUrl('/thank-you?order=' + encodeURIComponent(x.d.orderNumber));
			})
			.catch(function () { UI.toast.error('Something went wrong. Please try again.'); })
			.then(function () { state.submitting = false; updateSummary(); });
	}

	/* wiring */
	selectHandlers();
	root.addEventListener('click', function (e) {
		var t = e.target;
		var rm = t.closest('[data-co-rm]'), dec = t.closest('[data-co-dec]'), inc = t.closest('[data-co-inc]');
		if (rm) { Cart.remove(rm.getAttribute('data-co-rm')); return; }
		if (dec) { var d = Cart.find(dec.getAttribute('data-co-dec')); if (d) Cart.setQty(d.productId, d.quantity - 1); return; }
		if (inc) { var i = Cart.find(inc.getAttribute('data-co-inc')); if (i) Cart.setQty(i.productId, i.quantity + 1); return; }
		if (t.closest('[data-co-coupon-toggle]')) { state.couponOpen = !state.couponOpen; root.querySelector('[data-co-coupon-chev]').innerHTML = icon(state.couponOpen ? 'chevron-up' : 'chevron-down', 16); updateSummary(); return; }
		if (t.closest('[data-co-coupon-apply]')) { applyCoupon(root.querySelector('[data-co-coupon]').value); return; }
		if (t.closest('[data-co-coupon-remove]')) { state.coupon = null; state.couponMsg = null; updateSummary(); return; }
	});
	root.addEventListener('input', function (e) {
		var t = e.target;
		if (t.matches('[data-co-coupon]')) { t.value = t.value.toUpperCase(); updateCouponBtn(); return; }
		if (t.name === 'notes') { root.querySelector('[data-co-notes-count]').textContent = t.value.length + ' / 90 characters'; return; }
		if (state.submitted && t.name && ['customerName', 'phone', 'houseAddress'].indexOf(t.name) > -1) validateField(t.name);
	});
	root.addEventListener('change', function (e) {
		if (e.target.matches('[data-co-terms]')) { state.terms = e.target.checked; if (state.terms) state.termsError = false; updateSummary(); }
	});
	root.addEventListener('submit', function (e) { if (e.target.id === 'sh-co-form') submit(e); });
	root.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.matches('[data-co-coupon]')) { e.preventDefault(); applyCoupon(e.target.value); } });

	var lastSub = null, lastLen = -1;
	Cart.on(function () {
		if (state.submitting) return; // order in flight: keep the page until the redirect
		if (!Cart.items.length) { emptyCart(); return; }
		if (!root.querySelector('#sh-co-form')) { start(); return; }
		refreshItems(); updateSummary();
		if (state.coupon && Cart.subtotal !== lastSub && Cart.subtotal > 0) applyCoupon(state.coupon.code);
		lastSub = Cart.subtotal;
	});
	function start() {
		if (!build()) return;
		refreshItems(); draw(); updateSummary();
		lastSub = Cart.subtotal;
		if (!trackedInit && Cart.items.length) {
			trackedInit = true;
			window.ShTrack.event('InitiateCheckout', { content_type: 'product', content_ids: Cart.items.map(function (i) { return i.productId; }), contents: Cart.items.map(function (i) { return { id: i.productId, quantity: i.quantity, item_price: i.price }; }), num_items: Cart.items.reduce(function (n, i) { return n + i.quantity; }, 0), value: Cart.subtotal, currency: 'BDT' });
		}
	}
	start();
})();
