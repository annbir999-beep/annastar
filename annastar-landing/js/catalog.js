/**
 * catalog.js — загрузка и фильтрация каталога работ
 * Читает data/works.json, рендерит карточки, поддерживает фильтры и модалку
 */

class Catalog {
  constructor() {
    this.grid    = document.getElementById('catalogGrid');
    this.filters = document.getElementById('catalogFilters');
    this.modal   = document.getElementById('workModal');
    this.modalContent = document.getElementById('modalContent');

    if (!this.grid) return;

    this.works      = [];
    this.activeFilter = 'all';

    this._init();
  }

  async _init() {
    await this._loadWorks();
    this._renderCards(this.works);
    this._bindFilters();
    this._bindModal();

    document.addEventListener('langchange', () => {
      const filtered = this.activeFilter === 'all'
        ? this.works
        : this.works.filter(w => w.series?.toLowerCase() === this.activeFilter);
      this._renderCards(filtered);
    });
  }

  _t(ru, en) {
    return window.LANG === 'en' ? en : ru;
  }

  async _loadWorks() {
    try {
      const res = await fetch('data/works.json');
      if (!res.ok) throw new Error(res.status);
      this.works = await res.json();
    } catch (err) {
      // При открытии файла напрямую (file://) fetch не работает — используем встроенные данные
      if (typeof WORKS_DATA !== 'undefined') {
        this.works = WORKS_DATA;
      } else {
        console.error('Не удалось загрузить works.json:', err);
        this.works = [];
      }
    }
  }


