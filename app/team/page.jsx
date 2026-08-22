"use client";
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import { Coins, Shield, Wallet, Loader2, AlertTriangle, Check } from 'lucide-react';
import TeamVestingArtifact from '@/contracts/TeamVestingABI.json';

const resolveAbi = (artifact) => {
  if (!artifact) return [];
  if (Array.isArray(artifact)) return artifact;
  if (artifact.abi && Array.isArray(artifact.abi)) return artifact.abi;
  if (artifact.default) {
    if (Array.isArray(artifact.default)) return artifact.default;
    if (artifact.default.abi && Array.isArray(artifact.default.abi)) return artifact.default.abi;
  }
  return [];
};

const TeamVestingABI = resolveAbi(TeamVestingArtifact);
const VESTING_CONTRACT_ADDRESS = "0x129FB084868DabACbdecd2712fB00D6C948a11F6";
const TARGET_CHAIN_ID = 97;

export default function TeamPortalPage() {
  const { open } = useWeb3Modal();
  const { address, isConnected, chainId } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  const extractErrorMessage = (err) => {
    if (err?.reason) return err.reason;
    if (err?.data?.message) return err.data.message.replace("execution reverted: ", "");
    return err?.message || "Transaction failed";
  };

  const handleClaimVesting = async () => {
    if (!isConnected) return showToast("Hubungkan dompet tim terlebih dahulu", "error");
    if (Number(chainId) !== TARGET_CHAIN_ID) return showToast("Harap pindah ke BSC Testnet", "error");

    const confirmed = window.confirm("Yakin ingin mencairkan token Vesting developer sekarang?");
    if (!confirmed) return;
    
    setIsLoading(true);
    try {
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const vestingContract = new ethers.Contract(VESTING_CONTRACT_ADDRESS, TeamVestingABI, signer);
      
      showToast("Memproses pencairan token developer...", "info");
      const tx = await vestingContract.claim(); 
      await tx.wait();
      showToast("Sukses! Dana developer telah ditransfer ke dompet Anda!", "success");
    } catch (err) {
      showToast("Gagal claim vesting: " + extractErrorMessage(err), "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05030F] text-gray-200 flex flex-col items-center justify-center p-6 font-sans">
      {toast && (
        <div className="fixed top-8 right-8 z-[100] animate-in fade-in">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border ${toast.type === 'success' ? 'bg-green-950/90 border-green-500/40 text-green-300' : toast.type === 'error' ? 'bg-red-950/90 border-red-500/40 text-red-300' : 'bg-[#0B0817] border-violet-500/40 text-cyan-300'}`}>
            {toast.type === 'success' ? <Check className="w-5 h-5 text-green-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
            <p className="text-sm font-medium">{toast.msg}</p>
          </div>
        </div>
      )}

      <div className="max-w-md w-full bg-[#0B0817] border border-neutral-900 rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-neutral-900 pb-4">
          <Shield className="w-8 h-8 text-cyan-400 shrink-0" />
          <div>
            <h1 className="text-lg font-bold text-white font-display">TEAM VESTING PORTAL</h1>
            <p className="text-xs text-neutral-400 font-mono">Restricted Access — Authorized Team Only</p>
          </div>
        </div>

        {!isConnected ? (
          <button
            onClick={() => open()}
            className="w-full bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm cursor-pointer shadow-lg"
          >
            <Wallet className="w-4 h-4" /> Hubungkan Dompet Tim
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#05030F] border border-neutral-800 p-4 rounded-2xl">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Connected Wallet</span>
              <p className="text-xs font-mono text-cyan-400 truncate mt-0.5">{address}</p>
            </div>

            <button
              disabled={isLoading}
              onClick={handleClaimVesting}
              className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />}
              Klaim Gaji (Team Vesting)
            </button>
          </div>
        )}

        <div className="text-center pt-2">
          <a href="/" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">← Kembali ke Beranda Utama</a>
        </div>
      </div>
    </div>
  );
}