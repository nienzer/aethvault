"use client";
import React, { useState } from 'react';
import { ShieldAlert, Lock, Unlock, Coins, Database, RefreshCw, AlertTriangle } from 'lucide-react';
import { ethers } from 'ethers';
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';

// Import ABI seluruh kontrak
import AetherVaultABI from '@/contracts/AetherVaultABI.json';
import AetherVaultV3ABI from '@/contracts/AetherVaultV3ABI.json';
import StakingABI from '@/contracts/StakingABI.json';
import TeamVestingABI from '@/contracts/TeamVestingABI.json';

const AETH_TOKEN_ADDRESS = "0x71C387117FA0DaD965B7F587081338395FEA2E4a"; 
const CONTRACT_ADDRESS = "0x8C315f5F2364139436fc126cBAe397718bd0f3BE"; 
const STAKING_CONTRACT_ADDRESS = "0x2B5556e9d885aAAB4C2AFA0870D35Eb539d8a257"; 
const VESTING_CONTRACT_ADDRESS = "0xbaa33196cDADC93be1f48B356325eFEa8860387E";

export default function AdminPage() {
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Input States
  const [newTreasury, setNewTreasury] = useState('');
  const [stakingFundAmount, setStakingFundAmount] = useState('');
  const [tierIdInput, setTierIdInput] = useState('0');
  const [newApyInput, setNewApyInput] = useState('');
  const [newLockDaysInput, setNewLockDaysInput] = useState('');

  const getSigner = async () => {
    const provider = new ethers.BrowserProvider(walletProvider);
    return provider.getSigner();
  };

  const executeTx = async (actionName, contractAddress, abi, method, ...args) => {
    try {
      setIsLoading(true);
      setStatusMsg(`Memproses ${actionName}...`);
      const signer = await getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      
      const tx = await contract[method](...args);
      setStatusMsg(`Transaksi dikirim. Menunggu konfirmasi...`);
      await tx.wait();
      
      setStatusMsg(`${actionName} Berhasil!`);
      alert(`${actionName} Sukses!`);
    } catch (err) {
      console.error(err);
      setStatusMsg(`Gagal: ${err.reason || err.message}`);
      alert(`Gagal: ${err.reason || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05030F] text-white p-6 sm:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex items-center gap-4 border-b border-neutral-800 pb-6">
          <ShieldAlert className="w-10 h-10 text-red-400" />
          <div>
            <h1 className="text-2xl font-black font-display uppercase tracking-wider">Master Admin Control Panel</h1>
            <p className="text-xs text-neutral-400 font-mono">Manajemen Penuh Seluruh Smart Contract AetherVault Ecosystem</p>
          </div>
        </div>

        {statusMsg && (
          <div className="bg-cyan-950/40 border border-cyan-500/40 p-4 rounded-2xl text-cyan-300 text-xs font-mono">
            {statusMsg}
          </div>
        )}

        {!isConnected ? (
          <div className="text-center py-20 text-neutral-500 text-sm">Hubungkan dompet Admin Anda terlebih dahulu.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. KONTROL TOKEN INDUK (AetherVault.sol) */}
            <div className="bg-[#0B0817] border border-neutral-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <h2 className="text-xs font-bold text-yellow-400 uppercase font-mono tracking-widest">1. Token Induk (AetherVault)</h2>
              
              <div className="space-y-2">
                <label className="text-[10px] text-neutral-400 font-mono">Ganti Alamat Treasury</label>
                <div className="flex gap-2">
                  <input 
                    type="text" placeholder="0x..." value={newTreasury} onChange={(e) => setNewTreasury(e.target.value)}
                    className="flex-1 bg-[#05030F] border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-yellow-500"
                  />
                  <button 
                    onClick={() => executeTx("Update Treasury", AETH_TOKEN_ADDRESS, AetherVaultABI, "updateTreasury", newTreasury)}
                    disabled={isLoading}
                    className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                  >
                    Update
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => executeTx("Pause Token", AETH_TOKEN_ADDRESS, AetherVaultABI, "pause")}
                  disabled={isLoading}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5"/> Pause Token
                </button>
                <button 
                  onClick={() => executeTx("Unpause Token", AETH_TOKEN_ADDRESS, AetherVaultABI, "unpause")}
                  disabled={isLoading}
                  className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/40 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5"/> Unpause Token
                </button>
              </div>
            </div>

            {/* 2. KONTROL STAKING (AetherVaultStakingSecureV6.sol) */}
            <div className="bg-[#0B0817] border border-neutral-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <h2 className="text-xs font-bold text-violet-400 uppercase font-mono tracking-widest">2. Staking Protocol V6</h2>
              
              <div className="space-y-2">
                <label className="text-[10px] text-neutral-400 font-mono">Fund Reward Pool (AETH)</label>
                <div className="flex gap-2">
                  <input 
                    type="number" placeholder="Jumlah AETH" value={stakingFundAmount} onChange={(e) => setStakingFundAmount(e.target.value)}
                    className="flex-1 bg-[#05030F] border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-violet-500"
                  />
                  <button 
                    onClick={() => executeTx("Fund Reward Pool", STAKING_CONTRACT_ADDRESS, StakingABI, "fundRewardPool", ethers.parseUnits(stakingFundAmount || "0", 18))}
                    disabled={isLoading}
                    className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                  >
                    Fund Pool
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => executeTx("Pause Staking", STAKING_CONTRACT_ADDRESS, StakingABI, "pause")}
                  disabled={isLoading}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5"/> Pause Staking
                </button>
                <button 
                  onClick={() => executeTx("Unpause Staking", STAKING_CONTRACT_ADDRESS, StakingABI, "unpause")}
                  disabled={isLoading}
                  className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/40 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5"/> Unpause Staking
                </button>
              </div>
            </div>

            {/* 3. KONTROL VAULT & PROOF (AetherVaultV3.sol) */}
            <div className="bg-[#0B0817] border border-neutral-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <h2 className="text-xs font-bold text-cyan-400 uppercase font-mono tracking-widest">3. Vault V3 & Proof Registry</h2>
              <p className="text-[11px] text-neutral-400">Pengaturan tier, placeholder URI, dan pemulihan token aman tersedia langsung di kontrak utama.</p>
              
              <div className="flex gap-2 pt-4">
                <button 
                  onClick={() => executeTx("Pause Vault", CONTRACT_ADDRESS, AetherVaultV3ABI, "pause")}
                  disabled={isLoading}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5"/> Pause Vault
                </button>
                <button 
                  onClick={() => executeTx("Unpause Vault", CONTRACT_ADDRESS, AetherVaultV3ABI, "unpause")}
                  disabled={isLoading}
                  className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/40 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5"/> Unpause Vault
                </button>
              </div>
            </div>

            {/* 4. KONTROL VESTING GAJI DEV (TeamVesting.sol) */}
            <div className="bg-[#0B0817] border border-neutral-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <h2 className="text-xs font-bold text-green-400 uppercase font-mono tracking-widest">4. Team Vesting (Gaji Developer)</h2>
              <p className="text-[11px] text-neutral-400">Pencairan jatah token dev berdasarkan jadwal linier dengan cliff 6 bulan.</p>
              
              <button 
                onClick={() => executeTx("Claim Vesting", VESTING_CONTRACT_ADDRESS, TeamVestingABI, "claim")}
                disabled={isLoading}
                className="w-full bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-300 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Coins className="w-4 h-4" /> Cairkan Gaji (Claim Vesting)
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}