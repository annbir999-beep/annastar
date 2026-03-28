/**
 * quiz.js — логика квиза подбора картины
 */

const QUIZ_CONFIG = [
  {
    id: 'style',
    question: 'Какой образ вам ближе?',
    options: [
      { value: 'botanica',    icon: '🌿', label: 'Природа и цветы' },
      { value: 'zoology',     icon: '🦁', label: 'Животные' },
      { value: 'abstraction', icon: '✦',  label: 'Абстракция' },
      { value: 'relax',       icon: '☽',  label: 'Медитация' },
    ],
  },
  {
    id: 'palette',
    question: 'Какая цветовая палитра подойдёт вашему интерьеру?',
    options: [
      { value: 'warm',    icon: '✦', label: 'Тёплые — золото, терракот' },
      { value: 'cool',    icon: '◈', label: 'Холодные — серебро, синий' },
      { value: 'neutral', icon: '○', label: 'Нейтральные — белый, зелёный' },
      { value: 'bright',  icon: '◉', label: 'Яркие акценты' },
    ],
  },
  {
    id: 'size',
    question: 'Какой размер вам нужен?',
    options: [
      { value: 'small',  icon: '▫', label: 'Небольшой — до 40×50 см' },
      { value: 'medium', icon: '▪', label: 'Средний — 50×70 до 60×80 см' },
      { value: 'large',  icon: '■', label: 'Большой — 70×100 и более' },
      { value: 'any',    icon: '✦', label: 'Размер не важен' },
    ],
  },
  {
    id: 'budget',
    question: 'Какой бюджет вы рассматриваете?',
    options: [
      { value: 'low',  icon: '◇', label: 'До 35 000 ₽' },
      { value: 'mid',  icon: '◆', label: '35 000 — 90 000 ₽' },
      { value: 'high', icon: '❖', label: '90 000 — 180 000 ₽' },
      { value: 'vip',  icon: '✦', label: 'Без ограничений' },
    ],
  },
];

// Маппинг палитры на теги works.json
const PALETTE_TAGS = {
  warm:    ['fire', 'gold', 'pink'],
  cool:    ['night', 'silver', 'purple', 'blue'],
  neutral: ['white', 'architecture', 'green'],
  bright:  null, // не фильтруем — яркие есть у всех
};

class Quiz {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.answers = {};
    this.step    = 0;
    this.works   = [];

