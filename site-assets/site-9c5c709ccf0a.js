'use strict';
// No networking, storage, HTML injection, trackers, or third-party scripts.
const walk = document.querySelector('[data-walk-calculator]');
if (walk) {
  const update = () => {
    const duration = walk.querySelector('#walk-duration').value;
    const count = Number(walk.querySelector('#walk-count').value);
    const each = duration === '60' ? 35 : 22;
    walk.querySelector('[data-total]').textContent = `$${(each * count).toFixed(0)} / week`;
    walk.querySelector('[data-estimate]').textContent = `${count} × ${duration}-minute walks at $${each} per walk. Planning estimate only; no package discount or booking implied.`;
  };
  walk.addEventListener('change', update);
  update();
}
const filters = document.querySelector('[data-filters]');
if (filters) {
  filters.addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;
    filters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let visible = 0;
    document.querySelectorAll('[data-category]').forEach(card => {
      const show = button.dataset.filter === 'all' || card.dataset.category === button.dataset.filter;
      card.hidden = !show;
      if (show) visible += 1;
    });
    document.querySelector('[data-filter-count]').textContent = `${visible} planning ${visible === 1 ? 'category' : 'categories'} shown. These are not venue listings.`;
  });
}
document.querySelectorAll('[data-print]').forEach(button => button.addEventListener('click', () => window.print()));
const workflow = document.querySelector('[data-workflow]');
if (workflow) {
  const notes = {
    leads: 'Start with a lead intake checklist. Keep outreach drafts for human review; do not auto-send messages.',
    reports: 'Use approved sample evidence. Keep a human review before publishing or sharing a report.',
    scheduling: 'Start with availability suggestions. Confirm the appointment before making a calendar commitment.',
    bookkeeping: 'Suggest transaction categories. Reconcile against the original records and review before filing.'
  };
  const update = () => { workflow.querySelector('[data-workflow-output]').textContent = notes[workflow.querySelector('select').value]; };
  workflow.addEventListener('change', update); update();
}

// Photo wall: thumbnails load in batches; the viewer opens full-size copies. No autoplay or network calls.
const grid = document.querySelector('[data-gallery]');
if (grid) {
  const items = [...grid.querySelectorAll('.grid-item')];
  const batch = Number(grid.dataset.batch) || 36;
  const tools = document.querySelector('[data-gallery-tools]');
  const more = document.querySelector('[data-gallery-more]');
  const status = more.querySelector('[data-gallery-status]');
  const nextBatch = more.querySelector('[data-gallery-next]');
  let filter = 'all';
  let limit = batch;
  const matching = () => items.filter(item => filter === 'all' || item.dataset.kind === filter);
  const render = () => {
    const shown = matching();
    items.forEach(item => { item.hidden = true; });
    shown.slice(0, limit).forEach(item => { item.hidden = false; });
    const count = Math.min(limit, shown.length);
    status.textContent = `Showing ${count} of ${shown.length}`;
    nextBatch.textContent = `Show ${Math.min(batch, shown.length - count)} more`;
    more.querySelectorAll('button').forEach(button => { button.hidden = count >= shown.length; });
  };
  tools.addEventListener('click', event => {
    const button = event.target.closest('button[data-gallery-filter]');
    if (!button) return;
    tools.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    filter = button.dataset.galleryFilter;
    limit = batch;
    render();
  });
  nextBatch.addEventListener('click', () => {
    const first = matching()[limit];
    limit += batch;
    render();
    if (first) first.querySelector('a').focus();
  });
  more.querySelector('[data-gallery-all]').addEventListener('click', () => { limit = items.length; render(); });

  const box = document.querySelector('[data-lightbox]');
  const stage = box.querySelector('[data-lightbox-stage]');
  const caption = box.querySelector('[data-lightbox-caption]');
  const counter = box.querySelector('[data-lightbox-count]');
  const original = box.querySelector('[data-lightbox-open]');
  let sequence = [];
  let index = 0;
  let opener = null;
  const show = target => {
    index = (target + sequence.length) % sequence.length;
    const link = sequence[index].querySelector('a');
    const thumb = link.querySelector('img');
    let media;
    if (link.dataset.type === 'video') {
      media = document.createElement('video');
      media.controls = true;
      media.playsInline = true;
      media.preload = 'metadata';
      media.poster = thumb.getAttribute('src');
      media.src = link.getAttribute('href');
      media.setAttribute('aria-label', thumb.alt);
    } else {
      media = document.createElement('img');
      media.src = link.getAttribute('href');
      media.alt = thumb.alt;
    }
    stage.replaceChildren(media);
    caption.textContent = link.dataset.caption;
    counter.textContent = `${index + 1} of ${sequence.length}`;
    original.href = link.getAttribute('href');
  };
  const open = item => {
    if (!matching().includes(item)) {
      filter = 'all';
      tools.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.galleryFilter === 'all')));
      render();
    }
    sequence = matching();
    opener = document.activeElement;
    show(sequence.indexOf(item));
    box.showModal();
  };
  grid.addEventListener('click', event => {
    const link = event.target.closest('a.grid-thumb');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    open(link.closest('.grid-item'));
  });
  // Photos placed elsewhere on the page open the same viewer.
  document.querySelectorAll('a[data-gallery-src]').forEach(link => link.addEventListener('click', event => {
    const item = items.find(entry => entry.querySelector('a').getAttribute('href') === link.dataset.gallerySrc);
    if (!item || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    open(item);
  }));
  box.querySelector('[data-lightbox-prev]').addEventListener('click', () => show(index - 1));
  box.querySelector('[data-lightbox-next]').addEventListener('click', () => show(index + 1));
  box.querySelector('[data-lightbox-close]').addEventListener('click', () => box.close());
  box.addEventListener('click', event => { if (event.target === box) box.close(); });
  box.addEventListener('keydown', event => {
    if (event.target.closest('video')) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
  });
  let startX = null;
  stage.addEventListener('pointerdown', event => { startX = event.target.closest('video') ? null : event.clientX; });
  stage.addEventListener('pointerup', event => {
    if (startX === null) return;
    const distance = event.clientX - startX;
    startX = null;
    if (Math.abs(distance) > 50) show(index + (distance < 0 ? 1 : -1));
  });
  box.addEventListener('close', () => {
    stage.replaceChildren();
    if (opener) opener.focus();
  });
  tools.hidden = false;
  more.hidden = false;
  render();
}
