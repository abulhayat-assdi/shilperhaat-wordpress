/* Shilperhaat theme behaviour (vanilla JS, no build step).
   Ports the client-side behaviour of Header / BottomNav / MobileMenu / FloatingContact. */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ── Cart store (same localStorage key/shape as the original: "sh_cart") ── */
  var CART_KEY = 'sh_cart';
  var Cart = {
    items: function () {
      try {
        var raw = localStorage.getItem(CART_KEY);
        var parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) { return []; }
    },
    save: function (items) {
      try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch (e) {}
      document.dispatchEvent(new CustomEvent('sh:cart-changed', { detail: { items: items } }));
    },
    count: function () { return Cart.items().length; },   // original itemCount = distinct lines
    open: function () { document.dispatchEvent(new CustomEvent('sh:open-cart')); }
  };
  window.shCart = Cart;

  function renderCartBadges() {
    var n = Cart.count();
    $$('[data-sh-cart-count]').forEach(function (el) {
      el.textContent = n > 9 ? '9+' : String(n);
      if (n > 0) { el.removeAttribute('hidden'); } else { el.setAttribute('hidden', ''); }
    });
    var icon = $('[data-sh-cart-icon] svg');
    var label = $('[data-sh-cart-label]');
    if (icon) {
      icon.style.color = n > 0 ? '#800000' : '#888888';
      icon.setAttribute('stroke-width', n > 0 ? '2.5' : '1.75');
    }
    if (label) {
      label.style.color = n > 0 ? '#800000' : '#888888';
      label.style.fontWeight = n > 0 ? '600' : '400';
    }
  }
  document.addEventListener('sh:cart-changed', renderCartBadges);
  window.addEventListener('storage', function (e) { if (e.key === CART_KEY) renderCartBadges(); });

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-sh-open-cart]')) { Cart.open(); }
  });

  /* ── Search: ignore empty queries ── */
  $$('[data-sh-search]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      var input = form.querySelector('input[name="search"]');
      if (!input || !input.value.trim()) { e.preventDefault(); }
    });
  });

  /* ── Desktop "More" dropdown ── */
  var more = $('[data-sh-more]');
  if (more) {
    var moreMenu = $('[data-sh-more-menu]', more);
    var moreToggle = $('[data-sh-more-toggle]', more);
    var setMore = function (open) {
      if (open) { moreMenu.removeAttribute('hidden'); } else { moreMenu.setAttribute('hidden', ''); }
      moreToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      moreToggle.style.color = open ? '#800000' : '#333';
      $('[data-sh-more-icon-menu]', more).hidden = open;
      $('[data-sh-more-icon-close]', more).hidden = !open;
    };
    moreToggle.addEventListener('click', function () { setMore(moreMenu.hasAttribute('hidden')); });
    moreMenu.addEventListener('click', function (e) { if (e.target.closest('a')) setMore(false); });
    document.addEventListener('mousedown', function (e) { if (!more.contains(e.target)) setMore(false); });
  }

  /* ── Sticky desktop nav ── */
  var nav = $('[data-sh-nav]');
  var middle = $('[data-sh-header-middle]');
  if (nav) {
    var sticky = false;
    var onScroll = function () {
      var h = (middle && middle.offsetHeight) || 72;
      var now = window.scrollY > h;
      if (now === sticky) return;
      sticky = now;
      if (sticky) {
        nav.style.position = 'fixed'; nav.style.top = '0'; nav.style.left = '0'; nav.style.zIndex = '1000';
        nav.style.boxShadow = '0 2px 12px rgba(0,0,0,0.25)'; nav.style.animation = 'slideDown 0.3s ease';
      } else {
        nav.style.position = 'relative'; nav.style.top = ''; nav.style.left = ''; nav.style.zIndex = '10';
        nav.style.boxShadow = ''; nav.style.animation = '';
      }
      document.body.style.paddingTop = sticky ? '48px' : '0';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile drawer ── */
  var menu = $('[data-sh-menu]');
  var backdrop = $('[data-sh-menu-backdrop]');
  if (menu && backdrop) {
    var setMenu = function (open) {
      menu.style.transform = open ? 'translateX(0)' : 'translateX(-100%)';
      menu.style.boxShadow = open ? '4px 0 24px rgba(0,0,0,0.15)' : 'none';
      backdrop.style.opacity = open ? '1' : '0';
      backdrop.style.pointerEvents = open ? 'auto' : 'none';
      document.body.style.overflow = open ? 'hidden' : '';
    };
    $$('[data-sh-open-menu]').forEach(function (b) { b.addEventListener('click', function () { setMenu(true); }); });
    $$('[data-sh-close-menu]').forEach(function (b) { b.addEventListener('click', function () { setMenu(false); }); });
    backdrop.addEventListener('click', function () { setMenu(false); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  }

  /* ── Floating contact widget ── */
  var widget = $('[data-sh-contact]');
  if (widget) {
    var card = $('[data-sh-contact-card]', widget);
    var setContact = function (open) {
      if (open) { card.removeAttribute('hidden'); } else { card.setAttribute('hidden', ''); }
      $('[data-sh-contact-pulse]', widget).hidden = open;
      $('[data-sh-contact-blob]', widget).style.borderRadius = open ? '50%' : '50% 50% 12px 50%';
      $('[data-sh-contact-icon-open]', widget).hidden = open;
      $('[data-sh-contact-icon-close]', widget).hidden = !open;
    };
    var isOpen = function () { return !card.hasAttribute('hidden'); };
    $('[data-sh-contact-toggle]', widget).addEventListener('click', function () { setContact(!isOpen()); });
    $('[data-sh-contact-close]', widget).addEventListener('click', function () { setContact(false); });
    $$('[data-sh-open-contact]').forEach(function (b) { b.addEventListener('click', function () { setContact(true); }); });
    document.addEventListener('mousedown', function (e) {
      if (isOpen() && !widget.contains(e.target) && !e.target.closest('[data-sh-open-contact]')) setContact(false);
    });
  }

  renderCartBadges();
})();

/* ═════════ Storefront widgets (home / cards) ═════════ */
(function () {
  'use strict';
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var SHX = window.SH || {};

  /* ── Toasts (port of ToastProvider) ── */
  var toastBox;
  function ensureToastBox() {
    if (toastBox) return toastBox;
    toastBox = document.createElement('div');
    toastBox.className = 'fixed bottom-20 right-4 z-[9999] flex flex-col gap-2 md:bottom-6 md:right-6';
    document.body.appendChild(toastBox);
    return toastBox;
  }
  var toastColors = {
    success: 'bg-white border-green-200 shadow-green-100', error: 'bg-white border-red-200 shadow-red-100',
    warning: 'bg-white border-yellow-200 shadow-yellow-100', info: 'bg-white border-blue-200 shadow-blue-100'
  };
  function toast(type, message) {
    var box = ensureToastBox();
    var el = document.createElement('div');
    el.className = 'flex items-start gap-3 p-3 rounded-xl border shadow-lg max-w-xs ' + toastColors[type];
    el.style.cssText = 'opacity:0;transform:translateX(60px) scale(0.9);transition:opacity 0.22s ease, transform 0.22s ease';
    var icon = document.createElement('div'); icon.className = 'mt-0.5 flex-shrink-0'; icon.innerHTML = (SHX.icons || {})[type] || '';
    var p = document.createElement('p'); p.className = 'text-sm text-[#1a1208] flex-1 leading-snug'; p.textContent = message;
    var x = document.createElement('button'); x.className = 'text-gray-400 hover:text-gray-600 flex-shrink-0'; x.innerHTML = (SHX.icons || {}).close || '×';
    x.addEventListener('click', function () { el.remove(); });
    el.appendChild(icon); el.appendChild(p); el.appendChild(x); box.appendChild(el);
    requestAnimationFrame(function () { el.style.opacity = '1'; el.style.transform = 'translateX(0) scale(1)'; });
    setTimeout(function () { el.remove(); }, 3000);
  }
  window.shToast = { success: function (m) { toast('success', m); }, error: function (m) { toast('error', m); }, warning: function (m) { toast('warning', m); }, info: function (m) { toast('info', m); } };

  /* ── Cart mutations (same rules as cart-context reducer) ── */
  function addItem(item) {
    var items = window.shCart.items();
    var found = items.filter(function (i) { return i.productId === item.productId; })[0];
    if (found) { found.quantity = Math.min(found.quantity + 1, found.stock); }
    else { item.quantity = 1; items.push(item); }
    window.shCart.save(items);
  }
  window.shCartAdd = addItem;

  document.addEventListener('click', function (e) {
    var stop = e.target.closest('[data-sh-stop-link]');
    if (stop) { e.preventDefault(); }

    var add = e.target.closest('[data-sh-add-to-cart]');
    if (add && !add.disabled) {
      e.preventDefault(); e.stopPropagation();
      var item = JSON.parse(add.getAttribute('data-sh-add-to-cart'));
      if (item.stock === 0) { window.shToast.error('This product is currently out of stock'); return; }
      addItem(item);
      window.shToast.success('"' + item.title + '" added to cart');
      return;
    }
    var buy = e.target.closest('[data-sh-buy-now]');
    if (buy && !buy.disabled) {
      e.preventDefault(); e.stopPropagation();
      var it = JSON.parse(buy.getAttribute('data-sh-buy-now'));
      if (it.stock === 0) { window.shToast.error('This product is currently out of stock'); return; }
      addItem(it);
      window.location.href = (SHX.home || '/') + 'checkout';
    }
  });

  /* ── Image fallback (onError → placeholder) ── */
  function bindFallback(img) {
    img.addEventListener('error', function () {
      if (SHX.placeholder && img.src !== SHX.placeholder) { img.src = SHX.placeholder; }
    }, { once: true });
    if (img.complete && img.naturalWidth === 0 && SHX.placeholder) { img.src = SHX.placeholder; }
  }
  $$('img[data-sh-fallback]').forEach(bindFallback);

  /* ── Hero banner slider ── */
  var hero = $('[data-sh-hero]');
  if (hero) {
    var slides = $$('[data-sh-slide]', hero);
    var dots = $$('[data-sh-hero-dot]', hero);
    var cur = 0;
    var withMobile = ['aspect-[768/400]', 'md:aspect-[1920/600]', 'max-h-[520px]'];
    var show = function (n) {
      cur = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        if (i === cur) { s.removeAttribute('hidden'); } else { s.setAttribute('hidden', ''); }
      });
      dots.forEach(function (d, i) {
        d.style.width = i === cur ? '20px' : '8px';
        d.style.backgroundColor = i === cur ? '#800000' : 'rgba(255,255,255,0.5)';
      });
      var hasMobile = slides[cur].getAttribute('data-has-mobile') === '1';
      withMobile.forEach(function (c) { hero.classList.toggle(c, hasMobile); });
      hero.style.height = hasMobile ? '' : 'clamp(280px, 52vw, 520px)';
    };
    if (slides.length > 1) {
      var prev = $('[data-sh-hero-prev]', hero), next = $('[data-sh-hero-next]', hero);
      prev.addEventListener('click', function (e) { e.stopPropagation(); show(cur - 1); });
      next.addEventListener('click', function (e) { e.stopPropagation(); show(cur + 1); });
      dots.forEach(function (d, i) { d.addEventListener('click', function (e) { e.stopPropagation(); show(i); }); });
      var timer = setInterval(function () { show(cur + 1); }, 4000);
      // the original restarts the 4s timer after manual navigation; keep it simple but equivalent
      hero.addEventListener('click', function () { clearInterval(timer); timer = setInterval(function () { show(cur + 1); }, 4000); });
    }
  }

  /* ── Category strip arrows (mobile) ── */
  var catTrack = $('[data-sh-cat-track]');
  $$('[data-sh-cat-scroll]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (catTrack) catTrack.scrollBy({ left: Number(b.getAttribute('data-sh-cat-scroll')) * 320, behavior: 'smooth' });
    });
  });

  /* ── Review carousel ── */
  var rev = $('[data-sh-reviews]');
  if (rev) {
    var track = $('[data-sh-rev-track]', rev);
    var items = $$('[data-sh-rev-item]', rev);
    var dotsBox = $('[data-sh-rev-dots]', rev);
    var current = 0, perView = 1, groups = 1, revTimer;
    var perViewNow = function () { return window.innerWidth >= 1024 ? 3 : (window.innerWidth >= 640 ? 2 : 1); };
    var renderRev = function () {
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      $$('button', dotsBox).forEach(function (d, i) {
        d.style.width = i === current ? '24px' : '8px';
        d.style.backgroundColor = i === current ? '#800000' : '#ddd';
      });
    };
    var layout = function () {
      perView = perViewNow();
      groups = Math.ceil(items.length / perView);
      items.forEach(function (it) { it.style.width = (100 / perView) + '%'; });
      dotsBox.innerHTML = '';
      for (var i = 0; i < groups; i++) {
        (function (i) {
          var d = document.createElement('button');
          d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
          d.style.cssText = 'height:8px;border-radius:4px;border:none;cursor:pointer;padding:0;transition:all 0.3s ease';
          d.addEventListener('click', function () { current = i; renderRev(); });
          dotsBox.appendChild(d);
        })(i);
      }
      current = 0; renderRev();
    };
    $('[data-sh-rev-prev]', rev).addEventListener('click', function () { current = (current - 1 + groups) % groups; renderRev(); });
    $('[data-sh-rev-next]', rev).addEventListener('click', function () { current = (current + 1) % groups; renderRev(); });
    var lastPer = perViewNow();
    window.addEventListener('resize', function () { if (perViewNow() !== lastPer) { lastPer = perViewNow(); layout(); } });
    layout();
    revTimer = setInterval(function () { current = (current + 1) % groups; renderRev(); }, 4000);
  }
})();