    this._loadWorks().then(() => this._render());
  }

  async _loadWorks() {
    try {
      const res = await fetch('data/works.json');
      this.works = await res.json();
    } catch {
      this.works = typeof WORKS_DATA !== 'undefined' ? WORKS_DATA : [];
    }
  }

  _render() {
    this.container.innerHTML = `
      <div class="quiz__progress">
        <div class="quiz__progress-text">
          <span class="quiz__step-label">Вопрос 1 из ${QUIZ_CONFIG.length}</span>
          <span class="quiz__step-percent">0%</span>
        </div>
        <div class="quiz__progress-bar">
          <div class="quiz__progress-fill" style="width: 0%"></div>
        </div>
      </div>

      <div class="quiz__steps">
        ${QUIZ_CONFIG.map((q, i) => this._renderStep(q, i)).join('')}
      </div>

      <div class="quiz__result" id="quizResult">
        <h3 class="quiz__result-title">Ваша подборка готова!</h3>
        <p class="quiz__result-subtitle">Вот работы, которые подойдут именно вам:</p>
        <div class="quiz__result-cards" id="quizResultCards"></div>
        <div class="quiz__result-cta">
          <a href="#order" class="btn btn--primary">Заказать картину</a>
          <button class="quiz__restart" id="quizRestart">Пройти квиз заново</button>
        </div>
      </div>
    `;

    this._bindEvents();
    this._updateStep();
  }

  _renderStep(q, i) {
    const options = q.options.map(opt => `
      <button class="quiz__option" data-value="${opt.value}" type="button">
        <span class="quiz__option-icon">${opt.icon}</span>
        <span class="quiz__option-text">${opt.label}</span>
      </button>
    `).join('');

    return `
      <div class="quiz__step" data-index="${i}">
        <p class="quiz__question">${q.question}</p>
        <div class="quiz__options">${options}</div>
        <div class="quiz__nav">
          <button class="quiz__btn-back" type="button">&larr; Назад</button>
          <button class="btn btn--primary quiz__btn-next" type="button" disabled>Далее &rarr;</button>
        </div>
      </div>
    `;
  }

  _bindEvents() {
    this.container.addEventListener('click', (e) => {
      const opt = e.target.closest('.quiz__option');
      if (opt) {
        const step = opt.closest('.quiz__step');
        step.querySelectorAll('.quiz__option').forEach(o => o.classList.remove('is-selected'));
        opt.classList.add('is-selected');
        this.answers[QUIZ_CONFIG[this.step].id] = opt.dataset.value;
        step.querySelector('.quiz__btn-next').disabled = false;
      }

      if (e.target.closest('.quiz__btn-next') && !e.target.closest('.quiz__btn-next').disabled) {
        if (this.step < QUIZ_CONFIG.length - 1) {
          this.step++;
          this._updateStep();
        } else {
          this._showResult();
        }
      }

      if (e.target.closest('.quiz__btn-back') && this.step > 0) {
        this.step--;
        this._updateStep();
      }

      if (e.target.id === 'quizRestart') this._restart();
    });
  }

  _updateStep() {
    const steps = this.container.querySelectorAll('.quiz__step');
    steps.forEach((s, i) => s.classList.toggle('is-active', i === this.step));

    const currentQ = QUIZ_CONFIG[this.step];
    if (this.answers[currentQ.id]) {
      const activeStep = steps[this.step];
      const selected = activeStep.querySelector(`[data-value="${this.answers[currentQ.id]}"]`);
      if (selected) {
        selected.classList.add('is-selected');
        activeStep.querySelector('.quiz__btn-next').disabled = false;
      }
    }

    const pct = Math.round((this.step / QUIZ_CONFIG.length) * 100);
    this.container.querySelector('.quiz__progress-fill').style.width = `${pct}%`;
    this.container.querySelector('.quiz__step-label').textContent =
      `Вопрос ${this.step + 1} из ${QUIZ_CONFIG.length}`;
    this.container.querySelector('.quiz__step-percent').textContent = `${pct}%`;

    const nextBtn = steps[this.step]?.querySelector('.quiz__btn-next');
    if (nextBtn) nextBtn.textContent = this.step === QUIZ_CONFIG.length - 1 ? 'Показать результат' : 'Далее →';

    document.getElementById('quizResult')?.classList.remove('is-active');
    this.container.querySelector('.quiz__steps').style.display = '';
    this.container.querySelector('.quiz__progress').style.display = '';
  }

  _showResult() {
    this.container.querySelector('.quiz__progress-fill').style.width = '100%';
    this.container.querySelector('.quiz__step-percent').textContent = '100%';
    this.container.querySelector('.quiz__steps').style.display = 'none';
    this.container.querySelector('.quiz__progress').style.display = 'none';

    const matched = this._matchWorks();
    const cardsEl = document.getElementById('quizResultCards');

    if (matched.length === 0) {
      cardsEl.innerHTML = `<p style="grid-column:1/-1;color:var(--color-text-light)">
        Подходящих работ пока нет — свяжитесь со мной для индивидуального заказа.
      </p>`;
    } else {
      cardsEl.innerHTML = matched.slice(0, 6).map(w => `
        <div class="work-card">
          <div class="work-card__img">
            <img src="images/works/${w.image}" alt="${w.title_ru || w.title}" loading="lazy" />
          </div>
          <div class="work-card__body">
            <p class="work-card__title">${w.title}</p>
            <p class="work-card__title-ru">${w.title_ru || ''}</p>
            <p class="work-card__meta">${w.size} • ${w.year}</p>
            <div class="work-card__footer">
              <span class="work-card__price">${w.price_rub.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>
        </div>
      `).join('');
    }

    document.getElementById('quizResult').classList.add('is-active');
  }

  _matchWorks() {
    return this.works.filter(w => {
      // Стиль → совпадение с series
      if (this.answers.style) {
        if (w.series?.toLowerCase() !== this.answers.style) return false;
      }

      // Палитра → проверяем теги
      if (this.answers.palette) {
        const allowedTags = PALETTE_TAGS[this.answers.palette];
        if (allowedTags && !w.tags.some(t => allowedTags.includes(t))) return false;
      }

      // Размер → по sqm
      if (this.answers.size && this.answers.size !== 'any') {
        const sizeMap = { small: [0, 0.20], medium: [0.20, 0.55], large: [0.55, Infinity] };
        const [min, max] = sizeMap[this.answers.size] || [0, Infinity];
        if (w.sqm < min || w.sqm >= max) return false;
      }

      // Бюджет
      if (this.answers.budget) {
        const budgetMap = { low: [0, 35000], mid: [35000, 90000], high: [90000, 180000], vip: [0, Infinity] };
        const [min, max] = budgetMap[this.answers.budget] || [0, Infinity];
        if (w.price_rub < min || w.price_rub >= max) return false;
      }

      return true;
    });
  }

  _restart() {
    this.answers = {};
    this.step    = 0;
    this._updateStep();
    this.container.querySelectorAll('.quiz__option').forEach(o => o.classList.remove('is-selected'));
    this.container.querySelectorAll('.quiz__btn-next').forEach(b => b.disabled = true);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Quiz('quizWrapper');
});
