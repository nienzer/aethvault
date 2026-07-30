// lib/arweaveUpload.js
//
// ==========================================================================
// PENYIMPANAN PERMANEN (ARWEAVE) — DIBAYAR LANGSUNG OLEH USER
// ==========================================================================
// Dipakai KHUSUS untuk tier Eternal & Legacy, di mana janji durasi
// penyimpanan (100 tahun / warisan) tidak masuk akal kalau cuma dititipkan
// ke layanan pinning IPFS biasa (rata-rata industri ~1 tahun kalau lupa
// perpanjang, dan developer harus terus bayar tagihan selamanya).
//
// Lewat Irys (dulu bernama Bundlr — lapisan pembayaran untuk Arweave), user
// yang membuat kapsul membayar SENDIRI dari wallet-nya sendiri (pakai POL di
// jaringan Polygon), langsung ke jaringan Irys, yang meneruskan datanya ke
// Arweave untuk disimpan permanen (sekali bayar, tidak ada tagihan bulanan).
// Developer (kamu) TIDAK PERNAH memegang dana atau private key siapa pun di
// alur ini — semua transaksi ditandatangani & dibayar oleh wallet user yang
// sedang terhubung, persis seperti transaksi sealCapsule() ke smart contract.
//
// CATATAN PENTING UNTUK UX:
// - Proses ini menambah SATU transaksi wallet ekstra (fund ke Irys) selain
//   transaksi sealCapsule() yang sudah ada. Beri tahu user dengan jelas di
//   UI bahwa akan ada 2 kali konfirmasi wallet untuk tier Eternal/Legacy
//   yang pakai lampiran file.
// - Biaya fund ke Irys terpisah dari AETH yang dibayarkan ke kontrak —
//   ini biaya penyimpanan Arweave, bukan biaya protokol AetherVault.
// ==========================================================================

import { WebUploader } from "@irys/web-upload";
import { WebEthereum } from "@irys/web-upload-ethereum";
import { EthersV6Adapter } from "@irys/web-upload-ethereum-ethers-v6";

// FIX: Timeout untuk semua operasi Irys supaya tidak hang selamanya
// kalau node Irys lambat atau tidak responsif. Nilai dalam milidetik.
const IRYS_TIMEOUT_MS = 30000; // 30 detik

/**
 * Helper: wrap promise dengan timeout
 */
