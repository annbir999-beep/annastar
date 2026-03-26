/**
 * form.js — форма заявок
 * Валидация, маска телефона, отправка на backend / Telegram Bot API
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('orderForm');
  if (!form) return;

  const phoneInput = document.getElementById('phone');

  // --- Маска телефона ---
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.startsWith('8')) val = '7' + val.slice(1);
      if (!val.startsWith('7') && val.length > 0) val = '7' + val;

      let formatted = '';
      if (val.length > 0)  formatted  = '+7';
      if (val.length > 1)  formatted += ' (' + val.slice(1, 4);
      if (val.length >= 4) formatted += ') ' + val.slice(4, 7);
      if (val.length >= 7) formatted += '-' + val.slice(7, 9);
      if (val.length >= 9) formatted += '-' + val.slice(9, 11);

      e.target.value = formatted;
    });
  }

  // --- Отправка формы ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!_validate(form)) return;

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled   = true;
    submitBtn.textContent = 'Отправляю…';

    const data = {
      name:    form.name.value.trim(),
      phone:   form.phone.value.trim(),
      email:   form.email.value.trim(),
      message: form.message.value.trim(),
    };

    const ok = await _sendForm(data);

    if (ok) {
      _showSuccess(form);
    } else {
      submitBtn.disabled   = false;
      submitBtn.textContent = 'Отправить заявку';
      _showError(form, 'Не удалось отправить заявку. Попробуйте позже или напишите в Telegram.');
    }
  });
});

/** Базовая валидация */
function _validate(form) {
  let valid = true;

  // Убираем старые ошибки
  form.querySelectorAll('.field-error').forEach(el => el.remove());
  form.querySelectorAll('.form-group input, .form-group textarea')
      .forEach(el => el.classList.remove('is-invalid'));

  const name  = form.name.value.trim();
  const phone = form.phone.value.replace(/\D/g, '');
  const email = form.email.value.trim();

  if (name.length < 2) {
    _fieldError(form.name, 'Введите ваше имя');
    valid = false;
  }

  if (phone.length < 11) {
    _fieldError(form.phone, 'Введите корректный номер телефона');
    valid = false;
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    _fieldError(form.email, 'Введите корректный email');
    valid = false;
  }

  return valid;
}

function _fieldError(input, message) {
  input.classList.add('is-invalid');
  const err = document.createElement('span');
  err.className   = 'field-error';
  err.textContent = message;
  err.style.cssText = 'display:block;font-size:12px;color:#c62828;margin-top:4px';
  input.parentNode.appendChild(err);
}

/** Отправка на backend */
async function _sendForm(data) {
  try {
    const res = await fetch('/api/order', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function _showSuccess(form) {
  const msg = document.createElement('div');
  msg.className = 'form-success';
  msg.innerHTML = `
    <p style="font-size:20px;font-weight:600;color:var(--color-secondary);margin-bottom:8px">
      Заявка отправлена!
    </p>
    <p style="color:var(--color-text-light)">
      Отвечу в течение 2 часов в рабочее время.
    </p>
  `;
  msg.style.cssText = 'text-align:center;padding:40px 0';
  form.replaceWith(msg);
}

function _showError(form, text) {
  let err = form.querySelector('.form-send-error');
  if (!err) {
    err = document.createElement('p');
    err.className = 'form-send-error';
    err.style.cssText = 'color:#c62828;font-size:14px;text-align:center';
    form.appendChild(err);
  }
  err.textContent = text;
}