/* ═════════ Shop filters (port of ShopFilters.tsx) ═════════ */
(function () {
  'use strict';
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var controls = $$('[data-sh-filter]');
  if (!controls.length) return;

  function update(key, value) {
    var params = new URLSearchParams(window.location.search);
    if (value) { params.set(key, value); } else { params.delete(key); }
    params.delete('page');
    var qs = params.toString();
    window.location.href = window.location.pathname + (qs ? '?' + qs : '');
  }
  var timer;
  controls.forEach(function (el) {
    el.addEventListener('change', function () { update(el.getAttribute('data-sh-filter'), el.value); });
    if (el.hasAttribute('data-sh-filter-debounce')) {
      el.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { update(el.getAttribute('data-sh-filter'), el.value); }, 700); });
    }
  });

  var drawer = $('[data-sh-filter-drawer]'), backdrop = $('[data-sh-filter-backdrop]');
  var setDrawer = function (open) {
    if (!drawer) return;
    drawer.hidden = !open; backdrop.hidden = !open;
  };
  $$('[data-sh-open-filters]').forEach(function (b) { b.addEventListener('click', function () { setDrawer(true); }); });
  $$('[data-sh-close-filters]').forEach(function (b) { b.addEventListener('click', function () { setDrawer(false); }); });
  if (backdrop) backdrop.addEventListener('click', function () { setDrawer(false); });
})();

