import { ethers } from "ethers";
import { WebUploader } from "@irys/web-upload";
import { WebBNB } from "@irys/web-upload-ethereum";
import { EthersV6Adapter } from "@irys/web-upload-ethereum-ethers-v6";
import { Buffer } from "buffer";

// Helper inisialisasi Irys (sama persis dengan di page_2.jsx)
const getNewIrysUploader = async (walletProvider) => {
  const provider = new ethers.BrowserProvider(walletProvider);
  const irysUploader = await WebUploader(WebBNB)
    .withAdapter(EthersV6Adapter(provider))
    .withRpc("https://bsc-testnet-rpc.publicnode.com")
    .devnet();
  return irysUploader;
};

/**
 * Fungsi Wrapper Universal (Logika 100% Sesuai Kode Sukses Bos)
 */
export async function uploadEncryptedFileService(walletProvider, rawEncryptedBytes) {
  const irysUploader = await getNewIrysUploader(walletProvider);
  
  // Pastikan data berupa Node.js Buffer
  const dataBuffer = Buffer.isBuffer(rawEncryptedBytes)
    ? rawEncryptedBytes
    : Buffer.from(rawEncryptedBytes);

  const price = await irysUploader.getPrice(dataBuffer.length);
  try {
    await irysUploader.fund(price);
  } catch (fundErr) {
    throw new Error("Gagal fund Irys: " + fundErr.message);
  }

  const tags = [
    { name: "Content-Type", value: "application/octet-stream" },
    { name: "App-Name", value: "AetherVault" },
    { name: "Encryption", value: "ECIES-secp256k1" }
  ];

  const receipt = await irysUploader.upload(dataBuffer, { tags });
  return `https://devnet.irys.xyz/${receipt.id}`;
}