/**
 * i18n.js — переключатель языков RU / EN
 * Подключать первым из всех скриптов.
 */

const I18N = {
  ru: {
    // Hero
    'hero.title':       'Искусство, в котором<br>живёт свет',
    'hero.subtitle':    'Каждое произведение создаётся слой за слоем — текстура, отражение и свет формируют объёмную поверхность, несущую силу и тихую гармонию.',
    'hero.btn.catalog': 'Смотреть каталог',
    'hero.btn.quiz':    'Подобрать картину',

    // About
    'about.title': 'О художнике',
    'about.p1': 'Anna Biryukova — современный художник, работающий в авторской технике <strong>«Световой рельеф»</strong>. Её язык сочетает геометрическую структуру с органическим движением, создавая выразительные композиции, которые передают силу, гармонию и трансформацию.',
    'about.p2': 'В своём многоэтапном процессе Анна создаёт объёмные работы с использованием многослойного акрила, смолы, сусального золота, зеркальных элементов, стеклянных текстур, страз и декоративных камней. Эти материалы формируют рельефные поверхности, взаимодействующие со светом и открывающие новые нюансы с каждого угла обзора.',
    'about.fact1': 'Вдохновение — животные, ботанические мотивы и символические образы',
    'about.fact2': 'Каждая работа создаётся вручную и может занимать несколько недель',
    'about.fact3': 'Все произведения — уникальные оригиналы, не имеющие копий',
    'about.fact4': 'Работы становятся акцентными точками современного интерьера',

    // Catalog
    'catalog.eyebrow':    'Оригинальные работы · Уникальные экземпляры',
    'catalog.title':      'Каталог работ',
    'catalog.filter.all': 'Все',

    // Mockups
    'mockups.eyebrow': 'Визуализации',
    'mockups.title':   'Картины в интерьере',

    // Artist at work
    'atwork.title': 'Художник за работой',
    'atwork.lead':  'Каждая картина — это путешествие длиной в несколько недель. Анна начинает с эскиза и постепенно выстраивает слой за слоем: грунт, объёмная текстура, акрил, смола, сусальное золото, зеркальные элементы и финальные акценты из страз.',
    'atwork.p1':    'Процесс создания — медитативный и непредсказуемый. Материалы вступают в диалог между собой: смола растекается, золото ловит свет, зеркальные осколки преломляют пространство. Именно в этом взаимодействии рождается живой характер каждой работы.',
    'atwork.p2':    'Анна не использует шаблонов и не создаёт копий. Каждое полотно — единственное в своём роде. Прежде чем взять кисть, художник проводит время в тишине — чтобы почувствовать образ изнутри, а не просто перенести его на холст.',
    'atwork.tag1':  'Акрил',
    'atwork.tag2':  'Эпоксидная смола',
    'atwork.tag3':  'Сусальное золото',
    'atwork.tag4':  'Зеркало',
    'atwork.tag5':  'Стразы',

    // Commission
    'commission.eyebrow':          'Индивидуальный заказ',
    'commission.title':            'Картина на заказ',
    'commission.intro':            'Создам работу специально для вашего пространства — под размер, палитру и характер интерьера',
    'commission.step1.title':      'Разговор',
    'commission.step1.text':       'Обсуждаем ваш интерьер, предпочтения по цвету, образу и размеру. Можно прислать фото помещения — это помогает сразу увидеть картину в контексте.',
    'commission.step2.title':      'Концепция',
    'commission.step2.text':       'Предлагаю эскиз и цветовую схему. На этом этапе можно внести правки — работа начнётся только после вашего одобрения.',
    'commission.step3.title':      'Создание',
    'commission.step3.text':       'Работа пишется от 2 до 6 недель в зависимости от размера и сложности. Делаю промежуточные фото — вы видите, как рождается картина.',
    'commission.step4.title':      'Доставка',
    'commission.step4.text':       'Работа упаковывается в жёсткий короб с пенной прокладкой — доходит в целости. Доставляю по России (СДЭК, Почта России, ТК) и за рубеж по договорённости. В комплекте — сертификат подлинности и подпись на обороте.',
    'commission.info.cost.label':  'Стоимость',
    'commission.info.cost.value':  'от 30 000 ₽',
    'commission.info.time.label':  'Срок',
    'commission.info.time.value':  '2–6 недель',
    'commission.info.prepay.label':'Предоплата',
    'commission.info.del.label':   'Доставка',
    'commission.info.del.value':   'Россия и за рубеж',
    'commission.cta':              'Обсудить заказ',

    // Try on
    'tryon.eyebrow': 'Примерка',
    'tryon.title':   'Примерь картину на свою стену',
    'tryon.intro':   'Выбери работу из каталога и загрузи фото своей комнаты — увидишь, как она будет выглядеть у тебя дома',

    // Reviews
    'reviews.eyebrow': 'Отзывы коллекционеров',
    'reviews.title':   'Говорят покупатели',

    // Quiz
    'quiz.eyebrow': 'Подбор по вкусу · 4 вопроса',
    'quiz.title':   'Найдём вашу картину',
    'quiz.intro':   'Ответьте на 4 вопроса — предложим идеальный вариант',

    // Order
    'order.eyebrow':        'Сотрудничество',
    'order.title':          'Заказать картину',
    'order.quote':          '«Каждая картина создаётся под конкретного человека и пространство — я вкладываю в неё столько же внимания, сколько вы уделяете своему интерьеру»',
    'order.stat1.label':    'работ в коллекции',
    'order.stat2.label':    'оригиналы',
    'order.stat3.label':    'время ответа',
    'order.g1':             '✦ Сертификат подлинности с каждой работой',
    'order.g2':             '✦ Бережная упаковка и доставка по России и за рубеж',
    'order.g3':             '✦ Картина на заказ — обсудим лично',
    'order.form.name.label':  'Ваше имя *',
    'order.form.phone.label': 'Телефон *',
    'order.form.email.label': 'Email',
    'order.form.msg.label':   'Пожелания к картине',
    'order.form.msg.ph':      'Расскажите об интерьере, размере, цветовых предпочтениях...',
    'order.form.submit':      'Отправить заявку',
    'order.form.note':        'Отвечу в течение 2 часов в рабочее время',

    // Quick nav
    'nav.catalog':    'Каталог',
    'nav.about':      'О художнике',
    'nav.commission': 'На заказ',
    'nav.tryon':      'Примерка',
    'nav.designers':  'Дизайнерам',
    'nav.contact':    'Связаться',

    // Interior photo CTA
    'interior.cta.text': 'Не уверены, впишется ли работа в ваш интерьер?',
    'interior.cta.btn':  'Пришлите фото — подберём вместе',

    // Delivery table
    'delivery.title':           'Доставка и гарантии',
    'delivery.ru.label':        'По России',
    'delivery.ru.value':        'СДЭК, Почта России, транспортные компании — по тарифам перевозчика',
    'delivery.intl.label':      'За рубеж',
    'delivery.intl.value':      'Любым удобным способом, по договорённости',
    'delivery.pack.label':      'Упаковка',
    'delivery.pack.value':      'Жёсткий короб, пенная прокладка, угловые протекторы — работа не сдвинется в пути',
    'delivery.guarantee.label': 'Гарантия',
    'delivery.guarantee.value': 'Если работа пришла повреждённой — заменю или верну деньги',

    // B2B
    'b2b.eyebrow': 'Профессионалам',
    'b2b.title':   'Дизайнерам и архитекторам',
    'b2b.text':    'Работаю с интерьерными проектами напрямую: подбираю работы под концепцию, адаптирую размер и палитру под план помещения, выставляю счёт для юридических лиц. Если вы ведёте объект и ищете авторское искусство — давайте обсудим условия.',
    'b2b.cta':     'Обсудить проект',

    // Promo banner (включить: убрать style="display:none" в HTML)
    'promo.text': '✦ Новые работы в коллекции — загляните в каталог',

    // Footer
    'footer.subscribe.title': 'Узнавайте о новых работах первыми',
    'footer.subscribe.ph':    'Ваш email',
    'footer.subscribe.btn':   'Подписаться',
    'footer.copy':            '© 2025 Anna Biryukova. Все права защищены.',
  },

  en: {
    // Hero
    'hero.title':       'Art where<br>light lives',
    'hero.subtitle':    'Each artwork is built layer by layer — texture, reflection and light form a sculptural surface carrying both strength and quiet harmony.',
    'hero.btn.catalog': 'View catalog',
    'hero.btn.quiz':    'Find my artwork',

    // About
    'about.title': 'About the Artist',
    'about.p1': 'Anna Biryukova is a contemporary artist working in her signature <strong>"Luminous Relief"</strong> technique. Her visual language combines geometric structure with organic movement, creating expressive compositions that convey strength, harmony and transformation.',
    'about.p2': 'In her multi-stage process, Anna creates sculptural works using layered acrylic, resin, gold leaf, mirror elements, glass textures, rhinestones and decorative stones. These materials form relief surfaces that interact with light, revealing new nuances from every angle.',
    'about.fact1': 'Inspiration — animals, botanical motifs and symbolic imagery',
    'about.fact2': 'Each work is crafted by hand and may take several weeks',
    'about.fact3': 'All works are unique originals with no reproductions',
    'about.fact4': 'Works become focal points in contemporary interiors',

    // Catalog
    'catalog.eyebrow':    'Original works · Unique pieces',
    'catalog.title':      'Works Catalog',
    'catalog.filter.all': 'All',

    // Mockups
    'mockups.eyebrow': 'Visualizations',
    'mockups.title':   'Art in Interior',

    // Artist at work
    'atwork.title': 'Artist at Work',
    'atwork.lead':  'Each painting is a journey of several weeks. Anna begins with a sketch and gradually builds layer by layer: primer, textured base, acrylic, resin, gold leaf, mirror elements and final rhinestone accents.',
    'atwork.p1':    'The creative process is meditative and unpredictable. Materials enter into dialogue: resin flows, gold catches light, mirror shards refract space. It is in this interaction that the living character of each work is born.',
    'atwork.p2':    'Anna uses no templates and makes no copies. Every canvas is one of a kind. Before picking up a brush, the artist spends time in stillness — to feel the image from within, not merely transfer it to canvas.',
    'atwork.tag1':  'Acrylic',
    'atwork.tag2':  'Epoxy Resin',
    'atwork.tag3':  'Gold Leaf',
    'atwork.tag4':  'Mirror',
    'atwork.tag5':  'Rhinestones',

    // Commission
    'commission.eyebrow':          'Custom Order',
    'commission.title':            'Commission a Painting',
    'commission.intro':            'I will create a work specifically for your space — tailored to size, palette and the character of your interior',
    'commission.step1.title':      'Conversation',
    'commission.step1.text':       'We discuss your interior, colour preferences, imagery and size. Feel free to send photos of your space — it helps to see the artwork in context right away.',
    'commission.step2.title':      'Concept',
    'commission.step2.text':       'I propose a sketch and colour scheme. Adjustments are welcome at this stage — work begins only after your approval.',
    'commission.step3.title':      'Creation',
    'commission.step3.text':       'The painting takes 2 to 6 weeks depending on size and complexity. I share progress photos so you can watch the artwork come to life.',
    'commission.step4.title':      'Delivery',
    'commission.step4.text':       "The work is packed in a rigid crate with foam padding — it arrives intact. Shipping across Russia (CDEK, Russian Post, freight carriers) and internationally by arrangement. Includes a certificate of authenticity and artist's signature on the reverse.",
    'commission.info.cost.label':  'Price',
    'commission.info.cost.value':  'from 30 000 ₽',
    'commission.info.time.label':  'Timeline',
    'commission.info.time.value':  '2–6 weeks',
    'commission.info.prepay.label':'Deposit',
    'commission.info.del.label':   'Shipping',
    'commission.info.del.value':   'Russia & international',
    'commission.cta':              'Discuss a commission',

    // Try on
    'tryon.eyebrow': 'Virtual Try-On',
    'tryon.title':   'See the painting on your wall',
    'tryon.intro':   'Select a work from the catalog and upload a photo of your room — see how it will look in your home',

    // Reviews
    'reviews.eyebrow': 'Collector Reviews',
    'reviews.title':   'What buyers say',

    // Quiz
    'quiz.eyebrow': 'Find your match · 4 questions',
    'quiz.title':   'Let\'s find your painting',
    'quiz.intro':   'Answer 4 questions — we\'ll suggest the perfect match',

    // Order
    'order.eyebrow':        'Collaboration',
    'order.title':          'Order a Painting',
    'order.quote':          '«Every painting is made for a specific person and space — I pour into it as much attention as you give to your interior»',
    'order.stat1.label':    'works in collection',
    'order.stat2.label':    'originals',
    'order.stat3.label':    'response time',
    'order.g1':             '✦ Certificate of authenticity with every work',
    'order.g2':             '✦ Careful packaging and delivery — Russia & worldwide',
    'order.g3':             '✦ Custom commission — let\'s discuss personally',
    'order.form.name.label':  'Your name *',
    'order.form.phone.label': 'Phone *',
    'order.form.email.label': 'Email',
    'order.form.msg.label':   'Your wishes',
    'order.form.msg.ph':      'Tell me about your interior, size, colour preferences...',
    'order.form.submit':      'Send request',
    'order.form.note':        "I'll reply within 2 hours during working hours",

    // Quick nav
    'nav.catalog':    'Catalog',
    'nav.about':      'About',
    'nav.commission': 'Commission',
    'nav.tryon':      'Try On',
    'nav.designers':  'Designers',
    'nav.contact':    'Contact',

    // Interior photo CTA
    'interior.cta.text': 'Not sure the artwork will fit your interior?',
    'interior.cta.btn':  'Send a photo — we\'ll find the right fit',

    // Delivery table
    'delivery.title':           'Shipping & Guarantees',
    'delivery.ru.label':        'Within Russia',
    'delivery.ru.value':        'CDEK, Russian Post, freight carriers — at carrier rates',
    'delivery.intl.label':      'International',
    'delivery.intl.value':      'Any convenient method, by arrangement',
    'delivery.pack.label':      'Packaging',
    'delivery.pack.value':      'Rigid crate, foam padding, corner protectors — the work won\'t shift in transit',
    'delivery.guarantee.label': 'Guarantee',
    'delivery.guarantee.value': 'If the work arrives damaged — I\'ll replace it or issue a full refund',

    // B2B
    'b2b.eyebrow': 'For Professionals',
    'b2b.title':   'Designers & Architects',
    'b2b.text':    'I work directly with interior projects: selecting works to match the concept, adapting size and palette to floor plans, and invoicing for legal entities. If you\'re working on a project and looking for original art — let\'s talk.',
    'b2b.cta':     'Discuss a project',

    // Promo banner
    'promo.text': '✦ New works added to the collection — explore the catalog',

    // Footer
    'footer.subscribe.title': 'Be the first to know about new works',
    'footer.subscribe.ph':    'Your email',
    'footer.subscribe.btn':   'Subscribe',
    'footer.copy':            '© 2025 Anna Biryukova. All rights reserved.',
  }
};

