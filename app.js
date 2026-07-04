// State
let state = {
    algorithm: ALGORITHMS[0].id,
    palette: PALETTES[0].id,
    effect: 'none',
    mode: 'dark',
    favorites: [],
    searchQuery: ''
};

// P5 Instances
let desktopP5, mobileP5;
const RESOLUTIONS = {
    desktop: { w: 3840, h: 2160 },
    mobile: { w: 1242, h: 2688 }
};

// UI Elements
const desktopPreview = document.getElementById('desktop-preview');
const mobilePreview = document.getElementById('mobile-preview');
const algorithmsGrid = document.getElementById('algorithms-grid');
const selectedPatternName = document.getElementById('selected-pattern-name');
const palettesGrid = document.getElementById('palettes-grid');
const selectedPaletteName = document.getElementById('selected-palette-name');
const effectsGrid = document.getElementById('effects-grid');
const selectedEffectName = document.getElementById('selected-effect-name');
const btnGenerate = document.getElementById('btn-generate');
const btnDownloadDesktop = document.getElementById('btn-download-desktop');
const btnDownloadMobile = document.getElementById('btn-download-mobile');
const btnSetWallpaper = document.getElementById('btn-set-wallpaper');
const btnShare = document.getElementById('btn-share');
const modal = document.getElementById('os-guide-modal');
const modalText = document.getElementById('os-guide-text');
const btnCloseModal = document.getElementById('btn-close-modal');
const modalBackdrop = document.getElementById('modal-backdrop');
const searchInput = document.getElementById('pattern-search');

// Favorites
const btnFavorite = document.getElementById('btn-favorite');
const favoritesModal = document.getElementById('favorites-modal');
const btnCloseFavorites = document.getElementById('btn-close-favorites');
const favoritesGrid = document.getElementById('favorites-grid');
const btnViewFavorites = document.getElementById('btn-view-favorites');

// Initialize
async function init() {
    await loadFavorites();
    renderAlgorithmsGrid();
    renderPalettes();
    renderEffects();
    setupTheme();
    setupP5();
    setupEvents();
    updateClock();
    setInterval(updateClock, 60000);
}

// IndexedDB Favorites
async function loadFavorites() {
    try {
        const saved = localStorage.getItem('wllpr_favorites');
        if (saved) {
            state.favorites = JSON.parse(saved);
        }
    } catch (e) {
        console.error("Could not load favorites");
    }
    updateFavoriteButton();
}

function saveFavorites() {
    try {
        localStorage.setItem('wllpr_favorites', JSON.stringify(state.favorites));
    } catch (e) {
        console.error("Could not save favorites");
    }
    updateFavoriteButton();
    renderFavorites();
}

function toggleFavorite() {
    const current = { algo: state.algorithm, pal: state.palette, eff: state.effect };
    const index = state.favorites.findIndex(f => f.algo === current.algo && f.pal === current.pal && f.eff === current.eff);

    if (index > -1) {
        state.favorites.splice(index, 1);
    } else {
        if(state.favorites.length >= 10) {
            alert("Maximum 10 favorites allowed. Please remove some first.");
            return;
        }
        state.favorites.push(current);
    }
    saveFavorites();
}

