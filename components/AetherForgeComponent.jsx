import React, { useState } from "react";
import { ethers } from "ethers";
import AetherForgeFactoryABI from "../contracts/AetherForgeFactoryABI.json";
import AetherVaultABI from "../contracts/AetherVaultABI.json";

const CREATION_FEE_AMOUNT = "1000"; // Sesuaikan dengan settingan deploy

export default function AetherForgeComponent({ account, forgeFactoryAddress, aethTokenAddress, showToast, t }) {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenSupply, setTokenSupply] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const forgeT = t?.forge || {}; // Mengambil objek translate Forge

  async function handleCreateToken(e) {
    e.preventDefault();
    if (!account) return showToast ? showToast(forgeT.alertConnect || "Koneksikan wallet terlebih dahulu!", "error") : alert(forgeT.alertConnect || "Koneksikan wallet terlebih dahulu!");

    try {
      setLoading(true);
      setStatusMsg((forgeT.msgApprove || "Meminta persetujuan (Approve) {fee} AETH...").replace("{fee}", CREATION_FEE_AMOUNT));

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // 1. Approve Fee
      const aethContract = new ethers.Contract(aethTokenAddress, AetherVaultABI, signer);
      const feeAmount = ethers.parseEther(CREATION_FEE_AMOUNT);
      const approveTx = await aethContract.approve(forgeFactoryAddress, feeAmount);
      await approveTx.wait();

      setStatusMsg(forgeT.msgApproveSuccess || "Approve sukses! Mencetak token kustom baru...");

      // 2. Eksekusi Create Token 
      const forgeContract = new ethers.Contract(forgeFactoryAddress, AetherForgeFactoryABI, signer);
      const createTx = await forgeContract.createToken(
        tokenName,
        tokenSymbol,
        ethers.parseEther(tokenSupply || "0")
      );
      await createTx.wait();

      setLoading(false);
      const successMsg = forgeT.msgMintSuccess || "🎉 Sukses! Token kustom berhasil dicetak.";
      setStatusMsg(successMsg);
      if(showToast) showToast(successMsg, "success");
      
      setTokenName("");
      setTokenSymbol("");
      setTokenSupply("");
    } catch (err) {
      console.error(err);
      setLoading(false);
      const failMsg = forgeT.msgMintFail || "❌ Gagal mencetak token.";
      setStatusMsg(failMsg);
      if(showToast) showToast(failMsg, "error");
    }
  }

  return (
    <div className="p-8 bg-[#0B0817] rounded-3xl border border-neutral-900 text-white max-w-xl mx-auto shadow-xl">
      <div className="flex items-center space-x-3 mb-3">
        <span className="p-3 bg-sky-500/10 text-sky-400 rounded-xl text-xl font-bold">⚡</span>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">{forgeT.title || "AetherForge Token Creator"}</h2>
          <p className="text-xs text-neutral-400 font-mono">{forgeT.subtitle || "Decentralized Anti-Spam Custom Token Factory"}</p>
        </div>
      </div>
      
      <p className="text-neutral-300 text-sm mb-6 leading-relaxed">
        {forgeT.desc || "Cetak token BEP-20 kustom Anda secara instan. Dilengkapi dengan mekanisme pembagian otomatis (Burn, Staking Reward, & Treasury DAO)."}
      </p>

      <form onSubmit={handleCreateToken} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">{forgeT.tokenNameLabel || "Nama Token"}</label>
          <input 
            type="text" 
            placeholder={forgeT.tokenNamePlaceholder || "Contoh: Aether Meme"} 
            value={tokenName} 
            onChange={(e) => setTokenName(e.target.value)} 
            required
            className="w-full p-3.5 bg-[#05030F] border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">{forgeT.tokenSymbolLabel || "Simbol Token"}</label>
          <input 
            type="text" 
            placeholder={forgeT.tokenSymbolPlaceholder || "Contoh: AMEME"} 
            value={tokenSymbol} 
            onChange={(e) => setTokenSymbol(e.target.value)} 
            required
            className="w-full p-3.5 bg-[#05030F] border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">{forgeT.supplyLabel || "Total Suplai Awal"}</label>
          <input 
            type="number" 
            placeholder={forgeT.supplyPlaceholder || "Contoh: 1000000"} 
            value={tokenSupply} 
            onChange={(e) => setTokenSupply(e.target.value)} 
            required
            className="w-full p-3.5 bg-[#05030F] border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div className="p-4 bg-cyan-950/20 border border-cyan-900/40 rounded-xl text-xs text-cyan-300 flex items-start space-x-2">
          <span className="text-base">ℹ️</span>
          <div>
            <span className="font-bold">{forgeT.feeInfoTitle || "Informasi Biaya:"}</span> {(forgeT.feeInfoDesc || "Pembuatan token akan memotong biaya sebesar {fee} AETH, dengan alokasi otomatis untuk menjaga kesehatan ekonomi protokol.").replace("{fee}", CREATION_FEE_AMOUNT)}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold text-slate-950 transition-all shadow-lg ${
            loading 
              ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700" 
              : "bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-white shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)]"
          }`}
        >
          {loading ? (forgeT.btnProcessing || "Sedang Memproses Jaringan...") : (forgeT.btnMint || "🚀 Cetak Token Sekarang")}
        </button>
      </form>

      {statusMsg && (
        <div className="mt-5 p-4 bg-[#05030F] border border-neutral-800 rounded-xl text-center text-sm font-medium text-neutral-300 animate-pulse">
          {statusMsg}
        </div>
      )}
    </div>
  );
}