import React, { useState } from "react";
import { ethers } from "ethers";
import AetherForgeFactoryABI from "../contracts/AetherForgeFactoryABI.json";
import { useLanguage } from '@/context/LanguageContext';

// 🌟 EKSTRAK ABI DENGAN AMAN: Mencegah error "e is not iterable"
const RESOLVED_FORGE_ABI = AetherForgeFactoryABI.abi || AetherForgeFactoryABI.default?.abi || AetherForgeFactoryABI;

const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

const CREATION_FEE_AMOUNT = "1000"; // Sesuai dengan deploy sampeyan (1000 AETH)

export default function AetherForgeComponent({ account, forgeFactoryAddress, aethTokenAddress, showToast }) {
  const { t: globalT } = useLanguage();
  const t = globalT.dashboard || {};

  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenSupply, setTokenSupply] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  async function handleCreateToken(e) {
    e.preventDefault();
    if (!account) return showToast ? showToast(t.forgeAlertConnect || "Koneksikan wallet terlebih dahulu!", "error") : alert(t.forgeAlertConnect || "Koneksikan wallet terlebih dahulu!");

    try {
      setLoading(true);
      setStatusMsg((t.forgeMsgApprove || "Meminta persetujuan (Approve) {fee} AETH...").replace("{fee}", CREATION_FEE_AMOUNT));

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // 1. Approve Fee menggunakan ERC20_ABI
      const aethContract = new ethers.Contract(aethTokenAddress, ERC20_ABI, signer);
      const feeAmount = ethers.parseEther(CREATION_FEE_AMOUNT);
      
      const currentAllowance = await aethContract.allowance(account, forgeFactoryAddress);
      if (currentAllowance < feeAmount) {
          const approveTx = await aethContract.approve(forgeFactoryAddress, feeAmount);
          await approveTx.wait();
      }

      setStatusMsg(t.forgeMsgApproveSuccess || "Approve sukses! Mencetak token kustom baru...");

      // 2. Eksekusi Create Token 
      // 🌟 PERBAIKAN: Gunakan RESOLVED_FORGE_ABI yang sudah diekstrak
      const forgeContract = new ethers.Contract(forgeFactoryAddress, RESOLVED_FORGE_ABI, signer);
      const createTx = await forgeContract.createToken(
        tokenName,
        tokenSymbol,
        ethers.parseEther(tokenSupply || "0")
      );
      await createTx.wait();

      setLoading(false);
      const successMsg = t.forgeMsgMintSuccess || "🎉 Sukses! Token kustom berhasil dicetak.";
      setStatusMsg(successMsg);
      if(showToast) showToast(successMsg, "success");
      
      setTokenName("");
      setTokenSymbol("");
      setTokenSupply("");
    } catch (err) {
      console.error("DETAIL ERROR MINTING:", err);
      setLoading(false);
      
      let realError = err?.reason || err?.data?.message || err?.message || "Unknown error";
      if (realError.toLowerCase().includes("user rejected")) {
          realError = "Dibatalkan oleh pengguna.";
      }
      
      const failMsg = (t.forgeMsgMintFail || "❌ Gagal mencetak token:") + " " + realError;
      setStatusMsg(failMsg);
      if(showToast) showToast(failMsg, "error");
    }
  }

  return (
    <div className="p-8 bg-[#0B0817] rounded-3xl border border-neutral-900 text-white max-w-xl mx-auto shadow-xl">
      <div className="flex items-center space-x-3 mb-3">
        <span className="p-3 bg-sky-500/10 text-sky-400 rounded-xl text-xl font-bold">⚡</span>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">{t.forgeTitle || "AetherForge Token Creator"}</h2>
          <p className="text-xs text-neutral-400 font-mono">{t.forgeSubtitle || "Decentralized Anti-Spam Custom Token Factory"}</p>
        </div>
      </div>
      
      <p className="text-neutral-300 text-sm mb-6 leading-relaxed">
        {t.forgeDesc || "Cetak token BEP-20 kustom Anda secara instan. Dilengkapi dengan mekanisme pembagian otomatis (Burn, Staking Reward, & Treasury DAO)."}
      </p>

      <form onSubmit={handleCreateToken} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">{t.forgeTokenNameLabel || "Nama Token"}</label>
          <input 
            type="text" 
            placeholder={t.forgeTokenNamePlaceholder || "Contoh: Aether Meme"} 
            value={tokenName} 
            onChange={(e) => setTokenName(e.target.value)} 
            required
            className="w-full p-3.5 bg-[#05030F] border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">{t.forgeTokenSymbolLabel || "Simbol Token"}</label>
          <input 
            type="text" 
            placeholder={t.forgeTokenSymbolPlaceholder || "Contoh: AMEME"} 
            value={tokenSymbol} 
            onChange={(e) => setTokenSymbol(e.target.value)} 
            required
            className="w-full p-3.5 bg-[#05030F] border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">{t.forgeSupplyLabel || "Total Suplai Awal"}</label>
          <input 
            type="number" 
            placeholder={t.forgeSupplyPlaceholder || "Contoh: 1000000"} 
            value={tokenSupply} 
            onChange={(e) => setTokenSupply(e.target.value)} 
            required
            className="w-full p-3.5 bg-[#05030F] border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div className="p-4 bg-cyan-950/20 border border-cyan-900/40 rounded-xl text-xs text-cyan-300 flex items-start space-x-2">
          <span className="text-base">ℹ️</span>
          <div>
            <span className="font-bold">{t.forgeFeeInfoTitle || "Informasi Biaya:"}</span> {(t.forgeFeeInfoDesc || "Pembuatan token akan memotong biaya sebesar {fee} AETH...").replace("{fee}", CREATION_FEE_AMOUNT)}
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
          {loading ? (t.forgeBtnProcessing || "Sedang Memproses Jaringan...") : (t.forgeBtnMint || "🚀 Cetak Token Sekarang")}
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