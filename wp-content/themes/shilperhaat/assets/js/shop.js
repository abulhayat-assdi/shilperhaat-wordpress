/* Shop filters (components/shop/ShopFilters.tsx): every change rebuilds the query string and reloads. */
(function () {
	'use strict';
	var root = document.getElementById('sh-shop');
	if (!root) return;
	var base = root.getAttribute('data-path');
	function update(key, value) {
		var p = new URLSearchParams(location.search);
		if (value) p.set(key, value); else p.delete(key);
		p.delete('page');
		var qs = p.toString();
		location.href = base + (qs ? '?' + qs : '');
	}
	var timers = {};
	root.addEventListener('change', function (e) {
		var el = e.target.closest('[data-filter]');
		if (!el) return;
		var k = el.getAttribute('data-filter');
		if (el.type === 'number') return;
		update(k, el.value);
	});
	root.addEventListener('input', function (e) {
		var el = e.target.closest('[data-filter]');
		if (!el || el.type !== 'number') return;
		var k = el.getAttribute('data-filter');
		clearTimeout(timers[k]);
		timers[k] = setTimeout(function () { update(k, el.value); }, 600);
	});
	root.addEventListener('click', function (e) {
		if (e.target.closest('[data-shop-clear]')) { location.href = base; return; }
		var drawer = document.getElementById('sh-shop-drawer');
		if (e.target.closest('[data-shop-open]')) drawer.style.display = 'block';
		else if (e.target.closest('[data-shop-close]')) drawer.style.display = 'none';
	});
})();
