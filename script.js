// State Management
const state = {
    images: [],
    currentIndex: 0,
    name: '',
    art: '',
    isEditing: false
};

// DOM Elements
const dom = {
    galleryContainer: document.getElementById('gallery-container'),
    productInfo: document.getElementById('product-info'),
    imageUrls: document.getElementById('imageUrls'),
    modal: document.getElementById('image-modal'),
    modalImage: document.getElementById('modal-image'),
    modalCounter: document.getElementById('modal-counter'),
    settingsPanel: document.getElementById('settings-panel')
};

// Initialization
function init() {
    parseUrlParams();
    setupEventListeners();
    renderAll();
}

function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    state.images = params.get('images')?.split(',')
        .map(url => url.trim())
        .filter(url => url) || [];
    state.name = params.get('name') || '';
    state.art = params.get('art') || '';
}

// Rendering
function renderAll() {
    renderHeader();
    renderGallery();
    renderSettingsPanel();
}

function renderHeader() {
    dom.productInfo.textContent = [state.art, state.name]
        .filter(Boolean).join(' - ');
}

function renderGallery() {
    dom.galleryContainer.innerHTML = state.images
        .map((url, index) => `
            <div class="tile" data-index="${index}">
                <img src="${url}" 
                     class="gallery-img" 
                     loading="lazy"
                     alt="Изображение ${index + 1}">
                <div class="image-counter">
                    ${index + 1}/${state.images.length}
                </div>
            </div>
        `).join('');
}

function renderSettingsPanel() {
    dom.imageUrls.value = state.images.join('\n');
}

// Modal Control
function openModal(index) {
    state.currentIndex = index;
    dom.modal.style.display = 'flex';
    updateModal();
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    dom.modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function updateModal() {
    dom.modalImage.src = state.images[state.currentIndex];
    dom.modalCounter.textContent = 
        `${state.currentIndex + 1}/${state.images.length}`;
}

// Gallery Actions
function updateGallery() {
    state.images = dom.imageUrls.value
        .split(/[,\n]/)
        .map(url => url.trim())
        .filter(url => url);
    updateUrl();
    renderAll();
}

function updateUrl() {
    const params = new URLSearchParams();
    if (state.images.length) params.set('images', state.images.join(','));
    if (state.name) params.set('name', state.name);
    if (state.art) params.set('art', state.art);
    
    window.history.replaceState(null, '', `?${params.toString()}`);
}

// Event Handlers
function setupEventListeners() {
    // Gallery clicks
    dom.galleryContainer.addEventListener('click', e => {
        const tile = e.target.closest('.tile');
        if (tile) openModal(parseInt(tile.dataset.index));
    });

    // Modal navigation
    dom.modal.addEventListener('click', e => {
        if (e.target === dom.modal) closeModal();
    });
    
    document.addEventListener('keydown', e => {
        if (dom.modal.style.display === 'flex') {
            if (e.key === 'ArrowLeft') navigate(-1);
            if (e.key === 'ArrowRight') navigate(1);
            if (e.key === 'Escape') closeModal();
        }
    });

    // Swipe detection
    let touchStartX = 0;
    document.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
    });
    
    document.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) navigate(diff > 0 ? 1 : -1);
    });

    // Settings panel
    document.getElementById('settings-btn').addEventListener('click', () => {
        dom.settingsPanel.classList.toggle('active');
    });

    // Share button
    document.getElementById('share-btn').addEventListener('click', copyUrl);
}

function navigate(direction) {
    state.currentIndex = (state.currentIndex + direction + state.images.length) % state.images.length;
    updateModal();
}

// Share Functionality
function copyUrl() {
    navigator.clipboard.writeText(window.location.href)
        .then(() => showToast('Ссылка скопирована!'))
        .catch(() => showToast('Ошибка копирования'));
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 2000);
}

// Start Application
document.addEventListener('DOMContentLoaded', init);
