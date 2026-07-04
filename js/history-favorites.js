// Handles Favorites and History logic
document.addEventListener('DOMContentLoaded', () => {
    const favoriteBtn = document.getElementById('favorite-btn');
    const favoriteIcon = document.getElementById('favorite-icon');
    const navFavorites = document.getElementById('nav-favorites');
    const navHistory = document.getElementById('nav-history');

    let currentWallpaperId = null;
    let isFavorite = false;

    // Check if the current settings are favorited (we'd need a hash or id, but for now we'll mock it or generate one based on settings)

    // Wire up favorite button
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', async () => {
            if (!window.db || !window.db.db) {
                console.error("Storage not initialized");
                return;
            }

            try {
                if (isFavorite && currentWallpaperId) {
                    await window.db.delete('favorites', currentWallpaperId);
                    isFavorite = false;
                    favoriteIcon.setAttribute('fill', 'none');
                    favoriteIcon.classList.remove('text-red-500');
                } else {
                    const canvas = document.querySelector('#canvas-container canvas');
                    let thumb = '';
                    if (canvas) {
                        // Create a tiny thumbnail
                        const tmpCanvas = document.createElement('canvas');
                        tmpCanvas.width = 160;
                        tmpCanvas.height = 90;
                        const ctx = tmpCanvas.getContext('2d');
                        ctx.drawImage(canvas, 0, 0, tmpCanvas.width, tmpCanvas.height);
                        thumb = tmpCanvas.toDataURL('image/jpeg', 0.5);
                    }

                    const settings = {
                        algorithm: window.currentAlgorithm,
                        palette: window.currentPalette,
                        effects: window.activeEffects,
                        params: window.currentParams,
                        thumbnail: thumb
                    };
                    const saved = await window.db.save('favorites', settings);
                    currentWallpaperId = saved.id;
                    isFavorite = true;
                    favoriteIcon.setAttribute('fill', 'currentColor');
                    favoriteIcon.classList.add('text-red-500');
                }
            } catch (err) {
                console.error("Error saving favorite:", err);
            }
        });
    }

    // Modal logic for Favorites / History could go here, or simple alert for now
    if (navFavorites) {
        navFavorites.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!window.db || !window.db.db) return;
            const favs = await window.db.getAll('favorites');
            if (favs.length === 0) {
                alert("No favorites saved yet. Click the heart icon to save one!");
            } else {
                alert(`You have ${favs.length} favorites saved offline!`);
            }
        });
    }

    if (navHistory) {
        navHistory.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!window.db || !window.db.db) return;
            const hist = await window.db.getAll('history');
            if (hist.length === 0) {
                alert("History is currently empty.");
            } else {
                alert(`You have ${hist.length} history items saved offline!`);
            }
        });
    }
});
