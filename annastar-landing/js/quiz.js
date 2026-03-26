/**
 * quiz.js — логика квиза подбора картины
 * Рендерит шаги, собирает ответы, фильтрует works.json и показывает результат
 */

const QUIZ_CONFIG = [
  {
    id: 'style',
    question: 'Какой стиль вам ближе?',
    options: [
      { value: 'abstract',  icon: '🎨', label: 'Абстракция' },
      { value: 'landscape', icon: '🌿', label: 'Пейзаж' },
      { value: 'portrait',  icon: '👤', label: 'Портрет' },
      { value: 'floral',    icon: '🌸', label: 'Цветы' },
    ],
  },
  {
    id: 'palette',
    question: 'Какая цветовая палитра подойдёт вашему интерьеру?',
    options: [
      { value: 'warm',    icon: '🟠', label: 'Тёплые тона' },
      { value: 'cool',    icon: '🔵', label: 'Холодные тона' },
      { value: 'neutral', icon: '⚪', label: 'Нейтральные' },
      { value: 'bright',  icon: '🌈', label: 'Яркие акценты' },
    ],
  },
  {
    id: 'size',
    question: 'Какой размер вам нужен?',
    options: [
      { value: 'small',   icon: '🖼️',  label: 'До 40×50 см' },
      { value: 'medium',  icon: '🖼',   label: '50×70 — 60×80 см' },
      { value: 'large',   icon: '🖼️',  label: '80×100 и больше' },
      { value: 'any',     icon: '✨',   label: 'Не важно' },
    ],
  },
  {
    id: 'budget',
    question: 'Какой бюджет вы рассматриваете?',
    options: [
      { value: 'low',    icon: '💛', label: 'До 10 000 ₽' },
      { value: 'mid',    icon: '🧡', label: '10 000 — 25 000 ₽' },
      { value: 'high',   icon: '❤️', label: '25 000 — 50 000 ₽' },
      { value: 'vip',    icon: '💎', label: 'Без ограничений' },
    ],
  },
];

class Quiz {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.answers   = {};
    this.step      = 0;
    this.works     = [];

    this._loadWorks().then(() => this._render());
  }

  /** Загружаем данные работ */
  async _loadWorks() {
    try {
      const res = await fetch('data/works.json');
      this.works = await res.json();
    } catch {
      this.works = [];
    }
  }

  /** Начальный рендер HTML квиза */
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
    // Выбор варианта
    this.container.addEventListener('click', (e) => {
      const opt = e.target.closest('.quiz__option');
      if (opt) {
        const step = opt.closest('.quiz__step');
        step.querySelectorAll('.quiz__option').forEach(o => o.classList.remove('is-selected'));
        opt.classList.add('is-selected');

        const questionId = QUIZ_CONFIG[this.step].id;
        this.answers[questionId] = opt.dataset.value;

        step.querySelector('.quiz__btn-next').disabled = false;
      }

      // Кнопка "Далее"
      if (e.target.closest('.quiz__btn-next') && !e.target.closest('.quiz__btn-next').disabled) {
        if (this.step < QUIZ_CONFIG.length - 1) {
          this.step++;
          this._updateStep();
        } else {
          this._showResult();
        }
      }

      // Кнопка "Назад"
      if (e.target.closest('.quiz__btn-back') && this.step > 0) {
        this.step--;
        this._updateStep();
      }

      // Рестарт
      if (e.target.id === 'quizRestart') this._restart();
    });
  }

  _updateStep() {
    const steps = this.container.querySelectorAll('.quiz__step');
    steps.forEach((s, i) => s.classList.toggle('is-active', i === this.step));

    // Восстанавливаем выбор если уже отвечали
    const currentQ = QUIZ_CONFIG[this.step];
    if (this.answers[currentQ.id]) {
      const activeStep = steps[this.step];
      const selected = activeStep.querySelector(`[data-value="${this.answers[currentQ.id]}"]`);
      if (selected) {
        selected.classList.add('is-selected');
        activeStep.querySelector('.quiz__btn-next').disabled = false;
      }
    }

    // Прогресс
    const pct = Math.round((this.step / QUIZ_CONFIG.length) * 100);
    this.container.querySelector('.quiz__progress-fill').style.width = `${pct}%`;
    this.container.querySelector('.quiz__step-label').textContent =
      `Вопрос ${this.step + 1} из ${QUIZ_CONFIG.length}`;
    this.container.querySelector('.quiz__step-percent').textContent = `${pct}%`;

    // Последний шаг — меняем текст кнопки
    const nextBtn = steps[this.step]?.querySelector('.quiz__btn-next');
    if (nextBtn) nextBtn.textContent = this.step === QUIZ_CONFIG.length - 1 ? 'Показать результат' : 'Далее →';

    // Скрыть блок результата
    document.getElementById('quizResult')?.classList.remove('is-active');
    this.container.querySelector('.quiz__steps').style.display = '';
    this.container.querySelector('.quiz__progress').style.display = '';
  }

  _showResult() {
    // Прогресс 100%
    this.container.querySelector('.quiz__progress-fill').style.width = '100%';
    this.container.querySelector('.quiz__step-percent').textContent = '100%';

    // Скрываем шаги
    this.container.querySelector('.quiz__steps').style.display = 'none';
    this.container.querySelector('.quiz__progress').style.display = 'none';

    // Фильтруем работы
    const matched = this._matchWorks();
    const cardsEl = document.getElementById('quizResultCards');

    if (matched.length === 0) {
      cardsEl.innerHTML = `<p style="grid-column:1/-1;color:var(--color-text-light)">
        Подходящих работ пока нет — свяжитесь со мной для индивидуального заказа.
      </p>`;
    } else {
      cardsEl.innerHTML = matched.slice(0, 3).map(w => `
        <div class="work-card">
          <div class="work-card__img">
            <img src="images/works/${w.image}" alt="${w.title}" loading="lazy" />
          </div>
          <div class="work-card__body">
            <p class="work-card__title">${w.title}</p>
            <p class="work-card__meta">${w.size} • ${w.medium}</p>
            <div class="work-card__footer">
              <span class="work-card__price">${w.price.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>
        </div>
      `).join('');
    }

    document.getElementById('quizResult').classList.add('is-active');
  }

  _matchWorks() {
    return this.works.filter(w => {
      if (this.answers.style && this.answers.style !== 'any' && w.category !== this.answers.style) return false;
      if (this.answers.palette && this.answers.palette !== 'any' && w.palette && !w.palette.includes(this.answers.palette)) return false;
      if (this.answers.budget) {
        const budgetMap = { low: [0, 10000], mid: [10000, 25000], high: [25000, 50000], vip: [0, Infinity] };
        const [min, max] = budgetMap[this.answers.budget] || [0, Infinity];
        if (w.price < min || w.price > max) return false;
      }
      return true;
    });
  }

  _restart() {
    this.answers = {};
    this.step    = 0;
    this._updateStep();
    // Сбрасываем выделения
    this.container.querySelectorAll('.quiz__option').forEach(o => o.classList.remove('is-selected'));
    this.container.querySelectorAll('.quiz__btn-next').forEach(b => b.disabled = true);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Quiz('quizWrapper');
});
