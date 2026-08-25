import React, { useState } from "react";
import { ethers } from "ethers";
import { useLanguage } from '@/context/LanguageContext';
import { CheckCircle, Copy, Check, PlusCircle } from 'lucide-react';

const FORGE_FACTORY_ABI = [
  "function createMyOwnToken(string name, string symbol, uint256 initialSupply) returns (address)"
];

const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

const CREATION_FEE_AMOUNT = "1000";

export default function AetherForgeComponent({ account, forgeFactoryAddress, aethTokenAddress, showToast }) {
  const { t: globalT } = useLanguage();
  const t = globalT.dashboard || {};

  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenSupply, setTokenSupply] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  
  const [newTokenDetails, setNewTokenDetails] = useState(null);
  const [copied, setCopied] = useState(false);

  async function handleCreateToken(e) {
    e.preventDefault();
    if (!account) return showToast ? showToast(t.forgeAlertConnect || "Koneksikan wallet terlebih dahulu!", "error") : alert(t.forgeAlertConnect || "Koneksikan wallet terlebih dahulu!");

    try {
      setLoading(true);
      setNewTokenDetails(null);
      setStatusMsg((t.forgeMsgApprove || "Meminta persetujuan (Approve) {fee} AETH...").replace("{fee}", CREATION_FEE_AMOUNT));

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const aethContract = new ethers.Contract(aethTokenAddress, ERC20_ABI, signer);
      const feeAmount = ethers.parseEther(CREATION_FEE_AMOUNT);
      
      const currentAllowance = await aethContract.allowance(account, forgeFactoryAddress);
      if (currentAllowance < feeAmount) {
          const approveTx = await aethContract.approve(forgeFactoryAddress, feeAmount);
          await approveTx.wait();
      }

      setStatusMsg(t.forgeMsgApproveSuccess || "Approve sukses! Mencetak token kustom baru...");

      const forgeContract = new ethers.Contract(forgeFactoryAddress, FORGE_FACTORY_ABI, signer);
      
      // 🌟 PERBAIKAN: Kirim angka mentah (BigInt), tidak pakai parseEther lagi karena kontrak sudah mengalikannya dengan desimal
      const createTx = await forgeContract.createMyOwnToken(
        tokenName,
        tokenSymbol,
        BigInt(tokenSupply || "0")
      );
      
      const receipt = await createTx.wait();

      const transferSignature = ethers.id("Transfer(address,address,uint256)");
      let deployedAddress = "";
      
      for (const log of receipt.logs) {
        if (log.topics[0] === transferSignature) {
          deployedAddress = log.address;
          break;
        }
      }

      setLoading(false);
      const successMsg = t.forgeMsgMintSuccess || "🎉 Sukses! Token kustom berhasil dicetak.";
      setStatusMsg(successMsg);
      if(showToast) showToast(successMsg, "success");
      
      setNewTokenDetails({
        name: tokenName,
        symbol: tokenSymbol,
        address: deployedAddress || (t.forgeSuccessNoAddress || "Alamat tidak ditemukan (Cek BscScan)")
      });

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

  const addTokenToMetaMask = async () => {
    if (!newTokenDetails || !newTokenDetails.address || !window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: newTokenDetails.address,
            symbol: newTokenDetails.symbol,
            decimals: 18, 
          },
        },
      });
    } catch (error) {
      console.error("Gagal menambahkan ke MetaMask", error);
    }
  };

  const copyToClipboard = () => {
    if(newTokenDetails?.address) {
      navigator.clipboard.writeText(newTokenDetails.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

      {newTokenDetails && (
        <div className="mb-6 p-5 bg-gradient-to-br from-green-950/40 to-cyan-950/40 border border-green-500/40 rounded-2xl animate-in fade-in zoom-in duration-300 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-bold text-green-300">{t.forgeSuccessCardTitle || "Token Berhasil Tercipta!"}</h3>
          </div>
          
          <div className="space-y-3 bg-black/40 p-4 rounded-xl border border-green-500/20">
            <div>
              <p className="text-[10px] text-green-400/70 font-mono uppercase">{t.forgeSuccessTokenName || "Nama Token"}</p>
              <p className="font-bold text-white text-sm">{newTokenDetails.name} ({newTokenDetails.symbol})</p>
            </div>
            <div>
              <p className="text-[10px] text-green-400/70 font-mono uppercase mb-1">{t.forgeSuccessContractAddr || "Contract Address Baru"}</p>
              <div className="flex items-center justify-between bg-[#0B0817] p-2.5 rounded-lg border border-neutral-800">
                <span className="text-xs text-cyan-300 font-mono truncate mr-3">{newTokenDetails.address}</span>
                <button 
                  onClick={copyToClipboard}
                  className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-md text-neutral-400 hover:text-white transition-colors"
                  title="Copy Address"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={addTokenToMetaMask}
            className="w-full mt-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <PlusCircle className="w-4 h-4" /> {t.forgeAddMetaMaskBtn || "Tambahkan ke MetaMask"} 🦊
          </button>
        </div>
      )}

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