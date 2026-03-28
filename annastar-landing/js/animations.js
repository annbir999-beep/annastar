/**
 * animations.js — scroll reveal, custom cursor, footer subscribe
 */

document.addEventListener('DOMContentLoaded', () => {
  _initScrollReveal();
  _initCursor();
  _initSubscribeForm();
});

/* ── SCROLL REVEAL ─────────────────────────────── */
function _initScrollReveal() {
  const targets = document.querySelectorAll(
    '.section-title, .section-eyebrow, .about__inner, .atwork__inner, ' +
    '.work-card, .mockups__slide, .order__left, .order__right, ' +
    '.atwork__tags, .footer__subscribe'
  );

  targets.forEach(el => {
    el.classList.add('reveal');
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ── CUSTOM CURSOR ─────────────────────────────── */
function _initCursor() {
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (!cursor || !follower) return;

  // Отключаем на тач-устройствах
  if (window.matchMedia('(hover: none)').matches) return;

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  // Плавный follower через rAF
  (function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    follower.style.transform = `translate(${followerX}px, ${followerY}px)`;
    requestAnimationFrame(animateFollower);
  })();

  // Увеличение на интерактивных элементах
  const hoverTargets = 'a, button, .work-card, .mockups__slide, .filter-btn, .quiz__option';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor--hover');
      follower.classList.add('cursor--hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor--hover');
      follower.classList.remove('cursor--hover');
    });
  });

  // Скрыть при уходе курсора за экран
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    follower.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    follower.style.opacity = '1';
  });
}

/* ── FOOTER SUBSCRIBE ──────────────────────────── */
function _initSubscribeForm() {
  const form = document.getElementById('subscribeForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = form.email.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      form.email.style.borderColor = '#c62828';
      return;
    }
    form.email.style.borderColor = '';
    form.innerHTML = '<p class="footer__subscribe-thanks">Спасибо! Пришлю письмо, когда появятся новые работы.</p>';
  });
}