function updateFavoriteButton() {
    if(!btnFavorite) return;
    const isFav = state.favorites.some(f => f.algo === state.algorithm && f.pal === state.palette && f.eff === state.effect);
    if(isFav) {
        btnFavorite.classList.add('text-red-500');
        btnFavorite.classList.remove('text-gray-500', 'dark:text-gray-400');
        btnFavorite.innerHTML = `<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg> Saved`;
    } else {
        btnFavorite.classList.remove('text-red-500');
        btnFavorite.classList.add('text-gray-500', 'dark:text-gray-400');
        btnFavorite.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg> Favorite`;
    }
}

function renderFavorites() {
    if(!favoritesGrid) return;
    favoritesGrid.innerHTML = '';

    if(state.favorites.length === 0) {
        favoritesGrid.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">No favorites yet.</div>';
        return;
    }

    state.favorites.forEach((fav, idx) => {
        const algo = ALGORITHMS.find(a => a.id === fav.algo);
        const pal = PALETTES.find(p => p.id === fav.pal);
        const eff = EFFECTS.find(e => e.id === fav.eff) || EFFECTS[0];

        if(!algo || !pal) return;

        const div = document.createElement('div');
        div.className = 'relative rounded-xl overflow-hidden cursor-pointer shadow border border-gray-200 dark:border-gray-800 hover:scale-105 transition aspect-video bg-black';

        const canvasContainerId = `fav-canvas-${idx}`;
        div.innerHTML = `
            <div id="${canvasContainerId}" class="w-full h-full absolute inset-0"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-2 pointer-events-none">
                <span class="text-white text-xs font-bold truncate">${algo.name}</span>
                <span class="text-white/80 text-[10px] truncate">${pal.name} ${eff.id !== 'none' ? '+ ' + eff.name : ''}</span>
            </div>
            <button class="absolute top-2 right-2 text-white/50 hover:text-white bg-black/50 rounded-full p-1 z-10 delete-fav" data-idx="${idx}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        `;

        div.addEventListener('click', (e) => {
            if(e.target.closest('.delete-fav')) return;
            state.algorithm = fav.algo;
            state.palette = fav.pal;
            state.effect = fav.eff || 'none';

            selectedPatternName.textContent = algo.name;
            selectedPaletteName.textContent = pal.name;
            selectedEffectName.textContent = eff.name;

            renderAlgorithmsGrid();
            renderPalettes();
            renderEffects();
            regeneratePreviews();
            favoritesModal.classList.add('hidden');
        });

        favoritesGrid.appendChild(div);

        // Render thumbnail canvas
        setTimeout(() => {
            new p5(p => {
                p.setup = () => {
                    const c = document.getElementById(canvasContainerId);
                    if(!c) return;
                    const canvas = p.createCanvas(c.clientWidth, c.clientHeight);
                    canvas.parent(canvasContainerId);
                    p.noLoop();
                    algo.draw(p, pal.colors, p.width, p.height);
                    eff.apply(p, p.width, p.height);
                };
            });
        }, 100);
    });

    document.querySelectorAll('.delete-fav').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
            state.favorites.splice(idx, 1);
            saveFavorites();
        });
    });
}

// P5 Setup
function setupP5() {
    const sketch = (p, containerId) => {
        p.setup = () => {
            const container = document.getElementById(containerId);
            const w = container.clientWidth;
            const h = container.clientHeight;
            const canvas = p.createCanvas(w, h);
            canvas.parent(containerId);
            p.noLoop();
            generateArt(p);
        };

        p.windowResized = () => {
            const container = document.getElementById(containerId);
            p.resizeCanvas(container.clientWidth, container.clientHeight);
            generateArt(p);
        };
    };

    desktopP5 = new p5(p => sketch(p, 'desktop-preview'));
    mobileP5 = new p5(p => sketch(p, 'mobile-preview'));
}

// Generate Art Logic
function generateArt(p) {
    const algo = ALGORITHMS.find(a => a.id === state.algorithm);
    const palette = PALETTES.find(pal => pal.id === state.palette);
    const eff = EFFECTS.find(e => e.id === state.effect) || EFFECTS[0];

    if(algo && palette) {
        algo.draw(p, palette.colors, p.width, p.height);
        eff.apply(p, p.width, p.height);
    }
}

function regeneratePreviews() {
    if(desktopP5) { desktopP5.clear(); generateArt(desktopP5); }
    if(mobileP5) { mobileP5.clear(); generateArt(mobileP5); }
    updateFavoriteButton();
}

