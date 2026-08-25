import React, { useState } from "react";
import { ethers } from "ethers";

// Impor ABI dari folder contracts bos
import AetherForgeFactoryABI from "../contracts/AetherForgeFactoryABI.json";
import AetherVaultABI from "../contracts/AetherVaultABI.json";

const FORGE_FACTORY_ADDRESS = "0x452ceE9B5f3CBF8E9ac7C9fcEc7AC4101349f09E";
const AETH_TOKEN_ADDRESS = "0xac884F2670cF85dCAF34e750e52B846D8DE3Cf55";
const CREATION_FEE_AMOUNT = "1000";
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
      setStatusMsg(`Meminta persetujuan (Approve) ${CREATION_FEE_AMOUNT} AETH...`);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // 1. Approve Fee ke Forge Factory
      const aethContract = new ethers.Contract(AETH_TOKEN_ADDRESS, AetherVaultABI, signer);
      const feeAmount = ethers.parseEther(CREATION_FEE_AMOUNT);
      const approveTx = await aethContract.approve(FORGE_FACTORY_ADDRESS, feeAmount);
      await approveTx.wait();

      setStatusMsg("Approve sukses! Mencetak token kustom baru...");

      // 2. Eksekusi Create Token di Factory (Mendukung pembagian Burn & Fee Split)
      const forgeContract = new ethers.Contract(FORGE_FACTORY_ADDRESS, AetherForgeFactoryABI, signer);
      const createTx = await forgeContract.createToken(
        tokenName,
        tokenSymbol,
        ethers.parseEther(tokenSupply || "0")
      );
      const receipt = await createTx.wait();

      setLoading(false);
      setStatusMsg("🎉 Sukses! Token kustom berhasil dicetak & terdistribusi ke sistem.");
      setTokenName("");
      setTokenSymbol("");
      setTokenSupply("");
    } catch (err) {
      console.error(err);
      setLoading(false);
      setStatusMsg("❌ Gagal mencetak token atau transaksi dibatalkan oleh pengguna.");
    }
  }

  return (
    <div className="p-8 bg-slate-900 rounded-2xl border border-slate-800 text-white max-w-xl mx-auto shadow-2xl">
      <div className="flex items-center space-x-3 mb-3">
        <span className="p-3 bg-sky-500/10 text-sky-400 rounded-xl text-xl font-bold">⚡</span>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">AetherForge Token Creator</h2>
          <p className="text-xs text-slate-400">Decentralized Anti-Spam Custom Token Factory</p>
        </div>
      </div>
      
      <p className="text-slate-300 text-sm mb-6 leading-relaxed">
        Cetak token BEP-20 kustom Anda secara instan. Dilengkapi dengan mekanisme pembagian otomatis (Burn, Staking Reward, & Treasury DAO).
      </p>

      <form onSubmit={handleCreateToken} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Nama Token</label>
          <input 
            type="text" 
            placeholder="Contoh: Aether Meme" 
            value={tokenName} 
            onChange={(e) => setTokenName(e.target.value)} 
            required
            className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Simbol Token</label>
          <input 
            type="text" 
            placeholder="Contoh: AMEME" 
            value={tokenSymbol} 
            onChange={(e) => setTokenSymbol(e.target.value)} 
            required
            className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Total Suplai Awal</label>
          <input 
            type="number" 
            placeholder="Contoh: 1000000" 
            value={tokenSupply} 
            onChange={(e) => setTokenSupply(e.target.value)} 
            required
            className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition"
          />
        </div>

        <div className="p-4 bg-sky-950/30 border border-sky-900/50 rounded-xl text-xs text-sky-300 flex items-start space-x-2">
          <span className="text-base">ℹ️</span>
          <div>
            <span className="font-semibold">Informasi Biaya:</span> Pembuatan token akan memotong biaya sebesar <strong className="text-white">{CREATION_FEE_AMOUNT} AETH</strong>, dengan alokasi otomatis untuk menjaga kesehatan ekonomi protokol.
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold text-slate-950 transition shadow-lg ${
            loading 
              ? "bg-slate-700 text-slate-400 cursor-not-allowed" 
              : "bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-500/20"
          }`}
        >
          {loading ? "Sedang Memproses Jaringan..." : "🚀 Cetak Token Sekarang"}
        </button>
      </form>

      {statusMsg && (
        <div className="mt-5 p-4 bg-slate-950 border border-slate-800 rounded-xl text-center text-sm font-medium text-slate-300 animate-pulse">
          {statusMsg}
        </div>
      )}
    </div>
  );
}