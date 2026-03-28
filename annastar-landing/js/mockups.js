/**
 * mockups.js — карусель «Картины в интерьере»
 * Показывает 2 слайда за раз, авто-прокрутка каждые 4 сек,
 * управление стрелками и точками. Скрывает слайды без изображения.
 */

(function () {
  const carousel  = document.getElementById('mockupsCarousel');
  const dotsWrap  = document.getElementById('mockupsDots');
  const btnPrev   = document.getElementById('mockupsPrev');
  const btnNext   = document.getElementById('mockupsNext');

  if (!carousel) return;

  // Скрываем слайды с битыми/отсутствующими изображениями
  const allSlides = Array.from(carousel.querySelectorAll('.mockups__slide'));
  allSlides.forEach(slide => {
    const img = slide.querySelector('img');
    if (!img) { slide.remove(); return; }
    img.addEventListener('error', () => slide.remove());
  });

  // Даём браузеру время обработать ошибки, затем инициализируем
  setTimeout(init, 200);

  function init() {
    const slides = Array.from(carousel.querySelectorAll('.mockups__slide'));
    if (slides.length === 0) {
      document.getElementById('mockups')?.style.setProperty('display', 'none');
      return;
    }

    let current = 0;
    let timer;

    // Создаём точки
    dotsWrap.innerHTML = '';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'mockups__dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Слайд ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      // Смещение: каждый слайд занимает 60% + 10px отступ с двух сторон
      const slideWidth = slides[0].offsetWidth + 20; // ширина + gap
      carousel.style.transform = `translateX(calc(-${current * 60}% + 20%))`;

      dotsWrap.querySelectorAll('.mockups__dot').forEach((d, i) =>
        d.classList.toggle('active', i === current)
      );
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAuto() { timer = setInterval(next, 4000); }
    function stopAuto()  { clearInterval(timer); }

    btnNext?.addEventListener('click', () => { stopAuto(); next(); startAuto(); });
    btnPrev?.addEventListener('click', () => { stopAuto(); prev(); startAuto(); });

    // Свайп на мобильных
    let touchStartX = 0;
    carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) { stopAuto(); dx < 0 ? next() : prev(); startAuto(); }
    });

    goTo(0);
    startAuto();
  }
})();
