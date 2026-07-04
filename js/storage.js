// storage.js
// Handles all IndexedDB storage operations

const DB_NAME = 'wllpr_db';
const DB_VERSION = 1;

class StorageManager {
    constructor() {
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error("Database error: ", event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                this.db = event.target.result;

                // Create object stores
                if (!this.db.objectStoreNames.contains('favorites')) {
                    this.db.createObjectStore('favorites', { keyPath: 'id' });
                }
                if (!this.db.objectStoreNames.contains('history')) {
                    this.db.createObjectStore('history', { keyPath: 'id' });
                }
                if (!this.db.objectStoreNames.contains('presets')) {
                    this.db.createObjectStore('presets', { keyPath: 'id' });
                }
                if (!this.db.objectStoreNames.contains('palettes')) {
                    this.db.createObjectStore('palettes', { keyPath: 'id' });
                }
            };
        });
    }

    async save(storeName, item) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            item.updatedAt = Date.now();
            if(!item.id) item.id = Date.now().toString(); // simple ID generator

            const request = store.put(item);

            request.onsuccess = () => resolve(item);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                // Sort by updatedAt descending
                const result = request.result.sort((a, b) => b.updatedAt - a.updatedAt);
                resolve(result);
            }
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

const db = new StorageManager();
