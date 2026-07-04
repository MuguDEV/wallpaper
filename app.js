let currentAlgo = algorithms[0];
let currentPalette = palettes[0];
let currentSeed = 12345;
let isDarkTheme = false;

let desktopP5 = null;
let mobileP5 = null;

document.addEventListener('DOMContentLoaded', () => {
    initUI();
    initP5();
});

function initUI() {
    // Theme Toggle
    const htmlClass = document.documentElement.classList;
    const themeBtn = document.getElementById('theme-toggle');
    const modeDarkBtn = document.getElementById('mode-dark');
    const modeLightBtn = document.getElementById('mode-light');

    function setTheme(dark) {
        isDarkTheme = dark;
        if (dark) {
            htmlClass.add('dark');
            htmlClass.remove('light');
            modeDarkBtn.className = 'flex-1 py-1.5 text-xs font-medium rounded bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center gap-2 transition';
            modeLightBtn.className = 'flex-1 py-1.5 text-xs font-medium rounded text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-2 transition';
        } else {
            htmlClass.remove('dark');
            htmlClass.add('light');
            modeLightBtn.className = 'flex-1 py-1.5 text-xs font-medium rounded bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center gap-2 transition';
            modeDarkBtn.className = 'flex-1 py-1.5 text-xs font-medium rounded text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-2 transition';
        }
        triggerPreviewRender();
    }

    themeBtn.onclick = () => setTheme(!isDarkTheme);
    modeDarkBtn.onclick = () => setTheme(true);
    modeLightBtn.onclick = () => setTheme(false);

    // Initial check (system preference)
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme(true);
    }

    // Pattern Selector Logic
    const patternSelector = document.getElementById('pattern-selector');
    const patternDropdown = document.getElementById('pattern-dropdown');
    const patternList = document.getElementById('pattern-list');
    const patternSearch = document.getElementById('pattern-search');
    const selectedPatternName = document.getElementById('selected-pattern-name');

    patternSelector.onclick = () => patternDropdown.classList.toggle('active');

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!patternSelector.contains(e.target) && !patternDropdown.contains(e.target)) {
            patternDropdown.classList.remove('active');
        }
    });

    function renderPatternList(filter = '') {
        patternList.innerHTML = '';

        // Group by category
        const categories = [...new Set(algorithms.map(a => a.category))];

        categories.forEach(cat => {
            const catAlgos = algorithms.filter(a => a.category === cat && a.name.toLowerCase().includes(filter.toLowerCase()));
            if (catAlgos.length === 0) return;

            const catHeader = document.createElement('div');
            catHeader.className = 'px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2 first:mt-0';
            catHeader.innerText = cat;
            patternList.appendChild(catHeader);

            catAlgos.forEach(algo => {
                const item = document.createElement('div');
                item.className = 'px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition';
                if (algo.id === currentAlgo.id) item.classList.add('bg-gray-50', 'dark:bg-gray-700');
                item.innerText = algo.name;
                item.onclick = () => {
                    currentAlgo = algo;
                    selectedPatternName.innerText = algo.name;
                    patternDropdown.classList.remove('active');
                    renderPatternList(filter); // Re-render to update selected styling
                    triggerPreviewRender();
                };
                patternList.appendChild(item);
            });
        });
    }

    renderPatternList();

    patternSearch.addEventListener('input', (e) => {
        renderPatternList(e.target.value);
    });

    // Populate Palettes
    const paletteGrid = document.getElementById('palettes-grid');
    // For this UI, we only show the first 10 for neatness, or all 20? Let's show all 20 but tightly packed
    palettes.forEach(palette => {
        const btn = document.createElement('button');
        btn.className = `w-full aspect-square rounded overflow-hidden flex flex-col transition-transform hover:scale-110 ${palette.id === currentPalette.id ? 'selected-ring' : ''}`;

        // Create 2x2 or stripes depending on colors array size. Stripe is easier.
        const stripes = palette.colors.map(c => `<div class="flex-1 w-full" style="background-color: ${c}"></div>`).join('');
        btn.innerHTML = stripes;
        btn.title = palette.name;

        btn.onclick = () => {
            currentPalette = palette;
            document.querySelectorAll('#palettes-grid > button').forEach(el => el.classList.remove('selected-ring'));
            btn.classList.add('selected-ring');
            triggerPreviewRender();
        };

        paletteGrid.appendChild(btn);
    });

    // Actions
    document.getElementById('btn-generate').onclick = () => {
        currentSeed = Math.floor(Math.random() * 1000000);
        triggerPreviewRender();
    };

    document.getElementById('btn-download-desktop').onclick = () => {
        downloadAndSetup(false);
    };

    document.getElementById('btn-download-mobile').onclick = () => {
        downloadAndSetup(true);
    };

    updateClock();
    setInterval(updateClock, 60000);
}

