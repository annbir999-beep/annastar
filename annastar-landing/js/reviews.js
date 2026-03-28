/**
 * reviews.js — галерея скриншотов отзывов
 * Добавляй файлы в images/reviews/ и прописывай имена ниже в REVIEWS_FILES
 */

const REVIEWS_FILES = [
  // Добавляй сюда имена файлов по мере загрузки, например:
  // 'review-01.jpg',
  // 'review-02.jpg',
];

document.addEventListener('DOMContentLoaded', () => {
  const grid  = document.getElementById('reviewsGrid');
  const empty = document.getElementById('reviewsEmpty');
  if (!grid) return;

  const section = document.getElementById('reviews');

  if (REVIEWS_FILES.length === 0) {
    return; // секция скрыта через style в HTML
  }

  section && (section.style.display = '');

  grid.innerHTML = REVIEWS_FILES.map((file, i) => `
    <div class="review-card reveal" style="transition-delay:${i * 0.08}s">
      <img
        src="images/reviews/${file}"
        alt="Отзыв покупателя"
        loading="lazy"
        class="review-card__img"
        onclick="this.closest('.review-card').classList.toggle('review-card--zoomed')"
      />
    </div>
  `).join('');
});
