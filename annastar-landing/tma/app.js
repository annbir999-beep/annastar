/**
 * tma/app.js — логика Telegram Mini App AnnaStar
 */

// ── Telegram WebApp init ──────────────────────────────────────────────────────
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

// ── Состояние ─────────────────────────────────────────────────────────────────
let works        = [];
let activeFilter = 'all';
let currentWork  = null;
let currentLang  = tmaLang; // из i18n.js

// ── DOM ───────────────────────────────────────────────────────────────────────
const grid      = document.getElementById('tmaGrid');
const filters   = document.getElementById('tmaFilters');
const overlay   = document.getElementById('tmaOverlay');
const sheet     = document.getElementById('tmaSheet');
const sheetImg  = document.getElementById('tmaSheetImg');
const sheetBody = document.getElementById('tmaSheetBody');
const form      = document.getElementById('tmaForm');
const success   = document.getElementById('tmaSuccess');
const langBtn   = document.getElementById('tmaLangBtn');

// ── Загрузка данных ───────────────────────────────────────────────────────────
async function loadWorks() {
  try {
    const res = await fetch('/data/works.json');
    if (!res.ok) throw new Error(res.status);
    works = await res.json();
  } catch {
    works = typeof WORKS_DATA !== 'undefined' ? WORKS_DATA : [];
  }
  renderGrid();
  applyI18n();
}

