/* Order tracking page. Ports TrackOrderClient.tsx. */
(function () {
  'use strict';
  var SHX = window.SH || {};
  var ui = window.shUi, esc = ui.esc, icon = ui.icon, fmt = ui.fmt, url = ui.url;
  var root = document.querySelector('[data-sh-track]');
  if (!root) return;
  var form = root.querySelector('[data-track-form]');
  var input = root.querySelector('[data-track-input]');
  var btn = root.querySelector('[data-track-btn]');
  var btnIcon = root.querySelector('[data-track-btn-icon]');
  var result = root.querySelector('[data-track-result]');
  var initialHtml = result.innerHTML;

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var fmtDate = function (iso) { var d = new Date(iso); return MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(); };
  var STEPS = [
    { key: 'PENDING', label: 'Order Placed', icon: 'shopping-bag' },
    { key: 'CONFIRMED', label: 'Confirmed', icon: 'check-circle' },
    { key: 'PROCESSING', label: 'Processing', icon: 'package' },
    { key: 'SHIPPED', label: 'Shipped', icon: 'truck' },
    { key: 'DELIVERED', label: 'Delivered', icon: 'map-pin' }
  ];
  var BADGE = {
    PENDING: ['Pending', 'bg-yellow-100 text-yellow-800 border-yellow-200'], CONFIRMED: ['Confirmed', 'bg-blue-100 text-blue-800 border-blue-200'],
    PROCESSING: ['Processing', 'bg-purple-100 text-purple-800 border-purple-200'], SHIPPED: ['Shipped', 'bg-indigo-100 text-indigo-800 border-indigo-200'],
    DELIVERED: ['Delivered', 'bg-green-100 text-green-800 border-green-200'], CANCELLED: ['Cancelled', 'bg-red-100 text-red-800 border-red-200']
  };

  function setLoading(on) {
    btn.disabled = on || !input.value.trim();
    btnIcon.innerHTML = on ? icon('refresh-cw', 16, 'animation:spin 1s linear infinite') : icon('search', 16);
  }

  function renderOrder(o) {
    var cancelled = o.status === 'CANCELLED';
    var idx = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].indexOf(o.status);
    var b = BADGE[o.status];
    var stepper = '';
    if (!cancelled) {
      stepper = '<div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6"><h2 class="font-bold text-[#1a1208] mb-6 text-sm uppercase tracking-wide">Order Progress</h2><div class="relative">' +
        '<div class="absolute top-5 left-5 right-5 h-0.5 bg-gray-100 hidden sm:block"></div>' +
        '<div class="absolute top-5 left-5 h-0.5 bg-[#800000] hidden sm:block transition-all duration-700" style="width:' + (idx <= 0 ? '0%' : ((idx / (STEPS.length - 1)) * 100) + '%') + '"></div>' +
        '<div class="flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-0 relative z-10">' + STEPS.map(function (s, i) {
          var done = i < idx, cur = i === idx;
          return '<div class="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2 sm:flex-1"><div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ' +
            (cur ? 'bg-[#800000] text-white shadow-md shadow-[#800000]/30 scale-110' : (done ? 'bg-[#800000] text-white' : 'bg-gray-100 text-gray-400')) + '">' + icon(s.icon, 18) + '</div>' +
            '<div class="sm:text-center"><p class="text-sm font-semibold ' + (cur || done ? 'text-[#1a1208]' : 'text-gray-400') + '">' + s.label + '</p>' + (cur ? '<p class="text-xs text-[#800000] font-medium mt-0.5">Current</p>' : '') + '</div></div>';
        }).join('') + '</div></div></div>';
    } else {
      stepper = '<div class="bg-red-50 border border-red-200 rounded-2xl p-5 md:p-6 flex items-center gap-4">' + icon('x-circle', 32, 'color:#ef4444;flex-shrink:0') + '<div><p class="font-bold text-red-800">Order Cancelled</p><p class="text-sm text-red-600">This order has been cancelled. Contact us if you have questions.</p></div></div>';
    }
    var row = function (ic, label, val) {
      return '<div class="flex items-start gap-3"><div class="w-8 h-8 rounded-full bg-[#f0e8d8] flex items-center justify-center flex-shrink-0">' + ic + '</div><div><p class="text-xs text-[#7a6045]">' + label + '</p><p class="font-medium text-[#1a1208]">' + val + '</p></div></div>';
    };
    result.innerHTML = '<div class="space-y-5">' +
      '<div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><div><p class="text-xs text-[#7a6045] mb-1">Order Number</p><p class="text-xl font-bold text-[#800000]">#' + esc(o.orderNumber) + '</p><p class="text-xs text-gray-400 mt-1">Placed on ' + fmtDate(o.createdAt) + '</p></div>' +
      '<span class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ' + b[1] + '">' + b[0] + '</span></div>' +
      (o.adminNote ? '<div class="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800"><span class="font-semibold">Note from us: </span>' + esc(o.adminNote) + '</div>' : '') + '</div>' +
      stepper +
      '<div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6"><h2 class="font-bold text-[#1a1208] mb-4 flex items-center gap-2">' + icon('package', 18, 'color:#800000') + 'Ordered Items</h2><div class="space-y-3">' +
      o.items.map(function (i) {
        return '<div class="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"><div class="relative w-12 h-12 rounded-lg overflow-hidden bg-[#f0e8d8] flex-shrink-0">' + (i.productImage ? '<img src="' + esc(i.productImage) + '" alt="' + esc(i.productTitle) + '" class="object-cover" style="position:absolute;inset:0;width:100%;height:100%">' : '') + '</div>' +
          '<div class="flex-1 min-w-0"><p class="text-sm font-medium text-[#1a1208] line-clamp-1">' + esc(i.productTitle) + '</p><p class="text-xs text-[#7a6045]">' + i.quantity + ' × ' + fmt(i.price) + '</p></div>' +
          '<span class="font-semibold text-[#1a1208] text-sm whitespace-nowrap">' + fmt(i.lineTotal) + '</span></div>';
      }).join('') + '</div><div class="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">' +
      '<div class="flex justify-between text-[#4a2c0a]"><span>Subtotal</span><span>' + fmt(o.subtotal) + '</span></div>' +
      '<div class="flex justify-between text-[#4a2c0a]"><span>Delivery</span><span>' + (Number(o.deliveryCharge) === 0 ? '<span class="text-green-600">Free</span>' : fmt(o.deliveryCharge)) + '</span></div>' +
      '<div class="flex justify-between font-bold text-base text-[#1a1208]"><span>Total</span><span class="text-[#800000]">' + fmt(o.total) + '</span></div></div></div>' +
      '<div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6"><h2 class="font-bold text-[#1a1208] mb-4">Delivery Information</h2><div class="space-y-3 text-sm">' +
      row('<span class="text-sm">👤</span>', 'Customer', esc(o.customerName)) +
      row(icon('phone', 14, 'color:#800000'), 'Phone', esc(o.phone)) +
      row(icon('map-pin', 14, 'color:#800000'), 'Address', esc(o.address)) +
      row(icon('clock', 14, 'color:#800000'), 'Payment', o.paymentMethod === 'COD' ? 'Cash on Delivery' : esc(o.paymentMethod)) +
      '</div></div>' +
      '<div class="flex flex-col sm:flex-row gap-3 pb-4"><a href="' + url('') + '" class="flex items-center justify-center gap-2 flex-1 bg-[#800000] text-white font-bold py-3.5 rounded-xl hover:bg-[#5C0000] transition-colors text-sm">Back to Home</a>' +
      '<a href="' + url('shop') + '" class="flex items-center justify-center gap-2 flex-1 border-2 border-[#800000] text-[#800000] font-bold py-3.5 rounded-xl hover:bg-[#800000] hover:text-white transition-colors text-sm">' + icon('shopping-bag', 16) + 'Continue Shopping</a></div></div>';
  }

  function track(number) {
    number = number.trim();
    if (!number) return;
    setLoading(true);
    result.innerHTML = '<div class="flex flex-col items-center justify-center py-20 gap-4"><div class="w-12 h-12 border-4 border-[#800000] border-t-transparent rounded-full animate-spin"></div><p class="text-[#7a6045] text-sm">Looking up your order...</p></div>';
    fetch(SHX.rest + 'orders/track?orderNumber=' + encodeURIComponent(number))
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.success) { renderOrder(d.order); return; }
        showError();
      })
      .catch(showError)
      .then(function () { setLoading(false); });
  }
  function showError() {
    result.innerHTML = '<div class="flex flex-col items-center justify-center py-12"><div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center max-w-md w-full"><div class="text-5xl mb-4">📦</div>' +
      '<h2 class="text-xl font-bold text-[#1a1208] mb-2">Order Not Found</h2><p class="text-[#7a6045] text-sm mb-6">We couldn\'t find an order with that number. Please double-check and try again.</p>' +
      '<a href="' + url('shop') + '" class="inline-flex items-center gap-2 bg-[#800000] text-white font-semibold py-3 px-6 rounded-xl text-sm hover:bg-[#5C0000] transition-colors">' + icon('shopping-bag', 16) + 'Back to Shopping</a></div></div>';
  }

  input.addEventListener('input', function () { btn.disabled = !input.value.trim(); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v) return;
    history.pushState({}, '', url('track-order') + '?order=' + encodeURIComponent(v));
    track(v);
  });
  window.addEventListener('popstate', function () {
    var o = new URLSearchParams(window.location.search).get('order');
    if (o) { input.value = o; track(o); } else { result.innerHTML = initialHtml; }
  });
  btn.disabled = !input.value.trim();
  var initial = new URLSearchParams(window.location.search).get('order');
  if (initial) { input.value = initial; track(initial); }
})();
