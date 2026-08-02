/**
 * ============================================================
 * AetherVault — Secure Key Storage (SSR-Safe for Cloudflare Workers)
 * ============================================================
 * Hybrid Key Storage: IndexedDB + AES-GCM Encryption + Auto-Cleanup
 * 
 * SSR-SAFE: Semua browser-only API di-guard dengan typeof window !== 'undefined'
 *            sehingga aman untuk Next.js + Cloudflare Workers deployment.
 */

const DB_NAME = 'AetherVaultKeys_v2';
const STORE_NAME = 'keypairs';
const DB_VERSION = 1;
const KEY_VERSION = 'v2';

const CACHE_EXPIRY_MS = process.env.NODE_ENV === 'production' 
  ? 7 * 24 * 60 * 60 * 1000
  : 24 * 60 * 60 * 1000;

// ─── SSR Guard: hanya jalan di browser ───
const isBrowser = typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';

// In-memory session key (browser only)
let _sessionKey = null;

/**
 * Get or create AES-GCM 256-bit session key.
 */
async function _getSessionKey() {
  if (!isBrowser) return null;
  if (_sessionKey) return _sessionKey;

  // Coba restore dari sessionStorage
  try {
    const wrapped = sessionStorage.getItem('av_sess_key');
    if (wrapped) {
      const jwk = JSON.parse(wrapped);
      _sessionKey = await crypto.subtle.importKey(
        'jwk',
        jwk,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      return _sessionKey;
    }
  } catch (e) {
    // sessionStorage tidak tersedia atau corrupt
  }

  // Generate key baru
  try {
    _sessionKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    const exported = await crypto.subtle.exportKey('jwk', _sessionKey);
    sessionStorage.setItem('av_sess_key', JSON.stringify(exported));
    return _sessionKey;
  } catch (e) {
    return null;
  }
}

async function _encrypt(data) {
  const key = await _getSessionKey();
  if (!key) return null;
  try {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(JSON.stringify(data));
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
    return { iv: Array.from(iv), data: Array.from(new Uint8Array(ciphertext)), version: KEY_VERSION };
  } catch (e) {
    return null;
  }
}

async function _decrypt(encrypted) {
  const key = await _getSessionKey();
  if (!key) return null;
  try {
    const iv = new Uint8Array(encrypted.iv);
    const data = new Uint8Array(encrypted.data);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    return JSON.parse(new TextDecoder().decode(decrypted));
  } catch (e) {
    return null;
  }
}

function openDB() {
  if (!isBrowser) {
    return Promise.resolve(null);
  }
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
  if (!cached || typeof cached !== 'object') return false;
  if (!cached.privateKey || !cached.publicKey) return false;
  if (typeof cached.privateKey !== 'string' || typeof cached.publicKey !== 'string') return false;

  const pk = cached.privateKey.startsWith('0x') ? cached.privateKey.slice(2) : cached.privateKey;
  if (!/^[0-9a-fA-F]{64}$/.test(pk)) return false;

  const pub = cached.publicKey.startsWith('0x') ? cached.publicKey.slice(2) : cached.publicKey;
  if (!/^[0-9a-fA-F]{64}$/.test(pub) && !/^[0-9a-fA-F]{128}$/.test(pub) && !/^[0-9a-fA-F]{130}$/.test(pub)) {
    return false;
  }

  if (!cached.timestamp || typeof cached.timestamp !== 'number') return false;
  const age = Date.now() - cached.timestamp;
  if (age < 0 || age >= CACHE_EXPIRY_MS) return false;

  return true;
}

export async function saveKeyPair(address, keyPair) {
  if (!isBrowser || !address || !keyPair?.privateKey || !keyPair?.publicKey) {
    return;
  }
  try {
    const preCheck = { ...keyPair, timestamp: Date.now() };
    if (!isKeyPairValid(preCheck)) return;

    const payload = { publicKey: keyPair.publicKey, privateKey: keyPair.privateKey, timestamp: Date.now() };
    const encrypted = await _encrypt(payload);
    if (!encrypted) return;

    const db = await openDB();
    if (!db) return;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await new Promise((resolve, reject) => {
      const req = store.put(encrypted, address.toLowerCase());
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    db.close();
  } catch (err) {
    console.warn('[SecureStorage] Gagal simpan key pair:', err?.message);
  }
}

export async function getKeyPair(address) {
  if (!isBrowser || !address) return null;
  try {
    const db = await openDB();
    if (!db) return null;
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const encrypted = await new Promise((resolve, reject) => {
      const req = store.get(address.toLowerCase());
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    db.close();
    if (!encrypted) return null;

    const decrypted = await _decrypt(encrypted);
    if (!decrypted) {
      await clearKeyPair(address);
      return null;
    }
    if (!isKeyPairValid(decrypted)) {
      await clearKeyPair(address);
      return null;
    }
    return decrypted;
  } catch (err) {
    console.warn('[SecureStorage] Gagal ambil key pair:', err?.message);
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
    console.warn('[SecureStorage] Gagal hapus key pair:', err?.message);
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
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('av_sess_key');
    }
    _sessionKey = null;
  } catch (err) {
    console.warn('[SecureStorage] Gagal clear semua:', err?.message);
  }
}

export async function getAllStoredAddresses() {
  if (!isBrowser) return [];
  try {
    const db = await openDB();
    if (!db) return [];
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const keys = await new Promise((resolve, reject) => {
      const req = store.getAllKeys();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return keys.map(k => String(k));
  } catch (err) {
    return [];
  }
}

export async function cleanupExpiredKeys() {
  if (!isBrowser) return;
  try {
    const addresses = await getAllStoredAddresses();
    let cleaned = 0;
    for (const addr of addresses) {
      const cached = await getKeyPair(addr);
      if (!cached) cleaned++;
    }
    if (cleaned > 0) {
      console.log(`[SecureStorage] Cleaned ${cleaned} expired key pair(s)`);
    }
  } catch (err) {
    console.warn('[SecureStorage] Cleanup error:', err?.message);
  }
}

export function purgeSessionKey() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('av_sess_key');
  }
  _sessionKey = null;
}