// ── Рендер сетки ─────────────────────────────────────────────────────────────
function renderGrid() {
  const filtered = activeFilter === 'all'
    ? works
    : activeFilter === 'concept'
      ? works.filter(w => w.concept)
      : works.filter(w => w.series?.toLowerCase() === activeFilter);

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="tma-empty">${t('error_load')}</p>`;
    return;
  }

  grid.innerHTML = filtered.map(cardHTML).join('');
  grid.querySelectorAll('.tma-card').forEach(card => {
    card.addEventListener('click', () => {
      const work = works.find(w => w.id === card.dataset.id);
      if (work) openSheet(work);
    });
  });
}

function cardHTML(w) {
  const isConcept  = w.concept === true;
  const isFeatured = w.tags?.includes('hero');
  const isNew      = w.year >= 2026 && !isFeatured && !isConcept;

  let badge = '';
  if (isConcept)       badge = `<span class="tma-card__badge tma-card__badge--concept">${t('concept')}</span>`;
  else if (isFeatured) badge = `<span class="tma-card__badge">${t('badge_hero')}</span>`;
  else if (isNew)      badge = `<span class="tma-card__badge tma-card__badge--new">${t('badge_new')}</span>`;

  const title = currentLang === 'en' ? w.title : (w.title_ru || w.title);
  const price = isConcept && w.formats?.length
    ? `${t('from')} ${w.formats[0].price_rub.toLocaleString('ru-RU')} ₽`
    : w.price_rub ? `${w.price_rub.toLocaleString('ru-RU')} ₽` : '';
  const status = isConcept ? t('concept') : w.available ? t('available') : t('sold');

  return `
    <article class="tma-card" data-id="${w.id}">
      ${badge}
      <div class="tma-card__img">
        <img src="/images/works/${w.image}" alt="${w.title}" loading="lazy" decoding="async"/>
      </div>
      <div class="tma-card__body">
        <p class="tma-card__title">${title}</p>
        <p class="tma-card__price">${price}</p>
        <p class="tma-card__status">${status}</p>
      </div>
    </article>`;
}

// ── Bottom sheet ──────────────────────────────────────────────────────────────
function openSheet(work) {
  currentWork = work;
  form.classList.remove('is-visible');
  success.classList.remove('is-visible');

  const title = currentLang === 'en' ? work.title : (work.title_ru || work.title);
  const desc  = currentLang === 'en' ? (work.description_en || work.description || '') : (work.description || '');

  sheetImg.src = `/images/works/${work.image}`;
  sheetImg.alt = work.title;

  if (work.concept) {
    const formatsHTML = (work.formats || []).map(f => `
      <div class="tma-sheet__format-row">
        <span>${f.size}</span>
        <span>${t('from')} ${f.price_rub.toLocaleString('ru-RU')} ₽</span>
      </div>`).join('');

    sheetBody.innerHTML = `
      <h2 class="tma-sheet__title">${title}</h2>
      <p class="tma-sheet__meta">${work.materials}</p>
      <p class="tma-sheet__desc">${desc}</p>
      ${work.formats?.length ? `
        <div class="tma-sheet__formats">
          <p class="tma-sheet__formats-title">${t('formats')}</p>
          ${formatsHTML}
        </div>` : ''}
      <button class="tma-btn tma-btn--primary" id="sheetOrderBtn">${t('commission')}</button>
      <p style="font-size:12px;color:var(--tg-theme-hint-color);text-align:center;margin-top:8px">${t('concept_note')}</p>`;
  } else {
    const statusText = work.available ? t('available') : t('sold');
    sheetBody.innerHTML = `
      <h2 class="tma-sheet__title">${title}</h2>
      <p class="tma-sheet__meta">${work.year} · ${work.materials}</p>
      <p class="tma-sheet__meta">${t('size')}: ${work.size}</p>
      <p class="tma-sheet__desc">${desc}</p>
      <p class="tma-sheet__price">${work.price_rub?.toLocaleString('ru-RU')} ₽ <span style="font-size:14px;font-weight:400;color:var(--tg-theme-hint-color)">${statusText}</span></p>
      ${work.available && work.payment_link
        ? `<button class="tma-btn tma-btn--primary" id="sheetBuyBtn">${t('buy')}</button>`
        : ''}
      <button class="tma-btn tma-btn--outline" id="sheetOrderBtn">${work.available ? t('enquire') : t('commission_similar')}</button>`;
  }

  // Кнопка покупки — открывает ссылку ЮКассы
  document.getElementById('sheetBuyBtn')?.addEventListener('click', () => {
    if (work.payment_link) tg ? tg.openLink(work.payment_link) : window.open(work.payment_link, '_blank');
  });

  // Кнопка заявки — показывает форму
  document.getElementById('sheetOrderBtn')?.addEventListener('click', showForm);

  overlay.classList.add('is-open');
  sheet.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  // Кнопка «Назад» в Telegram
  if (tg?.BackButton) {
    tg.BackButton.show();
    tg.BackButton.onClick(closeSheet);
  }
}

function closeSheet() {
  sheet.classList.remove('is-open');
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
  currentWork = null;
  if (tg?.BackButton) tg.BackButton.hide();
}

// ── Форма заявки ──────────────────────────────────────────────────────────────
function showForm() {
  sheetImg.style.display  = 'none';
  sheetBody.style.display = 'none';
  form.classList.add('is-visible');

  const workTitle = currentLang === 'en'
    ? currentWork?.title
    : (currentWork?.title_ru || currentWork?.title);
  document.getElementById('tmaFormWork').textContent = `${t('order_work')} ${workTitle || ''}`;

  // Автозаполнение имени из Telegram
  const tgUser = tg?.initDataUnsafe?.user;
  if (tgUser) {
    const nameField = document.getElementById('tmaName');
    if (nameField && !nameField.value) {
      nameField.value = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ');
    }
  }
}

function hideForm() {
  sheetImg.style.display  = '';
  sheetBody.style.display = '';
  form.classList.remove('is-visible');
}

document.getElementById('tmaFormBack')?.addEventListener('click', hideForm);

document.getElementById('tmaSubmit')?.addEventListener('click', async () => {
  const name    = document.getElementById('tmaName').value.trim();
  const phone   = document.getElementById('tmaPhone').value.trim();
  const comment = document.getElementById('tmaComment').value.trim();

  if (!name || !phone) {
    tg?.showAlert('Пожалуйста, укажите имя и телефон.');
    return;
  }

  const submitBtn = document.getElementById('tmaSubmit');
  submitBtn.disabled = true;
  submitBtn.textContent = '...';

  try {
    const res = await fetch('/api/tg-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        phone,
        comment,
        work_title: currentWork?.title,
        work_id:    currentWork?.id,
      }),
    });

    if (!res.ok) throw new Error(res.status);

    form.classList.remove('is-visible');
    success.classList.add('is-visible');
    sheetImg.style.display = 'none';

    if (tg?.BackButton) tg.BackButton.hide();
  } catch {
    tg?.showAlert('Ошибка. Попробуйте ещё раз.');
    submitBtn.disabled = false;
    submitBtn.textContent = t('order_submit');
  }
});

document.getElementById('tmaSuccessBack')?.addEventListener('click', () => {
  success.classList.remove('is-visible');
  closeSheet();
});

// ── Фильтры ───────────────────────────────────────────────────────────────────
filters.addEventListener('click', e => {
  const btn = e.target.closest('.tma-filter');
  if (!btn) return;
  filters.querySelectorAll('.tma-filter').forEach(b => b.classList.remove('is-active'));
  btn.classList.add('is-active');
  activeFilter = btn.dataset.filter;
  renderGrid();
});

overlay.addEventListener('click', closeSheet);

// ── Переключатель языка ───────────────────────────────────────────────────────
langBtn.addEventListener('click', () => {
  currentLang = currentLang === 'ru' ? 'en' : 'ru';
  // Патчим глобальную переменную из i18n.js (переопределяем через замыкание не выйдет,
  // поэтому просто меняем button и перерисовываем)
  langBtn.textContent = currentLang === 'ru' ? 'EN' : 'RU';
  applyI18n();
  renderGrid();
});

function applyI18n() {
  langBtn.textContent = currentLang === 'ru' ? 'EN' : 'RU';
  // Фильтры
  const filterLabels = {
    all:      currentLang === 'ru' ? 'Все'        : 'All',
    botanica: 'Botanica',
    space:    'Space',
    soul:     'Soul',
    concept:  currentLang === 'ru' ? 'Под заказ'  : 'Commission',
  };
  filters.querySelectorAll('.tma-filter').forEach(btn => {
    btn.textContent = filterLabels[btn.dataset.filter] ?? btn.dataset.filter;
  });
}

// ── Старт ─────────────────────────────────────────────────────────────────────
loadWorks();
