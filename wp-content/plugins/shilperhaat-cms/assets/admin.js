/* Shilperhaat admin helpers: media picker (WP media library), drag-to-sort, repeaters, confirms. */
(function ($) {
  'use strict';

  /* ── Media picker ── */
  $(document).on('click', '.sh-media-add', function (e) {
    e.preventDefault();
    var box = $(this).closest('.sh-media'), multi = box.data('multi') === 1 || box.data('multi') === '1', name = box.data('name');
    var type = box.data('type') || 'image';
    var frame = wp.media({ title: 'Select ' + type, multiple: multi, library: { type: type } });
    frame.on('select', function () {
      frame.state().get('selection').each(function (att) {
        var url = att.get('url');
        if (!multi) { box.find('.sh-media-item').remove(); }
        var item = $('<div class="sh-media-item" draggable="true"><img alt=""><input type="hidden"><button type="button" class="sh-media-rm" title="Remove">×</button></div>');
        if (type === 'video') { item.find('img').replaceWith($('<div class="sh-vid"></div>').text('🎬 ' + url.split('/').pop())); } else { item.find('img').attr('src', url); }
        item.find('input').attr({ name: name + (multi ? '[]' : ''), value: url });
        box.find('.sh-media-list').append(item);
      });
    });
    frame.open();
  });
  $(document).on('click', '.sh-media-rm', function () { $(this).closest('.sh-media-item').remove(); });

  /* drag to reorder inside a .sh-media-list */
  var dragEl = null;
  $(document).on('dragstart', '.sh-media-item', function (e) { dragEl = this; e.originalEvent.dataTransfer.effectAllowed = 'move'; });
  $(document).on('dragover', '.sh-media-item', function (e) { e.preventDefault(); });
  $(document).on('drop', '.sh-media-item', function (e) {
    e.preventDefault();
    if (dragEl && dragEl !== this && $(dragEl).parent()[0] === $(this).parent()[0]) {
      var items = $(this).parent().children().toArray();
      if (items.indexOf(dragEl) < items.indexOf(this)) { $(this).after(dragEl); } else { $(this).before(dragEl); }
    }
  });

  /* ── Repeater rows (label/url pairs, tags ...) ── */
  $(document).on('click', '[data-sh-repeat-add]', function () {
    var tpl = $($(this).data('sh-repeat-add')).html().replace(/__I__/g, String(Date.now()) + Math.floor(Math.random() * 1000));
    $(this).prev('.sh-repeat').append(tpl);
  });
  $(document).on('click', '.sh-repeat-del', function () { $(this).closest('.sh-repeat-row').remove(); });

  /* ── Confirm destructive actions ── */
  $(document).on('click submit', '[data-sh-confirm]', function (e) {
    if (!window.confirm($(this).data('sh-confirm'))) { e.preventDefault(); e.stopImmediatePropagation(); }
  });

  /* ── Auto-slug from title ── */
  $(document).on('input', '[data-sh-slug-from]', function () {
    var target = $($(this).data('sh-slug-from'));
    if (target.length && !target.data('touched')) {
      target.val($(this).val().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-'));
    }
  });
  $(document).on('input', '[data-sh-slug]', function () { $(this).data('touched', true); });

  /* ── Live preview of Steadfast/Meta test buttons ── */
  $(document).on('click', '[data-sh-ajax]', function (e) {
    e.preventDefault();
    var btn = $(this), out = $(btn.data('sh-out'));
    btn.prop('disabled', true); out.text('Checking…');
    $.post(window.ajaxurl, { action: btn.data('sh-ajax'), _wpnonce: btn.data('nonce') }, function (r) {
      out.text(r && r.data ? r.data : (r.success ? 'OK' : 'Failed')).css('color', r.success ? '#2e7d32' : '#b71c1c');
    }).fail(function () { out.text('Request failed').css('color', '#b71c1c'); }).always(function () { btn.prop('disabled', false); });
  });

  /* ── Download media from the live site (batched) ── */
  $(document).on('click', '#sh-media-start', function () {
    var btn = $(this), box = $('#sh-media-progress'), log = $('#sh-media-log'), bar = $('#sh-media-bar'), txt = $('#sh-media-text');
    btn.prop('disabled', true); box.show(); log.text('');
    function step(offset) {
      $.post(window.ajaxurl, { action: 'sh_media_batch', _wpnonce: btn.data('nonce'), base: $('#sh-media-base').val(), offset: offset }, function (r) {
        if (!r || !r.success) { txt.text('Failed: ' + (r && r.data ? r.data : 'error')).css('color', '#b71c1c'); btn.prop('disabled', false); return; }
        var d = r.data;
        bar.attr('max', Math.max(d.total, 1)).val(Math.min(d.next, d.total));
        txt.text(Math.min(d.next, d.total) + ' / ' + d.total);
        log.append(document.createTextNode(d.log.join('\n') + '\n')); log.scrollTop(log[0].scrollHeight);
        if (d.done) { txt.text('Done — ' + d.total + ' files checked'); btn.prop('disabled', false); } else { step(d.next); }
      }).fail(function () { txt.text('Request failed — click again to resume.').css('color', '#b71c1c'); btn.prop('disabled', false); });
    }
    step(0);
  });
})(jQuery);
