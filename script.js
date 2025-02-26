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
    dom.productInfo.textContent = [state.art, state.name]
        .filter(Boolean).join(' - ');
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
    const container = dom.galleryContainer;
    
    // Очищаем контейнер
    container.innerHTML = '';
    
    // Добавляем проверку на пустой список
    if (!state.images || state.images.length === 0) {
        container.innerHTML = `<div class="empty-state">Нет изображений для отображения</div>`;
        return;
    }

    // Создаем элементы галереи
    state.images.forEach((url, index) => {
        if (!validateImageUrl(url)) {
            console.error(`Некорректный URL изображения: ${url}`);
            return;
        }

        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.innerHTML = `
            <img src="${url}" 
                 class="gallery-img" 
                 loading="lazy" 
                 alt="Изображение ${index + 1}"
                 onerror="this.onerror=null;this.src='https://via.placeholder.com/300x200?text=Ошибка+загрузки';">
            <div class="image-counter">${index + 1}/${state.images.length}</div>
        `;

        container.appendChild(tile);
    });

    // Добавляем обработчики после рендеринга
    addGalleryEventListeners();
}

// Добавим отдельную функцию для обработчиков событий
function addGalleryEventListeners() {
    document.querySelectorAll('.gallery-img').forEach(img => {
        img.addEventListener('click', function() {
            const index = Array.from(this.parentNode.parentNode.children)
                .indexOf(this.parentNode);
            openModal(index);
        });
    });
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
    // Галерея
    if (dom.galleryContainer) {
        dom.galleryContainer.addEventListener('click', e => {
            const tile = e.target.closest('.tile');
            if (tile) openModal(parseInt(tile.dataset.index));
        });
    }

    // Модальное окно
    if (dom.modal) {
        dom.modal.addEventListener('click', e => {
            if (e.target === dom.modal) closeModal();
        });
    }
    
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

// Инициализация с проверкой
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('gallery-container')) {
        console.error('Основной контейнер галереи не найден!');
        return;
    }
    init();
});