  _renderCards(works) {
    if (works.length === 0) {
      this.grid.innerHTML = `<p style="column-span:all;text-align:center;color:var(--color-text-light)">
        Работ в этой категории пока нет.
      </p>`;
      return;
    }

    this.grid.innerHTML = works.map(w => this._cardHTML(w)).join('');

    // Анимация появления
    this.grid.querySelectorAll('.work-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(16px)';
      setTimeout(() => {
        card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
        card.style.opacity    = '1';
        card.style.transform  = 'translateY(0)';
      }, i * 60);
    });
  }

  _imageHTML(image, alt, attrs = '') {
    return `<img src="images/works/${image}" alt="${alt}" loading="lazy" ${attrs}/>`;
  }

  _cardHTML(w) {
    const isConcept  = w.concept === true;
    const isFeatured = w.tags?.includes('hero');
    const isNew      = w.year >= 2026 && !isFeatured && !isConcept;

    const statusClass = isConcept   ? 'work-card__status--concept'
      : w.available   ? 'work-card__status--available'
      :                 'work-card__status--sold';
    const statusText  = isConcept   ? this._t('Под заказ', 'Commission')
      : w.available   ? this._t('В наличии', 'Available')
      :                 this._t('Продана', 'Sold');

    let badgeHTML = '';
    if (isConcept)       badgeHTML = `<span class="work-card__badge work-card__badge--concept">${this._t('Под заказ', 'Commission')}</span>`;
    else if (isFeatured) badgeHTML = `<span class="work-card__badge">${this._t('Флагман коллекции', 'Collection hero')}</span>`;
    else if (isNew)      badgeHTML = `<span class="work-card__badge work-card__badge--new">${this._t('Новинка', 'New')}</span>`;

    const priceHTML = isConcept && w.formats?.length
      ? `${this._t('от', 'from')} ${w.formats[0].price_rub.toLocaleString('ru-RU')} ₽`
      : w.price_rub ? `${w.price_rub.toLocaleString('ru-RU')} ₽` : '';

    const wishlist  = this._getWishlist();
    const isWished  = wishlist.includes(w.id);
    const cardTitle = window.LANG === 'en' ? w.title : (w.title_ru || w.title);
    const cardSub   = window.LANG === 'en' ? w.title : w.title_ru;

    return `
      <article class="work-card${isFeatured ? ' work-card--featured' : ''}${isConcept ? ' work-card--concept' : ''}"
               data-id="${w.id}" role="button" tabindex="0"
               aria-label="${this._t('Открыть работу', 'Open work')}: ${w.title}">
        ${badgeHTML}
        <button class="work-card__wish${isWished ? ' is-wished' : ''}" data-wish="${w.id}"
                aria-label="${this._t('В избранное', 'Wishlist')}"
                title="${this._t('В избранное', 'Add to wishlist')}">♡</button>
        <div class="work-card__img">
          ${this._imageHTML(w.image, w.title)}
        </div>
        <div class="work-card__body">
          <h3 class="work-card__title">${cardTitle}</h3>
          ${cardSub && cardSub !== cardTitle ? `<p class="work-card__title-ru">${cardSub}</p>` : ''}
          ${w.materials ? `<p class="work-card__materials">${w.materials}</p>` : ''}
          <div class="work-card__footer">
            <span class="work-card__price">${priceHTML}</span>
            <span class="work-card__status ${statusClass}">${statusText}</span>
          </div>
        </div>
      </article>
    `;
  }

  _getWishlist() {
    try { return JSON.parse(localStorage.getItem('annastar_wishlist') || '[]'); } catch { return []; }
  }

  _saveWishlist(list) {
    localStorage.setItem('annastar_wishlist', JSON.stringify(list));
  }

  _bindFilters() {
    if (!this.filters) return;

    this.filters.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      this.filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      this.activeFilter = btn.dataset.filter;
      const filtered = this.activeFilter === 'all'
        ? this.works
        : this.works.filter(w => w.series?.toLowerCase() === this.activeFilter);

      this._renderCards(filtered);
    });
  }

  _bindModal() {
    // Wishlist
    this.grid.addEventListener('click', (e) => {
      const wishBtn = e.target.closest('.work-card__wish');
      if (wishBtn) {
        e.stopPropagation();
        const id   = wishBtn.dataset.wish;
        const list = this._getWishlist();
        const idx  = list.indexOf(id);
        if (idx === -1) { list.push(id); wishBtn.classList.add('is-wished'); wishBtn.textContent = '♥'; }
        else            { list.splice(idx, 1); wishBtn.classList.remove('is-wished'); wishBtn.textContent = '♡'; }
        this._saveWishlist(list);
        return;
      }
    });

    // Открытие по клику на карточку
    this.grid.addEventListener('click', (e) => {
      if (e.target.closest('.work-card__wish')) return;
      const card = e.target.closest('.work-card');
      if (!card) return;
      const work = this.works.find(w => w.id === card.dataset.id);
      if (work) this._openModal(work);
    });

    // Открытие по Enter/Space (accessibility)
    this.grid.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('.work-card');
        if (card) {
          e.preventDefault();
          const work = this.works.find(w => w.id === card.dataset.id);
          if (work) this._openModal(work);
        }
      }
    });

    // Закрытие
    document.getElementById('modalClose')?.addEventListener('click', () => this._closeModal());
    document.getElementById('modalOverlay')?.addEventListener('click', () => this._closeModal());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this._closeModal();
    });
  }

  _openModal(work) {
    const modalTitle  = window.LANG === 'en' ? work.title : (work.title_ru || work.title);
    const description = window.LANG === 'en' ? (work.description_en || work.description || '') : (work.description || '');

    // ─── Gallery ─────────────────────────────────────────────────────────────
    const allImages = [work.image, ...(work.gallery || [])].filter(Boolean);
    let currentIdx = 0;

    const imageSection = allImages.length > 1 ? `
      <div class="modal__gallery">
        <div class="modal__gallery-main">
          <img id="mgImg" src="images/works/${allImages[0]}" alt="${work.title}" loading="lazy"/>
          <button class="modal__gallery-nav modal__gallery-prev" id="mgPrev" aria-label="${this._t('Назад', 'Previous')}">&#8249;</button>
          <button class="modal__gallery-nav modal__gallery-next" id="mgNext" aria-label="${this._t('Вперёд', 'Next')}">&#8250;</button>
        </div>
        <div class="modal__gallery-thumbs">
          ${allImages.map((img, i) => `<img src="images/works/${img}" class="modal__thumb${i===0?' is-active':''}" data-idx="${i}" loading="lazy" alt=""/>`).join('')}
        </div>
      </div>` : this._imageHTML(work.image, work.title, 'class="modal__single-img"');

    // ─── Content: concept vs regular ─────────────────────────────────────────
    let contentSection;

    if (work.concept) {
      const formatsHTML = (work.formats || []).map(f => `
        <div class="modal__format-row">
          <span class="modal__format-size">${f.size}</span>
          <span class="modal__format-price">${this._t('от', 'from')} ${f.price_rub.toLocaleString('ru-RU')} ₽</span>
        </div>`).join('');

      contentSection = `
        <div>
          <span class="modal__concept-tag">${this._t('Под заказ · Световой рельеф', 'Commission · Luminous Relief')}</span>
          <h2 class="modal__title">${modalTitle}</h2>
          <p class="modal__meta">${work.materials}</p>
          <p class="modal__desc">${description}</p>
          ${work.formats?.length ? `
            <div class="modal__formats">
              <p class="modal__formats-title">${this._t('Форматы и цены', 'Formats & Prices')}</p>
              <div class="modal__formats-list">${formatsHTML}</div>
            </div>` : ''}
          <a href="#order" class="btn btn--primary" style="width:100%;display:flex;justify-content:center;margin-top:20px"
             onclick="catalog._closeModal()">
            ${this._t('Заказать эту работу', 'Commission this work')}
          </a>
          <p class="modal__concept-note">${this._t('Обсудим детали, размер и срок', 'Details, size and timeline — by arrangement')}</p>
        </div>`;
    } else {
      const statusClass = work.available ? 'work-card__status--available' : 'work-card__status--sold';
      const statusText  = work.available ? this._t('В наличии', 'Available') : this._t('Продана', 'Sold');
      const sizeLabel   = this._t('Размер', 'Size');

      contentSection = `
        <div>
          <h2 class="modal__title">${modalTitle}</h2>
          <p class="modal__meta">${work.year} • ${work.materials}</p>
          <p style="margin-bottom:8px"><strong>${sizeLabel}:</strong> ${work.size}</p>
          <p class="modal__desc">${description}</p>
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
            <span style="font-size:24px;font-weight:700;color:var(--color-primary)">${work.price_rub.toLocaleString('ru-RU')} ₽</span>
            <span class="work-card__status ${statusClass}">${statusText}</span>
          </div>
          ${work.available && work.payment_link ? `
            <button class="btn btn--primary" style="width:100%" onclick="window.open('${work.payment_link}', '_blank')">
              ${this._t('Купить эту работу', 'Buy this artwork')}
            </button>
          ` : work.available ? `
            <a href="#order" class="btn btn--outline" style="width:100%;display:flex;justify-content:center"
               onclick="catalog._closeModal()">
              ${this._t('Узнать цену', 'Enquire')}
            </a>
          ` : `
            <a href="#order" class="btn btn--outline" style="width:100%;display:flex;justify-content:center"
               onclick="catalog._closeModal()">
              ${this._t('Заказать похожую', 'Commission similar')}
            </a>
          `}
        </div>`;
    }

    this.modalContent.innerHTML = `
      <button class="modal__close" id="modalClose" aria-label="${this._t('Закрыть', 'Close')}">&times;</button>
      <div class="modal__grid">
        ${imageSection}
        ${contentSection}
      </div>
    `;

    // ─── Gallery controls ─────────────────────────────────────────────────────
    if (allImages.length > 1) {
      const img    = document.getElementById('mgImg');
      const thumbs = this.modalContent.querySelectorAll('.modal__thumb');

      const setIdx = (idx) => {
        currentIdx = (idx + allImages.length) % allImages.length;
        img.src = `images/works/${allImages[currentIdx]}`;
        thumbs.forEach((t, i) => t.classList.toggle('is-active', i === currentIdx));
      };

      document.getElementById('mgPrev')?.addEventListener('click', () => setIdx(currentIdx - 1));
      document.getElementById('mgNext')?.addEventListener('click', () => setIdx(currentIdx + 1));
      thumbs.forEach((t, i) => t.addEventListener('click', () => setIdx(i)));
    }

    document.getElementById('modalClose')?.addEventListener('click', () => this._closeModal());
    this.modal.classList.add('is-open');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  _closeModal() {
    this.modal.classList.remove('is-open');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

const catalog = new Catalog();