// UI Rendering
function renderAlgorithmsGrid() {
    if(!algorithmsGrid) return;
    algorithmsGrid.innerHTML = '';

    const filtered = ALGORITHMS.filter(a =>
        a.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        (a.category && a.category.toLowerCase().includes(state.searchQuery.toLowerCase()))
    );

    if(filtered.length === 0) {
        algorithmsGrid.innerHTML = '<div class="col-span-full text-center text-xs text-gray-500">No patterns found.</div>';
        return;
    }

    filtered.forEach(algo => {
        const div = document.createElement('div');
        const isSelected = algo.id === state.algorithm;

        div.className = `p-3 rounded-xl cursor-pointer border-2 transition-all flex flex-col gap-1
            ${isSelected
                ? 'border-black dark:border-white bg-gray-50 dark:bg-zinc-900 shadow-md'
                : 'border-transparent bg-gray-100 dark:bg-zinc-800/50 hover:bg-gray-200 dark:hover:bg-zinc-800'}`;

        const catBadge = algo.category ? `<span class="bg-gray-200 dark:bg-gray-700 text-[9px] px-1.5 py-0.5 rounded mr-1">${algo.category}</span>` : '';
        const popBadge = algo.popular ? `<span class="bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">Hot</span>` : '';

        div.innerHTML = `
            <div class="font-bold text-sm flex justify-between items-center flex-wrap gap-1">
                <span class="truncate">${algo.name}</span>
                <div class="flex">${catBadge}${popBadge}</div>
            </div>
            <div class="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">${algo.description}</div>
        `;

        div.addEventListener('click', () => {
            state.algorithm = algo.id;
            selectedPatternName.textContent = algo.name;
            renderAlgorithmsGrid();
            regeneratePreviews();
        });

        algorithmsGrid.appendChild(div);
    });
}

function renderEffects() {
    if(!effectsGrid) return;
    effectsGrid.innerHTML = '';

    EFFECTS.forEach(eff => {
        const btn = document.createElement('button');
        const isSelected = eff.id === state.effect;

        btn.className = `px-3 py-1.5 rounded-lg text-xs font-medium transition-all
            ${isSelected
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'}`;

        btn.textContent = eff.name;

        btn.addEventListener('click', () => {
            state.effect = eff.id;
            selectedEffectName.textContent = eff.name;
            renderEffects();
            regeneratePreviews();
        });

        effectsGrid.appendChild(btn);
    });
}

function renderPalettes() {
    if(!palettesGrid) return;
    palettesGrid.innerHTML = '';
    PALETTES.forEach(pal => {
        const div = document.createElement('div');
        div.className = `w-full aspect-square rounded-full cursor-pointer overflow-hidden flex transition-transform
            ${pal.id === state.palette ? 'selected-ring scale-110 z-10' : 'hover:scale-110 shadow-sm'}`;
        div.title = pal.name;

        pal.colors.forEach(color => {
            const stripe = document.createElement('div');
            stripe.className = 'h-full flex-1';
            stripe.style.backgroundColor = color;
            div.appendChild(stripe);
        });

        div.addEventListener('mouseenter', () => {
            if(pal.id !== state.palette) {
                const tempAlgo = ALGORITHMS.find(a => a.id === state.algorithm);
                const tempEff = EFFECTS.find(e => e.id === state.effect) || EFFECTS[0];
                if(desktopP5) {
                    tempAlgo.draw(desktopP5, pal.colors, desktopP5.width, desktopP5.height);
                    tempEff.apply(desktopP5, desktopP5.width, desktopP5.height);
                }
                if(mobileP5) {
                    tempAlgo.draw(mobileP5, pal.colors, mobileP5.width, mobileP5.height);
                    tempEff.apply(mobileP5, mobileP5.width, mobileP5.height);
                }
                selectedPaletteName.textContent = pal.name;
            }
        });

        div.addEventListener('mouseleave', () => {
            if(pal.id !== state.palette) {
                regeneratePreviews();
                selectedPaletteName.textContent = PALETTES.find(p => p.id === state.palette).name;
            }
        });

        div.addEventListener('click', () => {
            state.palette = pal.id;
            selectedPaletteName.textContent = pal.name;
            renderPalettes();
            regeneratePreviews();
        });

        palettesGrid.appendChild(div);
    });
}

