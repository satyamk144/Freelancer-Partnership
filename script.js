'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Mobile navigation
const menuBtn = $('.menu-btn');
const nav = $('#navMenu');
menuBtn?.addEventListener('click', () => {
  const open = nav?.classList.toggle('open') ?? false;
  menuBtn?.setAttribute('aria-expanded', String(open));
});
$$('#navMenu a').forEach((a) => a.addEventListener('click', () => {
  nav?.classList.remove('open');
  menuBtn?.setAttribute('aria-expanded', 'false');
}));

// -------------------------
// Gallery + fullscreen viewer
// gallery-data.js is generated automatically by GitHub Actions.
// -------------------------
const galleryItems = Array.isArray(window.SATYAM_GALLERY) ? window.SATYAM_GALLERY : [
  { src: './assets/service-1.webp', alt: 'Service profile highlight' },
  { src: './assets/service-2.webp', alt: 'Professional work highlight' },
  { src: './assets/service-3.webp', alt: 'Professional profile highlight' }
];
const galleryGrid = $('#galleryGrid');
const lightbox = $('#lightbox');
const lightboxImage = $('#lightboxImage');
const lightboxCaption = $('#lightboxCaption');
const lightboxCounter = $('#lightboxCounter');
const closeBtn = $('#lightboxClose');
const prevBtn = $('#lightboxPrev');
const nextBtn = $('#lightboxNext');
const morePhotosBtn = $('#morePhotosBtn');
let currentGalleryIndex = 0;
let lastFocusedElement = null;

function renderGallery() {
  if (!galleryGrid) return;
  galleryGrid.replaceChildren();
  galleryItems.forEach((item, index) => {
    const button = document.createElement('button');
    button.className = 'gallery-item';
    button.type = 'button';
    button.dataset.galleryIndex = String(index);
    button.setAttribute('aria-label', `Open photo ${index + 1} full screen`);
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt || `Work photo ${index + 1}`;
    img.loading = index < 3 ? 'eager' : 'lazy';
    img.decoding = 'async';
    img.width = Number(item.width) || 1509;
    img.height = Number(item.height) || 1536;
    const zoom = document.createElement('span');
    zoom.className = 'gallery-zoom';
    zoom.textContent = '⛶';
    button.append(img, zoom);
    button.addEventListener('click', () => openGallery(index));
    galleryGrid.append(button);
  });
  if (lightboxCounter) lightboxCounter.textContent = galleryItems.length ? `1 / ${galleryItems.length}` : '0 / 0';
}
function updateLightbox() {
  const item = galleryItems[currentGalleryIndex];
  if (!item || !lightboxImage) return;
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt || '';
  if (lightboxCaption) lightboxCaption.textContent = item.alt || '';
  if (lightboxCounter) lightboxCounter.textContent = `${currentGalleryIndex + 1} / ${galleryItems.length}`;
}
function openGallery(index = 0) {
  if (!lightbox || !galleryItems.length) return;
  currentGalleryIndex = (index + galleryItems.length) % galleryItems.length;
  updateLightbox();
  lastFocusedElement = document.activeElement;
  lightbox.hidden = false;
  document.body.classList.add('lightbox-open');
  closeBtn?.focus();
}
function closeGallery() {
  if (!lightbox) return;
  lightbox.hidden = true;
  document.body.classList.remove('lightbox-open');
  lightboxImage?.removeAttribute('src');
  lastFocusedElement?.focus?.();
}
function moveGallery(step) {
  if (!galleryItems.length) return;
  currentGalleryIndex = (currentGalleryIndex + step + galleryItems.length) % galleryItems.length;
  updateLightbox();
}
renderGallery();
if (morePhotosBtn && galleryItems.length <= 3) morePhotosBtn.hidden = true;
closeBtn?.addEventListener('click', closeGallery);
prevBtn?.addEventListener('click', () => moveGallery(-1));
nextBtn?.addEventListener('click', () => moveGallery(1));
lightbox?.addEventListener('click', (event) => {
  if (event.target.matches('[data-close-lightbox]')) closeGallery();
});
document.addEventListener('keydown', (event) => {
  if (!lightbox || lightbox.hidden) return;
  if (event.key === 'Escape') closeGallery();
  if (event.key === 'ArrowLeft') moveGallery(-1);
  if (event.key === 'ArrowRight') moveGallery(1);
});
let touchStartX = 0;
lightbox?.addEventListener('touchstart', (event) => {
  touchStartX = event.changedTouches[0]?.screenX || 0;
}, { passive: true });
lightbox?.addEventListener('touchend', (event) => {
  const endX = event.changedTouches[0]?.screenX || 0;
  const delta = endX - touchStartX;
  if (Math.abs(delta) > 50) moveGallery(delta > 0 ? -1 : 1);
}, { passive: true });

// More Photos simply reveals the GitHub-managed gallery; no browser uploader/storage.
morePhotosBtn?.addEventListener('click', () => {
  const expanded = morePhotosBtn.getAttribute('aria-expanded') === 'true';
  morePhotosBtn.setAttribute('aria-expanded', String(!expanded));
  morePhotosBtn.innerHTML = expanded ? 'More Photos <span>↗</span>' : 'Hide Photos <span>↑</span>';
  galleryGrid?.classList.toggle('gallery-expanded', !expanded);
  if (!expanded) {
    const firstHidden = galleryGrid?.querySelector('.gallery-item:nth-child(n+4)');
    firstHidden?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});

// -------------------------
// PWA install button
// -------------------------
const installAppBtn = $('#installAppBtn');
let deferredInstallPrompt = null;
function isStandalone() {
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
}
function hideInstallButton() {
  if (installAppBtn) installAppBtn.hidden = true;
}
if (isStandalone()) hideInstallButton();
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (!isStandalone() && installAppBtn) installAppBtn.hidden = false;
});
installAppBtn?.addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  try { await deferredInstallPrompt.userChoice; } catch (_) {}
  deferredInstallPrompt = null;
  hideInstallButton();
});
window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  hideInstallButton();
});

// Service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js', { scope: './' }).catch((error) => {
      console.warn('Service worker registration failed:', error);
    });
  });
}

window.addEventListener('beforeunload', () => uploadedObjectUrls.forEach((url) => URL.revokeObjectURL(url)));
