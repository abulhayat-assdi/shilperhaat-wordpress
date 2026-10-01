/* Cart drawer + cart page + Meta tracking helper.
   Ports CartDrawer.tsx / CartPageClient.tsx / cart-context.tsx / fbpixel.ts. */
(function () {
  'use strict';
  var SHX = window.SH || {};
  var Cart = window.shCart;
  var D = SHX.delivery || { deliveryCharge: 80, freeDeliveryMin: 2000 };
  var $ = function (sel, r) { return (r || document).querySelector(sel); };

  /* ── helpers ── */
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function fmt(n) { return '৳' + Math.round(Number(n) || 0).toLocaleString('en-US'); }
  function icon(name, size, style, stroke) {
    var p = (SHX.iconPaths || {})[name] || '';
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (stroke || 2) + '" stroke-linecap="round" stroke-linejoin="round"' + (style ? ' style="' + style + '"' : '') + ' aria-hidden="true">' + p + '</svg>';
  }
  function imgUrl(u) { return u || SHX.placeholder || ''; }
  function url(path) { return (SHX.home || '/') + path.replace(/^\//, ''); }
  window.shUi = { esc: esc, fmt: fmt, icon: icon, imgUrl: imgUrl, url: url };

  /* Port of computeCart() */
  function compute(items) {
    var subtotal = items.reduce(function (s, i) { return s + i.price * i.quantity; }, 0);
    var delivery = (D.freeDeliveryMin !== null && subtotal >= D.freeDeliveryMin) ? 0 : (items.length > 0 ? D.deliveryCharge : 0);
    return { items: items, subtotal: subtotal, deliveryCharge: delivery, total: subtotal + delivery };
  }
  window.shCompute = compute;

  /* Cart mutations (reducer rules from cart-context.tsx) */
  Cart.update = function (productId, quantity) {
    var items = Cart.items();
    if (quantity <= 0) { items = items.filter(function (i) { return i.productId !== productId; }); }
    else { items.forEach(function (i) { if (i.productId === productId) i.quantity = Math.min(quantity, i.stock); }); }
    Cart.save(items);
  };
  Cart.remove = function (productId) { Cart.save(Cart.items().filter(function (i) { return i.productId !== productId; })); };
  Cart.clear = function () { Cart.save([]); };

  /* ── Meta Pixel + Conversions API (deduplicated through a shared event_id) ── */
  function newEventId(prefix) { return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10); }
  function fbq(name, data, eventId) {
    if (typeof window.fbq !== 'function') return;
    if (eventId) { window.fbq('track', name, data || {}, { eventID: eventId }); } else { window.fbq('track', name, data || {}); }
  }
  window.shTrack = function (name, data) {
    var id = newEventId(name.toLowerCase());
    fbq(name, data, id);
    try {
      fetch(SHX.rest + 'meta/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
        body: JSON.stringify({ eventName: name, eventId: id, eventSourceUrl: window.location.href, customData: data }) }).catch(function () {});
    } catch (e) {}
  };
  window.shTrackPurchasePixel = function (orderNumber, data) { fbq('Purchase', data, 'purchase_' + orderNumber); };
  // SPA-style PageView is not needed: every navigation is a full page load (base snippet fires PageView).

  /* ── Remove confirmation dialog ── */
  function confirmDialog(title, variant, onYes) {
    var wrap = document.createElement('div');
    wrap.className = 'fixed inset-0 z-[200] flex items-center justify-center';
    wrap.style.backgroundColor = 'rgba(0,0,0,0.45)';
    var msg = '“' + esc(title) + '” কার্ট থেকে সরিয়ে দেবেন?';
    if (variant === 'drawer') {
      wrap.innerHTML = '<div data-box style="background-color:#fff;border-radius:12px;padding:28px 28px 22px;max-width:320px;width:90%;box-shadow:0 8px 32px rgba(128,0,0,0.18);border:2px solid #800000;text-align:center">' +
        '<div style="width:48px;height:48px;border-radius:50%;background-color:#fff0f0;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;border:2px solid #800000">' + icon('trash-2', 22, 'color:#800000') + '</div>' +
        '<h3 style="font-size:16px;font-weight:700;color:#1a1208;margin-bottom:8px;font-family:\'Open Sans\',sans-serif">Remove Item?</h3>' +
        '<p style="font-size:13px;color:#7a6045;margin-bottom:20px;line-height:1.5;font-family:\'Open Sans\',sans-serif">' + msg + '</p>' +
        '<div style="display:flex;gap:10px"><button data-no style="flex:1;padding:10px 0;border:2px solid #800000;border-radius:8px;background-color:#fff;color:#800000;font-size:14px;font-weight:700;cursor:pointer;font-family:\'Open Sans\',sans-serif">No</button>' +
        '<button data-yes style="flex:1;padding:10px 0;background-color:#800000;border:2px solid #800000;border-radius:8px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:\'Open Sans\',sans-serif">Yes, Remove</button></div></div>';
    } else {
      wrap.innerHTML = '<div data-box class="bg-white rounded-xl p-7 text-center" style="max-width:320px;width:90%;box-shadow:0 8px 32px rgba(128,0,0,0.18);border:2px solid #800000">' +
        '<div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style="background-color:#fff0f0;border:2px solid #800000">' + icon('trash-2', 22, 'color:#800000') + '</div>' +
        '<h3 class="text-base font-bold text-[#1a1208] mb-2">Remove Item?</h3>' +
        '<p class="text-sm text-[#7a6045] mb-5 leading-relaxed">' + msg + '</p>' +
        '<div class="flex gap-3"><button data-no class="flex-1 py-2.5 rounded-lg font-bold text-sm border-2 border-[#800000] text-[#800000] bg-white hover:bg-[#fff0f0] transition-colors">No</button>' +
        '<button data-yes class="flex-1 py-2.5 rounded-lg font-bold text-sm bg-[#800000] text-white hover:bg-[#5C0000] transition-colors">Yes, Remove</button></div></div>';
    }
    wrap.addEventListener('click', function (e) {
      if (e.target.closest('[data-yes]')) { wrap.remove(); onYes(); }
      else if (e.target.closest('[data-no]') || !e.target.closest('[data-box]')) { wrap.remove(); }
    });
    document.body.appendChild(wrap);
  }

  /* ═════════ Drawer ═════════ */
  var drawerRoot = null;
  function closeDrawer() {
    if (drawerRoot) { drawerRoot.remove(); drawerRoot = null; }
    document.body.style.overflow = '';
  }
  function drawerHtml(c) {
    var items = c.items;
    var head = '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #eee;flex-shrink:0;background-color:#fff">' +
      '<h2 style="font-size:18px;font-weight:700;color:#222;font-family:\'Open Sans\',sans-serif">Your Cart' +
      (items.length > 0 ? '<span style="margin-left:8px;font-size:13px;font-weight:600;background-color:#800000;color:#fff;padding:2px 8px;border-radius:20px">' + items.length + '</span>' : '') + '</h2>' +
      '<button data-close aria-label="Close cart" style="background:none;border:none;cursor:pointer;padding:6px;color:#555;display:flex;align-items:center;justify-content:center">' + icon('x', 22) + '</button></div>';
    var body;
    if (!items.length) {
      body = '<div style="text-align:center;padding:60px 20px">' + icon('shopping-bag', 56, 'color:#ddd;margin-bottom:16px') +
        '<h3 style="font-size:18px;font-weight:700;color:#222;margin-bottom:8px;font-family:\'Open Sans\',sans-serif">Your cart is empty</h3>' +
        '<p style="font-size:13px;color:#888;margin-bottom:24px;font-family:\'Open Sans\',sans-serif">Browse our collection and add items you love.</p>' +
        '<a href="' + url('shop') + '" data-close style="display:inline-block;background-color:#800000;color:#fff;padding:11px 28px;border-radius:4px;font-size:14px;font-weight:600;text-decoration:none;font-family:\'Open Sans\',sans-serif">Continue Shopping</a></div>';
    } else {
      body = '<div style="display:flex;flex-direction:column;gap:10px">' + items.map(function (it) {
        var maxed = it.quantity >= it.stock;
        return '<div style="display:flex;align-items:flex-start;gap:12px;padding:12px 14px;background-color:#fff;border:1px solid #eee;border-radius:8px">' +
          '<a href="' + url('product/' + it.slug) + '"><div style="width:64px;height:64px;border-radius:6px;overflow:hidden;flex-shrink:0;background-color:#f9f9f9;border:1px solid #eee;position:relative"><img src="' + esc(imgUrl(it.image)) + '" alt="' + esc(it.title) + '" class="object-cover" style="position:absolute;inset:0;width:100%;height:100%" onerror="this.onerror=null;this.src=\'' + esc(SHX.placeholder) + '\'"></div></a>' +
          '<div style="flex:1;min-width:0"><a href="' + url('product/' + it.slug) + '" style="text-decoration:none"><p class="line-clamp-2" style="font-size:13px;font-weight:600;color:#222;line-height:1.4;font-family:\'Open Sans\',sans-serif">' + esc(it.title) + '</p></a>' +
          '<p style="font-size:14px;font-weight:700;color:#800000;margin-top:4px;font-family:\'Open Sans\',sans-serif">' + fmt(it.price) + '</p>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px"><div style="display:flex;align-items:center;border:1px solid #ddd;border-radius:4px;overflow:hidden">' +
          '<button data-dec="' + esc(it.productId) + '" aria-label="Decrease" style="width:28px;height:28px;border:none;background-color:#f9f9f9;cursor:pointer;display:flex;align-items:center;justify-content:center;border-right:1px solid #ddd">' + icon('minus', 12) + '</button>' +
          '<span style="width:32px;height:28px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:#222">' + it.quantity + '</span>' +
          '<button data-inc="' + esc(it.productId) + '" ' + (maxed ? 'disabled' : '') + ' aria-label="Increase" style="width:28px;height:28px;border:none;background-color:#f9f9f9;cursor:' + (maxed ? 'not-allowed' : 'pointer') + ';display:flex;align-items:center;justify-content:center;border-left:1px solid #ddd;opacity:' + (maxed ? 0.4 : 1) + '">' + icon('plus', 12) + '</button></div>' +
          '<button data-rm="' + esc(it.productId) + '" data-title="' + esc(it.title) + '" aria-label="Remove item" style="background:none;border:none;cursor:pointer;color:#e53935;padding:4px;display:flex;align-items:center">' + icon('trash-2', 15) + '</button></div></div></div>';
      }).join('') + '</div>';
    }
    var foot = '';
    if (items.length) {
      foot = '<div style="flex-shrink:0;padding:14px 16px;border-top:1px solid #eee;background-color:#fff">' +
        '<div style="display:flex;justify-content:space-between;font-size:13px;color:#666;margin-bottom:4px;font-family:\'Open Sans\',sans-serif"><span>Subtotal</span><span>' + fmt(c.subtotal) + '</span></div>' +
        '<div style="display:flex;justify-content:space-between;font-size:13px;color:#666;margin-bottom:12px;font-family:\'Open Sans\',sans-serif"><span>Delivery</span><span style="color:' + (c.deliveryCharge === 0 ? '#16a34a' : '#666') + ';font-weight:' + (c.deliveryCharge === 0 ? 600 : 400) + '">' + (c.deliveryCharge === 0 ? 'Free' : fmt(c.deliveryCharge)) + '</span></div>' +
        '<div style="display:flex;justify-content:space-between;font-size:16px;font-weight:700;color:#222;margin-bottom:14px;font-family:\'Open Sans\',sans-serif;border-top:1px solid #eee;padding-top:10px"><span>Total</span><span style="color:#800000">' + fmt(c.total) + '</span></div>' +
        '<div style="display:flex;gap:10px"><a href="' + url('cart') + '" style="flex:1;padding:11px 0;border:2px solid #800000;border-radius:4px;background-color:#fff;color:#800000;font-size:14px;font-weight:600;text-align:center;text-decoration:none;font-family:\'Open Sans\',sans-serif;display:flex;align-items:center;justify-content:center">View Cart</a>' +
        '<a href="' + url('checkout') + '" style="flex:1;padding:11px 0;background-color:#800000;border-radius:4px;color:#fff;border:none;font-size:14px;font-weight:600;text-align:center;text-decoration:none;font-family:\'Open Sans\',sans-serif;display:flex;align-items:center;justify-content:center">Checkout</a></div></div>';
    }
    return '<div data-close class="fixed inset-0 z-[80]" style="background-color:rgba(0,0,0,0.5)" aria-hidden="true"></div>' +
      '<div class="fixed right-0 top-0 h-full z-[90] flex flex-col bg-white" style="width:100%;max-width:400px;box-shadow:-4px 0 24px rgba(0,0,0,0.15);animation:slideInRight 0.28s ease">' +
      head + '<div style="flex:1;overflow-y:auto;padding:12px 16px">' + body + '</div>' + foot + '</div>';
  }
  function renderDrawer() {
    if (!drawerRoot) return;
    var keep = drawerRoot.querySelector('.overflow-y-auto, [style*="overflow-y:auto"]');
    var scroll = keep ? keep.scrollTop : 0;
    drawerRoot.innerHTML = drawerHtml(compute(Cart.items()));
    var b = drawerRoot.querySelector('[style*="overflow-y:auto"]'); if (b) b.scrollTop = scroll;
  }
  function openDrawer() {
    if (drawerRoot) return;
    drawerRoot = document.createElement('div');
    drawerRoot.setAttribute('data-sh-drawer', '');
    drawerRoot.addEventListener('click', function (e) {
      var inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]'), rm = e.target.closest('[data-rm]');
      if (inc && !inc.disabled) { var it = Cart.items().filter(function (i) { return i.productId === inc.getAttribute('data-inc'); })[0]; if (it) Cart.update(it.productId, it.quantity + 1); return; }
      if (dec) { var it2 = Cart.items().filter(function (i) { return i.productId === dec.getAttribute('data-dec'); })[0]; if (it2) Cart.update(it2.productId, it2.quantity - 1); return; }
      if (rm) {
        var id = rm.getAttribute('data-rm'), t = rm.getAttribute('data-title');
        confirmDialog(t, 'drawer', function () { Cart.remove(id); window.shToast.info('"' + t + '" removed from cart'); });
        return;
      }
      if (e.target.closest('[data-close]')) closeDrawer();
    });
    document.body.appendChild(drawerRoot);
    document.body.style.overflow = 'hidden';
    renderDrawer();
  }
  document.addEventListener('sh:open-cart', openDrawer);
  document.addEventListener('sh:cart-changed', renderDrawer);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });

  /* ═════════ Cart page ═════════ */
  var page = $('[data-sh-cart-page]');
  if (page) {
    var renderPage = function () {
      var c = compute(Cart.items()), items = c.items;
      if (!items.length) {
        page.innerHTML = '<div class="flex flex-col items-center justify-center py-20 text-center px-4"><div class="text-7xl mb-4">🛒</div>' +
          '<h2 class="text-2xl font-bold text-[#1a1208] mb-2">Your cart is empty</h2>' +
          '<p class="text-[#7a6045] text-sm max-w-xs mb-8">You haven\'t added any products yet. Browse our collection and pick your favourites.</p>' +
          '<a href="' + url('shop') + '" class="flex items-center gap-2 bg-[#800000] text-white font-bold px-8 py-3.5 rounded-full hover:bg-[#5C0000] transition-colors">' + icon('shopping-bag', 18) + 'Start Shopping</a></div>';
        return;
      }
      var list = items.map(function (it) {
        var maxed = it.quantity >= it.stock;
        return '<div class="bg-white rounded-xl border border-[#f0e8d8] p-4 flex items-start gap-4 shadow-sm">' +
          '<a href="' + url('product/' + it.slug) + '"><div class="relative w-20 h-20 rounded-lg overflow-hidden bg-[#f0e8d8] flex-shrink-0"><img src="' + esc(imgUrl(it.image)) + '" alt="' + esc(it.title) + '" class="object-cover" style="position:absolute;inset:0;width:100%;height:100%" onerror="this.onerror=null;this.src=\'' + esc(SHX.placeholder) + '\'"></div></a>' +
          '<div class="flex-1 min-w-0"><a href="' + url('product/' + it.slug) + '"><h3 class="font-semibold text-[#1a1208] text-sm md:text-base line-clamp-2 hover:text-[#800000] transition-colors">' + esc(it.title) + '</h3></a>' +
          '<div class="flex items-center gap-2 mt-1"><span class="font-bold text-[#800000]">' + fmt(it.price) + '</span>' + (it.compareAtPrice ? '<span class="text-xs text-gray-400 line-through">' + fmt(it.compareAtPrice) + '</span>' : '') + '</div>' +
          '<div class="flex items-center justify-between mt-3"><div class="flex items-center border border-[#e0d0b0] rounded-lg overflow-hidden">' +
          '<button data-dec="' + esc(it.productId) + '" class="w-8 h-8 flex items-center justify-center text-[#4a2c0a] hover:bg-[#f0e8d8] transition-colors" aria-label="Decrease quantity">' + icon('minus', 14) + '</button>' +
          '<span class="w-8 text-center text-sm font-semibold text-[#1a1208]">' + it.quantity + '</span>' +
          '<button data-inc="' + esc(it.productId) + '" ' + (maxed ? 'disabled' : '') + ' class="w-8 h-8 flex items-center justify-center text-[#4a2c0a] hover:bg-[#f0e8d8] disabled:opacity-40 transition-colors" aria-label="Increase quantity">' + icon('plus', 14) + '</button></div>' +
          '<div class="flex items-center gap-3"><span class="text-sm font-bold text-[#1a1208]">' + fmt(it.price * it.quantity) + '</span>' +
          '<button data-rm="' + esc(it.productId) + '" data-title="' + esc(it.title) + '" class="text-red-400 hover:text-red-600 transition-colors" aria-label="Remove ' + esc(it.title) + '">' + icon('trash-2', 16) + '</button></div></div></div></div>';
      }).join('');
      var freeNote = (c.deliveryCharge > 0 && D.freeDeliveryMin) ? '<p class="text-xs text-[#7a6045] bg-[#fdf8f3] p-2 rounded-lg">Add ' + fmt(D.freeDeliveryMin - c.subtotal) + ' more to get free delivery!</p>' : '';
      page.innerHTML = '<div class="max-w-5xl mx-auto px-4 py-6"><h1 class="text-2xl md:text-3xl font-bold text-[#1a1208] mb-6">My Cart (' + items.length + ' ' + (items.length === 1 ? 'item' : 'items') + ')</h1>' +
        '<div class="flex flex-col lg:flex-row gap-6"><div class="flex-1 space-y-3">' + list +
        '<div class="pt-2"><a href="' + url('shop') + '" class="text-[#800000] text-sm font-medium hover:underline flex items-center gap-1">← Continue Shopping</a></div></div>' +
        '<div class="lg:w-80"><div class="bg-white rounded-xl border border-[#f0e8d8] p-5 shadow-sm sticky top-24"><h2 class="font-bold text-[#1a1208] text-lg mb-4">Order Summary</h2><div class="space-y-3 text-sm">' +
        '<div class="flex justify-between text-[#4a2c0a]"><span>Subtotal</span><span>' + fmt(c.subtotal) + '</span></div>' +
        '<div class="flex justify-between text-[#4a2c0a]"><span>Delivery Charge</span><span>' + (c.deliveryCharge === 0 ? '<span class="text-green-600 font-semibold">Free</span>' : fmt(c.deliveryCharge)) + '</span></div>' + freeNote +
        '<div class="border-t border-[#f0e8d8] pt-3"><div class="flex justify-between font-bold text-[#1a1208] text-base"><span>Total</span><span class="text-[#800000] text-lg">' + fmt(c.total) + '</span></div></div></div>' +
        '<a href="' + url('checkout') + '" class="mt-5 flex items-center justify-center gap-2 w-full bg-[#800000] hover:bg-[#5C0000] text-white font-bold py-4 rounded-xl transition-colors">Place Order' + icon('arrow-right', 18) + '</a>' +
        '<div class="mt-3 flex items-center justify-center gap-2 text-xs text-[#7a6045]"><span>🔒</span><span>Secure Cash on Delivery</span></div></div></div></div></div>';
    };
    page.addEventListener('click', function (e) {
      var inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]'), rm = e.target.closest('[data-rm]');
      if (inc && !inc.disabled) { var a = Cart.items().filter(function (i) { return i.productId === inc.getAttribute('data-inc'); })[0]; if (a) Cart.update(a.productId, a.quantity + 1); }
      else if (dec) { var b = Cart.items().filter(function (i) { return i.productId === dec.getAttribute('data-dec'); })[0]; if (b) Cart.update(b.productId, b.quantity - 1); }
      else if (rm) {
        var id = rm.getAttribute('data-rm'), t = rm.getAttribute('data-title');
        confirmDialog(t, 'page', function () { Cart.remove(id); window.shToast.info('"' + t + '" removed from cart'); });
      }
    });
    document.addEventListener('sh:cart-changed', renderPage);
    renderPage();
  }
})();
