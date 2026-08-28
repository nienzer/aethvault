"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Droplet, Timer, Gift, Loader2, ShieldCheck, Wallet, ArrowRight } from 'lucide-react';

// ABI Minimal untuk berinteraksi dengan Faucet V3
const FAUCET_ABI = [
  "function claim() external",
  "function claimAmount() view returns (uint256)",
  "function cooldownTime() view returns (uint256)",
  "function lastClaimTime(address) view returns (uint256)",
  "function paused() view returns (bool)"
];

export default function AethVaultFaucet({ account, walletProvider, faucetAddress, showToast, TARGET_CHAIN_NAME }) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimAmount, setClaimAmount] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [lastClaim, setLastClaim] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const fetchFaucetData = useCallback(async () => {
    if (!walletProvider || !faucetAddress) return;
    try {
      const provider = new ethers.BrowserProvider(walletProvider);
      const contract = new ethers.Contract(faucetAddress, FAUCET_ABI, provider);
      
      const [amount, cd, last, pausedState] = await Promise.all([
        contract.claimAmount(),
        contract.cooldownTime(),
        contract.lastClaimTime(account),
        contract.paused()
      ]);

      setClaimAmount(parseFloat(ethers.formatUnits(amount, 18)));
      setCooldown(Number(cd));
      setLastClaim(Number(last));
      setIsPaused(pausedState);
    } catch (error) {
      console.error("Gagal memuat data Faucet:", error);
    }
  }, [walletProvider, faucetAddress, account]);

  useEffect(() => {
    fetchFaucetData();
  }, [fetchFaucetData]);

  // Timer hitung mundur untuk cooldown
  useEffect(() => {
    if (lastClaim === 0 || cooldown === 0) return;
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const targetTime = lastClaim + cooldown;
      if (now >= targetTime) {
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(targetTime - now);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastClaim, cooldown]);

  const handleClaim = async () => {
    if (!account) return showToast("Hubungkan dompet terlebih dahulu", "error");
    if (isPaused) return showToast("Faucet sedang dihentikan sementara (Paused)", "error");
    if (timeLeft > 0) return showToast("Anda masih dalam masa cooldown!", "error");

    setIsClaiming(true);
    try {
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(faucetAddress, FAUCET_ABI, signer);

      showToast("Memproses klaim token...", "info");
      const tx = await contract.claim();
      await tx.wait();

      showToast(`Berhasil! ${claimAmount} AETH telah dikirim ke dompet Anda.`, "success");
      await fetchFaucetData();
    } catch (error) {
      showToast("Gagal klaim: " + (error.reason || error.message || "Transaksi ditolak"), "error");
    } finally {
      setIsClaiming(false);
    }
  };

  const formatTime = (seconds) => {
    if (seconds <= 0) return "Ready to Claim";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="bg-[#0B0817] border border-neutral-900 p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-display text-lg sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Droplet className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            </div>
            Jury & Reviewer Faucet
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-lg">
            Klaim token uji coba (AETH) secara gratis untuk menguji fitur pintar AetherVault di ekosistem {TARGET_CHAIN_NAME}. Dilengkapi dengan sistem anti-Sybil.
          </p>
        </div>
        <div className="bg-[#05030F] border border-blue-500/30 px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
          <Gift className="w-5 h-5 text-blue-400" />
          <div className="flex flex-col">
            <span className="text-[9px] text-neutral-400 uppercase tracking-widest">Alokasi per Dompet</span>
            <span className="text-sm font-bold text-white font-mono">{claimAmount} AETH</span>
          </div>
        </div>
      </div>

      {/* Main Action Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Status Box */}
        <div className="bg-[#05030F] border border-neutral-800 p-5 sm:p-6 rounded-xl sm:rounded-2xl space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <span className="text-xs font-bold text-neutral-300">Status Keamanan</span>
          </div>
          
          <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
            <span className="text-xs text-neutral-500">Alamat Dompet</span>
            <span className="text-xs font-mono text-cyan-300 flex items-center gap-1.5">
              <Wallet className="w-3 h-3" />
              {account ? `${account.substring(0,6)}...${account.substring(account.length-4)}` : 'Belum Terhubung'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-neutral-500">Waktu Tunggu (Cooldown)</span>
            <span className={`text-xs font-mono font-bold flex items-center gap-1.5 ${timeLeft > 0 ? 'text-amber-400' : 'text-green-400'}`}>
              <Timer className="w-3 h-3" />
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Claim Button Area */}
        <div className="bg-[#05030F] border border-neutral-800 p-5 sm:p-6 rounded-xl sm:rounded-2xl flex flex-col justify-center items-center text-center">
          {isPaused ? (
            <div className="text-red-400 font-bold text-sm bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20 w-full">
              Faucet Sedang Dinonaktifkan (Paused)
            </div>
          ) : (
            <>
              <button
                onClick={handleClaim}
                disabled={isClaiming || timeLeft > 0 || !account}
                className={`w-full py-3.5 sm:py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all shadow-lg outline-none
                  ${(!account || timeLeft > 0 || isClaiming) 
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700' 
                    : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white border border-cyan-400/50 shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)] cursor-pointer'
                  }`}
              >
                {isClaiming ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Memproses Transaksi...</>
                ) : timeLeft > 0 ? (
                  <><Timer className="w-4 h-4" /> Cooldown Aktif</>
                ) : (
                  <>Klaim {claimAmount} AETH <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
              <p className="text-[10px] text-neutral-500 mt-4">
                *Dibutuhkan sedikit tBNB untuk membayar biaya gas transaksi.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}