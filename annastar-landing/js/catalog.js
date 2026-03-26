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
  }

  async _loadWorks() {
    try {
      const res = await fetch('data/works.json');
      this.works = await res.json();
    } catch (err) {
      console.error('Не удалось загрузить works.json:', err);
      this.works = [];
    }
  }

  _renderCards(works) {
    if (works.length === 0) {
      this.grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--color-text-light)">
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
    const statusClass = w.available ? 'work-card__status--available' : 'work-card__status--sold';
    const statusText  = w.available ? 'В наличии' : 'Продана';

    return `
      <article class="work-card" data-id="${w.id}" role="button" tabindex="0" aria-label="Открыть работу: ${w.title}">
        <div class="work-card__img">
          ${this._imageHTML(w.image, w.title)}
        </div>
        <div class="work-card__body">
          <h3 class="work-card__title">${w.title}</h3>
          ${w.title_ru ? `<p class="work-card__title-ru">${w.title_ru}</p>` : ''}
          <p class="work-card__meta">${w.size} • ${w.materials} • ${w.year}</p>
          <div class="work-card__footer">
            <span class="work-card__price">${w.price_rub.toLocaleString('ru-RU')} ₽</span>
            <span class="work-card__status ${statusClass}">${statusText}</span>
          </div>
        </div>
      </article>
    `;
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
    // Открытие по клику на карточку
    this.grid.addEventListener('click', (e) => {
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
    const statusClass = work.available ? 'work-card__status--available' : 'work-card__status--sold';
    const statusText  = work.available ? 'В наличии' : 'Продана';

    this.modalContent.innerHTML = `
      <button class="modal__close" id="modalClose" aria-label="Закрыть">&times;</button>
      <div class="modal__grid" style="display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:start">
        ${this._imageHTML(work.image, work.title, 'style="width:100%;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.1)"')}
        <div>
          <h2 style="font-family:var(--font-heading);font-size:26px;margin-bottom:8px">${work.title}</h2>
          <p style="color:var(--color-text-light);margin-bottom:16px">${work.year} • ${work.materials}</p>
          <p style="margin-bottom:8px"><strong>Размер:</strong> ${work.size}</p>
          <p style="margin-bottom:16px">${work.description || ''}</p>
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
            <span style="font-size:24px;font-weight:700;color:var(--color-primary)">${work.price_rub.toLocaleString('ru-RU')} ₽</span>
            <span class="work-card__status ${statusClass}">${statusText}</span>
          </div>
          ${work.available ? `
            <button class="btn btn--primary" style="width:100%" onclick="Payment.buyWork(${work.id})">
              Купить эту работу
            </button>
          ` : `
            <a href="#order" class="btn btn--outline" style="width:100%;display:flex;justify-content:center"
               onclick="catalog._closeModal()">
              Заказать похожую
            </a>
          `}
        </div>
      </div>
    `;

    // Повторно привязываем кнопку закрытия
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
