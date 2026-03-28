/**
 * tryon.js — виртуальная примерка картины на стену
 * Чистый JS + HTML5 Canvas, без внешних библиотек.
 */

class TryOn {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.works        = [];
    this.selectedWork = null;
    this.roomImg      = null;
    this.paintingImg  = null;
    this._editorActive = false;

    // Состояние картины на холсте
    this.p = { x: 0, y: 0, w: 0, h: 0 };

    this.dragging    = false;
    this.resizing    = null;
    this.dragStart   = null;
    this.resizeStart = null;

    this.canvas = null;
    this.ctx    = null;
    this.HANDLE = 12; // радиус ручки, px

    // Обработчик смены языка — храним ссылку, чтобы не дублировать
    this._onLangChange = () => {
      if (!this._editorActive) this._renderSelector();
    };
    document.addEventListener('langchange', this._onLangChange);

    this._loadWorks().then(() => this._renderSelector());
  }

  // ─── Данные ──────────────────────────────────────────────────────────────────

  async _loadWorks() {
    try {
      const res = await fetch('data/works.json');
      if (!res.ok) throw new Error();
      this.works = await res.json();
    } catch {
      this.works = typeof WORKS_DATA !== 'undefined' ? WORKS_DATA : [];
    }
  }

  _t(ru, en) {
    return window.LANG === 'en' ? en : ru;
  }

  // ─── Шаг 1–2: выбор картины и загрузка фото ──────────────────────────────────

  _renderSelector() {
    this._editorActive = false;
    const isEn = window.LANG === 'en';

    this.container.innerHTML = `
      <div class="tryon__panels">

        <div class="tryon__panel">
          <p class="tryon__step-label">
            <span class="tryon__step-num">1</span>
            ${this._t('Выбери картину', 'Select a painting')}
          </p>
          <div class="tryon__works" id="tryonWorks">
            ${this.works.map(w => `
              <button class="tryon__thumb${this.selectedWork?.id === w.id ? ' is-active' : ''}"
                data-id="${w.id}" type="button" title="${w.title_ru || w.title}">
                <img src="images/works/${w.image}" alt="${w.title}" loading="lazy" />
              </button>
            `).join('')}
          </div>
        </div>

        <div class="tryon__panel">
          <p class="tryon__step-label">
            <span class="tryon__step-num">2</span>
            ${this._t('Загрузи фото своей стены', 'Upload a photo of your wall')}
          </p>
          <label class="tryon__upload${this.roomImg ? ' has-photo' : ''}" id="tryonUploadZone">
            <input type="file" accept="image/*" id="tryonFileInput" style="display:none" />
            ${this.roomImg ? `
              <img src="${this.roomImg.src}" class="tryon__room-preview" alt="room" />
              <span class="tryon__upload-change">
                ${this._t('Изменить фото', 'Change photo')}
              </span>
              <button class="tryon__room-clear" id="tryonRoomClear" type="button" title="${this._t('Удалить фото', 'Remove photo')}">×</button>
            ` : `
              <div class="tryon__upload-inner">
                <span class="tryon__upload-icon">↑</span>
                <span class="tryon__upload-text">
                  ${this._t('Нажми или перетащи фото', 'Click or drag a photo')}
                </span>
                <span class="tryon__upload-hint">
                  ${this._t('JPG / PNG — фото вашей стены или комнаты', 'JPG / PNG — photo of your wall or room')}
                </span>
              </div>
            `}
          </label>
        </div>

      </div>

      <div class="tryon__start-row">
        <button class="btn btn--primary tryon__start" id="tryonStart"
          ${this.selectedWork && this.roomImg ? '' : 'disabled'}>
          ${this._t('Примерить →', 'Try on →')}
        </button>
        <p class="tryon__start-hint" id="tryonHint">${this._getHint()}</p>
      </div>
    `;

    this._bindSelectorEvents();
  }

  _getHint() {
    if (!this.selectedWork && !this.roomImg)
      return this._t('Выбери картину и загрузи фото комнаты', 'Select a painting and upload a room photo');
    if (!this.selectedWork)
      return this._t('Теперь выбери картину', 'Now select a painting');
    if (!this.roomImg)
      return this._t('Теперь загрузи фото стены', 'Now upload a room photo');
    return this._t('Готово — нажми «Примерить»', 'Ready — click Try on');
  }

  _bindSelectorEvents() {
    // Выбор картины
    document.getElementById('tryonWorks')?.addEventListener('click', e => {
      const btn = e.target.closest('.tryon__thumb');
      if (!btn) return;
      const work = this.works.find(w => w.id === btn.dataset.id);
      if (!work) return;
      this.selectedWork = work;
      document.querySelectorAll('.tryon__thumb').forEach(b =>
        b.classList.toggle('is-active', b.dataset.id === work.id)
      );
      this._updateHint();
    });

    // Загрузка фото
    const fileInput  = document.getElementById('tryonFileInput');
    const uploadZone = document.getElementById('tryonUploadZone');

    fileInput?.addEventListener('change', e => this._loadRoomFile(e.target.files[0]));

    document.getElementById('tryonRoomClear')?.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      this.roomImg = null;
      this._renderSelector();
    });

    uploadZone?.addEventListener('dragover',  e => { e.preventDefault(); uploadZone.classList.add('is-drag'); });
    uploadZone?.addEventListener('dragleave', ()  => uploadZone.classList.remove('is-drag'));
    uploadZone?.addEventListener('drop', e => {
      e.preventDefault();
      uploadZone.classList.remove('is-drag');
      this._loadRoomFile(e.dataTransfer.files[0]);
    });

    // Кнопка старта
    document.getElementById('tryonStart')?.addEventListener('click', () => this._enterEditor());
  }

  _updateHint() {
    const btn  = document.getElementById('tryonStart');
    const hint = document.getElementById('tryonHint');
    if (btn)  btn.disabled = !(this.selectedWork && this.roomImg);
    if (hint) hint.textContent = this._getHint();
  }

  _loadRoomFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        this.roomImg = img;
        this._renderSelector();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ─── Шаг 3: редактор ─────────────────────────────────────────────────────────

  _enterEditor() {
    if (!this.selectedWork || !this.roomImg) return;
    const img = new Image();
    img.onload = () => {
      this.paintingImg = img;
      this._renderEditor();
    };
    img.src = `images/works/${this.selectedWork.image}`;
  }

  _renderEditor() {
    this._editorActive = true;
    const w     = this.selectedWork;
    const title = window.LANG === 'en' ? w.title : (w.title_ru || w.title);

    this.container.innerHTML = `
      <div class="tryon__editor">

        <div class="tryon__canvas-wrap">
          <canvas id="tryonCanvas"></canvas>
          <div class="tryon__canvas-footer">
            <p class="tryon__canvas-hint">
              ${this._t(
                '✦ Перетаскивай картину · Тяни угол для изменения размера',
                '✦ Drag the painting · Pull a corner to resize'
              )}
            </p>
            <button class="tryon__back-inline" id="tryonBackInline" type="button">
              ${this._t('← Выбрать другую картину', '← Choose another painting')}
            </button>
          </div>
        </div>

        <div class="tryon__sidebar">
          <div class="tryon__sel-card">
            <img src="images/works/${w.image}" alt="${w.title}" class="tryon__sel-img" />
            <div class="tryon__sel-info">
              <p class="tryon__sel-title">${title}</p>
              <p class="tryon__sel-size">${w.size}</p>
              <p class="tryon__sel-price">${w.price_rub.toLocaleString('ru-RU')} ₽</p>
            </div>
          </div>

          <div class="tryon__actions">
            <button class="btn btn--primary tryon__download" id="tryonDownload">
              ${this._t('↓ Скачать мокап', '↓ Download mockup')}
            </button>
            <button class="tryon__back-btn" id="tryonBack" type="button">
              ${this._t('← Выбрать другую картину', '← Choose another painting')}
            </button>
          </div>

          ${w.available && w.payment_link ? `
            <a href="${w.payment_link}" class="btn btn--gold tryon__buy" target="_blank" rel="noopener">
              ${this._t('Купить эту работу', 'Buy this artwork')}
            </a>
          ` : `
            <a href="#order" class="btn btn--outline-light tryon__buy"
               onclick="document.getElementById('tryonBack')?.click()">
              ${this._t('Заказать похожую', 'Commission similar')}
            </a>
          `}
        </div>

      </div>
    `;

    this._initCanvas();

    const goBack = () => { this._editorActive = false; this._renderSelector(); };
    document.getElementById('tryonDownload')?.addEventListener('click', () => this._download());
    document.getElementById('tryonBack')?.addEventListener('click', goBack);
    document.getElementById('tryonBackInline')?.addEventListener('click', goBack);
  }

  // ─── Canvas ───────────────────────────────────────────────────────────────────

  _initCanvas() {
    this.canvas = document.getElementById('tryonCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Масштабируем под ширину контейнера (макс. 900px)
    const maxW  = Math.min(this.canvas.parentElement.clientWidth - 2, 900);
    const scale = maxW / this.roomImg.naturalWidth;
    this.canvas.width  = maxW;
    this.canvas.height = Math.round(this.roomImg.naturalHeight * scale);

    // Начальное положение: по центру, ~32% ширины холста
    const pw = Math.round(this.canvas.width * 0.32);
    const ph = Math.round(pw * (this.paintingImg.naturalHeight / this.paintingImg.naturalWidth));
    this.p = {
      x: Math.round((this.canvas.width  - pw) / 2),
      y: Math.round((this.canvas.height - ph) / 2),
      w: pw,
      h: ph,
    };

    this._drawScene();
    this._bindCanvasEvents();
  }

  _drawScene(hideHandles = false) {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Фото комнаты
    ctx.drawImage(this.roomImg, 0, 0, canvas.width, canvas.height);

    // Тень картины
    ctx.save();
    ctx.shadowColor   = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur    = 28;
    ctx.shadowOffsetX = 12;
    ctx.shadowOffsetY = 14;
    ctx.drawImage(this.paintingImg, this.p.x, this.p.y, this.p.w, this.p.h);
    ctx.restore();

    // Картина без тени (поверх, перекрывает тень внутри)
    ctx.drawImage(this.paintingImg, this.p.x, this.p.y, this.p.w, this.p.h);

    if (hideHandles) return;

    // Рамка
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth   = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(this.p.x, this.p.y, this.p.w, this.p.h);
    ctx.restore();

    // Угловые ручки
    ctx.save();
    ctx.fillStyle   = 'rgba(181,128,79,0.95)';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    Object.values(this._getHandles()).forEach(h => {
      ctx.beginPath();
      ctx.arc(h.x, h.y, this.HANDLE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
  }

  _getHandles() {
    const { x, y, w, h } = this.p;
    return {
      tl: { x,     y     },
      tr: { x: x+w, y     },
      bl: { x,     y: y+h },
      br: { x: x+w, y: y+h },
    };
  }

  _hitTest(mx, my) {
    const R = this.HANDLE;
    for (const [key, pos] of Object.entries(this._getHandles())) {
      if (Math.hypot(mx - pos.x, my - pos.y) < R) return `resize-${key}`;
    }
    const { x, y, w, h } = this.p;
    if (mx >= x && mx <= x+w && my >= y && my <= y+h) return 'drag';
    return null;
  }

  _canvasPos(e) {
    const rect   = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width  / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const src    = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top)  * scaleY,
    };
  }

  _bindCanvasEvents() {
    const c = this.canvas;
    const CURSORS = {
      'drag':       'move',
      'resize-tl':  'nwse-resize',
      'resize-br':  'nwse-resize',
      'resize-tr':  'nesw-resize',
      'resize-bl':  'nesw-resize',
    };

    const onDown = e => {
      e.preventDefault();
      const { x, y } = this._canvasPos(e);
      const hit = this._hitTest(x, y);
      if (!hit) return;

      if (hit === 'drag') {
        this.dragging  = true;
        this.dragStart = { ox: x - this.p.x, oy: y - this.p.y };
      } else {
        this.resizing    = hit;
        this.resizeStart = { mx: x, my: y, px: this.p.x, py: this.p.y, pw: this.p.w, ph: this.p.h };
      }
    };

    const onMove = e => {
      e.preventDefault();
      const { x, y } = this._canvasPos(e);

      if (this.dragging) {
        this.p.x = x - this.dragStart.ox;
        this.p.y = y - this.dragStart.oy;
        this._drawScene();
      } else if (this.resizing) {
        this._handleResize(x, y);
        this._drawScene();
      } else {
        const hit = this._hitTest(x, y);
        c.style.cursor = CURSORS[hit] || 'default';
      }
    };

    const onUp = () => { this.dragging = false; this.resizing = null; };

    c.addEventListener('mousedown',  onDown);
    c.addEventListener('mousemove',  onMove);
    c.addEventListener('mouseup',    onUp);
    c.addEventListener('mouseleave', onUp);
    c.addEventListener('touchstart', onDown, { passive: false });
    c.addEventListener('touchmove',  onMove, { passive: false });
    c.addEventListener('touchend',   onUp);
  }

  _handleResize(x, y) {
    const { mx, px, py, pw, ph } = this.resizeStart;
    const ratio = pw / ph;
    const dx    = x - mx;
    const MIN   = 50;

    switch (this.resizing) {
      case 'resize-br': {
        // Якорь: tl (x, y фиксированы)
        const nw = Math.max(MIN, pw + dx);
        this.p.x = px;
        this.p.y = py;
        this.p.w = nw;
        this.p.h = nw / ratio;
        break;
      }
      case 'resize-bl': {
        // Якорь: tr (правый край фиксирован, y фиксирован)
        const nw = Math.max(MIN, pw - dx);
        const nh = nw / ratio;
        this.p.x = px + pw - nw;
        this.p.y = py;
        this.p.w = nw;
        this.p.h = nh;
        break;
      }
      case 'resize-tr': {
        // Якорь: bl (x фиксирован, нижний край фиксирован)
        const nw = Math.max(MIN, pw + dx);
        const nh = nw / ratio;
        this.p.x = px;
        this.p.y = py + ph - nh;
        this.p.w = nw;
        this.p.h = nh;
        break;
      }
      case 'resize-tl': {
        // Якорь: br (правый и нижний края фиксированы)
        const nw = Math.max(MIN, pw - dx);
        const nh = nw / ratio;
        this.p.x = px + pw - nw;
        this.p.y = py + ph - nh;
        this.p.w = nw;
        this.p.h = nh;
        break;
      }
    }
  }

  // ─── Скачать ──────────────────────────────────────────────────────────────────

  _download() {
    this._drawScene(true); // без ручек
    const link      = document.createElement('a');
    link.download   = `annastar-${this.selectedWork.id}-tryon.jpg`;
    link.href       = this.canvas.toDataURL('image/jpeg', 0.92);
    link.click();
    this._drawScene(false); // вернуть ручки
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TryOn('tryonApp');
});