// Events
function setupEvents() {
    if(btnGenerate) btnGenerate.addEventListener('click', () => {
        state.algorithm = ALGORITHMS[Math.floor(Math.random() * ALGORITHMS.length)].id;
        state.palette = PALETTES[Math.floor(Math.random() * PALETTES.length)].id;
        state.effect = EFFECTS[Math.floor(Math.random() * EFFECTS.length)].id;

        selectedPatternName.textContent = ALGORITHMS.find(a => a.id === state.algorithm).name;
        selectedPaletteName.textContent = PALETTES.find(p => p.id === state.palette).name;
        selectedEffectName.textContent = EFFECTS.find(e => e.id === state.effect).name;

        renderAlgorithmsGrid();
        renderPalettes();
        renderEffects();
        regeneratePreviews();
    });

    if(btnDownloadDesktop) btnDownloadDesktop.addEventListener('click', () => generateHighResAndDownload('desktop'));
    if(btnDownloadMobile) btnDownloadMobile.addEventListener('click', () => generateHighResAndDownload('mobile'));

    if(btnSetWallpaper) btnSetWallpaper.addEventListener('click', () => {
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        generateHighResAndDownload(isMobileDevice ? 'mobile' : 'desktop');
    });

    if(btnShare) btnShare.addEventListener('click', async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'WLLPR Generator',
                    text: 'Check out this minimalist wallpaper generator!',
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            alert('Sharing is not supported on this browser.');
        }
    });

    if(btnFavorite) btnFavorite.addEventListener('click', toggleFavorite);

    if(btnViewFavorites) btnViewFavorites.addEventListener('click', () => {
        renderFavorites();
        favoritesModal.classList.remove('hidden');
    });

    if(btnCloseFavorites) btnCloseFavorites.addEventListener('click', () => {
        favoritesModal.classList.add('hidden');
    });

    if(searchInput) searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderAlgorithmsGrid();
    });

    const closeModal = () => modal.classList.add('hidden');
    if(btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if(modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

    const themeToggle = document.getElementById('theme-toggle');
    if(themeToggle) themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.contains('dark');
        setTheme(isDark ? 'light' : 'dark');
    });
}

// High-Res Generation
function generateHighResAndDownload(type) {
    const res = RESOLUTIONS[type];
    const container = document.getElementById('high-res-container');
    container.innerHTML = '';

    new p5((p) => {
        p.setup = () => {
            const canvas = p.createCanvas(res.w, res.h);
            canvas.parent('high-res-container');
            p.noLoop();

            const algo = ALGORITHMS.find(a => a.id === state.algorithm);
            const palette = PALETTES.find(pal => pal.id === state.palette);
            const eff = EFFECTS.find(e => e.id === state.effect) || EFFECTS[0];

            algo.draw(p, palette.colors, p.width, p.height);
            eff.apply(p, p.width, p.height);

            const filename = `WLLPR_${algo.id}_${palette.id}_${eff.id}_${type}.png`;
            p.saveCanvas(canvas, filename, 'png');

            setTimeout(() => {
                p.remove();
                container.innerHTML = '';
            }, 1000);

            showOSGuide(type);
        };
    });
}

function showOSGuide(type) {
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobileDevice || type === 'mobile') {
        modalText.innerHTML = "Image downloaded!<br><br><b>iOS/Android:</b> Tap the image in your gallery and select 'Set as Wallpaper'.";
    } else {
        modalText.innerHTML = "Image downloaded!<br><br><b>Windows:</b> Right-click the file → 'Set as desktop background'<br><b>Mac:</b> Right-click → 'Set Desktop Picture'";
    }
    modal.classList.remove('hidden');
}

// Theme Handling
function setupTheme() {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setTheme('dark');
    } else {
        setTheme('light');
    }
}

function setTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
    }
}

// Clock Overlay
function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });

    const dTime = document.getElementById('desktop-time');
    const dDate = document.getElementById('desktop-date');
    const mTime = document.getElementById('mobile-time');
    const mDate = document.getElementById('mobile-date');

    if(dTime) dTime.textContent = timeStr;
    if(dDate) dDate.textContent = dateStr;
    if(mTime) mTime.textContent = timeStr;
    if(mDate) mDate.textContent = dateStr;
}

window.addEventListener('DOMContentLoaded', init);
