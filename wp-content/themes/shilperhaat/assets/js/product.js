/* Product detail page behaviour: gallery, add-to-cart panel, tabs, review form.
   Ports ProductGallery / AddToCartSection / ProductTabs from the original React app. */
(function () {
  'use strict';
  var root = document.querySelector('[data-sh-product]');
  if (!root) return;
  var SHX = window.SH || {};
  var product = JSON.parse(root.getAttribute('data-sh-product'));
  var $ = function (sel, r) { return (r || document).querySelector(sel); };
  var $$ = function (sel, r) { return Array.prototype.slice.call((r || document).querySelectorAll(sel)); };
  var esc = function (s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; };
  var fmt = function (n) { return '৳' + Math.round(n).toLocaleString('en-US'); };

  /* Port of formatWhatsAppUrl() */
  function formatWa(raw, message) {
    var m = message ? '?text=' + encodeURIComponent(message) : '';
    raw = (raw || '').trim();
    if (!raw) return 'https://wa.me/' + m;
    if (/x/i.test(raw)) return 'https://wa.me/8801700000000' + m;
    var norm = function (d) {
      if (d.indexOf('01') === 0 && d.length === 11) return '88' + d;
      if (d.indexOf('1') === 0 && d.length === 10) return '880' + d;
      return d;
    };
    var digits = raw.replace(/[^0-9]/g, '');
    if (/^https?:\/\//i.test(raw)) {
      if (digits.length >= 8) return 'https://wa.me/' + norm(digits) + m;
      var sep = raw.indexOf('?') !== -1 ? '&' : '?';
      return message ? raw + sep + 'text=' + encodeURIComponent(message) : raw;
    }
    return digits ? 'https://wa.me/' + norm(digits) + m : 'https://wa.me/' + m;
  }

  /* ── Meta Pixel ViewContent (once per page load) ── */
  if (window.shTrack) {
    window.shTrack('ViewContent', { content_type: 'product', content_ids: [product.id], content_name: product.title, value: product.price, currency: 'BDT' });
  }

  /* ═════════ Gallery ═════════ */
  var gal = $('[data-sh-gallery]');
  if (gal) {
    var items = JSON.parse(gal.getAttribute('data-sh-gallery'));
    var title = gal.getAttribute('data-title');
    var iconParts = ($('[data-sh-gal-icons]', gal).innerHTML || '').split('|');
    var ICON = { prev16: iconParts[0], next16: iconParts[1], next14: iconParts[2], prev20: iconParts[3], next20: iconParts[4], zoom: iconParts[5], play: iconParts[6] };
    var active = 0;
    var main = $('[data-sh-gal-main]', gal);
    var thumbsD = $('[data-sh-gal-thumbs-d]', gal);
    var thumbsM = $('[data-sh-gal-thumbs-m]', gal);
    var placeholder = SHX.placeholder || '';

    var thumb = function (it, i, size) {
      var inner;
      if (it.type === 'image') {
        inner = '<img src="' + esc(it.url) + '" alt="' + esc(it.alt || ('Image ' + (i + 1))) + '" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;color:transparent" onerror="this.onerror=null;this.src=\'' + esc(placeholder) + '\'">';
      } else {
        var bg = it.youtubeVideoId ? '<img src="https://img.youtube.com/vi/' + esc(it.youtubeVideoId) + '/mqdefault.jpg" alt="Video thumbnail" style="width:100%;height:100%;object-fit:cover">' : '';
        var d = size < 70 ? 20 : 28;
        inner = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative;background:#1a1a1a">' + bg +
          '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35)"><div style="width:' + d + 'px;height:' + d + 'px;border-radius:50%;background:rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center">' + ICON.play.replace('width="13" height="13"', 'width="' + (size < 70 ? 9 : 13) + '" height="' + (size < 70 ? 9 : 13) + '"') + '</div></div></div>';
      }
      return '<button type="button" data-i="' + i + '" aria-label="View ' + it.type + ' ' + (i + 1) + '" style="width:' + size + 'px;height:' + size + 'px;border-radius:6px;overflow:hidden;border:2px solid ' + (i === active ? '#800000' : '#eee') + ';cursor:pointer;transition:border-color 0.2s ease;background-color:#fff;padding:0;flex-shrink:0;position:relative">' + inner + '</button>';
    };

    var renderThumbs = function () {
      if (thumbsD) thumbsD.innerHTML = items.map(function (it, i) { return thumb(it, i, 76); }).join('');
      if (thumbsM) thumbsM.innerHTML = items.map(function (it, i) { return thumb(it, i, 64); }).join('');
    };

    var arrows = function () {
      if (items.length < 2) return '';
      var m = 'position:absolute;top:50%;transform:translateY(-50%);display:flex;align-items:center;justify-content:center;border-radius:50%;cursor:pointer;z-index:10;';
      return '<button type="button" data-sh-gal-prev aria-label="Previous" class="md:hidden" style="' + m + 'left:8px;background-color:rgba(0,0,0,0.12);border:none;width:32px;height:32px;color:#FFFFFF">' + ICON.prev16 + '</button>' +
        '<button type="button" data-sh-gal-next aria-label="Next" class="md:hidden" style="' + m + 'right:8px;background-color:rgba(0,0,0,0.12);border:none;width:32px;height:32px;color:#FFFFFF">' + ICON.next16 + '</button>' +
        '<button type="button" data-sh-gal-next aria-label="Next image" class="hidden md:flex" style="' + m + 'right:8px;background-color:rgba(255,255,255,0.92);border:1px solid #eee;width:28px;height:28px;color:#666;box-shadow:0 1px 4px rgba(0,0,0,0.08)">' + ICON.next14 + '</button>';
    };

    var renderMain = function () {
      var it = items[active];
      var html;
      if (it.type === 'video') {
        var player = it.youtubeVideoId
          ? '<iframe src="https://www.youtube.com/embed/' + esc(it.youtubeVideoId) + '?autoplay=1&rel=0&modestbranding=1" title="Product video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-full rounded" style="border:none;min-height:340px"></iframe>'
          : (it.videoUrl ? '<video src="' + esc(it.videoUrl) + '" controls autoplay class="w-full rounded object-contain" style="max-height:380px;background:#000"></video>' : '');
        html = '<div class="w-full" style="cursor:default">' + player + '</div>';
      } else {
        html = '<div class="gallery-fade absolute inset-0 flex items-center justify-center cursor-zoom-in"><img src="' + esc(it.url) + '" alt="' + esc(it.alt || (title + ' — image ' + (active + 1))) + '" class="object-contain transition-transform duration-300 hover:scale-[1.03]" style="position:absolute;inset:0;width:100%;height:100%;color:transparent" onerror="this.onerror=null;this.src=\'' + esc(placeholder) + '\'"></div>' +
          '<div class="absolute bottom-3 right-3 flex items-center justify-center pointer-events-none" style="background-color:rgba(255,255,255,0.85);border-radius:50%;width:30px;height:30px;z-index:10">' + ICON.zoom + '</div>';
      }
      main.innerHTML = html + arrows();
    };

    var go = function (n) { active = (n + items.length) % items.length; renderMain(); renderThumbs(); };

    gal.addEventListener('click', function (e) {
      var t = e.target.closest('button[data-i]');
      if (t) { go(Number(t.getAttribute('data-i'))); return; }
      if (e.target.closest('[data-sh-gal-prev]')) { e.stopPropagation(); go(active - 1); return; }
      if (e.target.closest('[data-sh-gal-next]')) { e.stopPropagation(); go(active + 1); return; }
      if (e.target.closest('[data-sh-gal-main]') && items[active].type === 'image') { openLightbox(); }
    });

    var lb;
    var openLightbox = function () {
      var it = items[active];
      lb = document.createElement('div');
      lb.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4';
      lb.style.backgroundColor = 'rgba(0,0,0,0.9)';
      var nav = items.length > 1
        ? '<button type="button" data-lb-prev class="absolute top-1/2 -translate-y-1/2 flex items-center justify-center" style="left:8px;background-color:rgba(255,255,255,0.8);border:none;width:36px;height:36px;border-radius:50%;cursor:pointer">' + ICON.prev20 + '</button>' +
          '<button type="button" data-lb-next class="absolute top-1/2 -translate-y-1/2 flex items-center justify-center" style="right:8px;background-color:rgba(255,255,255,0.8);border:none;width:36px;height:36px;border-radius:50%;cursor:pointer">' + ICON.next20 + '</button>'
        : '';
      lb.innerHTML = '<div class="relative max-w-3xl w-full" data-lb-box><img src="' + esc(it.url) + '" alt="' + esc(it.alt || title) + '" width="800" height="800" class="object-contain w-full rounded-lg" style="max-height:80vh">' +
        '<button type="button" data-lb-close class="absolute flex items-center justify-center" style="top:-12px;right:-12px;background-color:#FFFFFF;color:#222831;border-radius:50%;width:32px;height:32px;border:none;cursor:pointer;font-size:14px;font-weight:700">✕</button>' + nav + '</div>';
      lb.addEventListener('click', function (e) {
        if (e.target.closest('[data-lb-close]') || e.target === lb) { lb.remove(); return; }
        if (e.target.closest('[data-lb-prev]')) { go(active - 1); lb.remove(); openLightbox(); }
        if (e.target.closest('[data-lb-next]')) { go(active + 1); lb.remove(); openLightbox(); }
      });
      document.body.appendChild(lb);
    };

    renderMain(); renderThumbs();
  }

  /* ═════════ Add-to-cart panel ═════════ */
  var atc = $('[data-sh-atc]');
  var payload = product.payload;
  var qty = 1, added = false;
  var cartQty = function () {
    var f = window.shCart.items().filter(function (i) { return i.productId === product.id; })[0];
    return f ? f.quantity : 0;
  };
  var maxQty = function () { return product.stock - cartQty(); };

  var track = function (q) {
    if (window.shTrack) {
      window.shTrack('AddToCart', { content_type: 'product', content_ids: [product.id], content_name: product.title, contents: [{ id: product.id, quantity: q, item_price: product.price }], value: product.price * q, currency: 'BDT' });
    }
  };

  if (atc) {
    var qEl = $('[data-sh-qty]', atc), dec = $('[data-sh-qty-dec]', atc), inc = $('[data-sh-qty-inc]', atc);
    var addBtn = $('[data-sh-atc-add]', atc), addInner = $('[data-sh-atc-add-inner]', atc);
    var icons = ($('[data-sh-atc-icons]', atc).innerHTML || '').split('|');
    var paint = function () {
      qEl.textContent = qty;
      var dOff = qty <= 1, iOff = qty >= maxQty();
      dec.disabled = dOff; dec.style.color = dOff ? '#ccc' : '#333'; dec.style.cursor = dOff ? 'not-allowed' : 'pointer';
      inc.disabled = iOff; inc.style.color = iOff ? '#ccc' : '#333'; inc.style.cursor = iOff ? 'not-allowed' : 'pointer';
      addBtn.setAttribute('data-bg', added ? '#34BE82' : '#800000');
      addBtn.setAttribute('data-bg-hover', added ? '#34BE82' : '#5C0000');
      addBtn.style.backgroundColor = added ? '#34BE82' : '#800000';
      addInner.innerHTML = (added ? icons[0] : icons[1]) + (added ? 'Added' : 'Add To Cart');
    };
    dec.addEventListener('click', function () { qty = Math.max(qty - 1, 1); paint(); });
    inc.addEventListener('click', function () { qty = Math.min(qty + 1, maxQty()); paint(); });
    document.addEventListener('sh:cart-changed', paint);

    var addToCart = function () {
      var items = window.shCart.items();
      var found = items.filter(function (i) { return i.productId === product.id; })[0];
      if (!found) {
        var item = JSON.parse(JSON.stringify(payload));
        item.quantity = Math.min(qty, item.stock);
        items.push(item);
      } else {
        found.quantity = Math.min(found.quantity + qty, found.stock);
      }
      window.shCart.save(items);
      track(qty);
      added = true; paint();
      window.shToast.success(qty + '× "' + product.title + '" added to cart');
      setTimeout(function () { added = false; paint(); }, 2000);
    };
    addBtn.addEventListener('click', addToCart);
    $('[data-sh-atc-buy]', atc).addEventListener('click', function () { addToCart(); window.location.href = (SHX.home || '/') + 'checkout'; });

    var pickTarget = function (cs, sl, defCs, defSl) {
      if (cs && cs.indexOf('XXXXXXXX') === -1 && cs !== defCs) return cs;
      if (sl && sl !== defSl) return sl;
      if (cs && cs.indexOf('XXXXXXXX') === -1) return cs;
      return sl || '';
    };
    $('[data-sh-atc-wa]', atc).addEventListener('click', function () {
      var c = SHX.contact || {};
      var target = pickTarget(c.whatsappUrl, c.layoutWhatsapp, 'https://wa.me/8801700000000', '01700000000');
      var msg = 'Hi! I want to order: ' + product.title + '\nPrice: ' + fmt(product.price) + '\nQty: ' + qty + '\nLink: ' + window.location.href;
      window.open(formatWa(target, msg), '_blank');
    });
    $('[data-sh-atc-call]', atc).addEventListener('click', function () {
      var c = SHX.contact || {};
      var target = pickTarget(c.phoneNumber, c.layoutPhone, '01700000000', '01700000000');
      window.location.href = 'tel:' + String(target).replace(/[\s\-()]/g, '');
    });
    paint();
  }

  /* ── Hover colours of the .sh-tap buttons ── */
  $$('.sh-tap', root).forEach(function (b) {
    b.addEventListener('mouseenter', function () { b.style.backgroundColor = b.getAttribute('data-bg-hover'); });
    b.addEventListener('mouseleave', function () { b.style.backgroundColor = b.getAttribute('data-bg'); b.style.transform = 'scale(1)'; });
    b.addEventListener('mousedown', function () { b.style.transform = 'scale(0.97)'; });
    b.addEventListener('mouseup', function () { b.style.transform = 'scale(1)'; });
  });

  /* ═════════ Tabs ═════════ */
  var tabs = $('[data-sh-tabs]');
  if (tabs) {
    $$('[data-sh-tab]', tabs).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var name = btn.getAttribute('data-sh-tab');
        $$('[data-sh-tab]', tabs).forEach(function (b) {
          var on = b === btn;
          b.style.fontWeight = on ? '600' : '400'; b.style.color = on ? '#800000' : '#666'; b.style.borderColor = on ? '#800000' : 'transparent';
        });
        $$('[data-sh-tabpanel]', tabs).forEach(function (p) { p.hidden = p.getAttribute('data-sh-tabpanel') !== name; });
      });
    });

    /* Review form */
    var form = $('[data-sh-review-form]', tabs), msg = $('[data-sh-review-msg]', tabs), openBtn = $('[data-sh-review-open]', tabs);
    var rating = 5;
    var paintStars = function () {
      $$('[data-sh-review-stars] button', tabs).forEach(function (b) {
        var on = Number(b.getAttribute('data-v')) <= rating, svg = b.querySelector('svg');
        svg.style.color = on ? '#f59e0b' : '#ccc'; svg.style.fill = on ? '#f59e0b' : 'none';
      });
    };
    var showMsg = function (type, text) {
      msg.hidden = false; msg.textContent = text;
      msg.style.backgroundColor = type === 'success' ? '#f0fdf4' : '#fef2f2';
      msg.style.border = '1px solid ' + (type === 'success' ? '#bbf7d0' : '#fecaca');
      msg.style.color = type === 'success' ? '#15803d' : '#b91c1c';
    };
    openBtn.addEventListener('click', function () { form.hidden = false; openBtn.hidden = true; msg.hidden = true; paintStars(); });
    $('[data-sh-review-cancel]', tabs).addEventListener('click', function () { form.hidden = true; openBtn.hidden = false; });
    $$('[data-sh-review-stars] button', tabs).forEach(function (b) { b.addEventListener('click', function () { rating = Number(b.getAttribute('data-v')); paintStars(); }); });
    var submitting = false;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (submitting) return;
      submitting = true; msg.hidden = true;
      var submit = $('[data-sh-review-submit]', form);
      submit.textContent = 'Submitting...'; submit.style.opacity = '0.7'; submit.style.cursor = 'wait';
      fetch(SHX.rest + 'reviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: tabs.getAttribute('data-product-id'), name: form.elements.name.value, rating: rating, content: form.elements.content.value })
      }).then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (!res.ok) { showMsg('error', res.d.error || 'Failed to submit review. Please try again.'); return; }
          showMsg('success', 'Thank you! Your review has been submitted and will appear after approval.');
          form.reset(); rating = 5; form.hidden = true; openBtn.hidden = false;
        })
        .catch(function () { showMsg('error', 'Failed to submit review. Please try again.'); })
        .then(function () { submitting = false; submit.textContent = 'Submit Review'; submit.style.opacity = '1'; submit.style.cursor = 'pointer'; });
    });
  }
})();
