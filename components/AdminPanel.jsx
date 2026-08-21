"use client";
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { ShieldAlert, AlertTriangle, Lock, Unlock, Coins } from 'lucide-react';

export default function AdminPanel({
  isOwner,
  walletProvider,
  showToast,
  extractErrorMessage,
  CONTRACT_ADDRESS,
  STAKING_CONTRACT_ADDRESS,
  VESTING_CONTRACT_ADDRESS,
  AetherVaultV3ABI,
  StakingABI,
  TeamVestingABI,
  t // Menerima kamus terjemahan dari Dashboard
}) {
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [newTreasuryInput, setNewTreasuryInput] = useState('');

  const getSigner = async () => {
    const provider = new ethers.BrowserProvider(walletProvider);
    return provider.getSigner();
  };

  const handleAdminTogglePause = async (isPause, isStakingTarget = false) => {
    try {
      setIsAdminLoading(true);
      const signer = await getSigner();
      const targetAddress = isStakingTarget ? STAKING_CONTRACT_ADDRESS : CONTRACT_ADDRESS;
      const abi = isStakingTarget ? StakingABI : AetherVaultV3ABI;
      const contract = new ethers.Contract(targetAddress, abi, signer);

      const tx = isPause ? await contract.pause() : await contract.unpause();
      showToast(t.adminTxSending || "Sending emergency transaction...", "info");
      await tx.wait();
      showToast(isPause ? (t.adminPauseSuccess || "Successfully PAUSED!") : (t.adminUnpauseSuccess || "Successfully UNPAUSED!"), "success");
    } catch (err) {
      showToast((t.adminPauseFail || "Failed to change pause status: ") + extractErrorMessage(err), "error");
    } finally {
      setIsAdminLoading(false);
    }
  };

  const handleAdminUpdateTreasury = async (e) => {
    e.preventDefault();
    if (!ethers.isAddress(newTreasuryInput)) return showToast(t.invalidTreasuryAddress || "Invalid treasury address!", "error");
    try {
      setIsAdminLoading(true);
      const signer = await getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultV3ABI, signer);
      const tx = await contract.setTreasuryAddress(newTreasuryInput);
      showToast(t.adminTreasuryUpdating || "Updating treasury...", "info");
      await tx.wait();
      showToast(t.adminTreasurySuccess || "Treasury successfully updated!", "success");
      setNewTreasuryInput('');
    } catch (err) {
      showToast((t.adminTreasuryFail || "Failed to update treasury: ") + extractErrorMessage(err), "error");
    } finally {
      setIsAdminLoading(false);
    }
  };

  const handleAdminClaimVesting = async () => {
    const confirmed = window.confirm(t.adminConfirmVestingClaim || "Are you sure you want to claim the Developer Vesting tokens now?");
    if (!confirmed) return;
    
    try {
      setIsAdminLoading(true);
      const signer = await getSigner();
      const vestingContract = new ethers.Contract(VESTING_CONTRACT_ADDRESS, TeamVestingABI, signer);
      
      showToast(t.adminVestingClaiming || "Processing developer token release...", "info");
      const tx = await vestingContract.claim(); 
      await tx.wait();
      showToast(t.adminVestingSuccess || "Success! Developer funds have been transferred to the wallet!", "success");
    } catch (err) {
      console.error("Vesting Error Details:", err);
      let errorMessage = "Unknown error occurred";
      if (err && typeof err === 'object') {
        try { errorMessage = extractErrorMessage(err); } catch(e) { errorMessage = err.message || "Execution reverted"; }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      showToast((t.adminVestingFail || "Failed to claim vesting: ") + errorMessage, "error");
    } finally {
      setIsAdminLoading(false);
    }
  };

  return (
    <div className="bg-[#0B0817] border border-neutral-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xl animate-in fade-in duration-300">
      <div className="flex items-center gap-3 border-b border-neutral-900 pb-4 mb-6">
        <ShieldAlert className="w-8 h-8 text-red-400 shrink-0" />
        <div>
          <h3 className="font-display text-lg sm:text-xl font-bold text-white uppercase tracking-wider">{t.adminTitle || "MASTER ADMIN CONTROL PANEL"}</h3>
          <p className="text-xs text-neutral-400 font-mono">{t.adminSubtitle || "Complete Management of the AetherVault Smart Contract Ecosystem"}</p>
        </div>
      </div>

      {!isOwner ? (
        <div className="bg-red-950/20 border border-red-500/30 p-6 rounded-2xl text-center space-y-2">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
          <h4 className="text-sm font-bold text-red-300">{t.adminAccessDenied || "Access Denied"}</h4>
          <p className="text-xs text-neutral-400">{t.adminNotOwner || "This panel is restricted to the contract owner."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* CARD 1: TOKEN INDUK */}
          <div className="bg-[#05030F] border border-neutral-800 p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-5 shadow-lg">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-400 uppercase font-mono mb-4">{t.adminMainEmergency || "1. CORE TOKEN (AETHERVAULT)"}</h4>
              <form onSubmit={handleAdminUpdateTreasury} className="space-y-2">
                <label className="text-[10px] text-neutral-500">{t.adminChangeTreasury || "Update Treasury Address"}</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder={t.adminTreasuryPlaceholder || "0x..."}
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
                    {t.adminUpdateTreasuryBtn || "Update"}
                  </button>
                </div>
              </form>
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                disabled={isAdminLoading}
                onClick={() => handleAdminTogglePause(true, false)} 
                className="flex-1 bg-red-900/20 hover:bg-red-900/30 border border-red-500/30 text-red-300 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" /> {t.adminPauseMain || "Pause Token"}
              </button>
              <button 
                disabled={isAdminLoading}
                onClick={() => handleAdminTogglePause(false, false)} 
                className="flex-1 bg-green-900/20 hover:bg-green-900/30 border border-green-500/30 text-green-300 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Unlock className="w-3.5 h-3.5" /> {t.adminUnpauseMain || "Unpause Token"}
              </button>
            </div>
          </div>

          {/* CARD 2: STAKING PROTOCOL */}
          <div className="bg-[#05030F] border border-neutral-800 p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-5 shadow-lg">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-indigo-400 uppercase font-mono mb-4">{t.adminStakeEmergency || "2. STAKING PROTOCOL V6"}</h4>
              <div className="space-y-2">
                <label className="text-[10px] text-neutral-500">{t.adminFundLabel || "Fund Reward Pool (AETH)"}</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder={t.adminAmountPlaceholder || "AETH Amount"}
                    className="flex-1 bg-[#0B0817] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                  />
                  <button 
                    disabled={isAdminLoading}
                    onClick={() => showToast("Fund Pool feature coming soon!", "info")}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors whitespace-nowrap shadow-md disabled:opacity-50"
                  >
                    {t.adminFundBtn || "Fund Pool"}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                disabled={isAdminLoading}
                onClick={() => handleAdminTogglePause(true, true)} 
                className="flex-1 bg-red-900/20 hover:bg-red-900/30 border border-red-500/30 text-red-300 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" /> {t.adminPauseStake || "Pause Staking"}
              </button>
              <button 
                disabled={isAdminLoading}
                onClick={() => handleAdminTogglePause(false, true)} 
                className="flex-1 bg-green-900/20 hover:bg-green-900/30 border border-green-500/30 text-green-300 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Unlock className="w-3.5 h-3.5" /> {t.adminUnpauseStake || "Unpause Staking"}
              </button>
            </div>
          </div>

          {/* CARD 3: VAULT V3 & PROOF REGISTRY */}
          <div className="bg-[#05030F] border border-neutral-800 p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-5 shadow-lg">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-cyan-400 uppercase font-mono mb-3">{t.adminVaultEmergency || "3. VAULT V3 & PROOF REGISTRY"}</h4>
              <p className="text-[10px] sm:text-xs text-neutral-400 leading-relaxed">
                {t.adminVaultDesc || "Tier configuration, placeholder URIs, and secure token recovery are available directly in the main contract."}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                disabled={isAdminLoading}
                onClick={() => handleAdminTogglePause(true, false)} 
                className="flex-1 bg-red-900/20 hover:bg-red-900/30 border border-red-500/30 text-red-300 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" /> {t.adminPauseVault || "Pause Vault"}
              </button>
              <button 
                disabled={isAdminLoading}
                onClick={() => handleAdminTogglePause(false, false)} 
                className="flex-1 bg-green-900/20 hover:bg-green-900/30 border border-green-500/30 text-green-300 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Unlock className="w-3.5 h-3.5" /> {t.adminUnpauseVault || "Unpause Vault"}
              </button>
            </div>
          </div>

          {/* CARD 4: TEAM VESTING */}
          <div className="bg-[#05030F] border border-neutral-800 p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-5 shadow-lg">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-green-400 uppercase font-mono mb-3">{t.adminVestingTitle || "4. TEAM VESTING (DEVELOPER FUNDS)"}</h4>
              <p className="text-[10px] sm:text-xs text-neutral-400 leading-relaxed">
                {t.adminVestingDesc || "Developer token release based on a linear schedule with a 6-month cliff."}
              </p>
            </div>
            <div className="pt-2">
              <button 
                disabled={isAdminLoading}
                onClick={handleAdminClaimVesting} 
                className="w-full bg-green-900/20 hover:bg-green-900/30 border border-green-500/30 text-green-300 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md disabled:opacity-50"
              >
                <Coins className="w-4 h-4" /> {t.adminClaimSalaryBtn || "Claim Salary (Vesting)"}
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}