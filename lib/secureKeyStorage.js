/**
 * ============================================================
 * AetherVault — Secure Key Storage (Production-Ready)
 * ============================================================
 * Hybrid Key Storage: IndexedDB + AES-GCM Encryption + Auto-Cleanup
 * 
 * Alur:
 * 1. Pertama kali: derive dari EIP-712 signature → encrypt → IndexedDB
 * 2. Kedua kali+:  ambil dari IndexedDB → decrypt (cepat, tanpa sign)
 * 3. Cache expired/hilang: fallback derive ulang (1x sign)
 * 4. Disconnect wallet: hapus cache (security)
 * 
 * Keamanan:
 * - Private key di-encrypt dengan AES-GCM sebelum masuk IndexedDB
 * - Encryption key di-memory + sessionStorage (scoped per session)
 * - Validasi format key ketat (length, hex pattern, expiry)
 * - Auto-cleanup key expired setiap read/write
 * 
 * Cache Expiry:
 * - Mainnet: 7 hari
 * - Testnet: 1 hari
 * ============================================================
 */

const DB_NAME = 'AetherVaultKeys_v2';
const STORE_NAME = 'keypairs';
const DB_VERSION = 1;

const CACHE_EXPIRY_MS = process.env.NODE_ENV === 'production' 
  ? 7 * 24 * 60 * 60 * 1000   // 7 hari mainnet
  : 24 * 60 * 60 * 1000;       // 1 hari testnet

const KEY_VERSION = 'v2'; // Schema version untuk migration

// ─── In-Memory Session Encryption Key ───
// Hilang saat tab ditutup / refresh → user perlu sign 1x lagi
let _sessionKey = null;

/**
 * Get or create AES-GCM 256-bit session key.
 * Disimpan di memory + sessionStorage untuk survive refresh.
 */
async function _getSessionKey() {
  if (_sessionKey) return _sessionKey;

  // Coba restore dari sessionStorage
  const wrapped = sessionStorage.getItem('av_sess_key');
  if (wrapped) {
    try {
      const jwk = JSON.parse(wrapped);
      _sessionKey = await crypto.subtle.importKey(
        'jwk',
        jwk,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      return _sessionKey;
    } catch (e) {
      sessionStorage.removeItem('av_sess_key');
      console.warn('[SecureStorage] Session key corrupt, regenerating...');
    }
  }

  // Generate key baru
  _sessionKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  // Simpan ke sessionStorage untuk survive refresh
  const exported = await crypto.subtle.exportKey('jwk', _sessionKey);
  sessionStorage.setItem('av_sess_key', JSON.stringify(exported));

  return _sessionKey;
}

/**
 * Encrypt object → AES-GCM ciphertext
 */
async function _encrypt(data) {
  const key = await _getSessionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );
  return {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(ciphertext)),
    version: KEY_VERSION,
  };
}

/**
 * Decrypt AES-GCM ciphertext → object
 */
async function _decrypt(encrypted) {
  const key = await _getSessionKey();
  const iv = new Uint8Array(encrypted.iv);
  const data = new Uint8Array(encrypted.data);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  return JSON.parse(new TextDecoder().decode(decrypted));
}

/**
 * Open IndexedDB connection
 */
