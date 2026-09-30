/* Shilperhaat storefront core: cart store, toasts, cart drawer, header/menu/contact behaviours, Meta tracking.
 * Vanilla JS port of lib/cart-context.tsx, toast-context.tsx, components/cart/CartDrawer.tsx, layout/Header|MobileMenu|BottomNav,
 * ui/FloatingContact and lib/fbpixel.ts. Runtime config comes from window.SH (see functions.php). */
(function () {
	'use strict';
	var SH = window.SH || {};
	var $ = function (s, r) { return (r || document).querySelector(s); };
	var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
	var icon = window.ShIcon || function () { return ''; };

	function esc(s) {
		return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
	}
	function fmt(n) { return '৳' + Math.round(Number(n) || 0).toLocaleString('en-US'); }
	function homeUrl(p) { return (SH.home || '/').replace(/\/$/, '') + p; }
	function imgUrl(u) {
		if (!u) return SH.placeholder;
		if (/^(https?:)?\/\//.test(u) || u.indexOf('data:') === 0) return u;
		if (u.indexOf('/uploads/') === 0) return SH.uploadsBase + '/' + u.slice(9).split('/').map(encodeURIComponent).join('/');
		if (u.indexOf('/placeholder-product.svg') === 0) return SH.placeholder;
		return u;
	}
	var ONERR = "this.onerror=null;this.src='" + String(SH.placeholder || '').replace(/'/g, "\\'") + "'";

	/* ───────────── Toasts (lib/toast-context.tsx) ───────────── */
	var toastIcons = {
		success: icon('check-circle', 18, '', 'text-green-600'),
		error: icon('x-circle', 18, '', 'text-red-600'),
		warning: icon('alert-circle', 18, '', 'text-yellow-600'),
		info: icon('info', 18, '', 'text-blue-600')
	};
	var toastColors = {
		success: 'bg-white border-green-200 shadow-green-100',
		error: 'bg-white border-red-200 shadow-red-100',
		warning: 'bg-white border-yellow-200 shadow-yellow-100',
		info: 'bg-white border-blue-200 shadow-blue-100'
	};
	function addToast(type, message) {
		var box = $('#sh-toasts');
		if (!box) return;
		var el = document.createElement('div');
		el.className = 'flex items-start gap-3 p-3 rounded-xl border shadow-lg max-w-xs ' + toastColors[type];
		el.style.cssText = 'opacity:0;transform:translateX(60px) scale(0.9);transition:opacity 0.22s ease, transform 0.22s ease';
		el.innerHTML = '<div class="mt-0.5 flex-shrink-0">' + toastIcons[type] + '</div><p class="text-sm text-[#1a1208] flex-1 leading-snug">' + esc(message) +
			'</p><button type="button" class="text-gray-400 hover:text-gray-600 flex-shrink-0">' + icon('x', 14) + '</button>';
		box.appendChild(el);
		requestAnimationFrame(function () { el.style.opacity = '1'; el.style.transform = 'translateX(0) scale(1)'; });
		var rm = function () { if (el.parentNode) el.parentNode.removeChild(el); };
		el.querySelector('button').addEventListener('click', rm);
		setTimeout(rm, 3000);
	}
	var toast = {
		success: function (m) { addToast('success', m); },
		error: function (m) { addToast('error', m); },
		warning: function (m) { addToast('warning', m); },
		info: function (m) { addToast('info', m); }
	};

	/* ───────────── Cart store (lib/cart-context.tsx) ───────────── */
	var KEY = 'sh_cart';
	var cfg = SH.settings || { deliveryCharge: 0, freeDeliveryMin: 2000 };
	var listeners = [];
	var items = [];
	try { var saved = localStorage.getItem(KEY); if (saved) { var parsed = JSON.parse(saved); if (Array.isArray(parsed)) items = parsed; } } catch (e) { /* ignore */ }

	var Cart = {
		get items() { return items; },
		get count() { return items.length; },
		get subtotal() { return items.reduce(function (s, i) { return s + i.price * i.quantity; }, 0); },
		get deliveryCharge() {
			var sub = this.subtotal;
			if (cfg.freeDeliveryMin !== null && cfg.freeDeliveryMin !== undefined && sub >= cfg.freeDeliveryMin) return 0;
			return items.length > 0 ? cfg.deliveryCharge : 0;
		},
		get total() { return this.subtotal + this.deliveryCharge; },
		freeDeliveryMin: cfg.freeDeliveryMin,
		on: function (fn) { listeners.push(fn); },
		_commit: function () {
			try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* ignore */ }
			listeners.forEach(function (fn) { fn(items); });
			renderBadges();
		},
		add: function (it) {
			var ex = items.filter(function (i) { return i.productId === it.productId; })[0];
			if (ex) { ex.quantity = Math.min(ex.quantity + 1, ex.stock); }
			else { it.quantity = 1; items.push(it); }
			this._commit();
		},
		remove: function (id) { items = items.filter(function (i) { return i.productId !== id; }); this._commit(); },
		setQty: function (id, q) {
			if (q <= 0) { items = items.filter(function (i) { return i.productId !== id; }); }
			else { items.forEach(function (i) { if (i.productId === id) i.quantity = Math.min(q, i.stock); }); }
			this._commit();
		},
		clear: function () { items = []; this._commit(); },
		find: function (id) { return items.filter(function (i) { return i.productId === id; })[0]; }
	};
	window.ShCart = Cart;
	window.ShUI = { toast: toast, fmt: fmt, esc: esc, imgUrl: imgUrl, homeUrl: homeUrl, onerr: ONERR, icon: icon };

	function renderBadges() {
		var n = items.length;
		$$('[data-sh-cart-badge]').forEach(function (b) {
			if (n > 0) { b.textContent = n > 9 ? '9+' : String(n); b.hidden = false; } else { b.hidden = true; }
		});
		var has = n > 0;
		var bi = $('[data-sh-bn-cart-icon] svg');
		if (bi) { bi.style.color = has ? '#800000' : '#888888'; bi.setAttribute('stroke-width', has ? '2.5' : '1.75'); }
		var bl = $('[data-sh-bn-cart-label]');
		if (bl) { bl.style.color = has ? '#800000' : '#888888'; bl.style.fontWeight = has ? '600' : '400'; }
	}

	/* ───────────── Meta Pixel + CAPI (lib/fbpixel.ts) ───────────── */
	function newEventId(prefix) { return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10); }
	function fbq(eventName, data, eventId) {
		if (typeof window.fbq !== 'function') return;
		if (eventId) window.fbq('track', eventName, data || {}, { eventID: eventId }); else window.fbq('track', eventName, data || {});
	}
	function trackEvent(eventName, data) {
		var id = newEventId(eventName.toLowerCase());
		fbq(eventName, data, id);
		try {
			fetch(SH.restUrl + 'meta/track', {
				method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
				body: JSON.stringify({ eventName: eventName, eventId: id, eventSourceUrl: location.href, customData: data })
			}).catch(function () {});
		} catch (e) { /* ignore */ }
	}
	window.ShTrack = { event: trackEvent, fbq: fbq, currency: 'BDT' };

	/* ───────────── Cart drawer (components/cart/CartDrawer.tsx) ───────────── */
	var drawerEl = null, confirmItem = null;
	function drawerHtml() {
		var n = items.length, sub = Cart.subtotal, del = Cart.deliveryCharge, total = Cart.total;
		var h = '';
		if (confirmItem) {
			h += '<div data-dr-confirm-bg class="fixed inset-0 z-[200] flex items-center justify-center" style="background-color:rgba(0,0,0,0.45)">' +
				'<div data-dr-confirm style="background-color:#fff;border-radius:12px;padding:28px 28px 22px;max-width:320px;width:90%;box-shadow:0 8px 32px rgba(128,0,0,0.18);border:2px solid #800000;text-align:center">' +
				'<div style="width:48px;height:48px;border-radius:50%;background-color:#fff0f0;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;border:2px solid #800000">' + icon('trash-2', 22, '', '', { stroke: '#800000' }) + '</div>' +
				'<h3 style="font-size:16px;font-weight:700;color:#1a1208;margin-bottom:8px;font-family:\'Open Sans\',sans-serif">Remove Item?</h3>' +
				'<p style="font-size:13px;color:#7a6045;margin-bottom:20px;line-height:1.5;font-family:\'Open Sans\',sans-serif">“' + esc(confirmItem.title) + '” কার্ট থেকে সরিয়ে দেবেন?</p>' +
				'<div style="display:flex;gap:10px">' +
				'<button type="button" data-dr-no style="flex:1;padding:10px 0;border:2px solid #800000;border-radius:8px;background-color:#fff;color:#800000;font-size:14px;font-weight:700;cursor:pointer;font-family:\'Open Sans\',sans-serif">No</button>' +
				'<button type="button" data-dr-yes style="flex:1;padding:10px 0;background-color:#800000;border:2px solid #800000;border-radius:8px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:\'Open Sans\',sans-serif">Yes, Remove</button>' +
				'</div></div></div>';
		}
		h += '<div data-dr-overlay class="fixed inset-0 z-[80]" style="background-color:rgba(0,0,0,0.5)" aria-hidden="true"></div>';
		h += '<div class="fixed right-0 top-0 h-full z-[90] flex flex-col bg-white" style="width:100%;max-width:400px;box-shadow:-4px 0 24px rgba(0,0,0,0.15);animation:slideInRight 0.28s ease">';
		h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #eee;flex-shrink:0;background-color:#fff">' +
			'<h2 style="font-size:18px;font-weight:700;color:#222;font-family:\'Open Sans\',sans-serif">Your Cart' +
			(n > 0 ? '<span style="margin-left:8px;font-size:13px;font-weight:600;background-color:#800000;color:#fff;padding:2px 8px;border-radius:20px">' + n + '</span>' : '') + '</h2>' +
			'<button type="button" data-dr-close aria-label="Close cart" style="background:none;border:none;cursor:pointer;padding:6px;color:#555;display:flex;align-items:center;justify-content:center">' + icon('x', 22) + '</button></div>';
		h += '<div style="flex:1;overflow-y:auto;padding:12px 16px">';
		if (n === 0) {
			h += '<div style="text-align:center;padding:60px 20px">' + icon('shopping-bag', 56, 'color:#ddd;margin-bottom:16px') +
				'<h3 style="font-size:18px;font-weight:700;color:#222;margin-bottom:8px;font-family:\'Open Sans\',sans-serif">Your cart is empty</h3>' +
				'<p style="font-size:13px;color:#888;margin-bottom:24px;font-family:\'Open Sans\',sans-serif">Browse our collection and add items you love.</p>' +
				'<a href="' + homeUrl('/shop') + '" data-dr-close style="display:inline-block;background-color:#800000;color:#fff;padding:11px 28px;border-radius:4px;font-size:14px;font-weight:600;text-decoration:none;font-family:\'Open Sans\',sans-serif">Continue Shopping</a></div>';
		} else {
			h += '<div style="display:flex;flex-direction:column;gap:10px">';
			items.forEach(function (it) {
				var atMax = it.quantity >= it.stock;
				var pu = homeUrl('/product/' + encodeURIComponent(it.slug));
				h += '<div style="display:flex;align-items:flex-start;gap:12px;padding:12px 14px;background-color:#fff;border:1px solid #eee;border-radius:8px">' +
					'<a href="' + pu + '" data-dr-close><div style="width:64px;height:64px;border-radius:6px;overflow:hidden;flex-shrink:0;background-color:#f9f9f9;border:1px solid #eee;position:relative">' +
					'<img src="' + esc(imgUrl(it.image)) + '" alt="' + esc(it.title) + '" class="object-cover" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" onerror="' + esc(ONERR) + '"></div></a>' +
					'<div style="flex:1;min-width:0"><a href="' + pu + '" data-dr-close style="text-decoration:none"><p class="line-clamp-2" style="font-size:13px;font-weight:600;color:#222;line-height:1.4;font-family:\'Open Sans\',sans-serif">' + esc(it.title) + '</p></a>' +
					'<p style="font-size:14px;font-weight:700;color:#800000;margin-top:4px;font-family:\'Open Sans\',sans-serif">' + fmt(it.price) + '</p>' +
					'<div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px">' +
					'<div style="display:flex;align-items:center;border:1px solid #ddd;border-radius:4px;overflow:hidden">' +
					'<button type="button" data-dr-dec="' + esc(it.productId) + '" aria-label="Decrease" style="width:28px;height:28px;border:none;background-color:#f9f9f9;cursor:pointer;display:flex;align-items:center;justify-content:center;border-right:1px solid #ddd">' + icon('minus', 12) + '</button>' +
					'<span style="width:32px;height:28px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:#222">' + it.quantity + '</span>' +
					'<button type="button" data-dr-inc="' + esc(it.productId) + '"' + (atMax ? ' disabled' : '') + ' aria-label="Increase" style="width:28px;height:28px;border:none;background-color:#f9f9f9;cursor:' + (atMax ? 'not-allowed' : 'pointer') + ';display:flex;align-items:center;justify-content:center;border-left:1px solid #ddd;opacity:' + (atMax ? 0.4 : 1) + '">' + icon('plus', 12) + '</button></div>' +
					'<button type="button" data-dr-rm="' + esc(it.productId) + '" aria-label="Remove item" style="background:none;border:none;cursor:pointer;color:#e53935;padding:4px;display:flex;align-items:center">' + icon('trash-2', 15) + '</button>' +
					'</div></div></div>';
			});
			h += '</div>';
		}
		h += '</div>';
		if (n > 0) {
			h += '<div style="flex-shrink:0;padding:14px 16px;border-top:1px solid #eee;background-color:#fff">' +
				'<div style="display:flex;justify-content:space-between;font-size:13px;color:#666;margin-bottom:4px;font-family:\'Open Sans\',sans-serif"><span>Subtotal</span><span>' + fmt(sub) + '</span></div>' +
				'<div style="display:flex;justify-content:space-between;font-size:13px;color:#666;margin-bottom:12px;font-family:\'Open Sans\',sans-serif"><span>Delivery</span><span style="color:' + (del === 0 ? '#16a34a' : '#666') + ';font-weight:' + (del === 0 ? 600 : 400) + '">' + (del === 0 ? 'Free' : fmt(del)) + '</span></div>' +
				'<div style="display:flex;justify-content:space-between;font-size:16px;font-weight:700;color:#222;margin-bottom:14px;font-family:\'Open Sans\',sans-serif;border-top:1px solid #eee;padding-top:10px"><span>Total</span><span style="color:#800000">' + fmt(total) + '</span></div>' +
				'<div style="display:flex;gap:10px">' +
				'<a href="' + homeUrl('/cart') + '" style="flex:1;padding:11px 0;border:2px solid #800000;border-radius:4px;background-color:#fff;color:#800000;font-size:14px;font-weight:600;text-align:center;text-decoration:none;font-family:\'Open Sans\',sans-serif;display:flex;align-items:center;justify-content:center">View Cart</a>' +
				'<a href="' + homeUrl('/checkout') + '" style="flex:1;padding:11px 0;background-color:#800000;border-radius:4px;color:#fff;border:none;font-size:14px;font-weight:600;text-align:center;text-decoration:none;font-family:\'Open Sans\',sans-serif;display:flex;align-items:center;justify-content:center">Checkout</a>' +
				'</div></div>';
		}
		h += '</div>';
		return h;
	}
	function renderDrawer() { if (drawerEl) drawerEl.innerHTML = drawerHtml(); }
	function openDrawer() {
		if (drawerEl) return;
		drawerEl = document.createElement('div');
		drawerEl.id = 'sh-cart-drawer';
		document.body.appendChild(drawerEl);
		document.body.style.overflow = 'hidden';
		renderDrawer();
	}
	function closeDrawer() {
		if (!drawerEl) return;
		drawerEl.parentNode.removeChild(drawerEl);
		drawerEl = null; confirmItem = null;
		document.body.style.overflow = '';
	}
	Cart.on(function () { renderDrawer(); });
	document.addEventListener('click', function (e) {
		var t = e.target;
		var open = t.closest('[data-sh-open-cart]');
		if (open) { e.preventDefault(); openDrawer(); return; }
		if (!drawerEl) return;
		if (t.closest('[data-dr-close]') || (t.hasAttribute && t.hasAttribute('data-dr-overlay'))) { closeDrawer(); return; }
		if (t.closest('[data-dr-confirm]') && !t.closest('[data-dr-no]') && !t.closest('[data-dr-yes]')) return;
		if (t.closest('[data-dr-no]') || t.hasAttribute('data-dr-confirm-bg')) { confirmItem = null; renderDrawer(); return; }
		if (t.closest('[data-dr-yes]')) {
			toast.info('"' + confirmItem.title + '" removed from cart');
			var id = confirmItem.id; confirmItem = null; Cart.remove(id); return;
		}
		var dec = t.closest('[data-dr-dec]'), inc = t.closest('[data-dr-inc]'), rm = t.closest('[data-dr-rm]');
		if (dec) { var di = Cart.find(dec.getAttribute('data-dr-dec')); if (di) Cart.setQty(di.productId, di.quantity - 1); }
		else if (inc) { var ii = Cart.find(inc.getAttribute('data-dr-inc')); if (ii && ii.quantity < ii.stock) Cart.setQty(ii.productId, ii.quantity + 1); }
		else if (rm) { var ri = Cart.find(rm.getAttribute('data-dr-rm')); if (ri) { confirmItem = { id: ri.productId, title: ri.title }; renderDrawer(); } }
	});
	window.ShUI.openDrawer = openDrawer;

	/* ───────────── Add-to-cart buttons (ProductCard / TopSellingCard) ───────────── */
	function itemFromBtn(b) {
		var cmp = b.getAttribute('data-compare');
		return {
			id: b.getAttribute('data-id'), productId: b.getAttribute('data-id'), title: b.getAttribute('data-title'),
			price: Number(b.getAttribute('data-price')), compareAtPrice: cmp ? Number(cmp) : null,
			image: b.getAttribute('data-image'), stock: Number(b.getAttribute('data-stock')), slug: b.getAttribute('data-slug')
		};
	}
	window.ShUI.itemFromBtn = itemFromBtn;
	document.addEventListener('click', function (e) {
		var b = e.target.closest('[data-sh-add]');
		if (!b || b.hasAttribute('data-sh-page-add')) return;
		e.preventDefault(); e.stopPropagation();
		var it = itemFromBtn(b);
		if (it.stock === 0) { toast.error('This product is currently out of stock'); return; }
		Cart.add(it);
		if (b.getAttribute('data-buy')) { window.location.href = homeUrl('/checkout'); return; }
		toast.success('"' + it.title + '" added to cart');
	});
	// Buttons inside the top-selling <a> must not navigate.
	document.addEventListener('click', function (e) {
		if (e.target.closest('[data-sh-noclick]')) e.preventDefault();
	}, true);

	/* ───────────── Header: search, sticky nav, "More" menu ───────────── */
	$$('.sh-search-form').forEach(function (f) {
		f.addEventListener('submit', function (e) {
			var i = f.querySelector('input[name=search]');
			if (!i || !i.value.trim()) { e.preventDefault(); }
		});
	});
	var nav = $('#sh-nav'), mid = $('#sh-header-mid');
	if (nav) {
		var sticky = false;
		var onScroll = function () {
			var mh = mid ? mid.offsetHeight : 72;
			var s = window.scrollY > mh;
			if (s === sticky) return;
			sticky = s;
			nav.classList.toggle('is-sticky', s);
			document.body.style.paddingTop = s ? '48px' : '0';
		};
		window.addEventListener('scroll', onScroll, { passive: true });
	}
	var moreBtn = $('#sh-more-btn'), moreMenu = $('#sh-more-menu');
	if (moreBtn && moreMenu) {
		var setMore = function (open) {
			moreMenu.style.display = open ? 'block' : 'none';
			moreBtn.classList.toggle('is-open', open);
			moreBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
			$('.sh-more-ico-menu', moreBtn).style.display = open ? 'none' : '';
			$('.sh-more-ico-x', moreBtn).style.display = open ? '' : 'none';
		};
		moreBtn.addEventListener('click', function () { setMore(moreMenu.style.display === 'none'); });
		document.addEventListener('mousedown', function (e) { if (!$('#sh-more').contains(e.target)) setMore(false); });
		moreMenu.addEventListener('click', function (e) { if (e.target.closest('a')) setMore(false); });
	}

	/* ───────────── Mobile menu drawer ───────────── */
	var mm = $('#sh-mm'), mmBg = $('#sh-mm-backdrop');
	function setMenu(open) {
		if (!mm) return;
		mm.style.transform = open ? 'translateX(0)' : 'translateX(-100%)';
		mmBg.style.opacity = open ? '1' : '0';
		mmBg.style.pointerEvents = open ? 'auto' : 'none';
		document.body.style.overflow = open ? 'hidden' : '';
	}
	document.addEventListener('click', function (e) {
		if (e.target.closest('[data-sh-open-menu]')) setMenu(true);
		else if (e.target.closest('[data-sh-close-menu]') || e.target === mmBg || (mm && e.target.closest('#sh-mm a'))) setMenu(false);
	});

	/* ───────────── Floating contact widget ───────────── */
	var fc = $('#sh-fc');
	function setContact(open) { if (fc) fc.setAttribute('data-open', open ? '1' : '0'); }
	document.addEventListener('click', function (e) {
		if (!fc) return;
		if (e.target.closest('[data-sh-toggle-contact]')) setContact(fc.getAttribute('data-open') !== '1');
		else if (e.target.closest('[data-sh-close-contact]')) setContact(false);
		else if (e.target.closest('[data-sh-open-contact]')) setContact(true);
	});
	document.addEventListener('mousedown', function (e) {
		if (fc && fc.getAttribute('data-open') === '1' && !fc.contains(e.target) && !e.target.closest('[data-sh-open-contact]')) setContact(false);
	});

	renderBadges();
	window.addEventListener('storage', function (e) {
		if (e.key === KEY) {
			try { items = JSON.parse(e.newValue || '[]') || []; } catch (x) { items = []; }
			listeners.forEach(function (fn) { fn(items); });
			renderBadges();
		}
	});
})();
