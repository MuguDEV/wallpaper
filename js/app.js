// State Management
let state = {
    view: 'desktop', // desktop, laptop, tablet, mobile, ultrawide, dual
    algorithm: null, // Will be populated from JS
    palette: null,
    theme: 'dark',
    sidebarLeftOpen: true,
    sidebarRightOpen: true,
};

// Resolutions mapping
const RESOLUTIONS = {
    desktop: { w: 3840, h: 2160, label: '3840 x 2160' },
    laptop: { w: 2560, h: 1600, label: '2560 x 1600' },
    tablet: { w: 2048, h: 2732, label: '2048 x 2732' },
    mobile: { w: 1284, h: 2778, label: '1284 x 2778' },
    ultrawide: { w: 5120, h: 2160, label: '5120 x 2160' },
    dual: { w: 3840 * 2, h: 2160, label: '7680 x 2160' }
};

// DOM Elements
const elements = {
    tabs: document.querySelectorAll('#preview-tabs button'),
    canvasInfo: document.getElementById('canvas-size-info'),
    canvasContainer: document.getElementById('canvas-container'),
    wrapper: document.getElementById('canvas-wrapper'),
    themeToggle: document.getElementById('theme-toggle'),
    exportBtn: document.querySelector('button:has(svg path[d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"])')
};

let mainP5 = null;

// Initialize
async function init() {
    try {
        await db.init();
        console.log("IndexedDB initialized.");
    } catch (e) {
        console.error("Failed to initialize IndexedDB", e);
    }

    setupEventListeners();
    initTheme();
    updateView('desktop');
    // We will initialize p5 and other things in the following steps
}

function renderLeftSidebarAlgorithms(filterQuery = '') {
    const container = document.getElementById('categories-container');
    if(!container) return;
    container.innerHTML = '';

    // Group algorithms by category
    const categories = {};
    ALGORITHMS.forEach(algo => {
        if (filterQuery && !algo.name.toLowerCase().includes(filterQuery) && !algo.category.toLowerCase().includes(filterQuery)) return;

        if(!categories[algo.category]) categories[algo.category] = [];
        categories[algo.category].push(algo);
    });

    for(const [catName, algos] of Object.entries(categories)) {
        const catDiv = document.createElement('div');
        catDiv.className = 'space-y-1';

        const catTitle = document.createElement('h4');
        catTitle.className = 'text-xs font-semibold text-gray-700 dark:text-gray-300 px-3 py-1';
        catTitle.textContent = catName;
        catDiv.appendChild(catTitle);

        algos.forEach(algo => {
            const btn = document.createElement('button');
            const isActive = state.algorithm === algo.id;
            btn.className = `w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center justify-between group ${isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`;

            const nameSpan = document.createElement('span');
            nameSpan.textContent = algo.name;
            btn.appendChild(nameSpan);

            if(algo.popular) {
                const badge = document.createElement('span');
                badge.className = 'text-[9px] uppercase tracking-widest bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 px-1.5 py-0.5 rounded';
                badge.textContent = 'HOT';
                btn.appendChild(badge);
            }

            btn.addEventListener('click', () => {
                state.algorithm = algo.id;
                // reset parameters when switching algorithms
                state.currentParams = null;
                renderLeftSidebarAlgorithms();
                buildAlgorithmControls();
                renderCurrentAlgorithm();
            });

            catDiv.appendChild(btn);
        });

        container.appendChild(catDiv);
    }
}

