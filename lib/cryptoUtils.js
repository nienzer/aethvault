// lib/cryptoUtils.js
//
// ==========================================================================
// CATATAN KEAMANAN
// ==========================================================================
// File ini mengimplementasikan enkripsi end-to-end berbasis ECIES (secp256k1)
// menggunakan library `eth-crypto`. Kunci privat/publik pengguna TIDAK PERNAH
// diminta dari wallet secara langsung (wallet browser seperti MetaMask memang
// tidak pernah mengekspos private key ke halaman web, dan itu sudah benar).
//
// Sebagai gantinya, kita menurunkan sepasang kunci ECIES yang DETERMINISTIK
// dari signature wallet atas sebuah PESAN BERSTRUKTUR EIP-712 (bukan lagi
// personal_sign string biasa — lihat perubahan di bawah).
//
// Konsekuensi keamanan penting yang harus dipahami:
// 1. Siapa pun yang menguasai wallet (private key asli / seed phrase) bisa
//    mereproduksi signature ini, dan karenanya bisa mereproduksi kunci ECIES
//    turunan ini juga. Jadi keamanan skema ini SAMA KUATNYA dengan keamanan
//    wallet pengguna itu sendiri — wajar, karena itulah akar kepercayaan di
//    Web3.
// 2. Ini BUKAN skema "zero-knowledge" atau "post-quantum", dan TIDAK punya
//    forward secrecy: kunci bersifat statis/deterministik seumur wallet.
//    Ciphertext yang tersimpan di blockchain bersifat PERMANEN (tidak pernah
//    dihapus, bahkan setelah "dibuka"). Artinya kalau private key wallet
//    seseorang bocor di masa depan — kapan pun, bahkan bertahun-tahun
//    kemudian — SEMUA ciphertext yang pernah dibuat orang itu, dari dulu,
//    langsung bisa didekripsi retroaktif. Ini trade-off yang disengaja demi
//    kesederhanaan (tidak perlu server kunci terpisah), tapi WAJIB
//    dikomunikasikan jujur ke pengguna, terutama untuk kapsul jangka panjang
//    (Eternal/Legacy).
// 3. Untuk ancaman realistis saat ini (orang lain membaca data on-chain/IPFS
//    publik), skema ini efektif: yang tersimpan di luar wallet target
//    hanyalah ciphertext yang tidak berarti tanpa kunci turunan tsb.
//
// ==========================================================================
// PERUBAHAN: personal_sign -> EIP-712 typed structured signing
// ==========================================================================
// Versi sebelumnya menandatangani string polos ("personal_sign") yang
// isinya HANYA berupa teks peringatan ("Do not sign this on any other
// site"). Itu adalah mitigasi berbasis PERILAKU MANUSIA, bukan kriptografi —
// kalau ada dApp jahat menampilkan permintaan tanda tangan dengan teks
// serupa, atau user tidak sempat membaca popup wallet-nya, signature yang
// sama bisa direproduksi di domain lain.
//
// EIP-712 mengikat signature ke sebuah "domain" terstruktur: nama aplikasi,
// versi, chainId, DAN alamat kontrak (verifyingContract). Wallet modern
// (MetaMask, dst) menampilkan data ini secara jelas ter-parsing ke user,
// dan signature yang dihasilkan HANYA valid/masuk akal untuk domain persis
// itu. Ini jauh lebih sulit direplikasi oleh dApp lain dibanding string
// polos, walau tetap bukan jaminan mutlak — user tetap harus membaca apa
// yang mereka tanda tangani.
//
// PERINGATAN MIGRASI (SANGAT PENTING):
// Skema signing lama (personal_sign atas IDENTITY_MESSAGE) dan skema baru
// (EIP-712) menghasilkan signature yang SAMA SEKALI BERBEDA untuk wallet
// yang sama — sehingga kunci ECIES turunannya juga berbeda total.
// JANGAN mengganti skema ini setelah ada user yang sudah:
//   (a) mendaftarkan public key on-chain lewat registerPublicKey(), atau
//   (b) punya kapsul yang sudah dienkripsi dengan kunci lama.
// Kalau itu terjadi, kunci lama tidak akan pernah bisa direproduksi lagi
// dan ciphertext lama menjadi permanen tidak bisa didekripsi. Perubahan ini
// aman dilakukan SEKARANG hanya karena kontrak belum di-deploy ke mainnet
// dan belum ada capsule/publicKey sungguhan yang bergantung pada skema lama.
// ==========================================================================

import EthCrypto from "eth-crypto";
import { ethers } from "ethers";

// Versi domain EIP-712. Naikkan (mis. jadi "2") HANYA kalau memang berniat
// memutus kompatibilitas kunci lama secara sengaja (mis. rotasi keamanan
// terencana dengan proses migrasi eksplisit ke user) — bukan perubahan
// sepele, karena efeknya identik dengan mengganti skema signing sama sekali.
const IDENTITY_DOMAIN_NAME = "AetherVault Encryption Identity";
const IDENTITY_DOMAIN_VERSION = "1";

const IDENTITY_TYPES = {
  Identity: [
    { name: "purpose", type: "string" },
    { name: "wallet", type: "address" },
  ],
};

const IDENTITY_PURPOSE_TEXT =
  "Derive my AetherVault message-encryption keypair. This signature never leaves my device and grants no on-chain permissions.";