function updateClock() {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const dateStr = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    document.getElementById('desktop-date').innerText = dateStr;
    document.getElementById('mobile-date').innerText = dateStr;
    document.getElementById('desktop-time').innerText = timeStr;
    document.getElementById('mobile-time').innerText = timeStr;
}

function initP5() {
    // Desktop Preview (400x225 -> 16:9)
    const desktopSketch = (p) => {
        p.setup = () => {
            let canvas = p.createCanvas(400, 225);
            canvas.parent('desktop-preview');
            p.pixelDensity(1);
            p.noLoop();
        };
    };
    desktopP5 = new p5(desktopSketch);

    // Mobile Preview (150x325 -> roughly 9:19.5)
    const mobileSketch = (p) => {
        p.setup = () => {
            let canvas = p.createCanvas(150, 325);
            canvas.parent('mobile-preview');
            p.pixelDensity(1);
            p.noLoop();
        };
    };
    mobileP5 = new p5(mobileSketch);

    setTimeout(triggerPreviewRender, 100);
}

function triggerPreviewRender() {
    if (desktopP5) {
        desktopP5.clear();
        desktopP5.randomSeed(currentSeed);
        desktopP5.noiseSeed(currentSeed);
        currentAlgo.draw(desktopP5, 400, 225, currentPalette.colors, isDarkTheme);
    }
    if (mobileP5) {
        mobileP5.clear();
        mobileP5.randomSeed(currentSeed);
        mobileP5.noiseSeed(currentSeed);
        currentAlgo.draw(mobileP5, 150, 325, currentPalette.colors, isDarkTheme);
    }
}

function renderHighRes(algo, palette, seed, isMobile, darkTheme, callback) {
    const hiddenContainer = document.getElementById('high-res-container');
    hiddenContainer.innerHTML = '';

    let w = isMobile ? 1242 : 3840;
    let h = isMobile ? 2688 : 2160;
    let resStr = isMobile ? 'mobile' : 'desktop';

    const hrSketch = (p) => {
        p.setup = () => {
            let hrCanvas = p.createCanvas(w, h);
            hrCanvas.parent('high-res-container');
            p.pixelDensity(1);
            p.noLoop();

            p.randomSeed(seed);
            p.noiseSeed(seed);

            algo.draw(p, w, h, palette.colors, darkTheme);

            hrCanvas.elt.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const filename = `WLLPR_${algo.id}_${palette.id}_${resStr}.png`;

                callback(url, filename);

                setTimeout(() => {
                    URL.revokeObjectURL(url);
                    p.remove();
                    hiddenContainer.innerHTML = '';
                }, 1000); // UI doesn't have share button anymore, so rapid cleanup is fine
            }, 'image/png');
        };
    };

    new p5(hrSketch);
}

function downloadAndSetup(isMobile) {
    const btnId = isMobile ? 'btn-download-mobile' : 'btn-download-desktop';
    const btn = document.getElementById(btnId);
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="animate-pulse">Generating...</span>';
    btn.disabled = true;

    renderHighRes(currentAlgo, currentPalette, currentSeed, isMobile, isDarkTheme, (url, filename) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        btn.innerHTML = originalText;
        btn.disabled = false;
    });
}