function setupEventListeners() {
    // Tabs
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            updateView(e.target.dataset.view);
        });
    });

    // Theme Toggle
    elements.themeToggle.addEventListener('click', toggleTheme);

    // Window resize handling for canvas scaling
    window.addEventListener('resize', scaleCanvas);

    // Command Palette Trigger (Ctrl+K)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('global-search');
            if (searchInput) {
                searchInput.focus();
                // We would open a proper modal here for a real command palette,
                // but for now focusing the search bar mimics the behavior
            }
        }
    });

    // Sidebar toggles (Simple mock implementation for now)
    const leftSidebarToggle = document.querySelector('#left-sidebar button[title="Toggle Sidebar"]');
    if(leftSidebarToggle) {
        leftSidebarToggle.addEventListener('click', () => {
            state.sidebarLeftOpen = !state.sidebarLeftOpen;
            const sidebar = document.getElementById('left-sidebar');
            if(state.sidebarLeftOpen) {
                sidebar.classList.remove('-ml-72');
            } else {
                sidebar.classList.add('-ml-72');
            }
            setTimeout(scaleCanvas, 300); // Recalculate canvas scale after transition
        });
    }

    // Export button
    if(elements.exportBtn) {
        elements.exportBtn.addEventListener('click', () => {
            if(mainP5) {
                // High-res offscreen render logic will go here for final product.
                // For now, save the current preview canvas.
                mainP5.saveCanvas('wllpr-export', 'png');
            }
        });
    }

    // Randomize button
    const btnRandomize = document.getElementById('btn-randomize');
    if (btnRandomize) {
        btnRandomize.addEventListener('click', () => {
            const randomAlgo = ALGORITHMS[Math.floor(Math.random() * ALGORITHMS.length)].id;
            const randomPalette = PALETTES[Math.floor(Math.random() * PALETTES.length)].id;
            state.algorithm = randomAlgo;
            state.palette = randomPalette;
            state.currentParams = null; // force reload of params

            // Re-render UI and canvas
            renderLeftSidebarAlgorithms();

            const paletteSelect = document.getElementById('palette-select');
            if (paletteSelect) paletteSelect.value = randomPalette;

            buildAlgorithmControls();
            renderColorSwatches();
            renderCurrentAlgorithm();
        });
    }

    // Search
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            renderLeftSidebarAlgorithms(query);
        });
    }

    // Palette selection
    const paletteSelect = document.getElementById('palette-select');
    if (paletteSelect) {
        // Populate
        paletteSelect.innerHTML = '';
        PALETTES.forEach(pal => {
            const option = document.createElement('option');
            option.value = pal.id;
            option.textContent = pal.name;
            if (state.palette === pal.id) option.selected = true;
            paletteSelect.appendChild(option);
        });

        paletteSelect.addEventListener('change', (e) => {
            state.palette = e.target.value;
            renderColorSwatches();
            renderCurrentAlgorithm();
        });
    }
}

function initTheme() {
    // Basic localstorage theme check (temporary until indexedDB is up)
    const saved = localStorage.getItem('wllpr_theme') || 'dark';
    if(saved === 'light') {
        document.documentElement.classList.remove('dark');
        state.theme = 'light';
    }
}

function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    if(state.theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('wllpr_theme', state.theme);
}

function updateView(view) {
    state.view = view;

    // Update active tab styling
    elements.tabs.forEach(tab => {
        if(tab.dataset.view === view) {
            tab.className = 'px-3 py-1.5 rounded-md text-sm font-medium bg-white dark:bg-white/10 text-black dark:text-white shadow-sm border border-gray-200 dark:border-transparent transition';
        } else {
            tab.className = 'px-3 py-1.5 rounded-md text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-white/5 transition';
        }
    });

    // Update label
    elements.canvasInfo.textContent = RESOLUTIONS[view].label;

    scaleCanvas();


    if (mainP5) {
        const res = RESOLUTIONS[view];
        mainP5.resizeCanvas(res.w, res.h);
        renderCurrentAlgorithm();
    }
}

let scale = 1;
function scaleCanvas() {
    const res = RESOLUTIONS[state.view];
    const padding = 64; // 8 * 8 (p-8 in tailwind)

    const availableWidth = elements.wrapper.clientWidth - (padding * 2);
    const availableHeight = elements.wrapper.clientHeight - (padding * 2);

    const scaleX = availableWidth / res.w;
    const scaleY = availableHeight / res.h;
    scale = Math.min(scaleX, scaleY);

    elements.canvasContainer.style.width = `${res.w}px`;
    elements.canvasContainer.style.height = `${res.h}px`;
    elements.canvasContainer.style.transform = `scale(${scale})`;
}

function initP5() {
    new p5((p) => {
        mainP5 = p;
        p.setup = () => {
            const res = RESOLUTIONS[state.view];
            const canvas = p.createCanvas(res.w, res.h);
            canvas.parent('canvas-container');
            p.noLoop();

            // Set default algo if none
            if (!state.algorithm && ALGORITHMS.length > 0) {
                state.algorithm = ALGORITHMS[0].id;
                state.palette = PALETTES[0].id;
                state.effect = 'none';
            }

            renderLeftSidebarAlgorithms(); // Populate Left Sidebar
            buildAlgorithmControls(); // Build UI controls initially
            renderColorSwatches(); // Build color swatches
            renderEffectsList(); // Build effects list
            renderCurrentAlgorithm();
        };

        p.draw = () => {
            // Static renders, no continuous loop needed for most wallpapers unless animated
        };
    });
}

