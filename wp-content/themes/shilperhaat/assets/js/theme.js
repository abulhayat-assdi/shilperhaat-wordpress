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