function openDB() {
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

/**
 * Validasi format key pair yang ketat
 * @param {Object} cached 
 * @returns {boolean}
 */
export function isKeyPairValid(cached) {
  if (!cached || typeof cached !== 'object') return false;
  if (!cached.privateKey || !cached.publicKey) return false;
  if (typeof cached.privateKey !== 'string' || typeof cached.publicKey !== 'string') return false;

  // Validasi panjang private key (64 hex tanpa 0x, atau 66 dengan 0x)
  const pk = cached.privateKey.startsWith('0x') ? cached.privateKey.slice(2) : cached.privateKey;
  if (!/^[0-9a-fA-F]{64}$/.test(pk)) return false;

  // Validasi panjang public key (uncompressed: 128/130 hex, compressed: 66 hex)
  const pub = cached.publicKey.startsWith('0x') ? cached.publicKey.slice(2) : cached.publicKey;
  if (!/^[0-9a-fA-F]{64}$/.test(pub) && !/^[0-9a-fA-F]{128}$/.test(pub) && !/^[0-9a-fA-F]{130}$/.test(pub)) {
    return false;
  }

  // Validasi timestamp & expiry
  if (!cached.timestamp || typeof cached.timestamp !== 'number') return false;
  const age = Date.now() - cached.timestamp;
  if (age < 0 || age >= CACHE_EXPIRY_MS) return false;

  return true;
}

/**
 * Simpan key pair ke IndexedDB (terenkripsi AES-GCM)
 * @param {string} address 
 * @param {{publicKey: string, privateKey: string}} keyPair 
 */
export async function saveKeyPair(address, keyPair) {
  if (!address || !keyPair?.privateKey || !keyPair?.publicKey) {
    console.warn('[SecureStorage] Invalid params for saveKeyPair');
    return;
  }

  try {
    // Pre-validate sebelum encrypt
    const preCheck = { ...keyPair, timestamp: Date.now() };
    if (!isKeyPairValid(preCheck)) {
      console.warn('[SecureStorage] Key pair failed pre-validation, not saving');
      return;
    }

    const payload = {
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
      timestamp: Date.now(),
    };

    const encrypted = await _encrypt(payload);
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    await new Promise((resolve, reject) => {
      const req = store.put(encrypted, address.toLowerCase());
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    db.close();
    console.log('[SecureStorage] Key pair encrypted & saved for', address.slice(0, 6) + '...');
  } catch (err) {
    console.warn('[SecureStorage] Gagal simpan key pair:', err.message);
    // Silent fail — fallback ke derive ulang di next call
  }
}

/**
 * Ambil key pair dari IndexedDB (decrypt + validasi)
 * @param {string} address 
 * @returns {Promise<{publicKey: string, privateKey: string, timestamp: number} | null>}
 */
export async function getKeyPair(address) {
  if (!address) return null;

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    const encrypted = await new Promise((resolve, reject) => {
      const req = store.get(address.toLowerCase());
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    db.close();

    if (!encrypted) return null;

    // Decrypt
    let decrypted;
    try {
      decrypted = await _decrypt(encrypted);
    } catch (decryptErr) {
      // Session key hilang/berubah → cache tidak bisa dibaca
      console.warn('[SecureStorage] Decrypt failed (session key changed?), will re-derive');
      await clearKeyPair(address);
      return null;
    }

    // Validasi format & expiry
    if (!isKeyPairValid(decrypted)) {
      console.warn('[SecureStorage] Cached key invalid/expired, clearing...');
      await clearKeyPair(address);
      return null;
    }

    return decrypted;
  } catch (err) {
    console.warn('[SecureStorage] Gagal ambil key pair:', err.message);
    return null;
  }
}

/**
 * Hapus key pair untuk address tertentu
 * @param {string} address 
 */
export async function clearKeyPair(address) {
  if (!address) return;
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await new Promise((resolve, reject) => {
      const req = store.delete(address.toLowerCase());
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    db.close();
    console.log('[SecureStorage] Key pair cleared for', address.slice(0, 6) + '...');
  } catch (err) {
    console.warn('[SecureStorage] Gagal hapus key pair:', err.message);
  }
}

/**
 * Hapus SEMUA key pair (nuclear option)
 */
export async function clearAllKeyPairs() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await new Promise((resolve, reject) => {
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    db.close();
    sessionStorage.removeItem('av_sess_key');
    _sessionKey = null;
    console.log('[SecureStorage] All key pairs cleared');
  } catch (err) {
    console.warn('[SecureStorage] Gagal clear semua:', err.message);
  }
}

/**
 * Ambil semua address yang tersimpan di DB
 * @returns {Promise<string[]>}
 */
export async function getAllStoredAddresses() {
  try {
    const db = await openDB();
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
    console.warn('[SecureStorage] Gagal list addresses:', err.message);
    return [];
  }
}

/**
 * Cleanup key pair yang sudah expired untuk semua address
 * Berguna di-call saat app startup
 */
export async function cleanupExpiredKeys() {
  try {
    const addresses = await getAllStoredAddresses();
    let cleaned = 0;
    for (const addr of addresses) {
      const cached = await getKeyPair(addr);
      if (!cached) {
        // getKeyPair sudah auto-delete kalau invalid
        cleaned++;
      }
    }
    if (cleaned > 0) {
      console.log(`[SecureStorage] Cleaned ${cleaned} expired key pair(s)`);
    }
  } catch (err) {
    console.warn('[SecureStorage] Cleanup error:', err.message);
  }
}

/**
 * Force regenerate session encryption key (misal setelah logout)
 */
export function purgeSessionKey() {
  sessionStorage.removeItem('av_sess_key');
  _sessionKey = null;
  console.log('[SecureStorage] Session key purged');
}