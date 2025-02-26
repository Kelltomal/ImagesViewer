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
    modalContent: document.getElementById('modal-content'),
    settingsPanel: document.getElementById('settings-panel'),
    settingsBtn: document.getElementById('settings-btn'),
    shareBtn: document.getElementById('share-btn')
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
    if (state.art === "" && state.name === "") {
        dom.productInfo.style.display = 'none';
    } else {
        dom.productInfo.style.display = 'block';
        dom.productInfo.textContent = [state.art, state.name]
            .filter(Boolean)
            .join(' - ');
    }
}

// Добавим проверку URL изображений
function validateImageUrl(url) {
    try {
        new URL(url); // Проверяем валидность URL
        return true;
    } catch {
        return false;
    }
}

// Обновленная функция рендеринга галереи
function renderGallery() {
    dom.galleryContainer.innerHTML = state.images
        .map((url, index) => {
            if (!validateImageUrl(url)) {
                console.warn('Пропущен некорректный URL:', url);
                return '';
            }
            return `
                <div class="tile" data-index="${index}">
                    <img src="${url}" 
                         class="gallery-img" 
                         loading="lazy"
                         alt="Изображение ${index + 1}"
                         onerror="handleImageError(this)">
                    <div class="image-counter">${index + 1}/${state.images.length}</div>
                </div>
            `;
        })
        .join('');

    addGalleryEventListeners();
}

// Добавим отдельную функцию для обработчиков событий
function addGalleryEventListeners() {
    document.querySelectorAll('.tile').forEach((tile, index) => {
        tile.addEventListener('click', () => {
            if (!state.images[index]) {
                console.error('Изображение не найдено по индексу:', index);
                return;
            }
            openModal(index);
        });
    });
}

function handleImageError(img) {
    img.src = 'https://via.placeholder.com/300x200?text=Ошибка+загрузки';
    img.alt = 'Изображение не загружено';
    img.style.cursor = 'not-allowed';
    img.parentElement.classList.add('error-tile');
}

function renderSettingsPanel() {
    dom.imageUrls.value = state.images.join('\n');
}

// Modal Control
function openModal(index) {
    // Проверка валидности индекса
    if (index < 0 || index >= state.images.length || !state.images[index]) {
        console.error('Некорректный индекс изображения:', index);
        showToast('Ошибка открытия изображения');
        return;
    }
    
    // Проверка URL изображения
    const imageUrl = state.images[index];
    if (!validateImageUrl(imageUrl)) {
        console.error('Некорректный URL изображения:', imageUrl);
        showToast('Некорректная ссылка на изображение');
        return;
    }

    state.currentIndex = index;
    dom.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    updateModal();
}

function closeModal() {
    dom.modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function updateModal() {
    const currentImage = state.images[state.currentIndex];
    dom.modalImage.classList.remove('zoomed');
    
    if (!currentImage) {
        console.error('Текущее изображение не найдено');
        dom.modal.style.display = 'none';
        return;
    }

    // Добавляем обработчик ошибок загрузки
    dom.modalImage.onerror = () => {
        dom.modalImage.src = 'https://via.placeholder.com/800x600?text=Ошибка+загрузки';
        dom.modalImage.alt = 'Изображение не найдено';
    };

    dom.modalImage.src = currentImage;
    dom.modalImage.alt = `Изображение ${state.currentIndex + 1}`;
    dom.modalCounter.textContent = `${state.currentIndex + 1}/${state.images.length}`;
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
    // Галерея
    if (dom.galleryContainer) {
        dom.galleryContainer.addEventListener('click', e => {
            const tile = e.target.closest('.tile');
            if (tile) openModal(parseInt(tile.dataset.index));
        });
    }

        // Двойной клик для зума
    dom.modalImage.addEventListener('dblclick', function() {
        this.classList.toggle('zoomed');
    });

    // Модальное окно
    if (dom.modal) {
        dom.modal.addEventListener('click', e => {
            if (e.target === dom.modal) {
                dom.modalImage.classList.remove('zoomed');
                closeModal();
            }
        });
    }
    
    document.addEventListener('keydown', e => {
        if (dom.modal.style.display === 'flex') {
            if (e.key === 'ArrowLeft') navigate(-1);
            if (e.key === 'ArrowRight') navigate(1);
            if (e.key === 'Escape') closeModal();
        }
    });

        // Ресайз окна
    window.addEventListener('resize', function() {
        dom.modalImage.classList.remove('zoomed');
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

    // Панель настроек
    if (dom.settingsBtn) {
        dom.settingsBtn.addEventListener('click', () => {
            dom.settingsPanel?.classList.toggle('active');
        });
    }
    // Кнопка поделиться
    if (dom.shareBtn) {
        dom.shareBtn.addEventListener('click', copyUrl);
    }
}

function navigate(direction) {
    const newIndex = state.currentIndex + direction;
    dom.modalImage.classList.remove('zoomed');
    // Проверка границ
    if (newIndex < 0 || newIndex >= state.images.length) return;
    
    state.currentIndex = newIndex;
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

// Инициализация с проверкой
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('gallery-container')) {
        console.error('Основной контейнер галереи не найден!');
        return;
    }
    init();
});
