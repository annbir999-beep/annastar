/**
 * quiz.js — логика квиза подбора картины
 */

const QUIZ_CONFIG = [
  {
    id: 'style',
    question:    'Какой образ вам ближе?',
    question_en: 'Which imagery speaks to you?',
    options: [
      { value: 'botanica',    icon: '🌿', label: 'Природа и цветы',  label_en: 'Nature & flowers' },
      { value: 'zoology',     icon: '🦁', label: 'Животные',         label_en: 'Animals' },
      { value: 'abstraction', icon: '✦',  label: 'Абстракция',       label_en: 'Abstraction' },
      { value: 'relax',       icon: '☽',  label: 'Медитация',        label_en: 'Meditation' },
    ],
  },
  {
    id: 'palette',
    question:    'Какая цветовая палитра подойдёт вашему интерьеру?',
    question_en: 'Which colour palette suits your interior?',
    options: [
      { value: 'warm',    icon: '✦', label: 'Тёплые — золото, терракот',   label_en: 'Warm — gold, terracotta' },
      { value: 'cool',    icon: '◈', label: 'Холодные — серебро, синий',   label_en: 'Cool — silver, blue' },
      { value: 'neutral', icon: '○', label: 'Нейтральные — белый, зелёный',label_en: 'Neutral — white, green' },
      { value: 'bright',  icon: '◉', label: 'Яркие акценты',               label_en: 'Bold accents' },
    ],
  },
  {
    id: 'size',
    question:    'Какой размер вам нужен?',
    question_en: 'What size are you looking for?',
    options: [
      { value: 'small',  icon: '▫', label: 'Небольшой — до 40×50 см',      label_en: 'Small — up to 40×50 cm' },
      { value: 'medium', icon: '▪', label: 'Средний — 50×70 до 60×80 см',  label_en: 'Medium — 50×70 to 60×80 cm' },
      { value: 'large',  icon: '■', label: 'Большой — 70×100 и более',     label_en: 'Large — 70×100 and above' },
      { value: 'any',    icon: '✦', label: 'Размер не важен',              label_en: 'Size doesn\'t matter' },
    ],
  },
  {
    id: 'budget',
    question:    'Какой бюджет вы рассматриваете?',
    question_en: 'What is your budget?',
    options: [
      { value: 'low',  icon: '◇', label: 'До 35 000 ₽',          label_en: 'Up to 35 000 ₽' },
      { value: 'mid',  icon: '◆', label: '35 000 — 90 000 ₽',    label_en: '35 000 — 90 000 ₽' },
      { value: 'high', icon: '❖', label: '90 000 — 180 000 ₽',   label_en: '90 000 — 180 000 ₽' },
      { value: 'vip',  icon: '✦', label: 'Без ограничений',       label_en: 'No limit' },
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

    this._loadWorks().then(() => {
      this._render();

      document.addEventListener('langchange', () => {
        const savedAnswers = { ...this.answers };
        const savedStep    = this.step;
        this._render();
        this.answers = savedAnswers;
        this.step    = savedStep;
        this._updateStep();
        QUIZ_CONFIG.forEach((q, i) => {
          if (savedAnswers[q.id]) {
            const stepEl = this.container.querySelector(`.quiz__step[data-index="${i}"]`);
            stepEl?.querySelector(`[data-value="${savedAnswers[q.id]}"]`)?.classList.add('is-selected');
            const nextBtn = stepEl?.querySelector('.quiz__btn-next');
            if (nextBtn) nextBtn.disabled = false;
          }
        });
      });
    });
  }

  _q(q, field) {
    const enKey = field + '_en';
    return window.LANG === 'en' && q[enKey] ? q[enKey] : q[field];
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
    const isEn = window.LANG === 'en';
    this.container.innerHTML = `
      <div class="quiz__progress">
        <div class="quiz__progress-text">
          <span class="quiz__step-label">${isEn ? 'Question' : 'Вопрос'} 1 ${isEn ? 'of' : 'из'} ${QUIZ_CONFIG.length}</span>
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
        <h3 class="quiz__result-title">${isEn ? 'Your selection is ready!' : 'Ваша подборка готова!'}</h3>
        <p class="quiz__result-subtitle">${isEn ? 'Here are the works that suit you best:' : 'Вот работы, которые подойдут именно вам:'}</p>
        <div class="quiz__result-cards" id="quizResultCards"></div>
        <div class="quiz__result-cta">
          <a href="#order" class="btn btn--primary">${isEn ? 'Order a painting' : 'Заказать картину'}</a>
          <button class="quiz__restart" id="quizRestart">${isEn ? 'Retake the quiz' : 'Пройти квиз заново'}</button>
        </div>
      </div>
    `;

    this._bindEvents();
    this._updateStep();
  }

  _renderStep(q, i) {
    const isEn = window.LANG === 'en';
    const options = q.options.map(opt => `
      <button class="quiz__option" data-value="${opt.value}" type="button">
        <span class="quiz__option-icon">${opt.icon}</span>
        <span class="quiz__option-text">${this._q(opt, 'label')}</span>
      </button>
    `).join('');

    return `
      <div class="quiz__step" data-index="${i}">
        <p class="quiz__question">${this._q(q, 'question')}</p>
        <div class="quiz__options">${options}</div>
        <div class="quiz__nav">
          <button class="quiz__btn-back" type="button">&larr; ${isEn ? 'Back' : 'Назад'}</button>
          <button class="btn btn--primary quiz__btn-next" type="button" disabled>${isEn ? 'Next' : 'Далее'} &rarr;</button>
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
    const isEn = window.LANG === 'en';
    this.container.querySelector('.quiz__progress-fill').style.width = `${pct}%`;
    this.container.querySelector('.quiz__step-label').textContent =
      `${isEn ? 'Question' : 'Вопрос'} ${this.step + 1} ${isEn ? 'of' : 'из'} ${QUIZ_CONFIG.length}`;
    this.container.querySelector('.quiz__step-percent').textContent = `${pct}%`;

    const nextBtn = steps[this.step]?.querySelector('.quiz__btn-next');
    if (nextBtn) nextBtn.textContent = this.step === QUIZ_CONFIG.length - 1
      ? (isEn ? 'Show results' : 'Показать результат')
      : (isEn ? 'Next →' : 'Далее →');

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

    const isEn = window.LANG === 'en';
    if (matched.length === 0) {
      cardsEl.innerHTML = `<p style="grid-column:1/-1;color:var(--color-text-light)">
        ${isEn ? 'No matching works yet — contact me for a custom commission.' : 'Подходящих работ пока нет — свяжитесь со мной для индивидуального заказа.'}
      </p>`;
    } else {
      cardsEl.innerHTML = matched.slice(0, 6).map(w => {
        const cardTitle = isEn ? w.title : (w.title_ru || w.title);
        const cardSub   = isEn ? w.title_ru : w.title;
        return `
        <div class="work-card">
          <div class="work-card__img">
            <img src="images/works/${w.image}" alt="${w.title_ru || w.title}" loading="lazy" />
          </div>
          <div class="work-card__body">
            <p class="work-card__title">${cardTitle}</p>
            ${cardSub && cardSub !== cardTitle ? `<p class="work-card__title-ru">${cardSub}</p>` : ''}
            <p class="work-card__meta">${w.size} • ${w.year}</p>
            <div class="work-card__footer">
              <span class="work-card__price">${w.price_rub.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>
        </div>
        `;
      }).join('');
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
