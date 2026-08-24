import React, { useState } from "react";
import { ethers } from "ethers";

// Impor ABI dari folder contracts bos
import AetherForgeFactoryABI from "../contracts/AetherForgeFactoryABI.json";
import AetherVaultABI from "../contracts/AetherVaultABI.json";

const FORGE_FACTORY_ADDRESS = "MASUKKAN_ADDRESS_FORGE_DI_SINI";
const AETH_TOKEN_ADDRESS = "MASUKKAN_ADDRESS_TOKEN_AETH_DI_SINI";

export default function AetherForgeComponent({ account }) {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenSupply, setTokenSupply] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  async function handleCreateToken(e) {
    e.preventDefault();
    if (!account) return alert("Koneksikan wallet terlebih dahulu!");

    try {
      setLoading(true);
      setStatusMsg("Meminta persetujuan (Approve) 10 AETH...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // 1. Approve 10 AETH fee ke Forge Factory
      const aethContract = new ethers.Contract(AETH_TOKEN_ADDRESS, AetherVaultABI, signer);
      const feeAmount = ethers.parseEther("10");
      const approveTx = await aethContract.approve(FORGE_FACTORY_ADDRESS, feeAmount);
      await approveTx.wait();

      setStatusMsg("Approve sukses! Mencetak token baru...");

      // 2. Eksekusi Create Token di Factory
      const forgeContract = new ethers.Contract(FORGE_FACTORY_ADDRESS, AetherForgeFactoryABI, signer);
      const createTx = await forgeContract.createToken(
        tokenName,
        tokenSymbol,
        ethers.parseEther(tokenSupply || "0")
      );
      await createTx.wait();

      setLoading(false);
      setStatusMsg("🎉 Sukses! Token kustom berhasil dicetak.");
      setTokenName("");
      setTokenSymbol("");
      setTokenSupply("");
    } catch (err) {
      console.error(err);
      setLoading(false);
      setStatusMsg("❌ Gagal mencetak token atau transaksi dibatalkan.");
    }
  }

  return (
    <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 text-white max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-sky-400 mb-2">⚡ AetherForge Token Creator</h2>
      <p className="text-slate-400 text-sm mb-6">Cetak token BEP-20 kustom Anda secara instan dengan sistem anti-spam dan biaya otomatis ke DAO Treasury.</p>

      <form onSubmit={handleCreateToken} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Nama Token</label>
          <input 
            type="text" 
            placeholder="Contoh: Aether Meme" 
            value={tokenName} 
            onChange={(e) => setTokenName(e.target.value)} 
            required
            className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-400"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Simbol Token</label>
          <input 
            type="text" 
            placeholder="Contoh: AMEME" 
            value={tokenSymbol} 
            onChange={(e) => setTokenSymbol(e.target.value)} 
            required
            className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-400"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Total Suplai Awal</label>
          <input 
            type="number" 
            placeholder="Contoh: 1000000" 
            value={tokenSupply} 
            onChange={(e) => setTokenSupply(e.target.value)} 
            required
            className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-400"
          />
        </div>

        <div className="p-3 bg-slate-800 rounded-lg text-xs text-slate-300">
          ℹ️ Biaya pembuatan: **10 AETH** akan dipotong otomatis sebagai kontribusi ke kas protokol.
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-3 rounded-lg font-bold text-slate-950 transition ${loading ? "bg-slate-600 cursor-not-allowed" : "bg-emerald-400 hover:bg-emerald-300"}`}
        >
          {loading ? "Memproses Transaksi..." : "🚀 Cetak Token Sekarang"}
        </button>
      </form>

      {statusMsg && (
        <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-lg text-center text-sm">
          {statusMsg}
        </div>
      )}
    </div>
  );
}