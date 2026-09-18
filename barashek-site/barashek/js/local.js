(() => {
  'use strict';
  const script = document.currentScript;
  const root = new URL('../', script.src);
  const asset = path => new URL(path, root).href;
  const notice = document.createElement('dialog');
  notice.id = 'demo-notice';
  notice.className = 'local-demo-notice';
  notice.setAttribute('aria-labelledby', 'demo-title');
  notice.setAttribute('aria-describedby', 'demo-description');
  notice.innerHTML = '<h2 id="demo-title">Демонстрационный макет</h2><p id="demo-description">Это демо для портфолио, не сайт ресторана. Скачивание файлов, социальные сети, связь, бронирование и заказы недоступны. Ничего не отправляется и не сохраняется.</p><button type="button" autofocus>Понятно, закрыть</button>';
  document.body.appendChild(notice);
  let previousFocus;
  window.showDemoNotice = trigger => {
    if (notice.open) return;
    previousFocus = trigger || document.activeElement;
    document.body.classList.remove('changing_page');
    notice.showModal();
    notice.querySelector('button').focus();
  };
  notice.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      notice.querySelector('button').focus();
    }
  });
  notice.querySelector('button').addEventListener('click', () => notice.close());
  notice.addEventListener('click', e => {
    const rect = notice.getBoundingClientRect();
    if (e.target === notice && (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom)) notice.close();
  });
  notice.addEventListener('close', () => previousFocus?.focus({preventScroll:true}));
  const demoSelector = '[data-demo], .add_click, .remove_click';
  document.querySelectorAll(demoSelector).forEach(el => {
    el.setAttribute('aria-haspopup', 'dialog');
    el.setAttribute('aria-controls', notice.id);
    if (!el.matches('a, button') && !el.matches('.remove_click')) {
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
    }
    if (el.matches('.add_click')) {
      const name = el.querySelector('h2, h5')?.textContent || 'Блюдо';
      el.setAttribute('aria-label', name + ' - заказ недоступен, демо');
    }
  });
  document.addEventListener('click', e => {
    const trigger = e.target.closest(demoSelector);
    if (!trigger) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    window.showDemoNotice(trigger.closest('.add_click') || trigger);
  }, true);
  document.addEventListener('keydown', e => {
    const trigger = e.target.closest(demoSelector);
    if (!trigger || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    window.showDemoNotice(trigger);
  }, true);
  document.addEventListener('submit', e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    window.showDemoNotice(document.activeElement);
  }, true);
  document.querySelectorAll('.logotype, .delivery_logotype, .order_logotype').forEach(el => {
    const img = el.querySelector('img');
    if (img) { img.style.cssText = 'position:absolute!important;opacity:0!important;pointer-events:none!important;width:1px!important;height:1px!important'; img.alt = ''; }
    const mark = document.createElement('div');
    mark.className = 'local-wordmark';
    mark.setAttribute('aria-label', 'Барашек - грузинский ресторан');
    mark.innerHTML = '<div class="brand-sheep" aria-hidden="true"></div><div class="brand-overline">ГРУЗИНСКИЙ РЕСТОРАН</div><div class="brand-title">БАРАШЕК</div><div class="brand-tagline">ГРУЗИНСКАЯ КУХНЯ</div>';
    el.appendChild(mark);
  });
  const track = document.createElement('div');
  track.className = 'local-sheep-track';
  track.setAttribute('aria-label', 'Барашек - указатель прокрутки');
  track.innerHTML = '<div class="track-fill"></div><div class="track-sheep" role="img" aria-label="Барашек"></div>';
  document.body.appendChild(track);
  const sheep = track.querySelector('.track-sheep');
  const fill = track.querySelector('.track-fill');
  let previous = 0;
  const updateTrack = () => {
    const y = Math.max(0, window.scrollY);
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const progress = Math.min(1, y / max);
    fill.style.width = (progress * 100) + '%';
    sheep.style.left = (progress * 100) + '%';
    if (Math.abs(y - previous) > 1) sheep.style.backgroundImage = 'url("' + asset(y >= previous ? 'images/baran.png' : 'images/baran2.png') + '")';
    const size = innerWidth <= 600 ? 40 : 50;
    sheep.style.backgroundPosition = '0 ' + (-Math.floor(y / 45) % 12 * size) + 'px';
    previous = y;
  };
  addEventListener('scroll', updateTrack, {passive:true});
  addEventListener('resize', updateTrack);
  addEventListener('load', updateTrack);
  updateTrack();
  const tag = document.createElement('a');
  tag.href = asset('information/index.html');
  tag.className = 'local-prototype-tag';
  tag.textContent = 'ДИЗАЙН-МАКЕТ · БАРАШЕК';
  document.body.appendChild(tag);
  if (!document.querySelector('.local-portfolio-link')) {
    const back = document.createElement('a');
    back.href = asset('../../maxim-portfolio/maxim-portfolio.html');
    back.className = 'local-prototype-tag local-portfolio-link';
    back.textContent = '← В портфолио';
    document.body.appendChild(back);
  }
  const menu = document.querySelector('#menu');
  if (menu) {
    menu.setAttribute('role', 'button'); menu.tabIndex = 0;
    menu.setAttribute('aria-label', 'Открыть меню'); menu.setAttribute('aria-expanded', 'false');
    menu.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); menu.click(); }});
    menu.addEventListener('click', () => requestAnimationFrame(() => menu.setAttribute('aria-expanded', String(document.body.classList.contains('menu_opened')))));
  }
  addEventListener('keydown', e => {
    if (notice.open) return;
    if (e.key === 'Escape') {
      if (document.body.classList.contains('menu_opened')) menu?.click();
      document.querySelector('.local-lightbox')?.setAttribute('hidden', '');
    }
  });
  const food = document.querySelector('.page-menu .food > .ibm');
  if (food) { const browse = document.createElement('a'); browse.className = 'local-menu-open'; browse.href = asset('menu/catalog.html'); browse.textContent = 'Посмотреть все блюда'; food.appendChild(browse); }
  addEventListener('pageshow', () => document.body.classList.remove('changing_page'));
  document.querySelectorAll('.local-gallery button').forEach(button => button.addEventListener('click', () => {
    const lightbox = document.querySelector('.local-lightbox');
    lightbox.querySelector('img').src = button.querySelector('img').src;
    lightbox.querySelector('img').alt = button.querySelector('img').alt;
    lightbox.removeAttribute('hidden'); lightbox.querySelector('button').focus();
  }));
  document.querySelector('.local-lightbox')?.addEventListener('click', function(e) { if (e.target === this || e.target.tagName === 'BUTTON') this.setAttribute('hidden', ''); });
})();
