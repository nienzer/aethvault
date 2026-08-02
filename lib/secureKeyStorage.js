// lib/secureKeyStorage.js
// ============================================================
// Simple Key Storage — IndexedDB (SSR-Safe for Cloudflare Workers)
// ============================================================

const DB_NAME = 'AetherVaultKeys';
const STORE_NAME = 'keypairs';
const DB_VERSION = 1;

const CACHE_EXPIRY_MS = process.env.NODE_ENV === 'production' 
  ? 7 * 24 * 60 * 60 * 1000
  : 24 * 60 * 60 * 1000;

const isBrowser = typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';

function openDB() {
  if (!isBrowser) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export function isKeyPairValid(cached) {
  if (!cached || !cached.privateKey || !cached.publicKey) return false;
  const age = Date.now() - (cached.timestamp || 0);
  return age < CACHE_EXPIRY_MS;
}

export async function saveKeyPair(address, keyPair) {
  if (!isBrowser || !address || !keyPair?.privateKey || !keyPair?.publicKey) return;
  try {
    const db = await openDB();
    if (!db) return;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await new Promise((resolve, reject) => {
      const req = store.put({ ...keyPair, timestamp: Date.now() }, address.toLowerCase());
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    db.close();
  } catch (err) {
    console.warn('[SecureStorage] Save failed:', err?.message);
  }
}

export async function getKeyPair(address) {
  if (!isBrowser || !address) return null;
  try {
    const db = await openDB();
    if (!db) return null;
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const result = await new Promise((resolve, reject) => {
      const req = store.get(address.toLowerCase());
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return result || null;
  } catch (err) {
    console.warn('[SecureStorage] Get failed:', err?.message);
    return null;
  }
}

export async function clearKeyPair(address) {
  if (!isBrowser || !address) return;
  try {
    const db = await openDB();
    if (!db) return;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await new Promise((resolve, reject) => {
      const req = store.delete(address.toLowerCase());
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    db.close();
  } catch (err) {
    console.warn('[SecureStorage] Clear failed:', err?.message);
  }
}

export async function clearAllKeyPairs() {
  if (!isBrowser) return;
  try {
    const db = await openDB();
    if (!db) return;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await new Promise((resolve, reject) => {
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    db.close();
  } catch (err) {
    console.warn('[SecureStorage] Clear all failed:', err?.message);
  }
}