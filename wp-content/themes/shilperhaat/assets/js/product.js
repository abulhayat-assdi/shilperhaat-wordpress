/* Product page behaviours: gallery + lightbox, quantity/add-to-cart, WhatsApp/call, tabs, review form, Meta ViewContent.
 * Ports of components/product/{ProductGallery,AddToCartSection,ProductTabs,ProductViewTracker}.tsx. */
(function () {
	'use strict';
	var SH = window.SH || {}, UI = window.ShUI, Cart = window.ShCart;
	var root = document.getElementById('sh-product');
	if (!root) return;
	var $ = function (s, r) { return (r || document).querySelector(s); };
	var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
	var esc = UI.esc, icon = UI.icon;
	var P = {
		id: root.dataset.id, title: root.dataset.title, price: Number(root.dataset.price),
		compare: root.dataset.compare ? Number(root.dataset.compare) : null, stock: Number(root.dataset.stock),
		slug: root.dataset.slug, image: root.dataset.image
	};
	function cartItem() { return { id: P.id, productId: P.id, title: P.title, price: P.price, compareAtPrice: P.compare, image: P.image || null, stock: P.stock, slug: P.slug }; }

	/* ── Meta ViewContent ── */
	window.ShTrack.event('ViewContent', { content_type: 'product', content_ids: [P.id], content_name: P.title, value: P.price, currency: 'BDT' });
	function trackAdd(qty) {
		window.ShTrack.event('AddToCart', { content_type: 'product', content_ids: [P.id], content_name: P.title, contents: [{ id: P.id, quantity: qty, item_price: P.price }], value: P.price * qty, currency: 'BDT' });
	}

	/* ── Gallery ── */
	var gal = document.getElementById('sh-gallery');
	if (gal && gal.dataset.media) {
		var media = JSON.parse(gal.dataset.media), idx = 0, title = gal.dataset.title;
		var main = $('[data-gal-main]', gal);
		var setThumbs = function () {
			$$('[data-gal-thumb]', gal).forEach(function (b) {
				b.style.border = Number(b.dataset.galThumb) === idx ? '2px solid #800000' : '2px solid #eee';
			});
		};
		var renderMain = function () {
			var m = media[idx];
			$$('[data-gal-img],[data-gal-video],[data-gal-zoom]', main).forEach(function (n) { n.parentNode.removeChild(n); });
			var h = '';
			if (m.type === 'video') {
				h = '<div data-gal-video class="w-full" style="cursor:default">' + (m.youtubeVideoId
					? '<iframe src="https://www.youtube.com/embed/' + esc(m.youtubeVideoId) + '?autoplay=1&rel=0&modestbranding=1" title="Product video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-full rounded" style="border:none;min-height:340px"></iframe>'
					: '<video src="' + esc(m.videoUrl) + '" controls autoplay class="w-full rounded object-contain" style="max-height:380px;background:#000"></video>') + '</div>';
			} else {
				h = '<div data-gal-img class="gallery-fade absolute inset-0 flex items-center justify-center cursor-zoom-in"><img src="' + esc(m.url) + '" alt="' + esc(m.alt || (title + ' — image ' + (idx + 1))) + '" class="object-contain transition-transform duration-300 hover:scale-[1.03]" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" onerror="' + esc(UI.onerr) + '"></div>' +
					'<div data-gal-zoom class="absolute bottom-3 right-3 flex items-center justify-center pointer-events-none" style="background-color:rgba(255,255,255,0.85);border-radius:50%;width:30px;height:30px;z-index:10">' + icon('zoom-in', 14, 'color:#666') + '</div>';
			}
			main.insertAdjacentHTML('afterbegin', h);
			setThumbs();
		};
		var go = function (i) { idx = (i + media.length) % media.length; renderMain(); };
		gal.addEventListener('click', function (e) {
			var t = e.target.closest('[data-gal-thumb]');
			if (t) { go(Number(t.dataset.galThumb)); return; }
			if (e.target.closest('[data-gal-prev]')) { e.stopPropagation(); go(idx - 1); return; }
			if (e.target.closest('[data-gal-next]')) { e.stopPropagation(); go(idx + 1); return; }
			if (e.target.closest('[data-gal-img]') && media[idx].type === 'image') openLightbox();
		});
		var lb = null;
		var openLightbox = function () {
			if (lb) lb.parentNode.removeChild(lb);
			lb = document.createElement('div');
			lb.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4';
			lb.style.backgroundColor = 'rgba(0,0,0,0.9)';
			var draw = function () {
				var m = media[idx];
				var multi = media.length > 1;
				lb.innerHTML = '<div class="relative max-w-3xl w-full" data-lb-box>' +
					(m.type === 'image' ? '<img src="' + esc(m.url) + '" alt="' + esc(m.alt || title) + '" width="800" height="800" class="object-contain w-full rounded-lg" style="max-height:80vh">' : '') +
					'<button type="button" data-lb-close class="absolute flex items-center justify-center" style="top:-12px;right:-12px;background-color:#FFFFFF;color:#222831;border-radius:50%;width:32px;height:32px;border:none;cursor:pointer;font-size:14px;font-weight:700">✕</button>' +
					(multi ? '<button type="button" data-lb-prev class="absolute top-1/2 -translate-y-1/2 flex items-center justify-center" style="left:8px;background-color:rgba(255,255,255,0.8);border:none;width:36px;height:36px;border-radius:50%;cursor:pointer">' + icon('chevron-left', 20) + '</button>' +
						'<button type="button" data-lb-next class="absolute top-1/2 -translate-y-1/2 flex items-center justify-center" style="right:8px;background-color:rgba(255,255,255,0.8);border:none;width:36px;height:36px;border-radius:50%;cursor:pointer">' + icon('chevron-right', 20) + '</button>' : '') + '</div>';
			};
			draw();
			lb.addEventListener('click', function (e) {
				if (e.target.closest('[data-lb-close]') || e.target === lb) { lb.parentNode.removeChild(lb); lb = null; renderMain(); return; }
				if (e.target.closest('[data-lb-prev]')) { idx = (idx - 1 + media.length) % media.length; draw(); }
				else if (e.target.closest('[data-lb-next]')) { idx = (idx + 1) % media.length; draw(); }
			});
			document.body.appendChild(lb);
		};
	}

	/* ── Quantity + actions ── */
	var qty = 1;
	var qv = $('[data-qty-val]', root), dec = $('[data-qty-dec]', root), inc = $('[data-qty-inc]', root);
	function maxQty() { var ci = Cart.find(P.id); return P.stock - (ci ? ci.quantity : 0); }
	function syncQty() {
		if (!qv) return;
		qv.textContent = qty;
		var dis = qty <= 1; dec.disabled = dis; dec.style.color = dis ? '#ccc' : '#333'; dec.style.cursor = dis ? 'not-allowed' : 'pointer';
		var mx = qty >= maxQty(); inc.disabled = mx; inc.style.color = mx ? '#ccc' : '#333'; inc.style.cursor = mx ? 'not-allowed' : 'pointer';
	}
	if (qv) {
		dec.addEventListener('click', function () { qty = Math.max(qty - 1, 1); syncQty(); });
		inc.addEventListener('click', function () { qty = Math.min(qty + 1, maxQty()); syncQty(); });
		Cart.on(syncQty); syncQty();
	}
	var addBtn = $('[data-act=add]', root), addTimer = null;
	function addToCart() {
		if (P.stock === 0) return;
		var ci = Cart.find(P.id);
		if (!ci) { Cart.add(cartItem()); if (qty > 1) Cart.setQty(P.id, qty); }
		else { Cart.setQty(P.id, ci.quantity + qty); }
		trackAdd(qty);
		UI.toast.success(qty + '× "' + P.title + '" added to cart');
		if (addBtn) {
			addBtn.classList.add('is-added');
			$('[data-add-inner]', addBtn).innerHTML = icon('check', 16) + 'Added';
			clearTimeout(addTimer);
			addTimer = setTimeout(function () { addBtn.classList.remove('is-added'); $('[data-add-inner]', addBtn).innerHTML = icon('shopping-cart', 16) + 'Add To Cart'; }, 2000);
		}
	}
	function pick(primary, fallback, def) {
		var DEF = def;
		return primary && primary.indexOf('XXXXXXXX') === -1 && primary !== DEF ? primary : (fallback && fallback !== '01700000000' ? fallback : (primary && primary.indexOf('XXXXXXXX') === -1 ? primary : (fallback || '')));
	}
	function waUrl(raw, msg) {
		var m = msg ? '?text=' + encodeURIComponent(msg) : '';
		raw = (raw || '').trim();
		if (!raw) return 'https://wa.me/' + m;
		if (/x/i.test(raw)) return 'https://wa.me/8801700000000' + m;
		var d = raw.replace(/[^0-9]/g, '');
		var num = function (x) { return (x.indexOf('01') === 0 && x.length === 11) ? '88' + x : ((x.charAt(0) === '1' && x.length === 10) ? '880' + x : x); };
		if (/^https?:\/\//.test(raw)) { if (d.length >= 8) return 'https://wa.me/' + num(d) + m; return msg ? raw + (raw.indexOf('?') > -1 ? '&' : '?') + 'text=' + encodeURIComponent(msg) : raw; }
		return d ? 'https://wa.me/' + num(d) + m : 'https://wa.me/' + m;
	}
	root.addEventListener('click', function (e) {
		var b = e.target.closest('[data-act]');
		if (!b) return;
		var a = b.dataset.act;
		if (a === 'add') addToCart();
		else if (a === 'buy') { addToCart(); location.href = UI.homeUrl('/checkout'); }
		else if (a === 'wa') {
			var target = pick((SH.contact || {}).whatsappUrl, (SH.layout || {}).whatsappNumber, 'https://wa.me/8801700000000');
			var msg = 'Hi! I want to order: ' + P.title + '\nPrice: ' + UI.fmt(P.price) + '\nQty: ' + qty + '\nLink: ' + location.href;
			window.open(waUrl(target, msg), '_blank');
		} else if (a === 'call') {
			var t = pick((SH.contact || {}).phoneNumber, (SH.layout || {}).phone, '01700000000');
			var clean = (t || '').trim();
			location.href = !clean ? 'tel:' : (/x/i.test(clean) ? 'tel:01700000000' : 'tel:' + clean.replace(/[\s\-\(\)]/g, ''));
		}
	});
	var sticky = $('[data-act=sticky-add]');
	if (sticky && !sticky.disabled) sticky.addEventListener('click', function () {
		if (P.stock === 0) return;
		Cart.add(cartItem()); trackAdd(1); UI.toast.success('"' + P.title + '" added to cart');
	});

	/* ── Tabs ── */
	var tabs = document.getElementById('sh-tabs');
	if (tabs) {
		var setTab = function (name) {
			$$('[data-tab]', tabs).forEach(function (b) {
				var on = b.dataset.tab === name;
				b.style.fontWeight = on ? '600' : '400'; b.style.color = on ? '#800000' : '#666'; b.style.borderColor = on ? '#800000' : 'transparent';
			});
			$$('[data-panel]', tabs).forEach(function (p) { p.style.display = p.dataset.panel === name ? '' : 'none'; });
		};
		tabs.addEventListener('click', function (e) { var t = e.target.closest('[data-tab]'); if (t) setTab(t.dataset.tab); });

		/* review form */
		var form = $('[data-review-form]', tabs), msg = $('[data-review-msg]', tabs), openBtn = $('[data-review-open]', tabs);
		var rating = 5;
		var paint = function () {
			$$('[data-rate]', form).forEach(function (b) {
				var on = Number(b.dataset.rate) <= rating, s = $('svg', b);
				s.style.color = on ? '#f59e0b' : '#ccc'; s.style.fill = on ? '#f59e0b' : 'none';
			});
		};
		var showMsg = function (type, text) {
			msg.style.cssText = 'padding:12px 16px;border-radius:8px;margin-bottom:16px;font-size:13px;background-color:' + (type === 'success' ? '#f0fdf4' : '#fef2f2') + ';border:1px solid ' + (type === 'success' ? '#bbf7d0' : '#fecaca') + ';color:' + (type === 'success' ? '#15803d' : '#b91c1c');
			msg.textContent = text;
		};
		openBtn.addEventListener('click', function () { form.style.display = 'block'; openBtn.style.display = 'none'; msg.style.display = 'none'; paint(); });
		$('[data-review-cancel]', form).addEventListener('click', function () { form.style.display = 'none'; openBtn.style.display = ''; });
		form.addEventListener('click', function (e) { var r = e.target.closest('[data-rate]'); if (r) { rating = Number(r.dataset.rate); paint(); } });
		form.addEventListener('submit', function (e) {
			e.preventDefault();
			var btn = $('[data-review-submit]', form);
			if (btn.disabled) return;
			btn.disabled = true; btn.textContent = 'Submitting...'; btn.style.opacity = '.7'; btn.style.cursor = 'wait'; msg.style.display = 'none';
			fetch(SH.restUrl + 'reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: tabs.dataset.product, name: form.elements.name.value, rating: rating, content: form.elements.content.value, website: form.elements.website.value }) })
				.then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
				.then(function (x) {
					if (!x.ok) showMsg('error', x.d.error || 'Failed to submit review. Please try again.');
					else { showMsg('success', 'Thank you! Your review has been submitted and will appear after approval.'); form.reset(); rating = 5; form.style.display = 'none'; openBtn.style.display = ''; }
					msg.style.display = 'block';
				})
				.catch(function () { showMsg('error', 'Failed to submit review. Please try again.'); msg.style.display = 'block'; })
				.then(function () { btn.disabled = false; btn.textContent = 'Submit Review'; btn.style.opacity = '1'; btn.style.cursor = 'pointer'; });
		});
	}
})();
