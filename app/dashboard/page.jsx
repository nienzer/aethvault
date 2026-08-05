"use client";
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider, useDisconnect } from '@web3modal/ethers/react';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Lock, Clock, Shield, Wallet, LogOut, Layers, Eye, Sparkles, Flame, Check, Bell, Activity, History, Landmark, Cpu, Coins, Settings, UserX, AlertTriangle, UploadCloud, FileImage, X, ArrowUpRight, Menu, KeyRound, Loader2, Download, Award, Fingerprint, Database, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import { useLanguage } from '@/context/LanguageContext';
import {
  deriveIdentityKeyPair,
  assertCorrectNetwork,
  requestSwitchNetwork,
  publicKeyToBytes,
  encryptForPublicKey,
  decryptWithPrivateKey,
} from '@/lib/cryptoUtils';
import { uploadToArweavePermanent, estimateArweaveCost, getIrysUploader } from '@/lib/arweaveUpload';

// ⭐ IMPORT SEMUA KOMPONEN
import CertificateModal from '@/components/CertificateModal';
import StakingPanel from '@/components/StakingPanel';
import GlobalStats from '@/components/GlobalStats';
import VaultsList from '@/components/VaultsList';
import CreateCapsule from '@/components/CreateCapsule';
import AetherProofHub from '@/components/AetherProofHub';
import HallOfProof from '@/components/HallOfProof';

// ==========================================
// ⭐ ABI AETHERVAULT V2.2
// ==========================================
const AetherVaultABI = [
  { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "bytes", "name": "_pubKey", "type": "bytes" }], "name": "registerPublicKey", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "encryptionPublicKeys", "outputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }], "stateMutability": "view", "type": "function" },
  { "inputs": [ { "internalType": "enum AetherVault.Tier", "name": "_tier", "type": "uint8" }, { "internalType": "string", "name": "_title", "type": "string" }, { "internalType": "string", "name": "_encryptedMessage", "type": "string" }, { "internalType": "uint256", "name": "_unlockTimestamp", "type": "uint256" } ], "name": "sealTimeLockCapsule", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "string", "name": "_title", "type": "string" }, { "internalType": "string", "name": "_encryptedMessage", "type": "string" }, { "internalType": "uint256", "name": "_inactivityDuration", "type": "uint256" }, { "internalType": "address", "name": "_heirAddress", "type": "address" }], "name": "sealLegacyCapsule", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_capsuleIndex", "type": "uint256" }], "name": "pingAlive", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_capsuleIndex", "type": "uint256" }], "name": "revealCapsule", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_capsuleIndex", "type": "uint256" }], "name": "claimLegacy", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_capsuleIndex", "type": "uint256" }], "name": "getOpenedCiphertext", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_capsuleIndex", "type": "uint256" }], "name": "deleteOpenedContent", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_capsuleIndex", "type": "uint256" }], "name": "getCapsuleMeta", "outputs": [ { "internalType": "string", "name": "title", "type": "string" }, { "internalType": "uint256", "name": "unlockTimestamp", "type": "uint256" }, { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "enum AetherVault.Tier", "name": "tier", "type": "uint8" }, { "internalType": "bool", "name": "isLegacy", "type": "bool" }, { "internalType": "address", "name": "heirAddress", "type": "address" }, { "internalType": "uint256", "name": "lastPingAlive", "type": "uint256" }, { "internalType": "uint256", "name": "inactivityLimit", "type": "uint256" }, { "internalType": "bool", "name": "isClaimedOrRevealed", "type": "bool" }, { "internalType": "bool", "name": "contentDeleted", "type": "bool" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "getPlatformStats", "outputs": [ { "internalType": "uint256", "name": "totalCapsules", "type": "uint256" }, { "internalType": "uint256", "name": "burnedAeth", "type": "uint256" }, { "internalType": "uint256", "name": "users", "type": "uint256" }, { "internalType": "uint256", "name": "currentSupply", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_capsuleIndex", "type": "uint256" }], "name": "getCertificate", "outputs": [ { "internalType": "uint256", "name": "capsuleId", "type": "uint256" }, { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "enum AetherVault.Tier", "name": "tier", "type": "uint8" }, { "internalType": "bool", "name": "isLegacy", "type": "bool" }, { "internalType": "bytes32", "name": "proofHash", "type": "bytes32" }, { "internalType": "uint256", "name": "creationTimestamp", "type": "uint256" }, { "internalType": "uint256", "name": "blockNumber", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_capsuleIndex", "type": "uint256" }], "name": "isCapsuleReady", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }], "name": "getUserCapsules", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "_heir", "type": "address" }], "name": "getHeirCapsules", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "enum AetherVault.Tier", "name": "", "type": "uint8" }], "name": "tierConfigs", "outputs": [ { "internalType": "uint256", "name": "cost", "type": "uint256" }, { "internalType": "uint256", "name": "burnPart", "type": "uint256" }, { "internalType": "uint256", "name": "maxDuration", "type": "uint256" }, { "internalType": "uint256", "name": "maxMessageLength", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
  { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "capsuleId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": false, "internalType": "enum AetherVault.Tier", "name": "tier", "type": "uint8" }, { "indexed": false, "internalType": "uint256", "name": "cost", "type": "uint256" }, { "indexed": false, "internalType": "bytes32", "name": "proofHash", "type": "bytes32" } ], "name": "CapsuleSealed", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "capsuleId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "revealer", "type": "address" }], "name": "CapsuleRevealed", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "capsuleId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "heir", "type": "address" }], "name": "LegacyClaimed", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "capsuleId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "name": "PingRecorded", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "capsuleId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": false, "internalType": "bytes32", "name": "proofHash", "type": "bytes32" }], "name": "ProofCreated", "type": "event" }
];

// ==========================================
// ⭐ ABI STAKING V2
// ==========================================
const StakingABI = [
  { "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "stake", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "claimReward", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "stakedBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }], "name": "calculateReward", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "rewardRate", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "getStakingStats", "outputs": [ { "internalType": "uint256", "name": "currentTotalStaked", "type": "uint256" }, { "internalType": "uint256", "name": "totalRewardsPaid", "type": "uint256" }, { "internalType": "uint256", "name": "stakersCount", "type": "uint256" }, { "internalType": "uint256", "name": "rewardPoolAvailable", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Staked", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Withdrawn", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "reward", "type": "uint256" }], "name": "RewardClaimed", "type": "event" }
];

// ⭐ ALAMAT KONTRAK DIPISAH DENGAN JELAS
const AETH_TOKEN_ADDRESS = "0x8a3fb1F06e2381F1B4B0dfE5bC506d8f953C9BE9"; // Kontrak Token $AETH Lama (Penyimpan Saldo)[cite: 4]
const CONTRACT_ADDRESS = "0xb273Bdad4D9d0053657359F45d189561449aa56B"; // Kontrak Vault V3 Baru (Pencetak Sertifikat)
const STAKING_CONTRACT_ADDRESS = "0xc72433e176F2935965cbf595d6f30a70A89F702c"; 

const PLACEHOLDER_ADDRESS = "0x000000000000000000000000000000000000dEaD";
const IS_CONTRACT_ADDRESS_CONFIGURED = CONTRACT_ADDRESS.toLowerCase() !== PLACEHOLDER_ADDRESS.toLowerCase();
const IS_STAKING_ADDRESS_CONFIGURED = STAKING_CONTRACT_ADDRESS.toLowerCase() !== PLACEHOLDER_ADDRESS.toLowerCase();

const TARGET_CHAIN_ID = 80002;
const TARGET_CHAIN_ID_HEX = "0x" + TARGET_CHAIN_ID.toString(16);
const TARGET_CHAIN_NAME = "Polygon Amoy Testnet";

