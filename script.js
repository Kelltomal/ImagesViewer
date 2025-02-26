// Initialization
let images = [];
let currentImageIndex = 0;
let isSettingsOpen = false;

// DOM Elements
const gallery = document.getElementById('gallery');
const productInfo = document.getElementById('product-info');
const settingsPanel = document.getElementById('settings-panel');
const imageOrder = document.getElementById('image-order');

// URL Parameters Handling
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        images: params.get('images')?.split(',') || [],
        name: params.get('name'),
        art: params.get('art')
    };
}

// Gallery Rendering
function renderGallery() {
    gallery.innerHTML = '';
    images.forEach((img, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
            <img src="${img}" alt="Image ${index + 1}">
            <div class="image-counter">${index + 1}/${images.length}</div>
        `;
        item.addEventListener('click', () => openModal(index));
        gallery.appendChild(item);
    });
}

// Modal Controls
function openModal(index) {
    currentImageIndex = index;
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    modal.style.display = 'block';
    modalImg.src = images[index];
}

// Event Listeners
window.addEventListener('DOMContentLoaded', () => {
    const { images: urlImages, name, art } = getUrlParams();
    images = urlImages;
    
    // Render product info
    let infoHTML = '';
    if (art) infoHTML += `<h2>Артикул: ${art}</h2>`;
    if (name) infoHTML += `<h3>Название: ${name}</h3>`;
    productInfo.innerHTML = infoHTML;

    renderGallery();
});

// Close modal when clicking outside
document.querySelector('.modal').addEventListener('click', (e) => {
    if (e.target === document.querySelector('.modal')) {
        document.querySelector('.modal').style.display = 'none';
    }
});

// Navigation Controls
document.getElementById('prev').addEventListener('click', () => navigate(-1));
document.getElementById('next').addEventListener('click', () => navigate(1));

function navigate(direction) {
    currentImageIndex = (currentImageIndex + direction + images.length) % images.length;
    document.getElementById('modal-image').src = images[currentImageIndex];
}

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    if (document.querySelector('.modal').style.display === 'block') {
        if (e.key === 'ArrowLeft') navigate(-1);
        if (e.key === 'ArrowRight') navigate(1);
        if (e.key === 'Escape') document.querySelector('.modal').style.display = 'none';
    }
});