// Debounce function to limit render calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedRender = debounce(() => {
    renderCurrentAlgorithm();
}, 50);

// Dynamically build the UI for the selected algorithm
function buildAlgorithmControls() {
    const container = document.getElementById('dynamic-controls');
    container.innerHTML = '';

    const algo = ALGORITHMS.find(a => a.id === state.algorithm);
    if (!algo || !algo.params) {
        container.innerHTML = '<div class="text-xs text-gray-500 italic">No settings available for this algorithm.</div>';
        return;
    }

    // Deep clone parameters so we can modify values safely in state
    if (!state.currentParams || state.currentParams.algoId !== algo.id) {
        state.currentParams = { algoId: algo.id, values: {} };
        for (const [key, param] of Object.entries(algo.params)) {
            state.currentParams.values[key] = { ...param };
        }
    }

    for (const [key, param] of Object.entries(state.currentParams.values)) {
        const div = document.createElement('div');
        div.className = 'space-y-1.5';

        if (param.type === 'range') {
            const labelRow = document.createElement('div');
            labelRow.className = 'flex justify-between items-center text-xs';

            const label = document.createElement('span');
            label.className = 'text-gray-600 dark:text-gray-400';
            label.textContent = param.label;

            const valDisplay = document.createElement('span');
            valDisplay.className = 'text-gray-900 dark:text-gray-300 font-medium tabular-nums';
            valDisplay.textContent = param.value;

            const input = document.createElement('input');
            input.type = 'range';
            input.min = param.min;
            input.max = param.max;
            input.step = param.step || 1;
            input.value = param.value;

            input.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                valDisplay.textContent = val;
                state.currentParams.values[key].value = val;
                debouncedRender();
            });

            labelRow.appendChild(label);
            labelRow.appendChild(valDisplay);
            div.appendChild(labelRow);
            div.appendChild(input);
        }

        container.appendChild(div);
    }
}

function renderColorSwatches() {
    const container = document.getElementById('color-swatches');
    container.innerHTML = '';

    if (!state.palette) return;

    const pal = PALETTES.find(p => p.id === state.palette);
    if (pal) {
        pal.colors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'w-6 h-6 rounded-md shadow-sm border border-gray-200 dark:border-white/10';
            swatch.style.backgroundColor = color;
            container.appendChild(swatch);
        });
    }
}

function renderCurrentAlgorithm() {
    if (!mainP5 || !state.algorithm || !state.palette) return;

    const algo = ALGORITHMS.find(a => a.id === state.algorithm);
    const pal = PALETTES.find(p => p.id === state.palette);

    if (algo && pal) {
        if(!state.currentParams || state.currentParams.algoId !== algo.id) {
            buildAlgorithmControls(); // Ensure controls match the algo
        }

        mainP5.push();
        mainP5.clear();
        mainP5.randomSeed(42); // Optional: Keep seed constant during parameter adjustments
        mainP5.noiseSeed(42);

        // Pass the actual current params structure to the algorithm
        algo.draw(mainP5, pal.colors, mainP5.width, mainP5.height, state.currentParams ? state.currentParams.values : algo.params);
        mainP5.pop();

        // Apply effect if one is selected
        if(state.effect && state.effect !== 'none') {
            const effect = EFFECTS.find(e => e.id === state.effect);
            if(effect) effect.apply(mainP5, mainP5.width, mainP5.height);
        }
    }
}

function renderEffectsList() {
    const container = document.getElementById('effects-controls');
    if(!container) return;
    container.innerHTML = '';

    EFFECTS.forEach(eff => {
        const div = document.createElement('div');
        div.className = `p-2 rounded-lg border text-sm cursor-pointer transition ${state.effect === eff.id ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-500/20 dark:border-brand-500 dark:text-brand-300' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10'}`;
        div.textContent = eff.name;
        div.addEventListener('click', () => {
            state.effect = eff.id;
            renderEffectsList();
            renderCurrentAlgorithm();
        });
        container.appendChild(div);
    });
}

// Start
document.addEventListener('DOMContentLoaded', () => {
    init();
    initP5();
});

document.addEventListener('DOMContentLoaded', () => {
    const editPaletteBtn = document.getElementById('edit-palette-btn');
    if (editPaletteBtn) {
        editPaletteBtn.addEventListener('click', () => {
            alert('Advanced Color Editor coming soon! For now, please select a preset palette from the dropdown.');
        });
    }
});
