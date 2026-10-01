/* Checkout + thank-you page behaviour. Ports CheckoutPageClient.tsx, SearchableSelect.tsx, ThankYouClient.tsx. */
(function () {
  'use strict';
  var SHX = window.SH || {};
  var Cart = window.shCart, ui = window.shUi;
  var esc = ui.esc, icon = ui.icon, url = ui.url;
  var $ = function (sel, r) { return (r || document).querySelector(sel); };
  var $$ = function (sel, r) { return Array.prototype.slice.call((r || document).querySelectorAll(sel)); };
  var fmtAmt = function (n) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var DISTRICTS = window.SH_DISTRICTS || [];

  /* ═════════ Searchable select ═════════ */
  function makeSelect(host, opts) {
    var state = { open: false, query: '', value: '', disabled: false, error: false, options: opts.options || [] };
    var placeholder = opts.placeholder || 'Select';
    host.style.position = 'relative'; host.style.width = '100%';
    function render() {
      var borderColor = state.error ? '#f87171' : (state.open ? '#800000' : '#e0e0e0');
      var q = state.query.trim().toLowerCase();
      var list = q ? state.options.filter(function (o) { return o.toLowerCase().indexOf(q) !== -1; }) : state.options;
      var html = '<button type="button" data-trigger ' + (state.disabled ? 'disabled' : '') + ' style="width:100%;height:42px;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 12px;background:' + (state.disabled ? '#f9f9f9' : 'white') + ';border:1px solid ' + borderColor + ';border-radius:6px;font-size:14px;color:' + (state.value ? '#333' : '#aaa') + ';cursor:' + (state.disabled ? 'not-allowed' : 'pointer') + ';text-align:left;transition:border-color 0.15s;box-sizing:border-box">' +
        '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(state.value || placeholder) + '</span>' +
        icon(state.open ? 'chevron-up' : 'chevron-down', 16, 'color:' + (state.open ? '#800000' : '#999') + ';flex-shrink:0') + '</button>';
      if (state.open) {
        html += '<div style="position:absolute;top:calc(100% + 4px);left:0;right:0;background:white;border:1px solid #e0e0e0;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,0.10);z-index:9999;overflow:hidden">' +
          '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid #f0f0f0">' + icon('search', 14, 'color:#aaa;flex-shrink:0') +
          '<input data-search type="text" value="' + esc(state.query) + '" placeholder="Search..." style="flex:1;border:none;outline:none;font-size:13px;color:#333;background:transparent"></div>' +
          '<div style="max-height:220px;overflow-y:auto"><button type="button" data-clear style="display:block;width:100%;padding:9px 14px;text-align:left;font-size:13px;color:#aaa;background:white;border:none;cursor:pointer;border-bottom:1px solid #f5f5f5">' + esc(placeholder) + '</button>' +
          (list.length === 0 ? '<p style="padding:12px 14px;font-size:13px;color:#aaa">No results found</p>' : list.map(function (o) {
            var a = o === state.value;
            return '<button type="button" data-opt="' + esc(o) + '" class="sh-opt" style="display:block;width:100%;padding:9px 14px;text-align:left;font-size:13px;color:' + (a ? '#fff' : '#333') + ';background:' + (a ? '#800000' : 'white') + ';border:none;cursor:pointer;transition:background 0.1s">' + esc(o) + '</button>';
          }).join('')) + '</div></div>';
      }
      host.innerHTML = html;
      var s = $('[data-search]', host);
      if (s) { s.focus(); s.setSelectionRange(s.value.length, s.value.length); }
    }
    function close() { state.open = false; state.query = ''; }
    host.addEventListener('click', function (e) {
      if (e.target.closest('[data-trigger]')) { if (!state.disabled) { state.open = !state.open; state.query = ''; render(); } return; }
      var opt = e.target.closest('[data-opt]');
      if (opt) { state.value = opt.getAttribute('data-opt'); close(); render(); opts.onChange(state.value); return; }
      if (e.target.closest('[data-clear]')) { state.value = ''; close(); render(); opts.onChange(''); }
    });
    host.addEventListener('input', function (e) { if (e.target.matches('[data-search]')) { state.query = e.target.value; render(); } });
    host.addEventListener('mouseover', function (e) { var o = e.target.closest('.sh-opt'); if (o && o.getAttribute('data-opt') !== state.value) o.style.background = '#fff8f0'; });
    host.addEventListener('mouseout', function (e) { var o = e.target.closest('.sh-opt'); if (o && o.getAttribute('data-opt') !== state.value) o.style.background = 'white'; });
    document.addEventListener('mousedown', function (e) { if (state.open && !host.contains(e.target)) { close(); render(); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && state.open) { close(); render(); } });
    render();
    return {
      set: function (p) { for (var k in p) state[k] = p[k]; render(); },
      get value() { return state.value; }
    };
  }

  /* ═════════ Checkout ═════════ */
  var root = $('[data-sh-checkout]');
  if (root) {
    var form = $('[data-co-form]', root);
    var emptyBox = $('[data-co-empty]', root), mainBox = $('[data-co-main]', root);
    var state = { couponOpen: false, couponCode: '', couponApplying: false, applied: null, couponMsg: null, terms: true, termsErr: false, submitting: false, submitted: false };
    var els = {
      name: form.elements.customerName, phone: form.elements.phone, house: form.elements.houseAddress, notes: form.elements.notes
    };
    var district = '', thana = '';

    var districtSel = makeSelect($('[data-select="district"]'), {
      options: DISTRICTS.map(function (d) { return d.n; }), placeholder: 'Select District *',
      onChange: function (v) { district = v; thana = ''; thanaSel.set({ value: '', options: thanasOf(v), disabled: !v }); if (state.submitted) validate(); update(); }
    });
    var thanaSel = makeSelect($('[data-select="thana"]'), {
      options: [], placeholder: 'Select Thana (Optional)', onChange: function (v) { thana = v; }
    });
    thanaSel.set({ disabled: true });
    function thanasOf(d) { var f = DISTRICTS.filter(function (x) { return x.n === d; })[0]; return f ? f.t : []; }
    function deliveryFor(d) { return !d ? 0 : (d.toLowerCase() === 'dhaka' ? 100 : 150); }

    /* validation (same rules/messages as checkoutSchema) */
    var errors = {};
    function validate() {
      errors = {};
      if (els.name.value.trim().length < 2) errors.customerName = 'Full name is required';
      if (!/^01\d{9}$/.test(els.phone.value)) errors.phone = 'Enter a valid Bangladesh number (01XXXXXXXXX)';
      if (els.house.value.length < 5) errors.houseAddress = 'House/street address is required';
      else if (els.house.value.length > 300) errors.houseAddress = 'Too big';
      if (!district) errors.district = 'Select a district';
      ['customerName', 'phone', 'houseAddress', 'district'].forEach(function (k) {
        var p = $('[data-err="' + k + '"]', form);
        p.hidden = !errors[k]; p.textContent = errors[k] || '';
      });
      var inputs = { customerName: els.name, phone: els.phone, houseAddress: els.house };
      Object.keys(inputs).forEach(function (k) { inputs[k].style.borderColor = errors[k] ? '#f87171' : '#e0e0e0'; });
      districtSel.set({ error: !!errors.district });
      return Object.keys(errors).length === 0;
    }
    ['input', 'blur'].forEach(function (ev) { form.addEventListener(ev, function (e) { if (state.submitted && e.target.matches('input')) validate(); }, true); });

    function totals() {
      var items = Cart.items();
      var subtotal = items.reduce(function (s, i) { return s + i.price * i.quantity; }, 0);
      var delivery = deliveryFor(district);
      var discount = state.applied ? Math.min(state.applied.discount, subtotal) : 0;
      return { items: items, subtotal: subtotal, delivery: delivery, discount: discount, total: subtotal + delivery - discount };
    }

    function renderItems(t) {
      $('[data-co-items]', root).innerHTML = t.items.map(function (item) {
        return '<div style="display:flex;align-items:flex-start;gap:12px">' +
          '<div class="relative flex-shrink-0 overflow-hidden" style="width:60px;height:60px;border-radius:6px;border:1px solid #f0f0f0;background:#f5f5f5"><img src="' + esc(ui.imgUrl(item.image)) + '" alt="' + esc(item.title) + '" class="object-cover" style="position:absolute;inset:0;width:100%;height:100%" onerror="this.onerror=null;this.src=\'' + esc(SHX.placeholder) + '\'"></div>' +
          '<div style="flex:1;min-width:0"><div style="display:flex;align-items:flex-start;gap:8px"><p class="line-clamp-2" style="flex:1;font-size:14px;font-weight:600;color:#333;line-height:1.4">' + esc(item.title) + '</p>' +
          '<div style="display:flex;flex-direction:column;align-items:flex-end;flex-shrink:0"><span style="font-size:14px;font-weight:700;color:#800000;white-space:nowrap">৳' + fmtAmt(item.price * item.quantity) + '</span>' +
          (item.compareAtPrice && item.compareAtPrice > item.price ? '<span style="font-size:12px;color:#aaa;text-decoration:line-through;white-space:nowrap">৳' + fmtAmt(item.compareAtPrice * item.quantity) + '</span>' : '') + '</div>' +
          '<button type="button" data-rm="' + esc(item.productId) + '" aria-label="Remove item" style="flex-shrink:0;width:28px;height:28px;background:#ff4444;color:white;border:none;border-radius:4px;display:flex;align-items:center;justify-content:center;cursor:pointer">' + icon('trash-2', 13) + '</button></div>' +
          '<div style="display:flex;align-items:center;gap:8px;margin-top:8px"><span style="font-size:13px;color:#777">Qty:</span><div style="display:flex;border:1px solid #ddd;border-radius:4px;overflow:hidden">' +
          '<button type="button" data-dec="' + esc(item.productId) + '" style="width:28px;height:28px;background:white;border:none;border-right:1px solid #ddd;font-size:16px;color:#555;cursor:pointer;display:flex;align-items:center;justify-content:center">-</button>' +
          '<span style="width:32px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:500;color:#333">' + item.quantity + '</span>' +
          '<button type="button" data-inc="' + esc(item.productId) + '" style="width:28px;height:28px;background:white;border:none;border-left:1px solid #ddd;font-size:16px;color:#555;cursor:pointer;display:flex;align-items:center;justify-content:center">+</button></div></div></div></div>';
      }).join('');
    }

    function renderSummary(t) {
      $('[data-co-summary]', root).innerHTML = '<div class="space-y-1">' +
        '<div class="flex justify-between" style="padding:8px 0;font-size:14px;color:#555"><span>Sub total</span><span>৳' + fmtAmt(t.subtotal) + ' BDT</span></div>' +
        '<div class="flex justify-between items-center" style="padding:8px 0;font-size:14px;color:#555"><span>Delivery cost</span>' + (district ? '<span style="color:#333;font-weight:500">৳' + fmtAmt(t.delivery) + ' BDT</span>' : '<em style="color:#aaa;font-size:13px;font-style:italic">Select district</em>') + '</div>' +
        (t.discount > 0 ? '<div class="flex justify-between" style="padding:8px 0;font-size:14px;color:#2e7d32"><span>Coupon discount (' + esc(state.applied.code) + ')</span><span>−৳' + fmtAmt(t.discount) + ' BDT</span></div>' : '') +
        '<div class="flex justify-between" style="border-top:1px solid #eee;padding:10px 0 0;font-size:16px;font-weight:700;color:#222"><span>Total</span><span>৳' + fmtAmt(t.total) + ' BDT</span></div></div>';
    }

    function renderCoupon(t) {
      var body = $('[data-co-coupon-body]', root);
      body.hidden = !state.couponOpen;
      $('[data-co-coupon-chevron]', root).innerHTML = icon(state.couponOpen ? 'chevron-up' : 'chevron-down', 16);
      if (!state.couponOpen) return;
      if (state.applied) {
        body.innerHTML = '<div class="flex items-center justify-between" style="background:#f0faf0;border:1px solid #c6e8c6;border-radius:6px;padding:10px 14px"><span style="font-size:13px;color:#2e7d32;font-weight:600">✓ ' + esc(state.applied.code) + ' applied — ৳' + fmtAmt(t.discount) + ' off</span><button type="button" data-co-coupon-remove style="background:none;border:none;color:#c62828;font-size:12px;font-weight:600;cursor:pointer">Remove</button></div>';
      } else {
        var off = state.couponApplying || !state.couponCode.trim();
        body.innerHTML = '<div class="flex gap-2"><input type="text" data-co-coupon-input value="' + esc(state.couponCode) + '" placeholder="Enter coupon code" class="flex-1 w-full bg-white text-[#333] text-sm outline-none transition-colors placeholder:text-[#aaa]" style="height:42px;border:1px solid #e0e0e0;border-radius:6px;padding:0 14px;font-size:14px">' +
          '<button type="button" data-co-coupon-apply ' + (off ? 'disabled' : '') + ' class="transition-colors" style="background:' + (off ? '#b08080' : '#800000') + ';color:white;border:none;padding:0 16px;height:42px;border-radius:6px;font-size:13px;font-weight:500;cursor:' + (off ? 'not-allowed' : 'pointer') + ';flex-shrink:0">' + (state.couponApplying ? 'Checking...' : 'Apply') + '</button></div>' +
          (state.couponMsg ? '<p style="font-size:12px;color:#c62828;margin-top:8px">' + esc(state.couponMsg) + '</p>' : '');
        var inp = $('[data-co-coupon-input]', body);
        if (inp && document.activeElement === document.body && state._focusCoupon) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
      }
    }

    function renderSubmit() {
      var can = state.terms && !!district;
      var btn = $('[data-co-submit]', root);
      btn.disabled = state.submitting || !can;
      btn.style.background = can ? '#800000' : '#ccc';
      btn.style.cursor = can && !state.submitting ? 'pointer' : 'not-allowed';
      btn.innerHTML = state.submitting ? icon('loader', 18, 'animation:spin 1s linear infinite') + ' Placing Order...' : 'PLACE ORDER';
      $('[data-co-district-hint]', root).hidden = !!district;
      $('[data-co-terms-err]', root).hidden = !state.termsErr;
    }

    var initiated = false;
    function update() {
      var t = totals();
      if (!t.items.length) { emptyBox.hidden = false; mainBox.hidden = true; return; }
      emptyBox.hidden = true; mainBox.hidden = false;
      renderItems(t); renderSummary(t); renderCoupon(t); renderSubmit();
      if (!initiated) {
        initiated = true;
        window.shTrack('InitiateCheckout', {
          content_type: 'product', content_ids: t.items.map(function (i) { return i.productId; }),
          contents: t.items.map(function (i) { return { id: i.productId, quantity: i.quantity, item_price: i.price }; }),
          num_items: t.items.reduce(function (n, i) { return n + i.quantity; }, 0), value: t.subtotal, currency: 'BDT'
        });
      }
    }

    /* coupon */
    function applyCoupon(code) {
      if (!code.trim()) return;
      state.couponApplying = true; state.couponMsg = null; update();
      var t = totals();
      fetch(SHX.rest + 'coupons/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: code.trim(), subtotal: t.subtotal }) })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d.valid) { state.applied = { code: d.code, discount: d.discount }; state.couponMsg = null; }
          else { state.applied = null; state.couponMsg = d.message || 'Invalid coupon code.'; }
        })
        .catch(function () { state.applied = null; state.couponMsg = 'Could not verify coupon. Please try again.'; })
        .then(function () { state.couponApplying = false; update(); });
    }
    var lastSubtotal = totals().subtotal;
    document.addEventListener('sh:cart-changed', function () {
      var t = totals();
      if (state.applied && t.subtotal > 0 && t.subtotal !== lastSubtotal) applyCoupon(state.applied.code);
      lastSubtotal = t.subtotal; update();
    });

    root.addEventListener('click', function (e) {
      var inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]'), rm = e.target.closest('[data-rm]');
      if (inc) { var a = Cart.items().filter(function (i) { return i.productId === inc.getAttribute('data-inc'); })[0]; if (a) Cart.update(a.productId, a.quantity + 1); }
      else if (dec) { var b = Cart.items().filter(function (i) { return i.productId === dec.getAttribute('data-dec'); })[0]; if (b) Cart.update(b.productId, b.quantity - 1); }
      else if (rm) { Cart.remove(rm.getAttribute('data-rm')); }
      else if (e.target.closest('[data-co-coupon-toggle]')) { state.couponOpen = !state.couponOpen; update(); }
      else if (e.target.closest('[data-co-coupon-apply]')) { applyCoupon(state.couponCode); }
      else if (e.target.closest('[data-co-coupon-remove]')) { state.applied = null; state.couponCode = ''; state.couponMsg = null; update(); }
    });
    root.addEventListener('input', function (e) {
      if (e.target.matches('[data-co-coupon-input]')) {
        state.couponCode = e.target.value.toUpperCase(); e.target.value = state.couponCode;
        var off = !state.couponCode.trim(), btn = $('[data-co-coupon-apply]', root);
        if (btn) { btn.disabled = off; btn.style.background = off ? '#b08080' : '#800000'; btn.style.cursor = off ? 'not-allowed' : 'pointer'; }
      }
      if (e.target === els.notes) { $('[data-co-notes-count]', root).textContent = els.notes.value.length; }
    });
    $('[data-co-terms]', root).addEventListener('change', function (e) { state.terms = e.target.checked; if (state.terms) state.termsErr = false; renderSubmit(); });

    /* terms link hover */
    $$('.sh-co-link', root).forEach(function (a) { a.style.color = '#800000'; a.style.textDecoration = 'none'; a.addEventListener('mouseenter', function () { a.style.textDecoration = 'underline'; }); a.addEventListener('mouseleave', function () { a.style.textDecoration = 'none'; }); });

    function genOrderNumber() {
      var n = new Date();
      return 'SH' + String(n.getFullYear()).slice(-2) + String(n.getMonth() + 1).padStart(2, '0') + String(n.getDate()).padStart(2, '0') + Math.floor(Math.random() * 9000 + 1000);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      state.submitted = true;
      var ok = validate();
      if (!state.terms) { state.termsErr = true; renderSubmit(); return; }
      if (!ok) return;
      var t = totals();
      state.submitting = true; renderSubmit();
      var orderNumber = genOrderNumber();
      var address = [els.house.value, thana, district].filter(Boolean).join(', ');
      var payload = {
        orderNumber: orderNumber, customerName: els.name.value.trim(), phone: els.phone.value, address: address, notes: els.notes.value || '',
        subtotal: t.subtotal, deliveryCharge: t.delivery, total: t.total, couponCode: state.applied ? state.applied.code : null, paymentMethod: 'COD',
        items: t.items.map(function (i) { return { productId: i.productId, productTitle: i.title, productImage: i.image, price: i.price, quantity: i.quantity, lineTotal: i.price * i.quantity }; }),
        eventSourceUrl: window.location.href
      };
      fetch(SHX.rest + 'orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (!res.ok) { window.shToast.error(res.d.error || 'Something went wrong. Please try again.'); return; }
          // Keep the amounts the customer saw (server recomputes prices; same values unless a price changed).
          try {
            var saved = JSON.parse(JSON.stringify(payload));
            saved.id = res.d.orderId || ('temp-' + Date.now());
            saved.orderNumber = res.d.orderNumber || orderNumber;
            localStorage.setItem('sh_last_order', JSON.stringify(saved));
          } catch (err) {}
          Cart.clear();
          window.shToast.success('Order placed successfully!');
          window.location.href = url('thank-you') + '?order=' + encodeURIComponent(res.d.orderNumber || orderNumber);
        })
        .catch(function () { window.shToast.error('Something went wrong. Please try again.'); })
        .then(function () { state.submitting = false; renderSubmit(); });
    });

    update();
  }

  /* ═════════ Thank-you page ═════════ */
  var ty = $('[data-sh-thankyou]');
  if (ty) {
    var param = new URLSearchParams(window.location.search).get('order');
    var order = null;
    try { var raw = localStorage.getItem('sh_last_order'); if (raw) order = JSON.parse(raw); } catch (e) {}
    var num = param || (order && order.orderNumber);
    if (num) { $('[data-ty-number]', ty).hidden = false; $('[data-ty-number-text]', ty).textContent = num; }
    if (order) {
      // Meta Purchase pixel once per order (deterministic event_id = server CAPI event_id).
      try {
        var guard = 'sh_purchase_tracked_' + order.orderNumber;
        if (order.orderNumber && !localStorage.getItem(guard)) {
          window.shTrackPurchasePixel(order.orderNumber, {
            content_type: 'product',
            content_ids: order.items.map(function (i) { return i.productId; }).filter(Boolean),
            contents: order.items.filter(function (i) { return i.productId; }).map(function (i) { return { id: i.productId, quantity: i.quantity, item_price: i.price }; }),
            num_items: order.items.reduce(function (n, i) { return n + i.quantity; }, 0), value: order.total, currency: 'BDT', order_id: order.orderNumber
          });
          localStorage.setItem(guard, '1');
        }
      } catch (e) {}
      var fmt = ui.fmt;
      $('[data-ty-details]', ty).innerHTML = '<div class="space-y-4 thankyou-slide">' +
        '<div class="bg-white rounded-xl border border-[#f0e8d8] p-5 shadow-sm"><h2 class="font-bold text-[#1a1208] mb-4 flex items-center gap-2">' + icon('package', 18, 'color:#800000') + 'Ordered Items</h2><div class="space-y-3">' +
        order.items.map(function (i) {
          return '<div class="flex items-center gap-3"><div class="relative w-12 h-12 rounded-lg overflow-hidden bg-[#f0e8d8] flex-shrink-0">' + (i.productImage ? '<img src="' + esc(i.productImage) + '" alt="' + esc(i.productTitle) + '" class="object-cover" style="position:absolute;inset:0;width:100%;height:100%">' : '') + '</div>' +
            '<div class="flex-1 min-w-0"><p class="text-sm font-medium text-[#1a1208] line-clamp-1">' + esc(i.productTitle) + '</p><p class="text-xs text-[#7a6045]">' + i.quantity + 'x × ' + fmt(i.price) + '</p></div>' +
            '<span class="font-bold text-[#1a1208] text-sm">' + fmt(i.lineTotal) + '</span></div>';
        }).join('') + '</div>' +
        '<div class="border-t border-[#f0e8d8] mt-4 pt-4 space-y-2 text-sm"><div class="flex justify-between text-[#4a2c0a]"><span>Subtotal</span><span>' + fmt(order.subtotal) + '</span></div>' +
        '<div class="flex justify-between text-[#4a2c0a]"><span>Delivery</span><span>' + (order.deliveryCharge === 0 ? '<span class="text-green-600">Free</span>' : fmt(order.deliveryCharge)) + '</span></div>' +
        '<div class="flex justify-between font-bold text-base text-[#1a1208]"><span>Total</span><span class="text-[#800000]">' + fmt(order.total) + '</span></div></div></div>' +
        '<div class="bg-white rounded-xl border border-[#f0e8d8] p-5 shadow-sm"><h2 class="font-bold text-[#1a1208] mb-4">Delivery Information</h2><div class="space-y-2 text-sm">' +
        '<div class="flex items-start gap-3"><div class="w-5 h-5 rounded-full bg-[#f0e8d8] flex items-center justify-center flex-shrink-0 mt-0.5"><span class="text-xs">👤</span></div><span class="text-[#1a1208] font-medium">' + esc(order.customerName) + '</span></div>' +
        '<div class="flex items-start gap-3">' + icon('phone', 16, 'color:#800000;flex-shrink:0;margin-top:2px') + '<span class="text-[#4a2c0a]">' + esc(order.phone) + '</span></div>' +
        '<div class="flex items-start gap-3">' + icon('map-pin', 16, 'color:#800000;flex-shrink:0;margin-top:2px') + '<span class="text-[#4a2c0a]">' + esc(order.address) + '</span></div>' +
        '<div class="flex items-start gap-3"><span class="text-base">💵</span><span class="text-[#4a2c0a]">' + (order.paymentMethod === 'COD' ? 'Cash on Delivery' : esc(order.paymentMethod)) + '</span></div></div></div>' +
        '<div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800"><p class="font-semibold mb-1">What happens next:</p><ul class="space-y-1 text-xs list-disc list-inside"><li>We will call you soon to confirm your order</li><li>Your order will arrive within 3–5 business days</li><li>Pay the delivery person when you receive your package</li></ul></div></div>';
    }
  }
})();
