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

/**
 * Membuat instance Irys uploader yang terikat ke signer/wallet yang sedang
 * aktif. Panggil ulang setiap kali dibutuhkan (bukan di-cache lintas sesi)
 * supaya selalu memakai wallet & jaringan yang sedang benar-benar terhubung.
 */
export async function getIrysUploader(browserProvider) {
  const uploader = await WebUploader(WebEthereum).withAdapter(
    EthersV6Adapter(browserProvider)
  );
  return uploader;
}

/**
 * Mengecek estimasi biaya (dalam satuan token native, mis. POL) untuk
 * menyimpan data sebesar `byteLength` secara permanen di Arweave lewat Irys.
 * Dipakai untuk menampilkan estimasi biaya ke user SEBELUM mereka commit
 * upload, supaya tidak ada kejutan di wallet popup.
 */
export async function estimateArweaveCost(uploader, byteLength) {
  const priceAtomic = await uploader.getPrice(byteLength);
  // Irys mengembalikan angka dalam satuan atomic (setara wei). Konversi ke
  // unit "manusiawi" pakai helper bawaan uploader.
  return uploader.utils.fromAtomic(priceAtomic);
}

/**
 * Alur lengkap: cek saldo Irys user saat ini, top-up (fund) kalau kurang,
 * lalu upload data. Setiap langkah yang butuh tanda tangan wallet akan
 * memicu popup konfirmasi terpisah — ini alur normal Irys, bukan bug.
 *
 * @param {ethers.BrowserProvider} browserProvider
 * @param {Buffer|Uint8Array} data - data yang akan disimpan (idealnya
 *   sudah berupa ciphertext hasil enkripsi client-side, BUKAN plaintext).
 * @param {Array<{name: string, value: string}>} tags - metadata opsional.
 * @returns {Promise<{id: string, arweaveUrl: string, gatewayUrl: string}>}
 */
export async function uploadToArweavePermanent(browserProvider, data, tags = []) {
  const uploader = await getIrysUploader(browserProvider);

  const byteLength = data.byteLength ?? data.length;
  const priceAtomic = await uploader.getPrice(byteLength);

  const currentBalance = await uploader.getLoadedBalance();

  if (currentBalance < priceAtomic) {
    const shortfall = priceAtomic - currentBalance;
    // fund() memicu transaksi wallet yang harus di-approve user — inilah
    // titik di mana user benar-benar MEMBAYAR biaya penyimpanan permanen
    // dari dompetnya sendiri.
    await uploader.fund(shortfall);
  }

  const receipt = await uploader.upload(data, {
    tags: [{ name: "Content-Type", value: "application/octet-stream" }, ...tags],
  });

  return {
    id: receipt.id,
    arweaveUrl: `https://arweave.net/${receipt.id}`,
    gatewayUrl: `https://gateway.irys.xyz/${receipt.id}`,
  };
}