// ─── state ───────────────────────────────────────────────────────────────────

window.LANG = localStorage.getItem('annastar_lang') || 'ru';

// ─── core ─────────────────────────────────────────────────────────────────────

function setLang(lang) {
  window.LANG = lang;
  localStorage.setItem('annastar_lang', lang);
  document.documentElement.lang = lang;
  _applyTranslations();
  _updateToggle();
  document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}

function _applyTranslations() {
  const dict = I18N[window.LANG] || I18N.ru;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });

  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.dataset.i18nPh;
    if (dict[key] !== undefined) el.placeholder = dict[key];
  });
}

function _updateToggle() {
  document.querySelectorAll('.lang-toggle__opt').forEach(opt => {
    opt.classList.toggle('is-active', opt.dataset.lang === window.LANG);
  });
}

// ─── init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Create toggle button
  const toggle = document.createElement('div');
  toggle.id = 'langToggle';
  toggle.className = 'lang-toggle';
  toggle.setAttribute('role', 'group');
  toggle.setAttribute('aria-label', 'Language / Язык');
  toggle.innerHTML = `
    <button class="lang-toggle__opt${window.LANG === 'ru' ? ' is-active' : ''}" data-lang="ru" type="button" aria-pressed="${window.LANG === 'ru'}">RU</button>
    <span class="lang-toggle__sep" aria-hidden="true">|</span>
    <button class="lang-toggle__opt${window.LANG === 'en' ? ' is-active' : ''}" data-lang="en" type="button" aria-pressed="${window.LANG === 'en'}">EN</button>
  `;
  toggle.addEventListener('click', e => {
    const opt = e.target.closest('.lang-toggle__opt');
    if (opt && opt.dataset.lang !== window.LANG) setLang(opt.dataset.lang);
  });
  document.body.appendChild(toggle);

  // Apply saved language on load
  if (window.LANG !== 'ru') _applyTranslations();
});
