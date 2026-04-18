/* ============================================
   ASA RÉNOVATION — JavaScript
   ============================================ */

'use strict';

/* ---------- HEADER : SCROLL SHADOW ---------- */
const header = document.getElementById('header');
const floatingCta = document.getElementById('floating-cta');

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 60;
  header.classList.toggle('scrolled', scrolled);
  floatingCta.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

/* ---------- HAMBURGER MENU ---------- */
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');

hamburger.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  hamburger.classList.toggle('active', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

// Fermer le menu si on clique sur un lien
nav.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    hamburger.classList.remove('active');
  });
});

// Fermer si clic en dehors
document.addEventListener('click', (e) => {
  if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
    nav.classList.remove('open');
    hamburger.classList.remove('active');
  }
});

/* ---------- SMOOTH SCROLL ---------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const headerH = header.getBoundingClientRect().height;
    const targetY = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  });
});

/* ---------- FORMULAIRE DE CONTACT ---------- */
const form = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const btnText = document.getElementById('btn-text');
const btnLoading = document.getElementById('btn-loading');
const successModal = document.getElementById('success-modal');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const modalPrenom = document.getElementById('modal-prenom');

function validateField(field) {
  const value = field.value.trim();
  let valid = true;

  if (field.hasAttribute('required') && !value) {
    valid = false;
  } else if (field.type === 'email' && value) {
    valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  } else if (field.type === 'tel' && value) {
    valid = /^[\d\s\+\-\(\)]{8,}$/.test(value);
  } else if (field.type === 'checkbox' && field.hasAttribute('required')) {
    valid = field.checked;
  }

  field.classList.toggle('error', !valid);
  return valid;
}

// Validation en temps réel
form.querySelectorAll('input, select, textarea').forEach(field => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => {
    if (field.classList.contains('error')) validateField(field);
  });
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Valider tous les champs
  const fields = form.querySelectorAll('input, select, textarea');
  let allValid = true;
  fields.forEach(field => {
    if (!validateField(field)) allValid = false;
  });

  if (!allValid) {
    // Scroll vers le premier champ en erreur
    const firstError = form.querySelector('.error');
    if (firstError) {
      firstError.focus();
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  // UI : loading
  submitBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoading.style.display = 'inline';

  // Simuler un envoi (remplacer par fetch réel en production)
  await new Promise(r => setTimeout(r, 1800));

  // Succès
  const prenom = document.getElementById('prenom').value.trim();
  modalPrenom.textContent = prenom ? prenom + ' !' : '';
  openModal();
  form.reset();
  form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

  // Réinitialiser le bouton
  submitBtn.disabled = false;
  btnText.style.display = 'inline';
  btnLoading.style.display = 'none';
});

function openModal() {
  successModal.classList.add('active');
  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  successModal.classList.remove('active');
  modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

/* ---------- ANIMATIONS AU SCROLL ---------- */
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animated');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observer les cartes et sections
document.querySelectorAll('.service-card, .why-card, .aide-card, .temoignage-card, .aa-card, .step').forEach(el => {
  el.classList.add('animate-on-scroll');
  observer.observe(el);
});

/* ---------- COMPTEUR ANIMÉ (HERO STATS) ---------- */
function animateCounter(el, target, suffix = '') {
  const duration = 1500;
  const start = performance.now();
  const startVal = 0;

  function update(timestamp) {
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(startVal + (target - startVal) * eased);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const trustItems = document.querySelectorAll('.trust-item strong');
      const data = [
        { target: 1200, suffix: '+' },
        { target: 15, suffix: ' ans' },
        { target: 4.9, suffix: '/5', isFloat: true },
        { target: 0, suffix: '€' }
      ];
      trustItems.forEach((el, i) => {
        if (data[i]) {
          if (data[i].isFloat) {
            el.textContent = '4,9/5';
          } else {
            animateCounter(el, data[i].target, data[i].suffix);
          }
        }
      });
      heroObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroTrust = document.querySelector('.hero__trust');
if (heroTrust) heroObserver.observe(heroTrust);

/* ---------- INJECT ANIMATION CSS ---------- */
const style = document.createElement('style');
style.textContent = `
  .animate-on-scroll {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.55s ease, transform 0.55s ease;
  }
  .animate-on-scroll.animated {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(style);