const TIER_ENUM_MAP = { basic: 0, premium: 1, eternal: 2, legacy: 3 };
const TIER_INDEX_TO_LABEL = { 0: 'Basic', 1: 'VIP', 2: 'Eternal', 3: 'Legacy' };
const READ_ONLY_RPC_URL = "https://polygon-amoy.g.alchemy.com/v2/alch_t_rxF7Xm42lFIqpP2ucAM";

const TIER_FALLBACK_CONFIG = {
  basic: { cost: 10, burn: 2, maxLength: 250, maxYears: 1 },
  premium: { cost: 50, burn: 10, maxLength: 1000, maxYears: 5 },
  eternal: { cost: 200, burn: 40, maxLength: 2000, maxYears: 100 },
  legacy: { cost: 500, burn: 100, maxLength: 2000, maxYears: 50 },
};

export default function DashboardPage() {
  const router = useRouter();
  const { t: globalT } = useLanguage();
  const t = globalT.dashboard;

  const { open } = useWeb3Modal();
  const { address, isConnected, chainId } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const { disconnect } = useDisconnect();

  const isWrongNetwork = isConnected && chainId !== undefined && Number(chainId) !== TARGET_CHAIN_ID;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [nativeBalance, setNativeBalance] = useState('0.0000');
  const [aethBalance, setAethBalance] = useState(0);
  const [activeTab, setActiveTab] = useState('create');

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [tier, setTier] = useState('premium');
  const [inactivityYears, setInactivityYears] = useState('5');
  const [heirAddress, setHeirAddress] = useState('');
  const [isSealing, setIsSealing] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedCid, setUploadedCid] = useState('');
  const [stagedUpload, setStagedUpload] = useState(null); 
  const [isPreparingUpload, setIsPreparingUpload] = useState(false);

  const [stakeInput, setStakeInput] = useState('');
  const [unstakeInput, setUnstakeInput] = useState('');
  const [stakedBalance, setStakedBalance] = useState(0);
  const [pendingReward, setPendingReward] = useState(0);
  const [isStaking, setIsStaking] = useState(false);
  const [isWithdrawingStake, setIsWithdrawingStake] = useState(false);
  const [apyPercent, setApyPercent] = useState(null);

  const [myPublicKeyRegistered, setMyPublicKeyRegistered] = useState(false);
  const [isRegisteringKey, setIsRegisteringKey] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

  const [toast, setToast] = useState(null);
  const [myCapsules, setMyCapsules] = useState([]);
  const [isLoadingCapsules, setIsLoadingCapsules] = useState(false);
  
  const [platformStats, setPlatformStats] = useState({ capsules: 0, burned: 0, users: 0, supply: 0 });
  const [stakingGlobalStats, setStakingGlobalStats] = useState({ totalStaked: 0, totalRewards: 0, stakers: 0 });
  const [isFetchingGlobalStats, setIsFetchingGlobalStats] = useState(true);

  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [transactions, setTransactions] = useState([]);
  
  const [tierConfigError, setTierConfigError] = useState(null);
  const [selectedVault, setSelectedVault] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null); 
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isDownloadingAttachment, setIsDownloadingAttachment] = useState(null);
  
  const myKeyPairRef = useRef(null);

  useEffect(() => {
    if (address) {
      myKeyPairRef.current = null;
    }
  }, [address]);

  const [onChainTierConfig, setOnChainTierConfig] = useState({});
  const [isTierConfigLoaded, setIsTierConfigLoaded] = useState(false);

  const fetchGlobalStats = useCallback(async () => {
    setIsFetchingGlobalStats(true);
    try {
      const provider = new ethers.JsonRpcProvider(READ_ONLY_RPC_URL);
      const vaultContract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultABI, provider);
      const stats = await vaultContract.getPlatformStats();
      setPlatformStats({
        capsules: Number(stats[0]),
        burned: parseFloat(ethers.formatUnits(stats[1], 18)),
        users: Number(stats[2]),
        supply: parseFloat(ethers.formatUnits(stats[3], 18))
      });

      if (IS_STAKING_ADDRESS_CONFIGURED) {
        const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingABI, provider);
        const sStats = await stakingContract.getStakingStats();
        setStakingGlobalStats({
          totalStaked: parseFloat(ethers.formatUnits(sStats[0], 18)),
          totalRewards: parseFloat(ethers.formatUnits(sStats[1], 18)),
          stakers: Number(sStats[2])
        });
      }
    } catch (err) {
      console.error("Gagal memuat statistik global:", err);
    } finally {
      setIsFetchingGlobalStats(false);
    }
  }, []);

  useEffect(() => {
    fetchGlobalStats();
  }, [fetchGlobalStats]);

  useEffect(() => {
    let cancelled = false;
    const fetchTierConfigs = async () => {
      try {
        setTierConfigError(null);
        const provider = walletProvider
          ? new ethers.BrowserProvider(walletProvider)
          : new ethers.JsonRpcProvider(READ_ONLY_RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultABI, provider);
        const results = await Promise.all([0, 1, 2, 3].map((idx) => contract.tierConfigs(idx)));
        if (cancelled) return;
        const parsed = {};
        results.forEach((r, idx) => {
          parsed[idx] = {
            cost: parseFloat(ethers.formatUnits(r.cost, 18)),
            burn: parseFloat(ethers.formatUnits(r.burnPart, 18)),
            maxDurationSeconds: Number(r.maxDuration),
            maxLength: Number(r.maxMessageLength),
          };
        });
        setOnChainTierConfig(parsed);
        setIsTierConfigLoaded(true);
      } catch (err) {
        if (!cancelled) {
          setTierConfigError(err?.message || 'Failed to load tier config');
          setIsTierConfigLoaded(true);
        }
      }
    };
    fetchTierConfigs();
    return () => { cancelled = true; };
  }, [walletProvider]);

  const tierDisplayMeta = {
    basic: { name: t.tiersList.basicName, desc: t.tiersList.basicDesc, icon: 'bg-neutral-800', color: 'text-gray-300', border: 'border-neutral-500 shadow-[0_0_15px_-3px_rgba(255,255,255,0.1)]' },
    premium: { name: t.tiersList.vipName, desc: t.tiersList.vipDesc, icon: 'bg-gradient-to-br from-cyan-500/20 to-violet-500/20', color: 'text-cyan-300', border: 'border-cyan-400/70 shadow-[0_0_25px_-4px_rgba(168,85,247,0.45),0_0_15px_-4px_rgba(34,211,238,0.4)]' },
    eternal: { name: t.tiersList.eternalName, desc: t.tiersList.eternalDesc, icon: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20', color: 'text-amber-300', border: 'border-amber-400/70 shadow-[0_0_25px_-4px_rgba(245,158,11,0.45),0_0_15px_-4px_rgba(251,146,60,0.35)]' },
    legacy: { name: t.tiersList.legacyName, desc: t.tiersList.legacyDesc, icon: 'bg-gradient-to-br from-fuchsia-500/20 to-rose-500/20', color: 'text-fuchsia-300', border: 'border-fuchsia-400/70 shadow-[0_0_25px_-4px_rgba(232,121,249,0.45),0_0_15px_-4px_rgba(244,63,94,0.35)]' },
  };

  const tiers = Object.keys(tierDisplayMeta).reduce((acc, key) => {
    const idx = TIER_ENUM_MAP[key];
    const onChain = onChainTierConfig[idx];
    const fallback = TIER_FALLBACK_CONFIG[key];
    acc[key] = {
      ...tierDisplayMeta[key],
      cost: onChain ? onChain.cost : fallback.cost,
      burn: onChain ? onChain.burn : fallback.burn,
      maxLength: onChain ? onChain.maxLength : fallback.maxLength,
      maxYears: onChain ? Math.floor(onChain.maxDurationSeconds / (365 * 24 * 60 * 60)) : fallback.maxYears,
    };
    return acc;
  }, {});

  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  }, []);

  const extractErrorMessage = useCallback((err) => {
    const errorString = err?.message?.toLowerCase() || "";
    if (err?.code === 4001 || errorString.includes("user rejected") || errorString.includes("denied")) {
      return t.errUserRejected || "Transaksi dibatalkan oleh pengguna.";
    }
    if (errorString.includes("insufficient funds") || errorString.includes("exceeds balance")) {
      return t.errInsufficientFunds || "Saldo tidak mencukupi.";
    }
    if (errorString.includes("network error") || errorString.includes("timeout") || errorString.includes("rpc")) {
      return t.errNetworkIssue || "Gangguan jaringan/RPC.";
    }
    if (err?.reason) { return `${t.errContractReverted || "Ditolak Jaringan:"} ${err.reason}`; }
    if (err?.data?.message) { return err.data.message.replace("execution reverted: ", ""); }
    return t.defaultTxErrorMessage || "Transaksi gagal. Cek saldo dan jaringan Anda.";
  }, [t]);

  const getSigner = async () => {
    const provider = new ethers.BrowserProvider(walletProvider);
    return provider.getSigner();
  };

  const ensureCorrectNetwork = async (signer) => {
    await assertCorrectNetwork(signer, TARGET_CHAIN_ID);
  };

  const handleSwitchNetwork = async () => {
    setIsSwitchingNetwork(true);
    try {
      await requestSwitchNetwork(walletProvider, TARGET_CHAIN_ID_HEX);
      showToast(t.errNetworkSwitchSuccess.replace('{chain}', TARGET_CHAIN_NAME), 'success');
    } catch (err) {
      showToast(t.errNetworkSwitchFailPrefix + extractErrorMessage(err), 'error');
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  const getOrDeriveKeyPair = useCallback(async () => {
    if (myKeyPairRef.current) return myKeyPairRef.current;
    const signer = await getSigner();
    await ensureCorrectNetwork(signer);
    const kp = await deriveIdentityKeyPair(signer, CONTRACT_ADDRESS);
    myKeyPairRef.current = kp;
    return kp;
  }, [walletProvider]);

  const tryDecryptTitle = async (encryptedTitle, privateKey) => {
    if (!privateKey || !encryptedTitle) return null;
    try {
      return await decryptWithPrivateKey(privateKey, encryptedTitle);
    } catch (err) {
      return null;
    }
  };

  const fetchCapsulesFromChain = useCallback(async (provider, userAddress, privateKeyForTitles) => {
    setIsLoadingCapsules(true);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultABI, provider);
      const [ownedIds, heirIds] = await Promise.all([
        contract.getUserCapsules(userAddress),
        contract.getHeirCapsules(userAddress),
      ]);
      const allIdsMap = new Map();
      ownedIds.forEach((id) => allIdsMap.set(id.toString(), { id, asHeir: false }));
      heirIds.forEach((id) => {
        const key = id.toString();
        if (!allIdsMap.has(key)) {
          allIdsMap.set(key, { id, asHeir: true });
        }
      });
      const allIds = Array.from(allIdsMap.values());
      const results = await Promise.all(
        allIds.map(async ({ id, asHeir }) => {
          const meta = await contract.getCapsuleMeta(id);
          const ready = await contract.isCapsuleReady(id);
          const decryptedTitle = await tryDecryptTitle(meta.title, privateKeyForTitles);
          return {
            id: id.toString(),
            title: decryptedTitle ?? t.lockedTitleFallback,
            titleIsLocked: decryptedTitle === null,
            unlockTimestamp: Number(meta.unlockTimestamp),
            owner: meta.owner,
            isLegacy: meta.isLegacy,
            heirAddress: meta.heirAddress,
            lastPingAlive: Number(meta.lastPingAlive),
            inactivityLimit: Number(meta.inactivityLimit),
            isClaimedOrRevealed: meta.isClaimedOrRevealed,
            contentDeleted: meta.contentDeleted,
            tierIndex: Number(meta.tier),
            isReady: ready,
            asHeir,
            tierLabel: TIER_INDEX_TO_LABEL[Number(meta.tier)] || (meta.isLegacy ? t.tierLabelLegacy : t.tierLabelTimeLock),
            status: meta.contentDeleted ? t.statusDeleted : meta.isClaimedOrRevealed ? t.statusOpened : ready ? t.statusReady : t.statusLocked,
          };
        })
      );
      results.sort((a, b) => Number(b.id) - Number(a.id));
      setMyCapsules(results);
    } catch (err) {
      console.error(t.consoleCapsuleFail, err);
    } finally {
      setIsLoadingCapsules(false);
    }
  }, [t]);

  const fetchOnChainHistory = useCallback(async (userAddress) => {
    setIsLoadingHistory(true);
    try {
      const provider = new ethers.JsonRpcProvider(READ_ONLY_RPC_URL);
      const vaultContract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultABI, provider);
      
      const DEPLOY_BLOCK_NUMBER = 43345845;
      const currentBlock = await provider.getBlockNumber();
      const startBlock = Math.max(DEPLOY_BLOCK_NUMBER, currentBlock - 50000);
      
      const [sealedEvents, revealedEvents, claimedEvents, pingEvents] = await Promise.all([
        vaultContract.queryFilter(vaultContract.filters.CapsuleSealed(null, userAddress), startBlock, "latest"),
        vaultContract.queryFilter(vaultContract.filters.CapsuleRevealed(null, userAddress), startBlock, "latest"),
        vaultContract.queryFilter(vaultContract.filters.LegacyClaimed(null, userAddress), startBlock, "latest"),
        vaultContract.queryFilter(vaultContract.filters.PingRecorded(null, userAddress), startBlock, "latest"),
      ]);

      const allLogs = [
        ...sealedEvents.map((e) => ({ e, kind: 'sealed' })),
        ...revealedEvents.map((e) => ({ e, kind: 'revealed' })),
        ...claimedEvents.map((e) => ({ e, kind: 'claimed' })),
        ...pingEvents.map((e) => ({ e, kind: 'ping' })),
      ];

      const uniqueBlockNumbers = [...new Set(allLogs.map(({ e }) => e.blockNumber))];
      const blockTimeCache = new Map();
      await Promise.all(
        uniqueBlockNumbers.map(async (blockNumber) => {
          const block = await provider.getBlock(blockNumber);
          blockTimeCache.set(blockNumber, block.timestamp);
        })
      );

      const formatDate = (unixSeconds) => new Date(unixSeconds * 1000).toLocaleString(t.dateLocale, {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });

      const built = allLogs.map(({ e, kind }) => {
        const timestamp = blockTimeCache.get(e.blockNumber);
        const date = formatDate(timestamp);
        const base = { id: `${kind}-${e.transactionHash}-${e.index ?? e.logIndex}`, date, timestamp, txHash: e.transactionHash };

        switch (kind) {
          case 'sealed': {
            const tierName = TIER_INDEX_TO_LABEL[Number(e.args[2])] || 'Kapsul';
            const costHuman = parseFloat(ethers.formatUnits(e.args[3], 18));
            return { ...base, type: t.txSealTitle.replace('{tier}', tierName), detail: t.txSealDetail.replace('{cost}', costHuman).replace('{id}', e.args[0]), amount: costHuman, direction: 'out', tierIdx: Number(e.args[2]) };
          }
          case 'revealed': return { ...base, type: t.txRevealTitle, detail: t.txRevealDetail.replace('{id}', e.args[0]), amount: 0, direction: 'neutral' };
          case 'claimed': return { ...base, type: t.txClaimTitle, detail: t.txClaimDetail.replace('{id}', e.args[0]), amount: 0, direction: 'neutral' };
          case 'ping': return { ...base, type: t.txPingTitle, detail: t.txPingDetail.replace('{id}', e.args[0]), amount: 0, direction: 'neutral' };
          default: return null;
        }
      });
      setTransactions(built.filter(Boolean).sort((a, b) => b.timestamp - a.timestamp));
    } catch (err) {
      console.error(t.consoleHistoryFail, err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [t]);

  const fetchWalletData = useCallback(async () => {
    if (isConnected && walletProvider && address) {
      try {
        const provider = new ethers.BrowserProvider(walletProvider);
        const rawBalance = await provider.getBalance(address);
        setNativeBalance(parseFloat(ethers.formatEther(rawBalance)).toFixed(4));
        try {
          // ⭐ SALDO AETH DIAMBIL DARI KONTRAK TOKEN LAMA
          const tokenContract = new ethers.Contract(AETH_TOKEN_ADDRESS, AetherVaultABI, provider);
          const rawAethBalance = await tokenContract.balanceOf(address);
          setAethBalance(parseFloat(ethers.formatUnits(rawAethBalance, 18)));
          const registeredKey = await tokenContract.encryptionPublicKeys(address);
          setMyPublicKeyRegistered(registeredKey && registeredKey !== '0x');
        } catch (err) { console.log(t.consoleAetherVaultFail, err); }
        
        try {
          if (STAKING_CONTRACT_ADDRESS) {
            const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingABI, provider);
            const [rawStaked, rawReward, rawRate] = await Promise.all([
              stakingContract.stakedBalance(address),
              stakingContract.calculateReward(address),
              stakingContract.rewardRate(),
            ]);
            setStakedBalance(parseFloat(ethers.formatUnits(rawStaked, 18)));
            setPendingReward(parseFloat(ethers.formatUnits(rawReward, 18)));
            setApyPercent(Number(rawRate) / 10);
          }
        } catch (stakingErr) {}
        
        let privateKeyForTitles = null;
        if (!isWrongNetwork) {
          try {
            const kp = await getOrDeriveKeyPair();
            privateKeyForTitles = kp.privateKey;
          } catch (keyErr) {}
        }
        
        await fetchCapsulesFromChain(provider, address, privateKeyForTitles);
        await fetchOnChainHistory(address);
      } catch (err) { console.error(t.consoleWalletFail, err); }
    } else {
      setNativeBalance('0.0000'); setAethBalance(0); setStakedBalance(0); setPendingReward(0);
      setMyCapsules([]); setTransactions([]); setMyPublicKeyRegistered(false);
      myKeyPairRef.current = null;
    }
  }, [isConnected, walletProvider, address, fetchCapsulesFromChain, fetchOnChainHistory, isWrongNetwork, getOrDeriveKeyPair, t]);

  useEffect(() => {
    fetchWalletData();
  }, [isConnected, address, isWrongNetwork]); 

  const formatAddress = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '';
  const getMinUnlockDatetimeLocal = () => {
    const d = new Date(Date.now() + 5 * 60 * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const formatUnlockDateTime = (unixSeconds) => {
    if (!unixSeconds) return '-';
    return new Date(unixSeconds * 1000).toLocaleString(t.dateLocale, {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const handleRegisterEncryptionKey = async () => {
    if (!isConnected) return showToast(t.connectWalletFirst, 'error');
    if (isWrongNetwork) return showToast(t.switchNetworkFirst.replace('{chain}', TARGET_CHAIN_NAME), 'error');
    setIsRegisteringKey(true);
    try {
      const { publicKey } = await getOrDeriveKeyPair();
      const signer = await getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultABI, signer);
      const tx = await contract.registerPublicKey(publicKeyToBytes(publicKey));
      showToast(t.registeringKey, 'info');
      await tx.wait();
      setMyPublicKeyRegistered(true);
      showToast(t.keyRegisteredSuccess, 'success');
    } catch (err) {
      showToast(t.keyRegisterFailPrefix + extractErrorMessage(err), 'error');
    } finally {
      setIsRegisteringKey(false);
    }
  };

  const isPermanentTier = tier === 'eternal' || tier === 'legacy';
  const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isConnected) return showToast(t.connectWalletBeforeAttach, 'error');
    if (isWrongNetwork) return showToast(t.switchNetworkFirst.replace('{chain}', TARGET_CHAIN_NAME), 'error');
    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) return showToast(t.fileTooLarge.replace('{size}', MAX_ATTACHMENT_SIZE_BYTES / (1024 * 1024)), 'error');

    setSelectedFile(file);
    setIsPreparingUpload(true);
    try {
      const { publicKey: recipientPublicKey } = await resolveRecipient();
      const fileBase64 = await fileToBase64(file);
      const cipherPayload = JSON.stringify({ name: file.name, type: file.type, data: fileBase64 });
      const encryptedPayload = await encryptForPublicKey(recipientPublicKey, cipherPayload);
      const encryptedBytes = new TextEncoder().encode(encryptedPayload);
      const provider = new ethers.BrowserProvider(walletProvider);
      await ensureCorrectNetwork(await provider.getSigner());
      const uploader = await getIrysUploader(provider);
      const estimatedCost = await estimateArweaveCost(uploader, encryptedBytes.byteLength);
      setStagedUpload({ file, encryptedBytes, estimatedCost });
    } catch (error) {
      showToast(t.prepareAttachmentFailPrefix + extractErrorMessage(error), "error");
      setSelectedFile(null);
    } finally {
      setIsPreparingUpload(false);
    }
  };

  const handleConfirmArweaveUpload = async () => {
    if (!stagedUpload) return;
    if (isWrongNetwork) return showToast(t.switchNetworkFirst.replace('{chain}', TARGET_CHAIN_NAME), 'error');
    setIsUploading(true);
    try {
      const result = await uploadToArweavePermanent(
        new ethers.BrowserProvider(walletProvider),
        stagedUpload.encryptedBytes,
        [{ name: "Encryption", value: "ECIES-secp256k1" }]
      );
      setUploadedCid(result.arweaveUrl);
      setMessage(prev => prev + (prev ? '\n\n' : '') + `[${t.attachmentTag || 'Attachment'}: ${result.arweaveUrl}]`);
      showToast(t.fileUploadedSuccess, "success");
      setStagedUpload(null);
    } catch (error) {
      showToast(t.fileUploadFailPrefix + extractErrorMessage(error), "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelStagedUpload = () => {
    setStagedUpload(null);
    setSelectedFile(null);
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const resolveRecipient = async () => {
    const provider = new ethers.BrowserProvider(walletProvider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultABI, provider);
    if (tier === 'legacy') {
      if (!ethers.isAddress(heirAddress)) throw new Error(t.enterValidHeirAddress);
      const heirKey = await contract.encryptionPublicKeys(heirAddress);
      if (!heirKey || heirKey === '0x') throw new Error(t.heirKeyNotRegistered);
      return { publicKey: heirKey, privateKey: null };
    }
    const kp = await getOrDeriveKeyPair();
    return { publicKey: publicKeyToBytes(kp.publicKey), privateKey: kp.privateKey };
  };

  const handleSeal = async (e) => {
    e.preventDefault();
    if (!isConnected) return showToast(t.authRejectedConnectWallet, 'error');
    if (isWrongNetwork) return showToast(t.switchNetworkFirst.replace('{chain}', TARGET_CHAIN_NAME), 'error');

    const selectedTierData = tiers[tier];
    const messageByteLength = new TextEncoder().encode(message).length;
    if (messageByteLength > selectedTierData.maxLength) return showToast(t.messageTooLong.replace('{max}', selectedTierData.maxLength), 'error');
    if (aethBalance < selectedTierData.cost) return showToast(t.insufficientBalance, 'error');
    if (tier === 'legacy' && !ethers.isAddress(heirAddress)) return showToast(t.invalidHeirAddress, 'error');

    setIsSealing(true);
    try {
      showToast(t.encryptingMessage, 'info');
      const { publicKey: recipientPublicKey } = await resolveRecipient();
      const encryptedMessage = await encryptForPublicKey(recipientPublicKey, message);

      if (encryptedMessage.length > selectedTierData.maxLength) throw new Error(t.messageCapacityExceeded);
      const plainTitle = title || t.defaultCapsuleTitle;
      const encryptedTitle = await encryptForPublicKey(recipientPublicKey, plainTitle);
      
      const signer = await getSigner();
      await ensureCorrectNetwork(signer);

      // ⭐ TAMBAHAN OTOMATIS APPROVE TOKEN $AETH KE KONTRAK VAULT V3
      const requiredCostWei = ethers.parseUnits(selectedTierData.cost.toString(), 18);
      const tokenContract = new ethers.Contract(AETH_TOKEN_ADDRESS, AetherVaultABI, signer);
      
      showToast("Memeriksa izin (Allowance) token $AETH...", "info");
      const currentAllowance = await tokenContract.allowance(address, CONTRACT_ADDRESS);

      if (currentAllowance < requiredCostWei) {
        showToast("Meminta persetujuan (Approve) pemotongan $AETH...", "info");
        const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, requiredCostWei);
        await approveTx.wait();
        showToast("Approve berhasil! Melanjutkan pembuatan kapsul...", "success");
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultABI, signer);
      showToast(t.preparingOnChainTx, 'info');

      let tx;
      if (tier === 'legacy') {
        const inactivitySeconds = parseInt(inactivityYears) * 365 * 24 * 60 * 60;
        tx = await contract.sealLegacyCapsule(encryptedTitle, encryptedMessage, inactivitySeconds, heirAddress);
      } else {
        if (!unlockDate) throw new Error(t.selectUnlockDateTime);
        const unlockTimeMs = new Date(unlockDate).getTime();
        const unlockTimestamp = Math.floor(unlockTimeMs / 1000);
        tx = await contract.sealTimeLockCapsule(TIER_ENUM_MAP[tier], encryptedTitle, encryptedMessage, unlockTimestamp);
      }
      showToast(t.txSentWaitingConfirm, "info");
      await tx.wait();
      showToast(t.sealSuccess, 'success');
      setTitle(''); setMessage(''); setUnlockDate(''); setHeirAddress('');
      setSelectedFile(null); setUploadedCid('');
      setActiveTab('vaults');

      await fetchWalletData();
      await fetchGlobalStats(); 
    } catch (err) {
      showToast(t.genericFailPrefix + extractErrorMessage(err), 'error');
    } finally {
      setIsSealing(false);
    }
  };

  const handleOpenVault = async (capsule) => {
    if (isWrongNetwork) return showToast(t.switchNetworkFirst.replace('{chain}', TARGET_CHAIN_NAME), 'error');
    if (capsule.contentDeleted) {
      setSelectedVault({ ...capsule, decryptedMessage: null, error: t.statusAlreadyDeleted });
      return;
    }
    setSelectedVault({ ...capsule, decryptedMessage: null, error: null });
    setIsDecrypting(true);
    try {
      const signer = await getSigner();
      await ensureCorrectNetwork(signer);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultABI, signer);
      let ciphertext;
      if (capsule.isClaimedOrRevealed) {
        ciphertext = await contract.getOpenedCiphertext(capsule.id);
      } else {
        const fnName = capsule.asHeir ? 'claimLegacy' : 'revealCapsule';
        ciphertext = await contract[fnName].staticCall(capsule.id);
        const tx = await contract[fnName](capsule.id);
        await tx.wait();
      }
      const { privateKey } = await getOrDeriveKeyPair();
      const plaintext = await decryptWithPrivateKey(privateKey, ciphertext);
      setSelectedVault(prev => ({ ...prev, decryptedMessage: plaintext }));
      showToast(t.decryptSuccess, 'success');
      await fetchWalletData();
    } catch (err) {
      showToast(t.openVaultFailPrefix + extractErrorMessage(err), 'error');
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleViewCertificate = async (capsuleId) => {
    if (isWrongNetwork) return showToast(t.switchNetworkFirst.replace('{chain}', TARGET_CHAIN_NAME), 'error');
    try {
      const provider = new ethers.JsonRpcProvider(READ_ONLY_RPC_URL);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultABI, provider);
      const cert = await contract.getCertificate(capsuleId);
      setSelectedCertificate({
        capsuleId: cert.capsuleId.toString(),
        owner: cert.owner,
        tier: TIER_INDEX_TO_LABEL[Number(cert.tier)],
        isLegacy: cert.isLegacy,
        proofHash: cert.proofHash,
        creationTimestamp: Number(cert.creationTimestamp),
        blockNumber: Number(cert.blockNumber)
      });
    } catch (err) {
      showToast((t.certFetchFail || "Gagal memuat sertifikat: ") + extractErrorMessage(err), 'error');
    }
  };

  const [isPinging, setIsPinging] = useState(null);
  const handlePingAlive = async (capsule) => {
    if (isWrongNetwork) return showToast(t.switchNetworkFirst.replace('{chain}', TARGET_CHAIN_NAME), 'error');
    setIsPinging(capsule.id);
    try {
      const signer = await getSigner();
      await ensureCorrectNetwork(signer);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultABI, signer);
      const tx = await contract.pingAlive(capsule.id);
      await tx.wait();
      showToast(t.pingSuccess, 'success');
      await fetchWalletData();
    } catch (err) {
      showToast(t.pingFailPrefix + extractErrorMessage(err), 'error');
    } finally {
      setIsPinging(null);
    }
  };

  const [isDeletingContent, setIsDeletingContent] = useState(null);
  const handleDeleteOpenedContent = async (capsule) => {
    if (isWrongNetwork) return showToast(t.switchNetworkFirst.replace('{chain}', TARGET_CHAIN_NAME), 'error');
    const confirmed = window.confirm(t.deleteConfirmText);
    if (!confirmed) return;
    setIsDeletingContent(capsule.id);
    try {
      const signer = await getSigner();
      await ensureCorrectNetwork(signer);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultABI, signer);
      const tx = await contract.deleteOpenedContent(capsule.id);
      await tx.wait();
      showToast(t.deleteContentSuccess, 'success');
      setSelectedVault(null);
      await fetchWalletData();
    } catch (err) {
      showToast(t.deleteContentFailPrefix + extractErrorMessage(err), 'error');
    } finally {
      setIsDeletingContent(null);
    }
  };

  const handleStake = async () => {
    const amount = parseFloat(stakeInput);
    if (isNaN(amount) || amount <= 0) return showToast(t.invalidAethAmount, "error");
    if (!isConnected) return showToast(t.connectWalletFirst, "error");
    if (isWrongNetwork) return showToast(t.switchNetworkFirst.replace('{chain}', TARGET_CHAIN_NAME), 'error');

    setIsStaking(true);
    try {
      const signer = await getSigner();
      await ensureCorrectNetwork(signer);
      const amountInWei = ethers.parseUnits(amount.toString(), 18);
      // ⭐ ALLOWANCE & STAKE MENGGUNAKAN KONTRAK TOKEN LAMA
      const tokenContract = new ethers.Contract(AETH_TOKEN_ADDRESS, AetherVaultABI, signer);
      const currentAllowance = await tokenContract.allowance(address, STAKING_CONTRACT_ADDRESS);

      if (currentAllowance < amountInWei) {
        const approveTx = await tokenContract.approve(STAKING_CONTRACT_ADDRESS, amountInWei);
        await approveTx.wait();
      }
      const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingABI, signer);
      const tx = await stakingContract.stake(amountInWei);
      await tx.wait();
      setStakeInput('');
      showToast(t.stakeSuccess.replace("{amount}", amount), "success");
      await fetchWalletData();
      await fetchGlobalStats();
    } catch (err) {
      showToast(t.stakeFailPrefix + extractErrorMessage(err), "error");
    } finally {
      setIsStaking(false);
    }
  };

  const handleWithdrawStake = async () => {
    const amount = parseFloat(unstakeInput);
    if (isNaN(amount) || amount <= 0) return showToast(t.invalidAethAmount, "error");
    if (!isConnected) return showToast(t.connectWalletFirst, "error");
    if (isWrongNetwork) return showToast(t.switchNetworkFirst.replace('{chain}', TARGET_CHAIN_NAME), 'error');
    if (amount > stakedBalance) return showToast(t.unstakeExceedsBalance, "error");

    setIsWithdrawingStake(true);
    try {
      const signer = await getSigner();
      await ensureCorrectNetwork(signer);
      const amountInWei = ethers.parseUnits(amount.toString(), 18);
      const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingABI, signer);
      const tx = await stakingContract.withdraw(amountInWei);
      await tx.wait();
      setUnstakeInput('');
      showToast(t.unstakeSuccess.replace("{amount}", amount), "success");
      await fetchWalletData();
      await fetchGlobalStats();
    } catch (err) {
      showToast(t.unstakeFailPrefix + extractErrorMessage(err), "error");
    } finally {
      setIsWithdrawingStake(false);
    }
  };

  const handleClaimReward = async () => {
    if (!isConnected) return showToast(t.connectWalletFirst, "error");
    if (isWrongNetwork) return showToast(t.switchNetworkFirst.replace('{chain}', TARGET_CHAIN_NAME), 'error');
    if (pendingReward <= 0) return showToast(t.noRewardAvailable, "error");

    try {
      const signer = await getSigner();
      await ensureCorrectNetwork(signer);
      const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingABI, signer);
      const tx = await stakingContract.claimReward();
      await tx.wait();
      showToast(t.claimRewardSuccess, "success");
      await fetchWalletData();
      await fetchGlobalStats();
    } catch (err) {
      showToast(t.claimRewardFailPrefix + extractErrorMessage(err), "error");
    }
  };

  const extractArweaveUrl = (text) => {
    const match = text?.match(/(https:\/\/arweave\.net\/[a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const handleDownloadAttachment = async () => {
    if (!selectedVault?.decryptedMessage) return;
    const arweaveUrl = extractArweaveUrl(selectedVault.decryptedMessage);
    if (!arweaveUrl) {
      showToast(t.noAttachmentFound || "Tidak ada lampiran", "error");
      return;
    }
    setIsDownloadingAttachment(selectedVault.id);
    try {
      showToast(t.fetchingArweave || "Mengambil file dari Arweave...", "info");
      const response = await fetch(arweaveUrl);
      if (!response.ok) throw new Error(t.fetchArweaveFail || "Gagal mengambil dari Arweave");
      const encryptedText = await response.text();
      const { privateKey } = await getOrDeriveKeyPair();
      const decryptedJsonString = await decryptWithPrivateKey(privateKey, encryptedText);
      const fileData = JSON.parse(decryptedJsonString);
      const byteCharacters = atob(fileData.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: fileData.type || "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileData.name || "aether-file";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast((t.downloadSuccess || "Unduhan sukses: ").replace('{file}', fileData.name), "success");
    } catch (err) {
      showToast((t.downloadFailPrefix || "Gagal unduh: ") + extractErrorMessage(err), "error");
    } finally {
      setIsDownloadingAttachment(null);
    }
  };

  const renderNavMenu = (isMobile = false) => (
    <nav className="space-y-1.5">
      {[
        { id: 'create', icon: Lock, label: t.menuCreate },
        { id: 'proof', icon: Award, label: t.menuProof || 'Aether Proof' },
        { id: 'hall', icon: Globe, label: t.menuHall || 'Hall of Proof' },
        { id: 'vaults', icon: Layers, label: t.menuVaults, count: myCapsules.length > 0 ? myCapsules.length : undefined },
        { id: 'history', icon: History, label: t.menuHistory },
        { id: 'stats', icon: Flame, label: t.menuStats },
        { id: 'staking', icon: Coins, label: t.menuStaking },
        { id: 'security', icon: Shield, label: t.menuSecurity },
        { id: 'settings', icon: Settings, label: t.menuSettings }
      ].map((menu) => (
        <button
          key={menu.id}
          onClick={() => {
            setActiveTab(menu.id);
            if (isMobile) setIsMobileMenuOpen(false);
          }}
          className={`w-full text-left px-4 py-3.5 rounded-2xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-between group ${activeTab === menu.id ? 'bg-gradient-to-r from-cyan-500/15 via-violet-500/15 to-fuchsia-500/10 text-white border border-violet-400/40 shadow-[0_0_20px_-6px_rgba(168,85,247,0.5)]' : 'text-neutral-400 hover:bg-neutral-900/60 hover:text-white border border-transparent'}`}
        >
          <span className="flex items-center gap-3">
            <menu.icon className={`w-4 h-4 ${activeTab === menu.id ? 'text-cyan-300' : 'text-neutral-500 group-hover:text-neutral-300'}`} />
            {menu.label}
          </span>
          {menu.count !== undefined && (
            <span className={`px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-mono ${activeTab === menu.id ? 'bg-white/10 text-cyan-200' : 'bg-neutral-900 text-neutral-400'}`}>{menu.count}</span>
          )}
        </button>
      ))}
    </nav>
  );

  if (!IS_CONTRACT_ADDRESS_CONFIGURED || !IS_STAKING_ADDRESS_CONFIGURED) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05030F] text-gray-200 p-6">
        <div className="max-w-md w-full bg-[#0B0817] border border-red-500/40 rounded-3xl p-6 sm:p-8 space-y-4 text-center shadow-[0_0_30px_rgba(239,68,68,0.15)]">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-lg font-extrabold text-red-300">{t.configIncompleteTitle}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#05030F] text-gray-200 font-sans selection:bg-fuchsia-500/30 relative">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap');
        .font-display { font-family: 'Space Grotesk', ui-sans-serif, sans-serif; letter-spacing: -0.01em; }
      `}</style>

      {toast && (
        <div className="fixed top-24 right-4 sm:right-8 z-[100] animate-in fade-in slide-in-from-right-8 duration-300">
          <div className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-2xl border ${toast.type === 'success' ? 'bg-green-950/90 border-green-500/40 text-green-300' : toast.type === 'error' ? 'bg-red-950/90 border-red-500/40 text-red-300' : 'bg-[#0B0817] border-violet-500/40 text-cyan-300 shadow-[0_0_20px_rgba(168,85,247,0.25)]'} backdrop-blur-md max-w-[90vw]`}>
            {toast.type === 'success' ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 shrink-0" /> : toast.type === 'error' ? <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 shrink-0" /> : <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />}
            <p className="text-[11px] sm:text-sm font-medium">{toast.msg}</p>
          </div>
        </div>
      )}

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-[#05030F]/95 backdrop-blur-xl z-40 lg:hidden pt-24 px-6 pb-6 overflow-y-auto border-b border-neutral-900 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest font-mono">{t.menuTitle}</h2>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-neutral-400 hover:text-white p-2 bg-neutral-900 rounded-full"><X className="w-4 h-4"/></button>
          </div>
          {renderNavMenu(true)}
        </div>
      )}

      <main className="flex-1 w-full pt-0 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="bg-[#0B0817] border border-neutral-900 p-3 sm:p-4 rounded-2xl sm:rounded-3xl mb-6 lg:mb-8 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400 hover:text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden lg:flex items-center gap-2 text-cyan-500 font-bold font-mono text-[10px] sm:text-xs uppercase tracking-widest px-2">
                <Activity className="w-4 h-4" /> {t.web3TerminalLabel}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {!isConnected ? (
                <button
                  onClick={() => open()}
                  className="bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 hover:from-cyan-400 hover:via-violet-400 hover:to-fuchsia-400 text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-full font-bold flex items-center gap-1.5 sm:gap-2 transition-all shadow-[0_0_25px_-3px_rgba(168,85,247,0.5),0_0_15px_-3px_rgba(34,211,238,0.4)] text-[10px] sm:text-sm cursor-pointer whitespace-nowrap"
                >
                  <Wallet className="w-3 h-3 sm:w-4 sm:h-4" /> {t.connectWallet}
                </button>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <div className="hidden md:flex items-center gap-2.5 bg-[#05030F] px-4 py-2 rounded-full border border-neutral-800">
                    <Cpu className="w-4 h-4 text-cyan-500" />
                    <div className="flex flex-col">
                      <span className="text-[9px] text-neutral-400 uppercase tracking-wider">{t.gasFeeLabel}</span>
                      <span className="text-xs font-bold font-mono text-white">{nativeBalance} POL</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 bg-[#05030F] px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-neutral-800 shadow-inner">
                    <div className="hidden sm:flex w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 via-violet-400 to-fuchsia-400 items-center justify-center shadow-md">
                      <Wallet className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-mono text-[8px] sm:text-[10px] text-cyan-400">{formatAddress(address)}</span>
                      <span className="text-[10px] sm:text-xs font-bold font-mono text-white">{aethBalance.toLocaleString()} AETH</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      myKeyPairRef.current = null;
                      disconnect();
                    }}
                    className="p-1.5 sm:p-2.5 bg-[#05030F] hover:bg-red-500/10 border border-neutral-800 hover:border-red-500/40 rounded-full text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {isWrongNetwork && (
            <div className="bg-red-950/30 border border-red-500/40 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-bold text-red-300">{t.wrongNetworkTitle}</p>
                  <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">{t.wrongNetworkDesc.replace('{chain}', TARGET_CHAIN_NAME)}</p>
                </div>
              </div>
              <button
                onClick={handleSwitchNetwork}
                disabled={isSwitchingNetwork}
                className="whitespace-nowrap bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 text-red-300 px-4 py-2 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSwitchingNetwork ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                {t.switchToChainBtn.replace('{chain}', TARGET_CHAIN_NAME)}
              </button>
            </div>
          )}

          {isConnected && !isWrongNetwork && !myPublicKeyRegistered && (
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <KeyRound className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-bold text-amber-300">{t.keyNotRegisteredTitle}</p>
                  <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">{t.keyNotRegisteredDesc}</p>
                </div>
              </div>
              <button
                onClick={handleRegisterEncryptionKey}
                disabled={isRegisteringKey}
                className="whitespace-nowrap bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 px-4 py-2 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isRegisteringKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                {t.registerKeyBtn}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="hidden lg:block lg:col-span-1 space-y-6">
              <div className="bg-[#0B0817] border border-neutral-900 p-5 rounded-3xl sticky top-28 shadow-xl">
                <h2 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-4 px-3 font-mono">{t.menuTitle}</h2>
                {renderNavMenu()}
                <div className="mt-8 pt-5 border-t border-neutral-900 px-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <span className="flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-cyan-500 animate-pulse" /> {t.mainnetLabel}</span>
                    <span className="font-mono text-neutral-400">{TARGET_CHAIN_NAME}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6">
              
              {/* TAB: CREATE */}
              {activeTab === 'create' && (
                <CreateCapsule
                  t={t}
                  title={title} setTitle={setTitle}
                  message={message} setMessage={setMessage}
                  unlockDate={unlockDate} setUnlockDate={setUnlockDate}
                  tier={tier} setTier={setTier}
                  tiers={tiers}
                  inactivityYears={inactivityYears} setInactivityYears={setInactivityYears}
                  heirAddress={heirAddress} setHeirAddress={setHeirAddress}
                  isSealing={isSealing} handleSeal={handleSeal}
                  isConnected={isConnected} isWrongNetwork={isWrongNetwork}
                  TARGET_CHAIN_NAME={TARGET_CHAIN_NAME}
                  isPermanentTier={isPermanentTier}
                  uploadedCid={uploadedCid} setUploadedCid={setUploadedCid}
                  selectedFile={selectedFile} setSelectedFile={setSelectedFile}
                  isPreparingUpload={isPreparingUpload} stagedUpload={stagedUpload}
                  isUploading={isUploading}
                  handleConfirmArweaveUpload={handleConfirmArweaveUpload}
                  handleCancelStagedUpload={handleCancelStagedUpload}
                  handleFileSelected={handleFileSelected}
                  getMinUnlockDatetimeLocal={getMinUnlockDatetimeLocal}
                  aethBalance={aethBalance}
                />
              )}

              {/* ⭐ TAB: AETHER PROOF (BARU) */}
              {activeTab === 'proof' && (
                <AetherProofHub
                  t={t}
                  myCapsules={myCapsules}
                  handleViewCertificate={handleViewCertificate}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'hall' && (
                <HallOfProof 
                  t={t} 
                  handleViewCertificate={handleViewCertificate} 
                />
              )}

              {/* TAB: VAULTS */}
              {activeTab === 'vaults' && (
                <VaultsList
                  t={t}
                  isLoadingCapsules={isLoadingCapsules}
                  myCapsules={myCapsules}
                  setActiveTab={setActiveTab}
                  handlePingAlive={handlePingAlive}
                  isPinging={isPinging}
                  isWrongNetwork={isWrongNetwork}
                  handleDeleteOpenedContent={handleDeleteOpenedContent}
                  isDeletingContent={isDeletingContent}
                  handleOpenVault={handleOpenVault}
                  handleViewCertificate={handleViewCertificate}
                  formatUnlockDateTime={formatUnlockDateTime}
                />
              )}

              {/* TAB: HISTORY */}
              {activeTab === 'history' && (
                <div className="bg-[#0B0817] border border-neutral-900 p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl space-y-4 sm:space-y-6">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white">{t.historyTitle}</h3>
                  {isLoadingHistory ? (
                    <div className="text-center py-12 text-neutral-500 text-xs sm:text-sm">
                      <Loader2 className="w-8 h-8 text-cyan-500 mx-auto mb-2 animate-spin" />
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500 text-xs sm:text-sm">
                      <History className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
                      {t.historyEmpty}
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-5 bg-[#05030F] border border-neutral-900 rounded-xl sm:rounded-2xl hover:border-neutral-700 transition-colors gap-2 sm:gap-0">
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-white mb-0.5 sm:mb-1">{tx.type}</p>
                            <p className="text-[10px] sm:text-xs text-neutral-500">{tx.detail} • <span className="font-mono">{tx.date}</span></p>
                          </div>
                          {tx.direction !== 'neutral' && (
                            <span className={`text-[11px] sm:text-sm font-mono font-bold ${tx.direction === 'in' ? 'text-green-400' : 'text-red-400'}`}>
                              {tx.direction === 'in' ? '+' : '-'}{tx.amount} AETH
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: STATS */}
              {activeTab === 'stats' && (
                <GlobalStats
                  t={t}
                  isFetchingGlobalStats={isFetchingGlobalStats}
                  platformStats={platformStats}
                />
              )}

              {/* TAB: STAKING */}
              {activeTab === 'staking' && (
                <StakingPanel
                  t={t}
                  apyPercent={apyPercent}
                  stakingGlobalStats={stakingGlobalStats}
                  isFetchingGlobalStats={isFetchingGlobalStats}
                  aethBalance={aethBalance}
                  stakeInput={stakeInput}
                  setStakeInput={setStakeInput}
                  handleStake={handleStake}
                  isStaking={isStaking}
                  isWrongNetwork={isWrongNetwork}
                  stakedBalance={stakedBalance}
                  pendingReward={pendingReward}
                  unstakeInput={unstakeInput}
                  setUnstakeInput={setUnstakeInput}
                  handleWithdrawStake={handleWithdrawStake}
                  isWithdrawingStake={isWithdrawingStake}
                  handleClaimReward={handleClaimReward}
                />
              )}

              {/* TAB: SECURITY */}
              {activeTab === 'security' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-[#0B0817] border border-neutral-900 p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="font-display text-lg sm:text-xl font-bold text-white mb-1 flex items-center gap-2">
                        <Shield className="text-green-500 w-4 h-4 sm:w-5 sm:h-5" /> {t.securityTitle}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-400">{t.securityDesc}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-[#0B0817] border border-cyan-500/30 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-cyan-600 text-[8px] sm:text-[10px] font-bold px-2.5 sm:px-3 py-1 rounded-bl-xl uppercase tracking-widest text-white">Active</div>
                      <h5 className="text-sm sm:text-lg font-bold text-white mb-1.5 sm:mb-2 flex items-center gap-2"><Lock className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400"/> ReentrancyGuard</h5>
                      <p className="text-[10px] sm:text-sm text-neutral-400 mb-4 sm:mb-6 leading-relaxed">{t.reentrancyDesc}</p>
                      <a href={`https://amoy.polygonscan.com/address/${STAKING_CONTRACT_ADDRESS}#code`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 sm:px-4 py-2 rounded-lg hover:bg-cyan-500/20 transition-all border border-cyan-500/30">
                        {t.viewCodeBtn} <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="bg-[#0B0817] border border-neutral-900 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg relative overflow-hidden">
                      <h5 className="text-sm sm:text-lg font-bold text-white mb-1.5 sm:mb-2 flex items-center gap-2"><Coins className="w-4 h-4 sm:w-5 h-5 text-yellow-500"/> {t.vaultReserveTitle}</h5>
                      <p className="text-[10px] sm:text-sm text-neutral-400 mb-4 sm:mb-6 leading-relaxed">{t.vaultReserveDesc}</p>
                      <a href={`https://amoy.polygonscan.com/address/${STAKING_CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-xs font-bold text-yellow-400 bg-yellow-500/10 px-3 sm:px-4 py-2 rounded-lg hover:bg-yellow-500/20 transition-all border border-yellow-500/30">
                        {t.checkVaultBtn} <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="bg-[#0B0817] border border-neutral-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-6 sm:space-y-8 shadow-xl">
                  <div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-white flex items-center gap-2"><Settings className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400"/> {t.settingsTitle}</h3>
                    <p className="text-[11px] sm:text-sm text-neutral-400 mt-1">{t.settingsDesc}</p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-[#05030F] border border-neutral-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 sm:gap-2"><KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500"/> {t.encryptionKeyLabel}</p>
                          <p className="text-[10px] sm:text-xs text-neutral-500 mt-1">{t.encryptionKeyDesc}</p>
                        </div>
                        <button
                          onClick={handleRegisterEncryptionKey}
                          disabled={isRegisteringKey || myPublicKeyRegistered || isWrongNetwork}
                          className={`text-[9px] sm:text-[10px] px-3 sm:px-4 py-2 rounded-lg font-bold uppercase tracking-widest shrink-0 flex items-center gap-2 ${myPublicKeyRegistered ? 'bg-green-500/10 text-green-400 border border-green-500/20 cursor-default' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 cursor-pointer disabled:opacity-50'}`}
                        >
                          {isRegisteringKey && <Loader2 className="w-3 h-3 animate-spin" />}
                          {myPublicKeyRegistered ? t.registeredStatus : t.registerBtn}
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#05030F] border border-neutral-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 sm:gap-2"><Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500"/> {t.rpcLabel}</p>
                          <p className="text-[10px] sm:text-xs text-neutral-500 mt-1">{t.rpcDesc}</p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
                          <input type="text" disabled value="Polygon Amoy Testnet" className="bg-[#0B0817] border border-neutral-800 text-neutral-400 text-[9px] sm:text-xs font-mono px-2.5 sm:px-3 py-2 rounded-lg w-full sm:w-48 outline-none text-center sm:text-left" />
                          <span className={`text-[8px] sm:text-[10px] px-2 sm:px-3 py-2 rounded-lg font-bold uppercase tracking-widest shrink-0 ${isWrongNetwork ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>{isWrongNetwork ? t.wrongNetwork : t.connected}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-900 bg-[#05030F]/80 py-5 sm:py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <img src="/logo.png" alt="Logo" className="w-5 h-5 sm:w-6 sm:h-6 grayscale opacity-40" />
            <span className="text-[10px] sm:text-xs font-bold text-neutral-600 tracking-widest">AETHERVAULT</span>
          </div>
          <p className="text-[9px] sm:text-[10px] text-neutral-600 font-mono text-center md:text-right">
            &copy; {new Date().getFullYear()} Nienzer. All rights reserved. Decentralized Protocol V2.2.
          </p>
        </div>
      </footer>

      <CertificateModal 
        selectedCertificate={selectedCertificate}
        setSelectedCertificate={setSelectedCertificate}
        TARGET_CHAIN_NAME={TARGET_CHAIN_NAME}
        showToast={showToast}
        t={t}
      />

      {selectedVault && (
        <div className="fixed inset-0 bg-[#05030F]/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0B0817] border border-cyan-500/30 max-w-lg w-full rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-4 sm:space-y-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative">
            <h4 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2 sm:gap-2.5">
              <Sparkles className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5"/> {t.modalDecryptedTitle}
            </h4>
            {isDecrypting ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-cyan-500 mx-auto mb-3 animate-spin" />
              </div>
            ) : selectedVault.error ? (
              <div className="text-center py-6">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <p className="text-red-300 text-xs sm:text-sm">{selectedVault.error}</p>
              </div>
            ) : (
              <>
                <div className="w-full bg-[#05030F] border border-neutral-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-[11px] sm:text-sm text-cyan-300 font-mono break-words leading-relaxed max-h-[50vh] sm:max-h-60 overflow-y-auto whitespace-pre-wrap shadow-inner">
                  {selectedVault.decryptedMessage}
                </div>
                {selectedVault.decryptedMessage && extractArweaveUrl(selectedVault.decryptedMessage) && (
                  <button
                    onClick={handleDownloadAttachment}
                    disabled={isDownloadingAttachment === selectedVault.id}
                    className="w-full py-3 sm:py-3.5 bg-cyan-500/10 hover:bg-cyan-500/20 disabled:opacity-50 border border-cyan-500/40 text-cyan-300 font-bold rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 text-[11px] sm:text-xs cursor-pointer transition-all"
                  >
                    {isDownloadingAttachment === selectedVault.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t.decryptingDownloading}
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        {t.downloadDecryptBtn}
                      </>
                    )}
                  </button>
                )}
              </>
            )}
            <button onClick={() => setSelectedVault(null)} className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 sm:py-4 rounded-xl sm:rounded-full text-[10px] sm:text-xs cursor-pointer transition-colors outline-none border border-transparent focus:border-neutral-500">
              {t.closeVaultBtn}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}