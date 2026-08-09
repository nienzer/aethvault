import EthCrypto from "eth-crypto";
import { ethers } from "ethers";

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
      `Anda terhubung ke jaringan yang salah (chain ID ${actualChainId}). AetherVault testnet hanya berjalan di chain ID ${expectedChainId}. Ganti jaringan di wallet Anda sebelum melanjutkan.`
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

// 🛠️ Kembali menggunakan format aman yang diterima ethers.js v6 & kontrak V3
export function publicKeyToBytes(publicKeyHex) {
  if (!publicKeyHex) throw new Error("Public key kosong");
  const clean = publicKeyHex.startsWith("0x") ? publicKeyHex.slice(2) : publicKeyHex;
  return ethers.getBytes("0x" + clean);
}

export function bytesToPublicKey(bytesHex) {
  if (!bytesHex) return "";
  if (typeof bytesHex === "string") {
    return bytesHex.startsWith("0x") ? bytesHex.slice(2) : bytesHex;
  }
  // Jika berupa Uint8Array dari ethers.getBytes
  return ethers.hexlify(bytesHex).startsWith("0x") ? ethers.hexlify(bytesHex).slice(2) : bytesHex;
}

export async function encryptForPublicKey(publicKeyHex, plaintext) {
  const cleanKey = bytesToPublicKey(publicKeyHex);
  const encrypted = await EthCrypto.encryptWithPublicKey(
    cleanKey,
    plaintext
  );
  return EthCrypto.cipher.stringify(encrypted);
}

export async function decryptWithPrivateKey(privateKey, cipherString) {
  const encryptedObject = EthCrypto.cipher.parse(cipherString);
  return EthCrypto.decryptWithPrivateKey(privateKey, encryptedObject);
}