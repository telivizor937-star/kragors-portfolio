/* Front-end-only prototype. No customer data is transmitted. */
(() => {
  'use strict';
  const script = document.currentScript;
  const root = new URL('../', script.src);
  const asset = path => new URL(path, root).href;
  document.querySelectorAll('.logotype, .delivery_logotype, .order_logotype').forEach(el => {
    const img = el.querySelector('img');
    if (img) { img.style.cssText = 'position:absolute!important;opacity:0!important;pointer-events:none!important;width:1px!important;height:1px!important'; img.alt = ''; }
    const mark = document.createElement('div');
    mark.className = 'local-wordmark';
    mark.setAttribute('aria-label', 'Барашек — грузинский ресторан');
    mark.innerHTML = '<div class="brand-sheep" aria-hidden="true"></div><div class="brand-overline">ГРУЗИНСКИЙ РЕСТОРАН</div><div class="brand-title">БАРАШЕК</div><div class="brand-tagline">ГРУЗИНСКАЯ КУХНЯ</div>';
    el.appendChild(mark);
  });
  const track = document.createElement('div');
  track.className = 'local-sheep-track';
  track.setAttribute('aria-label', 'Барашек — указатель прокрутки');
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

  const menu = document.querySelector('#menu');
  if (menu) {
    menu.setAttribute('role', 'button'); menu.tabIndex = 0;
    menu.setAttribute('aria-label', 'Открыть меню'); menu.setAttribute('aria-expanded', 'false');
    menu.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); menu.click(); }});
    menu.addEventListener('click', () => requestAnimationFrame(() => menu.setAttribute('aria-expanded', String(document.body.classList.contains('menu_opened')))));
  }
  const form = document.querySelector('.reservation-modal form');
  const modal = document.querySelector('.reservation-modal');
  let previousFocus;
  if (modal) { modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true'); modal.setAttribute('aria-label','Заказ столика'); }
  document.querySelectorAll('.reservation-button,.reservation-modal .close,.send_btn').forEach(el => {
    el.tabIndex = 0; el.setAttribute('role','button');
    el.addEventListener('keydown', e => {if(e.key === 'Enter' || e.key === ' '){e.preventDefault();el.click();}});
  });
  if (form) {
    const inputs = [...form.querySelectorAll('input[type="text"]')];
    inputs.forEach((el,i) => {el.required = true;el.setAttribute('aria-label', i === 0 ? 'Имя' : 'Номер телефона');if(i===1){el.type='tel';el.inputMode='tel';}});
    const description = form.querySelector('.input p');
    if(description) description.textContent = 'Демонстрация формы: данные проверяются только в браузере. Заявка не отправляется в ресторан.';
    const status = form.querySelector('.feedback_error');
    if(status) {status.classList.add('local-status');status.setAttribute('role','status');}
    const submit = e => {
      e.preventDefault(); e.stopImmediatePropagation();
      const name = form.querySelector('input[name="name-nec"]');
      const phone = form.querySelector('input[name="contact-phone-nec"]');
      const policy = form.querySelector('input[type="checkbox"]');
      let message = '';
      if(!name.value.trim()) {message='Введите ваше имя.';name.focus();}
      else if(phone.value.replace(/\D/g,'').length < 10) {message='Введите номер телефона: минимум 10 цифр.';phone.focus();}
      else if(!policy.checked) {message='Подтвердите согласие на обработку данных.';policy.focus();}
      else message='Форма заполнена верно. Это демонстрация: заявка не отправлена, данные не сохранены.';
      status.textContent=message;status.style.display='block';status.style.color='#ecd18c';
      form.querySelectorAll('.order_error').forEach(el=>el.style.display='none');
    };
    form.addEventListener('submit',submit,true);
    form.querySelector('.send_btn').addEventListener('click',submit,true);
    document.querySelector('.reservation-button')?.addEventListener('click',()=>{previousFocus=document.activeElement;setTimeout(()=>inputs[0]?.focus(),100);});
    modal.addEventListener('click',e=>{if(e.target===modal){document.body.classList.remove('modal_opened');previousFocus?.focus();}});
  }
  addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      if(document.body.classList.contains('menu_opened')) menu?.click();
      if(document.body.classList.contains('modal_opened')){document.body.classList.remove('modal_opened');previousFocus?.focus();}
      document.querySelector('.local-lightbox')?.setAttribute('hidden','');
    }
    if(e.key==='Tab' && document.body.classList.contains('modal_opened')){
      const focusable=[...modal.querySelectorAll('input,a,[tabindex="0"]')].filter(el=>el.offsetParent!==null);
      const first=focusable[0],last=focusable[focusable.length-1];
      if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  document.querySelectorAll('#contacts .btn_border').forEach(el=>{
    el.textContent='Контакты';el.tabIndex=0;el.setAttribute('role','link');
    el.addEventListener('click',()=>location.href=asset('contacts/index.html'));
    el.addEventListener('keydown',e=>{if(e.key==='Enter')el.click();});
  });
  // Replace inaccessible server-side ordering with a complete local menu browser.
  const food = document.querySelector('.page-menu .food > .ibm');
  if(food){const browse=document.createElement('a');browse.className='local-menu-open';browse.href=asset('menu/catalog.html');browse.textContent='Посмотреть все блюда';food.appendChild(browse);}
  // Never make legacy form or ordering requests to the source restaurant.
  if(window.Feedback) Feedback.prototype.ajaxForm=function(){this.feedbackError('clean');this.error.textContent='Демонстрация: заявка не отправлена.';this.error.style.display='block';};
  if(window.Ajax) Ajax.prototype.exec=function(){if(this.success)this.success({status:'demo',count:0,sum:0,items:[]});};
  // Download links must not leave the page in its exit-fade state.
  addEventListener('pageshow',()=>document.body.classList.remove('changing_page'));
  document.querySelectorAll('a[download]').forEach(a=>a.addEventListener('click',()=>setTimeout(()=>document.body.classList.remove('changing_page'),0)));
  document.querySelectorAll('.local-gallery button').forEach(button=>button.addEventListener('click',()=>{
    const lightbox=document.querySelector('.local-lightbox');
    lightbox.querySelector('img').src=button.querySelector('img').src;
    lightbox.querySelector('img').alt=button.querySelector('img').alt;
    lightbox.removeAttribute('hidden');lightbox.querySelector('button').focus();
  }));
  document.querySelector('.local-lightbox')?.addEventListener('click',function(e){if(e.target===this || e.target.tagName==='BUTTON')this.setAttribute('hidden','');});
})();
