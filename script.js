const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
const header = document.querySelector('.site-header');
const progress = document.querySelector('.scroll-progress span');

const closeNav = () => {
  nav?.classList.remove('is-open');
  navToggle?.classList.remove('is-open');
  navToggle?.setAttribute('aria-expanded', 'false');
  navToggle?.setAttribute('aria-label', 'Abrir menú');
};

navToggle?.addEventListener('click', () => {
  const open = !nav?.classList.contains('is-open');
  nav?.classList.toggle('is-open', open);
  navToggle.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));

const onScroll = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
  if (progress) progress.style.transform = `scaleX(${ratio})`;
  header?.classList.toggle('is-scrolled', window.scrollY > 60);
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

const reveals = document.querySelectorAll('.reveal, .reveal-image');
if (reducedMotion || !('IntersectionObserver' in window)) {
  reveals.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
  reveals.forEach((item) => revealObserver.observe(item));
}

const zones = {
  neck: {
    number: '01',
    title: 'Cuello y hombros',
    copy: 'La tensión acumulada puede sentirse como rigidez, pesadez o molestia al moverte. Una sesión puede enfocarse en liberar la zona y recuperar comodidad.',
    message: 'Siento molestias o tensión en cuello y hombros.'
  },
  back: {
    number: '02',
    title: 'Espalda',
    copy: 'Las horas sentado, el esfuerzo y la rutina pueden cargar la espalda. El trabajo manual ayuda a atender esa tensión y devolver bienestar a la zona.',
    message: 'Quiero consultar por molestias o tensión en la espalda.'
  },
  waist: {
    number: '03',
    title: 'Zona lumbar',
    copy: 'Cuando la cintura molesta, hasta los movimientos cotidianos se sienten distintos. Contá qué sentís para orientar la atención de forma personalizada.',
    message: 'Siento molestias en la cintura o zona lumbar.'
  },
  legs: {
    number: '04',
    title: 'Piernas',
    copy: 'Cansancio, sobrecarga o tensión después de la actividad pueden pedir una pausa. La sesión se adapta a la sensación y necesidad de cada persona.',
    message: 'Quiero consultar por cansancio o molestias en las piernas.'
  }
};

const zoneCard = document.querySelector('.zone-card');
const zoneTitle = document.querySelector('#zone-title');
const zoneCopy = document.querySelector('#zone-copy');
const zoneNumber = document.querySelector('.zone-card__number');
let selectedZoneMessage = '';

document.querySelectorAll('.body-point').forEach((point) => {
  point.addEventListener('click', () => {
    const zone = zones[point.dataset.zone];
    if (!zone) return;
    document.querySelectorAll('.body-point').forEach((item) => {
      const active = item === point;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    zoneCard?.classList.remove('is-changing');
    void zoneCard?.offsetWidth;
    zoneCard?.classList.add('is-changing');
    if (zoneNumber) zoneNumber.textContent = zone.number;
    if (zoneTitle) zoneTitle.textContent = zone.title;
    if (zoneCopy) zoneCopy.textContent = zone.copy;
    selectedZoneMessage = zone.message;
  });
});

document.querySelectorAll('.faq-list details').forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    document.querySelectorAll('.faq-list details').forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

const modal = document.querySelector('#booking-modal');
const dialog = modal?.querySelector('.booking-dialog');
const modalClose = modal?.querySelector('.booking-close');
const bookingSteps = [...(modal?.querySelectorAll('.booking-step') || [])];
const bookingProgress = modal?.querySelector('.booking-progress span');
const bookingForm = document.querySelector('#booking-form');
const bookingMessage = document.querySelector('#booking-message');
const bookingDate = document.querySelector('#booking-date');
let lastTrigger = null;

const showStep = (step) => {
  bookingSteps.forEach((item) => item.classList.toggle('is-active', item.dataset.step === String(step)));
  if (bookingProgress) bookingProgress.style.width = step === 1 ? '50%' : '100%';
  dialog?.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
};

const openBooking = (trigger) => {
  if (!modal) return;
  lastTrigger = trigger;
  modal.hidden = false;
  document.body.classList.add('modal-open');
  showStep(1);
  if (selectedZoneMessage && bookingMessage) bookingMessage.value = selectedZoneMessage;
  window.setTimeout(() => modalClose?.focus(), 20);
};

const closeBooking = () => {
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove('modal-open');
  closeNav();
  lastTrigger?.focus();
};

document.querySelectorAll('.js-book').forEach((button) => button.addEventListener('click', () => openBooking(button)));
modal?.querySelectorAll('[data-close-modal]').forEach((item) => item.addEventListener('click', closeBooking));
modal?.querySelector('.booking-next')?.addEventListener('click', () => showStep(2));
modal?.querySelector('.booking-back')?.addEventListener('click', () => showStep(1));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal && !modal.hidden) closeBooking();
});

if (bookingDate) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  bookingDate.min = tomorrow.toISOString().split('T')[0];
}

bookingForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!bookingForm.reportValidity()) return;
  const data = new FormData(bookingForm);
  const dateValue = String(data.get('date') || '');
  const date = dateValue ? new Date(`${dateValue}T12:00:00`) : null;
  const formattedDate = date ? new Intl.DateTimeFormat('es-PY', { day: 'numeric', month: 'long', year: 'numeric' }).format(date) : 'a coordinar';
  const text = [
    'Hola Silvia, quisiera solicitar una sesión.',
    '',
    `Nombre: ${data.get('name')}`,
    `Tratamiento: ${data.get('service')}`,
    `Fecha preferida: ${formattedDate}`,
    data.get('message') ? `Comentario: ${data.get('message')}` : '',
    '',
    '¿Podrías confirmarme disponibilidad?'
  ].filter(Boolean).join('\n');
  window.open(`https://wa.me/595991902666?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
});

if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
  const portrait = document.querySelector('.hero-portrait');
  window.addEventListener('scroll', () => {
    if (!portrait || window.scrollY > window.innerHeight * 1.2) return;
    portrait.style.transform = `translateY(${window.scrollY * .055}px)`;
  }, { passive: true });
}
