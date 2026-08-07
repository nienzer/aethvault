// lib/cryptoUtils-testnet.js
//
// ==========================================================================
// VERSI TESTNET — ECIES Key Derivation untuk Testnet
// ==========================================================================
// File ini IDENTIK dengan cryptoUtils.js, tapi dengan perubahan kecil:
//
// 1. IDENTITY_DOMAIN_NAME diubah supaya keypair testnet TIDAK PERNAH
//    clash dengan keypair mainnet (meskipun chainId sudah beda, ini
//    double safety supaya user tidak pernah bingung).
// 2. Semua fungsi, algoritma, dan keamanan SAMA PERSIS dengan mainnet.
//
// CATATAN PENTING:
// - Keypair yang diturunkan di testnet (chainId 97) akan BEDA TOTAL
//   dari keypair mainnet (chainId 137) untuk wallet yang SAMA.
// - Ini bukan bug, ini fitur EIP-712. Data testnet dan mainnet terpisah.
// - JANGAN PERNAH pakai file testnet untuk production.
// ==========================================================================

import EthCrypto from "eth-crypto";
import { ethers } from "ethers";

// PERUBAHAN TESTNET: nama domain beda supaya keypair testnet terisolasi
const IDENTITY_DOMAIN_NAME = "AetherVault Encryption Identity (Testnet)";
const IDENTITY_DOMAIN_VERSION = "1";

const IDENTITY_TYPES = {
  Identity: [
    { name: "purpose", type: "string" },
    { name: "wallet", type: "address" },
  ],
};

const IDENTITY_PURPOSE_TEXT =
  "Derive my AetherVault message-encryption keypair. This signature never leaves my device and grants no on-chain permissions.";

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

  const signature = await signer.signTypedData(domain, IDENTITY_TYPES, value);
  const privateKey = ethers.keccak256(signature);
  const publicKey = EthCrypto.publicKeyByPrivateKey(privateKey);
  return { privateKey, publicKey };
}

export async function assertCorrectNetwork(signer, expectedChainId) {
  const network = await signer.provider.getNetwork();
  const actualChainId = Number(network.chainId);
  if (actualChainId !== expectedChainId) {
    const err = new Error(
      `Anda terhubung ke jaringan yang salah (chain ID ${actualChainId}). AetherVault testnet hanya berjalan di chain ID ${expectedChainId}. Ganti jaringan di wallet Anda sebelum melanjutkan — kalau tidak, kunci enkripsi yang diturunkan akan berbeda dan kapsul lama bisa gagal didekripsi.`
    );
    err.code = 'WRONG_NETWORK';
    err.expectedChainId = expectedChainId;
    err.actualChainId = actualChainId;
    throw err;
  }
  return true;
}

export async function requestSwitchNetwork(ethereumProvider, chainIdHex) {
  await ethereumProvider.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: chainIdHex }],
  });
}

export function publicKeyToBytes(publicKeyHex) {
  const clean = publicKeyHex.startsWith("0x") ? publicKeyHex.slice(2) : publicKeyHex;
  return "0x" + clean;
}

export function bytesToPublicKey(bytesHex) {
  return bytesHex.startsWith("0x") ? bytesHex.slice(2) : bytesHex;
}

export async function encryptForPublicKey(publicKeyHex, plaintext) {
  const encrypted = await EthCrypto.encryptWithPublicKey(
    bytesToPublicKey(publicKeyHex),
    plaintext
  );
  return EthCrypto.cipher.stringify(encrypted);
}

export async function decryptWithPrivateKey(privateKey, cipherString) {
  const encryptedObject = EthCrypto.cipher.parse(cipherString);
  return EthCrypto.decryptWithPrivateKey(privateKey, encryptedObject);
}