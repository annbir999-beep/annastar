# AnnaStar — Лендинг художника

Сайт-лендинг для продажи авторских картин маслом.

## Структура проекта

```
annastar-landing/
├── index.html          — единственная страница (SPA-лендинг)
├── css/
│   ├── style.css       — основные стили, CSS-переменные, компоненты
│   ├── quiz.css        — стили квиза подбора картины
│   └── mobile.css      — адаптив (tablet ≤1024px, mobile ≤768px, ≤480px)
├── js/
│   ├── quiz.js         — 4-шаговый квиз, подбор по style/palette/size/budget
│   ├── catalog.js      — рендер карточек из works.json, фильтры, модальное окно
│   ├── payment.js      — клиентская часть ЮКасса (инициирует платёж через backend)
│   └── form.js         — форма заявки: маска телефона, валидация, отправка
├── images/
│   ├── works/          — 12 фото работ (WebP, не более 200 KB каждая)
│   ├── mockups/        — мокапы картин в интерьере
│   └── artist/         — фото художника
├── data/
│   └── works.json      — данные 12 работ (id, title, category, price, ...)
├── .env                — API-ключи (не коммитить!)
└── .gitignore
```

## Быстрый старт

Проект — статический HTML без сборщика. Для разработки нужен локальный сервер
(из-за `fetch('data/works.json')` — браузер блокирует fetch по `file://`).

```bash
# Вариант 1 — VS Code расширение Live Server
# Кнопка "Go Live" в строке состояния

# Вариант 2 — Python
python -m http.server 8080

# Вариант 3 — Node.js
npx serve .
```

Откройте `http://localhost:8080` в браузере.

## Добавление работ

Отредактируйте `data/works.json`. Каждая работа:

```json
{
  "id": 13,
  "title": "Название работы",
  "category": "abstract",      // abstract | landscape | portrait | floral
  "medium": "Масло, холст",
  "size": "60×80 см",
  "year": 2024,
  "price": 15000,
  "available": true,
  "palette": ["warm"],          // warm | cool | neutral | bright
  "image": "work-13.webp",      // файл в images/works/
  "description": "Описание для модального окна"
}
```

Добавьте изображение `images/works/work-13.webp` (WebP, не более 200 KB).

## Интеграция ЮКасса

Платёжные запросы **обязательно** проходят через backend — секретный ключ
нельзя хранить в браузере.

Минимальный backend-эндпоинт `POST /api/payment/create`:

```js
// Пример на Node.js / Express
app.post('/api/payment/create', async (req, res) => {
  const { amount, description, workId } = req.body;

  const payment = await yookassa.createPayment({
    amount: { value: amount.toFixed(2), currency: 'RUB' },
    confirmation: {
      type: 'redirect',
      return_url: 'https://your-site.ru/?status=success&orderId=...',
    },
    description,
    metadata: { workId },
  });

  res.json({ confirmationUrl: payment.confirmation.confirmation_url });
});
```

## Уведомления о заявках

`POST /api/order` принимает форму и пересылает в Telegram:

```js
const msg = `Новая заявка!\n👤 ${name}\n📞 ${phone}\n✉️ ${email}\n💬 ${message}`;
await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
  method: 'POST',
  body: JSON.stringify({ chat_id: CHAT_ID, text: msg }),
  headers: { 'Content-Type': 'application/json' },
});
```

## Оптимизация изображений

Для конвертации в WebP (требует установленного `cwebp` или `sharp`):

```bash
# cwebp
cwebp -q 82 input.jpg -o images/works/work-01.webp

# sharp (Node.js)
npx sharp-cli --input="*.jpg" --output=images/works/ --format=webp --quality=82
```

Целевой размер: **до 200 KB** на файл.

## Чеклист перед публикацией

- [ ] Заменить заглушки в `.env` на реальные ключи
- [ ] Загрузить 12 фото работ в `images/works/`
- [ ] Загрузить мокапы в `images/mockups/`
- [ ] Загрузить фото художника в `images/artist/`
- [ ] Настроить backend `/api/order` и `/api/payment/create`
- [ ] Проверить на мобильных устройствах
- [ ] Добавить Google Analytics / Яндекс.Метрику
- [ ] Настроить HTTPS
