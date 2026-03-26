/**
 * payment.js — интеграция ЮКасса (YooKassa)
 *
 * Требует переменных окружения (подставляются при сборке / через backend):
 *   YOKASSA_SHOP_ID   — идентификатор магазина
 *   YOKASSA_SECRET    — секретный ключ (ТОЛЬКО на сервере, не в браузере!)
 *
 * ВАЖНО: платёжные запросы должны проходить через backend.
 * Этот файл содержит только клиентскую часть (инициализация виджета).
 */

const Payment = (() => {

  /** Открыть платёжный виджет ЮКасса для выбранной работы */
  async function buyWork(workId) {
    const work = await _getWork(workId);
    if (!work) {
      alert('Работа не найдена');
      return;
    }
    if (!work.available) {
      alert('Эта работа уже продана');
      return;
    }

    // Создаём платёж через наш backend
    const payment = await _createPayment({
      amount:      work.price,
      description: `Картина «${work.title}» (${work.size})`,
      workId:      work.id,
    });

    if (!payment || !payment.confirmationUrl) {
      alert('Не удалось создать платёж. Попробуйте позже.');
      return;
    }

    // Перенаправляем на страницу ЮКасса
    window.location.href = payment.confirmationUrl;
  }

  /** Запрос к backend для создания платежа */
  async function _createPayment({ amount, description, workId }) {
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, description, workId }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();

    } catch (err) {
      console.error('Ошибка создания платежа:', err);
      return null;
    }
  }

  /** Получить данные работы из works.json */
  async function _getWork(workId) {
    try {
      const res   = await fetch('data/works.json');
      const works = await res.json();
      return works.find(w => w.id === workId) || null;
    } catch {
      return null;
    }
  }

  /** Обработка возврата с платёжной страницы (вызвать на странице success/fail) */
  function handleReturn() {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');   // 'success' | 'fail'
    const orderId = params.get('orderId');

    if (status === 'success') {
      _showPaymentSuccess(orderId);
    } else if (status === 'fail') {
      _showPaymentFail();
    }
  }

  function _showPaymentSuccess(orderId) {
    const banner = document.createElement('div');
    banner.className  = 'payment-banner payment-banner--success';
    banner.innerHTML  = `
      <p>Оплата прошла успешно! Номер заказа: <strong>${orderId || '—'}</strong></p>
      <p>Я свяжусь с вами в течение нескольких часов по вопросам доставки.</p>
    `;
    document.body.prepend(banner);
  }

  function _showPaymentFail() {
    const banner = document.createElement('div');
    banner.className  = 'payment-banner payment-banner--fail';
    banner.innerHTML  = `<p>Оплата не прошла. Попробуйте ещё раз или свяжитесь со мной напрямую.</p>`;
    document.body.prepend(banner);
  }

  // Автоматически проверяем при загрузке страницы
  document.addEventListener('DOMContentLoaded', handleReturn);

  return { buyWork, handleReturn };

})();