/* ═════════ Blog category filter ═════════ */
(function () {
  'use strict';
  var blog = document.querySelector('[data-sh-blog]');
  if (!blog) return;
  var grid = blog.querySelector('[data-sh-blog-grid]');
  var empty = blog.querySelector('[data-sh-blog-empty]');
  var allBtn = blog.querySelector('[data-sh-blog-all]');
  var btns = Array.prototype.slice.call(blog.querySelectorAll('.sh-blog-cat'));
  var cards = grid ? Array.prototype.slice.call(grid.children) : [];
  var active = 'All';
  var on = 'text-white shadow-md', off = 'bg-white text-gray-600 border border-gray-200 hover:border-[#800000] hover:text-[#800000]';
  function apply(cat) {
    active = cat;
    btns.forEach(function (b) {
      var is = b.getAttribute('data-cat') === cat;
      b.className = 'sh-blog-cat px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ' + (is ? on : off);
      b.style.backgroundColor = is ? '#800000' : '';
    });
    var shown = 0;
    cards.forEach(function (c) {
      var ok = cat === 'All' || c.getAttribute('data-cat') === cat;
      c.style.display = ok ? '' : 'none';
      if (ok) shown++;
    });
    if (grid) grid.hidden = shown === 0;
    if (empty) empty.hidden = shown !== 0;
    if (allBtn) allBtn.hidden = cat === 'All';
  }
  btns.forEach(function (b) { b.addEventListener('click', function () { apply(b.getAttribute('data-cat')); }); });
  if (allBtn) allBtn.addEventListener('click', function () { apply('All'); });
})();
