(function () {
    const items = Array.from(document.querySelectorAll('.js-lightbox-item'));
    if (!items.length) return;
  
    const dlg = document.getElementById('lightbox');
    const img = dlg.querySelector('.lb__img');
    const labelsBox = dlg.querySelector('.lb__labels');
    const counter = dlg.querySelector('.lb__counter');
    const btnPrev = dlg.querySelector('.lb__nav--prev');
    const btnNext = dlg.querySelector('.lb__nav--next');
    const btnClose = dlg.querySelector('.lb__close');
  
    let index = 0;
    let touchStartX = 0;
    
  
    function render() {
      const el = items[index];
      const src = el.getAttribute('data-full') || el.src;
      const alt = el.getAttribute('data-alt') || el.alt || '';
      const labels = (el.getAttribute('data-labels') || '').split('|').filter(Boolean);
  
      img.src = src;
      img.alt = alt;
  
      labelsBox.innerHTML = '';
      labels.forEach(l => {
        const s = document.createElement('span');
        s.className = 'tag';
        s.textContent = l;
        labelsBox.appendChild(s);
      });
  
      counter.textContent = `${index + 1} / ${items.length}`;
    }
  
    function openAt(i) {
      index = i;
      render();
      if (typeof dlg.showModal === 'function') dlg.showModal();
      else dlg.setAttribute('open', 'open'); // rudimentary fallback
      document.documentElement.style.overflow = 'hidden';
    }
    function close() {
      if (typeof dlg.close === 'function') dlg.close();
      else dlg.removeAttribute('open');
      document.documentElement.style.overflow = '';
    }
    
    function prev() { index = (index - 1 + items.length) % items.length; render(); }
    function next() { index = (index + 1) % items.length; render(); }
  
    items.forEach((el, i) => {
      el.style.cursor = 'zoom-in';
      el.addEventListener('click', () => openAt(i));
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openAt(i); });
      el.setAttribute('tabindex', '0');
    });

    [btnPrev, btnNext, btnClose, dlg.querySelector('.lb__stage')].forEach(el => {
        el.addEventListener('click', e => e.stopPropagation());
      });
  
    btnPrev.addEventListener('click', prev);
    btnNext.addEventListener('click', next);
    btnClose.addEventListener('click', close);
  
    dlg.addEventListener('click', e => {
      const rect = dlg.querySelector('.lb__stage').getBoundingClientRect();
      const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!inside) close();
    });
  
    window.addEventListener('keydown', e => {
      if (!dlg.open) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    });
  
    // basic swipe
    img.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    img.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(dx) > 40) (dx > 0 ? prev() : next());
    }, { passive: true });
  })();
  
  