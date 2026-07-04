let currentAlgo = algorithms[0];
let currentPalette = palettes[0];
let bgCanvas;
let p5Instance = null;
let currentSeed = 12345;

let favorites = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    initUI();
    initP5();

    // Load favorites from localForage (IndexedDB)
    favorites = await localforage.getItem('wllpr_favorites') || [];
});

function initUI() {
    // Populate Algorithms
    const algoGrid = document.getElementById('algorithms-grid');
    algorithms.forEach(algo => {
        const card = document.createElement('div');
        card.className = `glass p-4 rounded-xl cursor-pointer transition-all glow ${algo.id === currentAlgo.id ? 'selected-ring' : ''}`;
        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-lg">${algo.name}</h3>
                ${algo.popular ? '<span class="bg-sky-500/20 text-sky-300 text-xs px-2 py-1 rounded-full font-semibold">Popular</span>' : ''}
            </div>
            <p class="text-sm text-white/70">${algo.description}</p>
        `;
        card.onclick = () => selectAlgorithm(algo.id, card);
        algoGrid.appendChild(card);
    });

    // Populate Palettes
    const paletteGrid = document.getElementById('palettes-grid');
    palettes.forEach(palette => {
        const card = document.createElement('div');
        card.className = `glass p-3 rounded-xl cursor-pointer transition-all glow flex flex-col gap-2 ${palette.id === currentPalette.id ? 'selected-ring' : ''}`;

        const colorsHtml = palette.colors.map(c =>
            `<div class="h-8 flex-1 rounded-sm" style="background-color: ${c}"></div>`
        ).join('');

        card.innerHTML = `
            <div class="flex w-full gap-1">${colorsHtml}</div>
            <div class="text-center text-xs font-semibold text-white/80">${palette.name}</div>
        `;

        // Hover for live preview
        card.onmouseenter = () => hoverPalette(palette);
        card.onmouseleave = () => hoverPalette(currentPalette); // Revert to selected

        card.onclick = () => selectPalette(palette.id, card);
        paletteGrid.appendChild(card);
    });

    // Navigation Tabs
    document.getElementById('nav-generator').onclick = () => switchTab('generator');
    document.getElementById('nav-favorites').onclick = () => {
        switchTab('favorites');
        loadFavorites(); // Implement later in next step
    };

    // Action Buttons
    document.getElementById('btn-generate').onclick = generateWallpaper;
    document.getElementById('btn-set-wallpaper').onclick = downloadAndSetup;
    document.getElementById('btn-favorite').onclick = saveToFavorites;
}

function selectAlgorithm(id, element) {
    currentAlgo = algorithms.find(a => a.id === id);
    document.querySelectorAll('#algorithms-grid > div').forEach(el => el.classList.remove('selected-ring'));
    element.classList.add('selected-ring');
    triggerPreviewRender();
}

function selectPalette(id, element) {
    currentPalette = palettes.find(p => p.id === id);
    document.querySelectorAll('#palettes-grid > div').forEach(el => el.classList.remove('selected-ring'));
    element.classList.add('selected-ring');
    triggerPreviewRender();
}

function hoverPalette(palette) {
    if (p5Instance && bgCanvas) {
        p5Instance.clear();
        p5Instance.randomSeed(currentSeed);
        p5Instance.noiseSeed(currentSeed);
        currentAlgo.draw(p5Instance, window.innerWidth, window.innerHeight, palette.colors);
    }
}

function triggerPreviewRender() {
    if (p5Instance) {
        p5Instance.clear();
        p5Instance.randomSeed(currentSeed);
        p5Instance.noiseSeed(currentSeed);
        currentAlgo.draw(p5Instance, window.innerWidth, window.innerHeight, currentPalette.colors);
    }
}

function initP5() {
    const sketch = (p) => {
        p.setup = () => {
            bgCanvas = p.createCanvas(window.innerWidth, window.innerHeight);
            bgCanvas.parent('canvas-container');
            p.pixelDensity(1); // Keep it performant
            p.noLoop(); // Only draw when triggered
            triggerPreviewRender();
        };

        p.windowResized = () => {
            p.resizeCanvas(window.innerWidth, window.innerHeight);
            triggerPreviewRender();
        };
    };

    p5Instance = new p5(sketch);
}

function renderHighRes(algo, palette, seed, isMobile, callback) {
    const hiddenContainer = document.getElementById('high-res-container');
    hiddenContainer.innerHTML = '';

    // Determine resolution
    let w, h, resStr;
    if (isMobile) {
        w = 1242; h = 2688; resStr = "mobile";
    } else {
        w = 3840; h = 2160; resStr = "4K"; // Defaulting to 4k to prevent crashing
    }

    const hrSketch = (p) => {
        p.setup = () => {
            let hrCanvas = p.createCanvas(w, h);
            hrCanvas.parent('high-res-container');
            p.pixelDensity(1);
            p.noLoop();

            p.randomSeed(seed);
            p.noiseSeed(seed);

            algo.draw(p, w, h, palette.colors);

            // Convert to blob and download
            hrCanvas.elt.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const filename = `WLLPR_${algo.id}_${palette.id}_${resStr}.png`;

                callback(url, filename);

                // Cleanup
                setTimeout(() => {
                    URL.revokeObjectURL(url);
                    p.remove(); // Fix leak
                    hiddenContainer.innerHTML = '';
                }, 60000); // 60s for mobile share
            }, 'image/png');
        };
    };

    new p5(hrSketch);
}

function switchTab(tab) {
    const genView = document.getElementById('view-generator');
    const favView = document.getElementById('view-favorites');
    const btnGen = document.getElementById('nav-generator');
    const btnFav = document.getElementById('nav-favorites');

    if (tab === 'generator') {
        genView.classList.remove('hidden');
        favView.classList.add('hidden');
        btnGen.className = "px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer text-sm font-semibold text-white";
        btnFav.className = "px-4 py-2 rounded-lg bg-transparent hover:bg-white/10 transition cursor-pointer text-sm font-semibold text-white/70";
    } else {
        genView.classList.add('hidden');
        favView.classList.remove('hidden');
        btnGen.className = "px-4 py-2 rounded-lg bg-transparent hover:bg-white/10 transition cursor-pointer text-sm font-semibold text-white/70";
        btnFav.className = "px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer text-sm font-semibold text-white";
    }
}

// Generates a random seed and updates preview
function generateWallpaper() {
    currentSeed = Math.floor(Math.random() * 1000000);
    triggerPreviewRender();
}

function detectOS() {
    const userAgent = window.navigator.userAgent;
    if (/android/i.test(userAgent)) return 'android';
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) return 'ios';
    return 'desktop';
}

// Generates the final image, triggers download, and shows modal
function downloadAndSetup() {
    const btn = document.getElementById('btn-set-wallpaper');
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Generating...';
    btn.disabled = true;

    const os = detectOS();
    const isMobile = os === 'android' || os === 'ios';

    renderHighRes(currentAlgo, currentPalette, currentSeed, isMobile, (url, filename) => {
        // Trigger Download
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Native Share (if available on mobile)
        if (navigator.share && isMobile) {
            document.getElementById('btn-share').classList.remove('hidden');
            document.getElementById('btn-share').onclick = async () => {
                try {
                    const response = await fetch(url);
                    const blob = await response.blob();
                    const file = new File([blob], filename, { type: 'image/png' });
                    await navigator.share({
                        title: 'My WLLPR',
                        files: [file]
                    });
                } catch (err) {
                    console.log('Share failed:', err);
                }
            };
        }

        // Show Modal
        const modal = document.getElementById('setup-modal');
        const instructions = document.getElementById('setup-instructions');

        if (os === 'ios') {
            instructions.innerHTML = "Image downloaded! Open <b>Photos</b> app &rarr; Tap the image &rarr; Tap Share icon &rarr; <b>'Use as Wallpaper'</b>.";
        } else if (os === 'android') {
            instructions.innerHTML = "Image downloaded! Open <b>Gallery/Photos</b> app &rarr; Tap the image &rarr; Tap Menu (⋮) &rarr; <b>'Set as Wallpaper'</b>.";
        } else {
            instructions.innerHTML = "Image downloaded! Locate the file, <b>Right-click</b> &rarr; <b>'Set as desktop background'</b>.";
        }

        modal.classList.add('active');
        document.getElementById('close-modal').onclick = () => modal.classList.remove('active');
        document.getElementById('btn-modal-close').onclick = () => modal.classList.remove('active');

        // Reset Button
        btn.innerHTML = originalText;
        btn.disabled = false;
    });
}

async function saveToFavorites() {
    if (!p5Instance || !bgCanvas) return;

    // Convert current canvas to data URL (low res for thumbnail)
    const thumbnail = bgCanvas.elt.toDataURL('image/jpeg', 0.7);

    const favItem = {
        id: Date.now().toString(),
        algoId: currentAlgo.id,
        paletteId: currentPalette.id,
        seed: currentSeed,
        thumbnail: thumbnail,
        date: new Date().toISOString()
    };

    favorites.unshift(favItem);
    if (favorites.length > 20) favorites.pop(); // Keep max 20

    await localforage.setItem('wllpr_favorites', favorites);

    // Show visual feedback
    const btn = document.getElementById('btn-favorite');
    const originalText = btn.innerHTML;
    btn.innerHTML = '✅ Saved';
    setTimeout(() => { btn.innerHTML = originalText; }, 2000);
}

function loadFavorites() {
    const grid = document.getElementById('favorites-grid');
    const msg = document.getElementById('no-favorites-msg');

    if (favorites.length === 0) {
        grid.innerHTML = '';
        grid.appendChild(msg);
        msg.style.display = 'block';
        return;
    }

    msg.style.display = 'none';
    grid.innerHTML = '';

    favorites.forEach(fav => {
        const algo = algorithms.find(a => a.id === fav.algoId);
        const palette = palettes.find(p => p.id === fav.paletteId);

        const card = document.createElement('div');
        card.className = 'glass rounded-xl overflow-hidden shadow-lg';
        card.innerHTML = `
            <img src="${fav.thumbnail}" alt="${algo.name}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h4 class="font-bold text-lg text-sky-300">${algo.name}</h4>
                <p class="text-sm text-white/70 mb-4">${palette.name}</p>
                <div class="flex justify-between">
                    <button class="px-4 py-2 bg-sky-500/20 text-sky-400 rounded-lg text-sm hover:bg-sky-500/30 transition" onclick="loadFavoriteAndDownload('${fav.id}')">Download</button>
                    <button class="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition" onclick="removeFavorite('${fav.id}')">Remove</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

window.loadFavoriteAndDownload = (id) => {
    const fav = favorites.find(f => f.id === id);
    if (!fav) return;

    const algo = algorithms.find(a => a.id === fav.algoId);
    const palette = palettes.find(p => p.id === fav.paletteId);
    const seed = fav.seed;

    const os = detectOS();
    const isMobile = os === 'android' || os === 'ios';

    renderHighRes(algo, palette, seed, isMobile, (url, filename) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}

window.removeFavorite = async (id) => {
    favorites = favorites.filter(f => f.id !== id);
    await localforage.setItem('wllpr_favorites', favorites);
    loadFavorites();
}
