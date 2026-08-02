// lib/arweaveUpload-testnet.js
//
// ==========================================================================
// VERSI TESTNET — Irys Devnet untuk Arweave Upload
// ==========================================================================
// File ini IDENTIK dengan arweaveUpload.js, tapi dikonfigurasi untuk
// jaringan Irys DEVNET (testnet), bukan mainnet.
//
// PERBEDAAN UTAMA:
// - Irys uploader diinisialisasi dengan network: "devnet"
// - Provider URL mengarah ke Polygon Amoy Testnet RPC
// - User membayar dengan testnet token (bukan POL mainnet real)
// - Data yang diupload tetap PERMANEN di Arweave mainnet (Irys tetap
//   meneruskan ke Arweave, hanya pembayaran yang pakai testnet token)
//
// CATATAN:
// - JANGAN pakai file ini untuk production/mainnet.
// - Pastikan user sudah punya testnet MATIC/POL di wallet-nya.
// - Irys devnet mungkin memiliki rate limit atau tidak se-stabil mainnet.
// ==========================================================================

import { WebUploader } from "@irys/web-upload";
import { WebEthereum } from "@irys/web-upload-ethereum";
import { EthersV6Adapter } from "@irys/web-upload-ethereum-ethers-v6";

const IRYS_TIMEOUT_MS = 30000;

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timeout setelah ${ms}ms — coba lagi`)), ms)
    ),
  ]);
}

/**
 * Membuat instance Irys uploader DEVNET (testnet).
 * Semua parameter sama dengan mainnet, tapi Irys berjalan di mode devnet.
 */
export async function getIrysUploader(browserProvider) {
  if (!browserProvider) {
    throw new Error("Provider wallet tidak tersedia. Hubungkan dompet terlebih dahulu.");
  }

  try {
    const uploader = await withTimeout(
      WebUploader(WebEthereum).withAdapter(
        EthersV6Adapter(browserProvider, {
          network: "devnet", // ← TESTNET MODE
          providerUrl: "https://rpc-amoy.polygon.technology", // ← Amoy Testnet RPC
        })
      ),
      IRYS_TIMEOUT_MS,
      "Inisialisasi Irys uploader (devnet)"
    );
    return uploader;
  } catch (err) {
    console.error("Gagal inisialisasi Irys uploader (devnet):", err);
    throw new Error(
      err?.message?.includes("timeout")
        ? err.message
        : "Gagal terhubung ke jaringan Irys devnet. Coba refresh halaman atau periksa koneksi internet."
    );
  }
}

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
    return String(uploader.utils.fromAtomic(priceAtomic));
  } catch (err) {
    console.error("Gagal estimasi biaya Arweave:", err);
    throw new Error(
      err?.message?.includes("timeout")
        ? err.message
        : "Gagal menghitung estimasi biaya penyimpanan. Coba lagi nanti."
    );
  }
}

export async function uploadToArweavePermanent(browserProvider, data, tags = []) {
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
    throw err;
  }

  const byteLength = data.byteLength ?? data.length ?? 0;
  if (byteLength === 0) {
    throw new Error("Ukuran data lampiran 0 byte — tidak ada yang bisa diupload.");
  }

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
      await withTimeout(
        uploader.fund(shortfall),
        IRYS_TIMEOUT_MS,
        "Pembayaran Irys (fund)"
      );
    } catch (err) {
      console.error("User menolak atau gagal fund Irys:", err);
      const msg = err?.message || "";
      if (msg.includes("user rejected") || msg.includes("cancelled") || msg.includes("denied")) {
        throw new Error("Pembayaran biaya penyimpanan dibatalkan. Upload tidak dilanjutkan.");
      }
      throw new Error(
        msg.includes("timeout")
          ? msg
          : "Gagal membayar biaya penyimpanan Arweave. Pastikan saldo testnet POL mencukupi dan coba lagi."
      );
    }
  }

  let receipt;
  try {
    receipt = await withTimeout(
      uploader.upload(data, {
        tags: [{ name: "Content-Type", value: "application/octet-stream" }, ...tags],
      }),
      IRYS_TIMEOUT_MS * 2,
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

  if (!receipt || !receipt.id) {
    throw new Error("Upload berhasil tapi tidak ada ID transaksi — data mungkin tidak tersimpan.");
  }

  return {
    id: receipt.id,
    arweaveUrl: `https://arweave.net/${receipt.id}`,
    gatewayUrl: `https://gateway.irys.xyz/${receipt.id}`,
  };
}