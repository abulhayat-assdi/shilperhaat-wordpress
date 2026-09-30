/* Home page behaviours: hero slider, category scroller, review carousel
 * (ports of components/home/HeroBanner.tsx, CategoryGrid.tsx, ReviewCarousel.tsx). */
(function () {
	'use strict';
	var $ = function (s, r) { return (r || document).querySelector(s); };
	var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

	/* Hero */
	var hero = $('#sh-hero');
	if (hero) {
		var slides = $$('.sh-hero-slide', hero), cur = 0, timer = null;
		var show = function (i) {
			cur = (i + slides.length) % slides.length;
			slides.forEach(function (s, k) {
				s.style.display = k === cur ? '' : 'none';
				if (k === cur) $$('img[loading=lazy]', s).forEach(function (im) { im.loading = 'eager'; });
			});
		};
		var reset = function () { if (timer) clearInterval(timer); if (slides.length > 1) timer = setInterval(function () { show(cur + 1); }, 4000); };
		hero.addEventListener('click', function (e) {
			var b = e.target.closest('button'); if (!b) return;
			e.stopPropagation();
			if (b.hasAttribute('data-hero-prev')) show(cur - 1);
			else if (b.hasAttribute('data-hero-next')) show(cur + 1);
			else if (b.hasAttribute('data-hero-dot')) show(Number(b.getAttribute('data-hero-dot')));
		});
		reset();
	}

	/* Category scroller (mobile arrows) */
	document.addEventListener('click', function (e) {
		var b = e.target.closest('[data-cat-scroll]'); if (!b) return;
		var track = $('#sh-cat-track');
		if (track) track.scrollBy({ left: Number(b.getAttribute('data-cat-scroll')) * 320, behavior: 'smooth' });
	});

	/* Reviews */
	var rc = $('#sh-reviews');
	if (rc) {
		var total = Number(rc.getAttribute('data-count')), track = $('#sh-rc-track'), dots = $('#sh-rc-dots');
		var perView = 1, current = 0, groups = total, t = null;
		var calc = function () {
			var w = window.innerWidth;
			var pv = w >= 1024 ? 3 : (w >= 640 ? 2 : 1);
			if (pv !== perView || !dots.childNodes.length) {
				perView = pv; groups = Math.ceil(total / perView); current = 0; draw();
			}
		};
		var draw = function () {
			track.style.transform = 'translateX(-' + (current * 100) + '%)';
			dots.innerHTML = '';
			for (var i = 0; i < groups; i++) {
				var d = document.createElement('button');
				d.type = 'button'; d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
				d.style.cssText = 'width:' + (i === current ? 24 : 8) + 'px;height:8px;border-radius:4px;background-color:' + (i === current ? '#800000' : '#ddd') + ';border:none;cursor:pointer;padding:0;transition:all 0.3s ease';
				(function (k) { d.addEventListener('click', function () { go(k); }); })(i);
				dots.appendChild(d);
			}
		};
		var go = function (i) { current = (i + groups) % groups; draw(); };
		var restart = function () { if (t) clearInterval(t); t = setInterval(function () { go(current + 1); }, 4000); };
		$('[data-rc-prev]', rc).addEventListener('click', function () { go(current - 1); });
		$('[data-rc-next]', rc).addEventListener('click', function () { go(current + 1); });
		window.addEventListener('resize', calc);
		calc(); restart();
	}
})();