/**
 * Meminta pengguna menandatangani pesan EIP-712 terstruktur (bukan lagi
 * personal_sign string polos), lalu menurunkan keypair ECIES (secp256k1)
 * deterministik dari hasil signature tsb.
 *
 * Signature diikat ke chainId JARINGAN AKTIF dan ke alamat kontrak
 * `verifyingContract` yang diberikan — signature ini TIDAK valid/berarti
 * untuk kontrak lain atau jaringan lain, mencegah signature ini dipakai
 * ulang (replay) di dApp lain yang mencoba meniru domain ini.
 *
 * @param {ethers.Signer} signer - signer dari wallet yang terhubung.
 * @param {string} verifyingContract - alamat kontrak AetherVault yang
 *   sedang dipakai (CONTRACT_ADDRESS di frontend). WAJIB diisi alamat asli
 *   hasil deploy, bukan placeholder, karena ini bagian dari domain yang
 *   menentukan kunci turunan.
 * @returns {Promise<{privateKey: string, publicKey: string}>}
 */
export async function deriveIdentityKeyPair(signer, verifyingContract) {
  if (!verifyingContract || !ethers.isAddress(verifyingContract)) {
    throw new Error(
      "deriveIdentityKeyPair: verifyingContract wajib berupa alamat kontrak yang valid (bukan placeholder)."
    );
  }

  const network = await signer.provider.getNetwork();
  const chainId = Number(network.chainId);
  const walletAddress = await signer.getAddress();

  const domain = {
    name: IDENTITY_DOMAIN_NAME,
    version: IDENTITY_DOMAIN_VERSION,
    chainId,
    verifyingContract,
  };

  const value = {
    purpose: IDENTITY_PURPOSE_TEXT,
    wallet: walletAddress,
  };

  // signTypedData (EIP-712) — wallet akan menampilkan domain + field di
  // atas secara terstruktur/terbaca, bukan blob string opak.
  const signature = await signer.signTypedData(domain, IDENTITY_TYPES, value);

  // keccak256 dari signature dipakai sebagai scalar kunci privat secp256k1.
  // Peluang hasil ini >= order kurva secara praktis dapat diabaikan (~2^-128),
  // dan EthCrypto akan melempar error jelas jika itu terjadi (sangat jarang).
  const privateKey = ethers.keccak256(signature);
  const publicKey = EthCrypto.publicKeyByPrivateKey(privateKey);
  return { privateKey, publicKey };
}

/**
 * PENTING (mitigasi risiko "salah jaringan"): karena domain EIP-712 di atas
 * mengikat chainId, keypair yang diturunkan di jaringan A akan BERBEDA TOTAL
 * dari keypair yang diturunkan di jaringan B untuk wallet yang sama. Kalau
 * pengguna tanpa sadar terhubung ke jaringan berbeda antara saat menyegel
 * kapsul dan saat membukanya, ciphertext lama menjadi TIDAK BISA didekripsi
 * lagi — bukan karena bug kriptografi, tapi karena kunci yang dicoba memang
 * berbeda dari yang dipakai mengenkripsi.
 *
 * Panggil fungsi ini di awal setiap alur yang menyentuh enkripsi/dekripsi
 * (seal, reveal, claim, register key) SEBELUM memanggil deriveIdentityKeyPair,
 * dan hentikan alur / minta user pindah jaringan dulu bila hasilnya false.
 */
export async function assertCorrectNetwork(signer, expectedChainId) {
  const network = await signer.provider.getNetwork();
  const actualChainId = Number(network.chainId);
  if (actualChainId !== expectedChainId) {
    const err = new Error(
      `Anda terhubung ke jaringan yang salah (chain ID ${actualChainId}). AetherVault hanya berjalan di chain ID ${expectedChainId}. Ganti jaringan di wallet Anda sebelum melanjutkan — kalau tidak, kunci enkripsi yang diturunkan akan berbeda dan kapsul lama bisa gagal didekripsi.`
    );
    err.code = 'WRONG_NETWORK';
    err.expectedChainId = expectedChainId;
    err.actualChainId = actualChainId;
    throw err;
  }
  return true;
}

/**
 * Meminta wallet berpindah ke jaringan target lewat wallet_switchEthereumChain.
 * Dipanggil dari tombol "Ganti Jaringan" di UI, bukan otomatis tanpa aksi user.
 */
export async function requestSwitchNetwork(ethereumProvider, chainIdHex) {
  await ethereumProvider.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: chainIdHex }],
  });
}

/**
 * Konversi public key hex (format eth-crypto, 130 hex char tanpa 0x prefix
 * setelah dipotong) menjadi bytes yang bisa disimpan on-chain via
 * registerPublicKey(bytes).
 */
export function publicKeyToBytes(publicKeyHex) {
  const clean = publicKeyHex.startsWith("0x") ? publicKeyHex.slice(2) : publicKeyHex;
  return "0x" + clean;
}

export function bytesToPublicKey(bytesHex) {
  return bytesHex.startsWith("0x") ? bytesHex.slice(2) : bytesHex;
}

/**
 * Enkripsi teks (pesan/judul kapsul) untuk pemegang publicKey tertentu.
 * Hasilnya di-stringify jadi satu string JSON supaya bisa disimpan sebagai
 * `encryptedMessage`/`title` (string) di kontrak.
 */
export async function encryptForPublicKey(publicKeyHex, plaintext) {
  const encrypted = await EthCrypto.encryptWithPublicKey(
    bytesToPublicKey(publicKeyHex),
    plaintext
  );
  return EthCrypto.cipher.stringify(encrypted);
}

/**
 * Dekripsi ciphertext (hasil encryptForPublicKey) menggunakan privateKey
 * turunan milik pemanggil.
 */
export async function decryptWithPrivateKey(privateKey, cipherString) {
  const encryptedObject = EthCrypto.cipher.parse(cipherString);
  return EthCrypto.decryptWithPrivateKey(privateKey, encryptedObject);
}