// lib/arweaveUpload.js (Versi Mock untuk Testnet Amoy)

export async function getIrysUploader(browserProvider) {
  // Mock uploader untuk testnet agar tidak error/nyangkut
  return {
    getPrice: async () => 0n,
    getLoadedBalance: async () => 999999999999999999n,
    fund: async () => {},
    utils: { fromAtomic: () => "0.01" },
    upload: async () => ({ id: "TEST_ARWEAVE_HASH_MOCK_12345" })
  };
}

export async function estimateArweaveCost(uploader, byteLength) {
  // Mengembalikan estimasi harga palsu untuk testnet
  return "0.01";
}

export async function uploadToArweavePermanent(browserProvider, data, tags = []) {
  // Simulasi upload sukses instant untuk kebutuhan uji coba testnet
  return {
    id: "TEST_ARWEAVE_HASH_MOCK_12345",
    arweaveUrl: `https://arweave.net/TEST_ARWEAVE_HASH_MOCK_12345`,
    gatewayUrl: `https://gateway.irys.xyz/TEST_ARWEAVE_HASH_MOCK_12345`,
  };
}