function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timeout setelah ${ms}ms — coba lagi`)), ms)
    ),
  ]);
}

/**
 * Membuat instance Irys uploader yang terikat ke signer/wallet yang sedang
 * aktif. Panggil ulang setiap kali dibutuhkan (bukan di-cache lintas sesi)
 * supaya selalu memakai wallet & jaringan yang sedang benar-benar terhubung.
 *
 * FIX: Tambah error handling & validasi parameter.
 */
export async function getIrysUploader(browserProvider) {
  if (!browserProvider) {
    throw new Error("Provider wallet tidak tersedia. Hubungkan dompet terlebih dahulu.");
  }

  try {
    const uploader = await withTimeout(
      WebUploader(WebEthereum).withAdapter(EthersV6Adapter(browserProvider)),
      IRYS_TIMEOUT_MS,
      "Inisialisasi Irys uploader"
    );
    return uploader;
  } catch (err) {
    console.error("Gagal inisialisasi Irys uploader:", err);
    throw new Error(
      err?.message?.includes("timeout")
        ? err.message
        : "Gagal terhubung ke jaringan Irys. Coba refresh halaman atau periksa koneksi internet."
    );
  }
}

/**
 * Mengecek estimasi biaya (dalam satuan token native, mis. POL) untuk
 * menyimpan data sebesar `byteLength` secara permanen di Arweave lewat Irys.
 * Dipakai untuk menampilkan estimasi biaya ke user SEBELUM mereka commit
 * upload, supaya tidak ada kejutan di wallet popup.
 *
 * FIX: Validasi parameter + error handling + timeout.
 */
export async function estimateArweaveCost(uploader, byteLength) {
  if (!uploader) {
    throw new Error("Uploader Irys belum diinisialisasi.");
  }
  if (typeof byteLength !== "number" || byteLength <= 0) {
    throw new Error("Ukuran data tidak valid untuk estimasi biaya.");
  }

  try {
    const priceAtomic = await withTimeout(
      uploader.getPrice(byteLength),
      IRYS_TIMEOUT_MS,
      "Estimasi biaya Irys"
    );
    // Irys mengembalikan angka dalam satuan atomic (setara wei). Konversi ke
    // unit "manusiawi" pakai helper bawaan uploader.
    return uploader.utils.fromAtomic(priceAtomic);
  } catch (err) {
    console.error("Gagal estimasi biaya Arweave:", err);
    throw new Error(
      err?.message?.includes("timeout")
        ? err.message
        : "Gagal menghitung estimasi biaya penyimpanan. Coba lagi nanti."
    );
  }
}

/**
 * Alur lengkap: cek saldo Irys user saat ini, top-up (fund) kalau kurang,
 * lalu upload data. Setiap langkah yang butuh tanda tangan wallet akan
 * memicu popup konfirmasi terpisah — ini alur normal Irys, bukan bug.
 *
 * FIX: Validasi parameter + error handling lengkap + timeout di tiap step +
 * cleanup kalau user reject transaksi fund.
 *
 * @param {ethers.BrowserProvider} browserProvider
 * @param {Buffer|Uint8Array} data - data yang akan disimpan (idealnya
 *   sudah berupa ciphertext hasil enkripsi client-side, BUKAN plaintext).
 * @param {Array<{name: string, value: string}>} tags - metadata opsional.
 * @returns {Promise<{id: string, arweaveUrl: string, gatewayUrl: string}>}
 */
export async function uploadToArweavePermanent(browserProvider, data, tags = []) {
  // --- VALIDASI PARAMETER ---
  if (!browserProvider) {
    throw new Error("Provider wallet tidak tersedia. Hubungkan dompet terlebih dahulu.");
  }
  if (!data || (data.byteLength ?? 0) === 0) {
    throw new Error("Data lampiran kosong atau tidak valid.");
  }
  if (!Array.isArray(tags)) {
    throw new Error("Format tags tidak valid — harus berupa array.");
  }

  let uploader;
  try {
    uploader = await getIrysUploader(browserProvider);
  } catch (err) {
    // Error sudah di-handle di getIrysUploader, teruskan saja
    throw err;
  }

  const byteLength = data.byteLength ?? data.length ?? 0;
  if (byteLength === 0) {
    throw new Error("Ukuran data lampiran 0 byte — tidak ada yang bisa diupload.");
  }

  // --- STEP 1: ESTIMASI HARGA ---
  let priceAtomic;
  try {
    priceAtomic = await withTimeout(
      uploader.getPrice(byteLength),
      IRYS_TIMEOUT_MS,
      "Estimasi biaya Irys"
    );
  } catch (err) {
    console.error("Gagal estimasi harga Irys:", err);
    throw new Error(
      err?.message?.includes("timeout")
        ? err.message
        : "Gagal menghitung biaya penyimpanan Arweave. Coba lagi nanti."
    );
  }

  // --- STEP 2: CEK SALDO & FUND KALAU PERLU ---
  let currentBalance;
  try {
    currentBalance = await withTimeout(
      uploader.getLoadedBalance(),
      IRYS_TIMEOUT_MS,
      "Cek saldo Irys"
    );
  } catch (err) {
    console.error("Gagal cek saldo Irys:", err);
    throw new Error("Gagal memeriksa saldo Irys. Coba lagi nanti.");
  }

  if (currentBalance < priceAtomic) {
    const shortfall = priceAtomic - currentBalance;
    try {
      // fund() memicu transaksi wallet yang harus di-approve user — inilah
      // titik di mana user benar-benar MEMBAYAR biaya penyimpanan permanen
      // dari dompetnya sendiri.
      await withTimeout(
        uploader.fund(shortfall),
        IRYS_TIMEOUT_MS,
        "Pembayaran Irys (fund)"
      );
    } catch (err) {
      console.error("User menolak atau gagal fund Irys:", err);
      // Bedakan antara user reject vs error teknis
      const msg = err?.message || "";
      if (msg.includes("user rejected") || msg.includes("cancelled") || msg.includes("denied")) {
        throw new Error("Pembayaran biaya penyimpanan dibatalkan. Upload tidak dilanjutkan.");
      }
      throw new Error(
        msg.includes("timeout")
          ? msg
          : "Gagal membayar biaya penyimpanan Arweave. Pastikan saldo POL mencukupi dan coba lagi."
      );
    }
  }

  // --- STEP 3: UPLOAD DATA ---
  let receipt;
  try {
    receipt = await withTimeout(
      uploader.upload(data, {
        tags: [{ name: "Content-Type", value: "application/octet-stream" }, ...tags],
      }),
      IRYS_TIMEOUT_MS * 2, // Upload bisa lebih lambat, kasih 60 detik
      "Upload ke Arweave"
    );
  } catch (err) {
    console.error("Gagal upload ke Arweave:", err);
    const msg = err?.message || "";
    if (msg.includes("timeout")) {
      throw new Error(msg);
    }
    throw new Error("Gagal mengunggah file ke Arweave. Coba lagi nanti.");
  }

  // --- VALIDASI RECEIPT ---
  if (!receipt || !receipt.id) {
    throw new Error("Upload berhasil tapi tidak ada ID transaksi — data mungkin tidak tersimpan.");
  }

  return {
    id: receipt.id,
    arweaveUrl: `https://arweave.net/${receipt.id}`,
    gatewayUrl: `https://gateway.irys.xyz/${receipt.id}`,
  };
}