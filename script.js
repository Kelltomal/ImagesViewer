// State Management
let state = {
    images: [],
    currentImageIndex: 0,
    isEditing: false
};

// URL Parameters Parser
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        images: params.get('images')?.split(',') || [],
        name: params.get('name'),
        art: params.get('art')
    };
}

// Gallery Render
function renderGallery() {
    const container = document.getElementById('gallery-container');
    container.innerHTML = state.images.map((img, index) => `
        <div class="image-wrapper">
            <img src="${img}" class="gallery-img" data-index="${index}">
            <div class="image-counter">${index + 1}/${state.images.length}</div>
        </div>
    `).join('');
}

// Modal Controls
function showImage(index) {
    const modal = document.getElementById('image-modal');
    const img = document.getElementById('modal-image');
    img.src = state.images[index];
    modal.style.display = 'block';
    state.currentImageIndex = index;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const params = getUrlParams();
    state.images = params.images;
    
    // Initialize product info
    const productInfo = [params.art, params.name].filter(Boolean).join(' - ');
    document.getElementById('product-info').textContent = productInfo;

    renderGallery();
    
    // Gallery click handler
    document.querySelectorAll('.gallery-img').forEach(img => {
        img.addEventListener('click', (e) => {
            showImage(parseInt(e.target.dataset.index));
        });
    });
});

// Navigation Controls
document.querySelector('.prev').addEventListener('click', () => {
    const newIndex = state.currentImageIndex - 1;
    if(newIndex >= 0) showImage(newIndex);
});

document.querySelector('.next').addEventListener('click', () => {
    const newIndex = state.currentImageIndex + 1;
    if(newIndex < state.images.length) showImage(newIndex);
});

// Close Modal
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('image-modal').style.display = 'none';
});

window.addEventListener('click', (e) => {
    if(e.target === document.getElementById('image-modal')) {
        document.getElementById('image-modal').style.display = 'none';
    }
});

// Windows 8-style Settings Panel
document.getElementById('settings-btn').addEventListener('click', () => {
    document.getElementById('settings-panel').classList.toggle('active');
});

// Metro-style Swipe Detection
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    if (Math.abs(touchEndX - touchStartX) > 50) {
        if (touchEndX < touchStartX) showImage(state.currentImageIndex + 1);
        else showImage(state.currentImageIndex - 1);
    }
});

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowLeft') showImage(state.currentImageIndex - 1);
    if(e.key === 'ArrowRight') showImage(state.currentImageIndex + 1);
});
