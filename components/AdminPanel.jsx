"use client";
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ShieldAlert, AlertTriangle, Lock, Unlock, Coins, Droplet, PauseCircle, PlayCircle, Save, Loader2 } from 'lucide-react';

import AetherVaultV3Artifact from '@/contracts/AetherVaultV3ABI.json';
import StakingArtifact from '@/contracts/StakingABI.json';
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

const AetherVaultV3ABI = resolveAbi(AetherVaultV3Artifact);
const StakingABI = resolveAbi(StakingArtifact);
const TeamVestingABI = resolveAbi(TeamVestingArtifact);

// ABI khusus Faucet
const FAUCET_ADMIN_ABI = [
  "function setClaimAmount(uint256 _amount) external",
  "function pause() external",
  "function unpause() external",
  "function paused() view returns (bool)",
  "function claimAmount() view returns (uint256)"
];

export default function AdminPanel({
  isOwner,
  walletProvider,
  showToast,
  extractErrorMessage,
  AETH_TOKEN_ADDRESS,
  CONTRACT_ADDRESS,
  STAKING_CONTRACT_ADDRESS,
  VESTING_CONTRACT_ADDRESS,
  FAUCET_ADDRESS, // 👈 Props baru Faucet Address
  t 
}) {
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [newTreasuryInput, setNewTreasuryInput] = useState('');

  // State khusus Faucet
  const [isFaucetPaused, setIsFaucetPaused] = useState(false);
  const [currentClaimAmount, setCurrentClaimAmount] = useState('0');
  const [newClaimAmount, setNewClaimAmount] = useState('');
  const [isFaucetLoading, setIsFaucetLoading] = useState(false);

  const CoreTokenABI = [
    "function pause() external",
    "function unpause() external",
    "function setTreasuryAddress(address _treasury) external"
  ];

  const getSigner = async () => {
    const provider = new ethers.BrowserProvider(walletProvider);
    return provider.getSigner();
  };

  // ================= FAUCET LOGIC =================
  const fetchFaucetStatus = async () => {
    if (!walletProvider || !FAUCET_ADDRESS) return;
    try {
      const provider = new ethers.BrowserProvider(walletProvider);
      const faucetContract = new ethers.Contract(FAUCET_ADDRESS, FAUCET_ADMIN_ABI, provider);
      const [pausedState, amount] = await Promise.all([
        faucetContract.paused(),
        faucetContract.claimAmount()
      ]);
      setIsFaucetPaused(pausedState);
      setCurrentClaimAmount(ethers.formatUnits(amount, 18));
    } catch (error) {
      console.error("Gagal load status Faucet:", error);
    }
  };

  useEffect(() => {
    if (isOwner) {
      fetchFaucetStatus();
    }
  }, [isOwner, FAUCET_ADDRESS, walletProvider]);

  const handleUpdateClaimAmount = async () => {
    if (!newClaimAmount || isNaN(newClaimAmount)) return showToast("Masukkan angka yang valid", "error");
    setIsFaucetLoading(true);
    try {
      const signer = await getSigner();
      const faucetContract = new ethers.Contract(FAUCET_ADDRESS, FAUCET_ADMIN_ABI, signer);
      
      const amountInWei = ethers.parseUnits(newClaimAmount.toString(), 18);
      const tx = await faucetContract.setClaimAmount(amountInWei);
      showToast("Mengubah jumlah klaim Faucet...", "info");
      await tx.wait();
      
      showToast("Jumlah klaim Faucet berhasil diubah!", "success");
      setNewClaimAmount('');
      await fetchFaucetStatus();
    } catch (error) {
      showToast("Gagal ubah Faucet: " + extractErrorMessage(error), "error");
    } finally {
      setIsFaucetLoading(false);
    }
  };

  const handleToggleFaucetPause = async () => {
    setIsFaucetLoading(true);
    try {
      const signer = await getSigner();
      const faucetContract = new ethers.Contract(FAUCET_ADDRESS, FAUCET_ADMIN_ABI, signer);
      
      const tx = isFaucetPaused ? await faucetContract.unpause() : await faucetContract.pause();
      showToast(isFaucetPaused ? "Mengaktifkan Faucet..." : "Menghentikan Faucet...", "info");
      await tx.wait();
      
      showToast(isFaucetPaused ? "Faucet kembali AKTIF!" : "Faucet berhasil di-PAUSE!", "success");
      await fetchFaucetStatus();
    } catch (error) {
      showToast("Gagal: " + extractErrorMessage(error), "error");
    } finally {
      setIsFaucetLoading(false);
    }
  };
  // ================= END FAUCET LOGIC =================

  const handleAdminTogglePause = async (isPause, targetType) => {
    try {
      setIsAdminLoading(true);
      const signer = await getSigner();
      
      let targetAddress;
      let abi;

      if (targetType === 'staking') {
        targetAddress = STAKING_CONTRACT_ADDRESS;
        abi = StakingABI;
      } else if (targetType === 'token') {
        targetAddress = AETH_TOKEN_ADDRESS;
        abi = CoreTokenABI;
      } else {
        targetAddress = CONTRACT_ADDRESS;
        abi = AetherVaultV3ABI;
      }

      const contract = new ethers.Contract(targetAddress, abi, signer);

      const tx = isPause ? await contract.pause() : await contract.unpause();
      showToast(t?.adminTxSending || "Sending emergency transaction...", "info");
      await tx.wait();
      showToast(isPause ? (t?.adminPauseSuccess || "Successfully PAUSED!") : (t?.adminUnpauseSuccess || "Successfully UNPAUSED!"), "success");
    } catch (err) {
      showToast((t?.adminPauseFail || "Failed to change pause status: ") + extractErrorMessage(err), "error");
    } finally {
      setIsAdminLoading(false);
    }
  };

  const handleAdminUpdateTreasury = async (e) => {
    e.preventDefault();
    if (!ethers.isAddress(newTreasuryInput)) return showToast(t?.invalidTreasuryAddress || "Invalid treasury address!", "error");
    try {
      setIsAdminLoading(true);
      const signer = await getSigner();
      const contract = new ethers.Contract(AETH_TOKEN_ADDRESS, CoreTokenABI, signer);
      const tx = await contract.setTreasuryAddress(newTreasuryInput);
      showToast(t?.adminTreasuryUpdating || "Updating treasury...", "info");
      await tx.wait();
      showToast(t?.adminTreasurySuccess || "Treasury successfully updated!", "success");
      setNewTreasuryInput('');
    } catch (err) {
      showToast((t?.adminTreasuryFail || "Failed to update treasury: ") + extractErrorMessage(err), "error");
    } finally {
      setIsAdminLoading(false);
    }
  };

  return (
    <div className="bg-[#0B0817] border border-neutral-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xl animate-in fade-in duration-300">
      <div className="flex items-center gap-3 border-b border-neutral-900 pb-4 mb-6">
        <ShieldAlert className="w-8 h-8 text-red-400 shrink-0" />
        <div>
          <h3 className="font-display text-lg sm:text-xl font-bold text-white uppercase tracking-wider">{t?.adminTitle || "MASTER ADMIN CONTROL PANEL"}</h3>
          <p className="text-xs text-neutral-400 font-mono">{t?.adminSubtitle || "Complete Management of the AetherVault Smart Contract Ecosystem"}</p>
        </div>
      </div>

      {!isOwner ? (
        <div className="bg-red-950/20 border border-red-500/30 p-6 rounded-2xl text-center space-y-2">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
          <h4 className="text-sm font-bold text-red-300">{t?.adminAccessDenied || "Access Denied"}</h4>
          <p className="text-xs text-neutral-400">{t?.adminNotOwner || "This panel is restricted to the contract owner."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* CARD 1: TOKEN INDUK */}
          <div className="bg-[#05030F] border border-neutral-800 p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-5 shadow-lg">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-400 uppercase font-mono mb-4">{t?.adminMainEmergency || "1. CORE TOKEN (AETHERVAULT)"}</h4>
              <form onSubmit={handleAdminUpdateTreasury} className="space-y-2">
                <label className="text-[10px] text-neutral-500">{t?.adminChangeTreasury || "Update Treasury Address"}</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder={t?.adminTreasuryPlaceholder || "0x..."}
                    value={newTreasuryInput}
                    onChange={(e) => setNewTreasuryInput(e.target.value)}
                    className="flex-1 bg-[#0B0817] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-mono"
                    required
                  />
                  <button 
                    type="submit" 
                    disabled={isAdminLoading}
                    className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md disabled:opacity-50"
                  >
                    {t?.adminUpdateTreasuryBtn || "Update"}
                  </button>
                </div>
              </form>
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                disabled={isAdminLoading}
                onClick={() => handleAdminTogglePause(true, 'token')} 
                className="flex-1 bg-red-900/20 hover:bg-red-900/30 border border-red-500/30 text-red-300 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" /> {t?.adminPauseMain || "Pause Token"}
              </button>
              <button 
                disabled={isAdminLoading}
                onClick={() => handleAdminTogglePause(false, 'token')} 
                className="flex-1 bg-green-900/20 hover:bg-green-900/30 border border-green-500/30 text-green-300 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Unlock className="w-3.5 h-3.5" /> {t?.adminUnpauseMain || "Unpause Token"}
              </button>
            </div>
          </div>

          {/* CARD 2: STAKING PROTOCOL */}
          <div className="bg-[#05030F] border border-neutral-800 p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-5 shadow-lg">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-indigo-400 uppercase font-mono mb-4">{t?.adminStakeEmergency || "2. STAKING PROTOCOL V6"}</h4>
              <div className="space-y-2">
                <label className="text-[10px] text-neutral-500">{t?.adminFundLabel || "Fund Reward Pool (AETH)"}</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder={t?.adminAmountPlaceholder || "AETH Amount"}
                    className="flex-1 bg-[#0B0817] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                  />
                  <button 
                    disabled={isAdminLoading}
                    onClick={() => showToast("Fund Pool feature coming soon!", "info")}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors whitespace-nowrap shadow-md disabled:opacity-50"
                  >
                    {t?.adminFundBtn || "Fund Pool"}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                disabled={isAdminLoading}
                onClick={() => handleAdminTogglePause(true, 'staking')} 
                className="flex-1 bg-red-900/20 hover:bg-red-900/30 border border-red-500/30 text-red-300 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" /> {t?.adminPauseStake || "Pause Staking"}
              </button>
              <button 
                disabled={isAdminLoading}
                onClick={() => handleAdminTogglePause(false, 'staking')} 
                className="flex-1 bg-green-900/20 hover:bg-green-900/30 border border-green-500/30 text-green-300 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Unlock className="w-3.5 h-3.5" /> {t?.adminUnpauseStake || "Unpause Staking"}
              </button>
            </div>
          </div>

          {/* CARD 3: VAULT V3 & PROOF REGISTRY */}
          <div className="bg-[#05030F] border border-neutral-800 p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-5 shadow-lg">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-cyan-400 uppercase font-mono mb-3">{t?.adminVaultEmergency || "3. VAULT V3 & PROOF REGISTRY"}</h4>
              <p className="text-[10px] sm:text-xs text-neutral-400 leading-relaxed">
                {t?.adminVaultDesc || "Tier configuration, placeholder URIs, and secure token recovery are available directly in the main contract."}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                disabled={isAdminLoading}
                onClick={() => handleAdminTogglePause(true, 'vault')} 
                className="flex-1 bg-red-900/20 hover:bg-red-900/30 border border-red-500/30 text-red-300 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" /> {t?.adminPauseVault || "Pause Vault"}
              </button>
              <button 
                disabled={isAdminLoading}
                onClick={() => handleAdminTogglePause(false, 'vault')} 
                className="flex-1 bg-green-900/20 hover:bg-green-900/30 border border-green-500/30 text-green-300 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Unlock className="w-3.5 h-3.5" /> {t?.adminUnpauseVault || "Unpause Vault"}
              </button>
            </div>
          </div>

          {/* CARD 4: FAUCET CONTROL (BARU) */}
          <div className="bg-[#05030F] border border-blue-500/30 p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-5 shadow-[0_0_15px_rgba(59,130,246,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-600/20 text-[8px] sm:text-[10px] font-bold px-3 py-1 rounded-bl-xl text-blue-400 uppercase tracking-widest border-b border-l border-blue-500/30">
              VIP Faucet
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-blue-400 uppercase font-mono mb-4 flex items-center gap-2">
                <Droplet className="w-4 h-4" /> 4. FAUCET V3 CONTROL
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-neutral-500">{t?.adminChangeClaim || "Change Claim Amount"}</label>
                  <span className="text-[10px] font-mono text-blue-300">Current: {currentClaimAmount} AETH</span>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder="E.g. 5000"
                    value={newClaimAmount}
                    onChange={(e) => setNewClaimAmount(e.target.value)}
                    className="flex-1 bg-[#0B0817] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 font-mono"
                  />
                  <button 
                    onClick={handleUpdateClaimAmount}
                    disabled={isFaucetLoading || !newClaimAmount}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isFaucetLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    {t?.adminSaveBtn || "Save"}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col pt-2 border-t border-neutral-900/50 mt-2 gap-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] text-neutral-400">Status Distribusi:</span>
                <span className={`text-[10px] font-bold font-mono ${isFaucetPaused ? 'text-red-400' : 'text-green-400'}`}>
                  {isFaucetPaused ? 'PAUSED 🔴' : 'ACTIVE 🟢'}
                </span>
              </div>
              <button 
                onClick={handleToggleFaucetPause}
                disabled={isFaucetLoading}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 border ${
                  isFaucetPaused 
                    ? 'bg-green-900/20 hover:bg-green-900/30 border-green-500/30 text-green-300' 
                    : 'bg-red-900/20 hover:bg-red-900/30 border-red-500/30 text-red-300'
                }`}
              >
                {isFaucetLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isFaucetPaused ? <PlayCircle className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
                {isFaucetPaused ? (t?.adminUnpauseFaucet || "Activate Faucet") : (t?.adminPauseFaucet || "Pause Faucet")}
              </button>
            </div>
          </div>
          {/* END CARD 4 */}

        </div>
      )}
    </div>
  );
}