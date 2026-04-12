/**
 * tma/i18n.js — переводы для Telegram Mini App
 */

const TMA_STRINGS = {
  ru: {
    logo:         'AnnaStar',
    filter_all:   'Все',
    filter_botanica:   'Botanica',
    filter_zoology:    'Zoology',
    filter_abstraction:'Abstraction',
    filter_relax:      'Relax',
    filter_concept:    'Под заказ',
    available:    'В наличии',
    sold:         'Продана',
    concept:      'Под заказ',
    badge_hero:   'Флагман',
    badge_new:    'Новинка',
    size:         'Размер',
    materials:    'Материалы',
    buy:          'Купить',
    enquire:      'Написать',
    commission:   'Заказать эту работу',
    commission_similar: 'Заказать похожую',
    formats:      'Форматы и цены',
    from:         'от',
    order_title:  'Оставить заявку',
    order_work:   'Работа:',
    order_name:   'Ваше имя',
    order_phone:  'Телефон',
    order_comment:'Комментарий (необязательно)',
    order_submit: 'Отправить заявку',
    order_back:   'Назад',
    success_title:'Заявка отправлена!',
    success_text: 'Анна свяжется с вами в течение дня.',
    success_back: 'Вернуться в каталог',
    loading:      'Загрузка...',
    error_load:   'Не удалось загрузить каталог.',
    concept_note: 'Обсудим детали, размер и срок',
  },
  en: {
    logo:         'AnnaStar',
    filter_all:   'All',
    filter_botanica:   'Botanica',
    filter_zoology:    'Zoology',
    filter_abstraction:'Abstraction',
    filter_relax:      'Relax',
    filter_concept:    'Commission',
    available:    'Available',
    sold:         'Sold',
    concept:      'Commission',
    badge_hero:   'Hero',
    badge_new:    'New',
    size:         'Size',
    materials:    'Materials',
    buy:          'Buy',
    enquire:      'Enquire',
    commission:   'Commission this work',
    commission_similar: 'Commission similar',
    formats:      'Formats & Prices',
    from:         'from',
    order_title:  'Send enquiry',
    order_work:   'Artwork:',
    order_name:   'Your name',
    order_phone:  'Phone',
    order_comment:'Comment (optional)',
    order_submit: 'Send',
    order_back:   'Back',
    success_title:'Request sent!',
    success_text: 'Anna will contact you within the day.',
    success_back: 'Back to catalogue',
    loading:      'Loading...',
    error_load:   'Failed to load catalogue.',
    concept_note: 'Details, size and timeline — by arrangement',
  }
};

// Определяем язык: из Telegram или из браузера
const tmaLang = (() => {
  try {
    const tgLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
    if (tgLang && tgLang.startsWith('ru')) return 'ru';
    if (tgLang) return 'en';
  } catch {}
  return navigator.language?.startsWith('ru') ? 'ru' : 'en';
})();

function t(key) {
  return TMA_STRINGS[tmaLang]?.[key] ?? TMA_STRINGS['ru'][key] ?? key;
}
