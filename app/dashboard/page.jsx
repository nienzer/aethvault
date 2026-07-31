"use client";
// 1. IMPORT HOOKS WALLETCONNECT SECARA LENGKAP
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider, useDisconnect } from '@web3modal/ethers/react';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Lock, Clock, Shield, Wallet, LogOut, Layers, Eye, Sparkles, Flame, Check, Bell, Activity, History, Landmark, Cpu, Coins, Settings, UserX, AlertTriangle, UploadCloud, FileImage, X, CheckCircle2, ArrowUpRight, Menu, KeyRound, Loader2 } from 'lucide-react';
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
} from '@/lib/cryptoUtils-testnet';
import { uploadToArweavePermanent, estimateArweaveCost, getIrysUploader } from '@/lib/arweaveUpload-testnet';

// ==========================================
// ABI TOKEN / VAULT — HARUS SINKRON DENGAN AetherVault.sol
// ==========================================
const AetherVaultABI = [
  { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },

  { "inputs": [{ "internalType": "bytes", "name": "_pubKey", "type": "bytes" }], "name": "registerPublicKey", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "encryptionPublicKeys", "outputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }], "stateMutability": "view", "type": "function" },

  { "inputs": [
      { "internalType": "enum AetherVault.Tier", "name": "_tier", "type": "uint8" },
      { "internalType": "string", "name": "_title", "type": "string" },
      { "internalType": "string", "name": "_encryptedMessage", "type": "string" },
      { "internalType": "uint256", "name": "_unlockTimestamp", "type": "uint256" }
    ], "name": "sealTimeLockCapsule", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "string", "name": "_title", "type": "string" }, { "internalType": "string", "name": "_encryptedMessage", "type": "string" }, { "internalType": "uint256", "name": "_inactivityDuration", "type": "uint256" }, { "internalType": "address", "name": "_heirAddress", "type": "address" }], "name": "sealLegacyCapsule", "outputs": [], "stateMutability": "nonpayable", "type": "function" },

  { "inputs": [{ "internalType": "uint256", "name": "_capsuleIndex", "type": "uint256" }], "name": "pingAlive", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_capsuleIndex", "type": "uint256" }], "name": "revealCapsule", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_capsuleIndex", "type": "uint256" }], "name": "claimLegacy", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "nonpayable", "type": "function" },

  { "inputs": [{ "internalType": "uint256", "name": "_capsuleIndex", "type": "uint256" }], "name": "getOpenedCiphertext", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_capsuleIndex", "type": "uint256" }], "name": "deleteOpenedContent", "outputs": [], "stateMutability": "nonpayable", "type": "function" },

  { "inputs": [{ "internalType": "uint256", "name": "_capsuleIndex", "type": "uint256" }], "name": "getCapsuleMeta", "outputs": [
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "uint256", "name": "unlockTimestamp", "type": "uint256" },
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "enum AetherVault.Tier", "name": "tier", "type": "uint8" },
      { "internalType": "bool", "name": "isLegacy", "type": "bool" },
      { "internalType": "address", "name": "heirAddress", "type": "address" },
      { "internalType": "uint256", "name": "lastPingAlive", "type": "uint256" },
      { "internalType": "uint256", "name": "inactivityLimit", "type": "uint256" },
      { "internalType": "bool", "name": "isClaimedOrRevealed", "type": "bool" },
      { "internalType": "bool", "name": "contentDeleted", "type": "bool" }
    ], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_capsuleIndex", "type": "uint256" }], "name": "isCapsuleReady", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }], "name": "getUserCapsules", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "_heir", "type": "address" }], "name": "getHeirCapsules", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "getCapsuleCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },

  { "inputs": [{ "internalType": "enum AetherVault.Tier", "name": "", "type": "uint8" }], "name": "tierConfigs", "outputs": [
      { "internalType": "uint256", "name": "cost", "type": "uint256" },
      { "internalType": "uint256", "name": "burnPart", "type": "uint256" },
      { "internalType": "uint256", "name": "maxDuration", "type": "uint256" },
      { "internalType": "uint256", "name": "maxMessageLength", "type": "uint256" }
    ], "stateMutability": "view", "type": "function" },

  { "anonymous": false, "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "capsuleId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": false, "internalType": "enum AetherVault.Tier", "name": "tier", "type": "uint8" },
      { "indexed": false, "internalType": "uint256", "name": "cost", "type": "uint256" }
    ], "name": "CapsuleSealed", "type": "event" },
  { "anonymous": false, "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "capsuleId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "revealer", "type": "address" }
    ], "name": "CapsuleRevealed", "type": "event" },
  { "anonymous": false, "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "capsuleId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "heir", "type": "address" }
    ], "name": "LegacyClaimed", "type": "event" },
  { "anonymous": false, "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "capsuleId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ], "name": "PingRecorded", "type": "event" }
];

// ==========================================
// ABI STAKING
// ==========================================
const StakingABI = [
  { "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "stake", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "claimReward", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "stakedBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }], "name": "calculateReward", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "rewardRate", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "availableRewardPool", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "anonymous": false, "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ], "name": "Staked", "type": "event" },
  { "anonymous": false, "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ], "name": "Withdrawn", "type": "event" },
  { "anonymous": false, "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "reward", "type": "uint256" }
    ], "name": "RewardClaimed", "type": "event" }
];

const CONTRACT_ADDRESS = "0x63317e60C7bEC4a3e8a61e1a2436624d1b998576"; // TODO: isi alamat hasil deploy AetherVault.sol (40 hex char setelah 0x!)
const STAKING_CONTRACT_ADDRESS = "0x318Ec508E9D33DaD230a76A600E04C26757A71FD"; // TODO: isi alamat staking (40 hex char setelah 0x!) 
const PLACEHOLDER_ADDRESS = "0x000000000000000000000000000000000000dEaD";
const IS_CONTRACT_ADDRESS_CONFIGURED =
  CONTRACT_ADDRESS.toLowerCase() !== PLACEHOLDER_ADDRESS.toLowerCase();
const IS_STAKING_ADDRESS_CONFIGURED =
  STAKING_CONTRACT_ADDRESS.toLowerCase() !== PLACEHOLDER_ADDRESS.toLowerCase();

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
  const [burnedTotal, setBurnedTotal] = useState(0);
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
  const [pendingFileCipherRef, setPendingFileCipherRef] = useState(null);
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
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isFullHistoryLoaded, setIsFullHistoryLoaded] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedVault, setSelectedVault] = useState(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  
  const myKeyPairRef = useRef(null);
  const [hasLocalKeyPair, setHasLocalKeyPair] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // FIX: Reset keypair ref saat wallet address berubah (switch wallet tanpa disconnect)
  useEffect(() => {
    if (address) {
      myKeyPairRef.current = null;
      setHasLocalKeyPair(false);
    }
  }, [address]);

  const [onChainTierConfig, setOnChainTierConfig] = useState({});
  const [isTierConfigLoaded, setIsTierConfigLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchTierConfigs = async () => {
      try {
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
        console.error(t.consoleTierConfigFail, err);
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

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  const extractErrorMessage = (err) => {
    return (err?.reason || err?.shortMessage || err?.error?.message || err?.data?.message || err?.message || t.defaultTxErrorMessage);
  };

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
    setHasLocalKeyPair(true);
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

  const DEPLOY_BLOCK_NUMBER = 43345845;

  const CHUNK_SIZE = 5000; // ~5k blocks per request (Polygon-safe for most RPC tiers)

  const fetchOnChainHistory = useCallback(async (userAddress, loadFromBlock = null) => {
    setIsLoadingHistory(true);
    try {
      const provider = new ethers.JsonRpcProvider(READ_ONLY_RPC_URL);
      const vaultContract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultABI, provider);
      const latestBlock = await provider.getBlockNumber();

      // Default: last 200k blocks (~5-6 days on Polygon). 
      // Pass DEPLOY_BLOCK_NUMBER explicitly for full history scan.
      const fromBlock = loadFromBlock ?? Math.max(DEPLOY_BLOCK_NUMBER, latestBlock - 200000);
      const toBlock = latestBlock;

      // Helper: chunked queryFilter with auto-split on rate-limit / timeout / too many results
      const queryChunked = async (contract, filter, _from, _to) => {
        const results = [];
        let current = _from;
        while (current <= _to) {
          const end = Math.min(current + CHUNK_SIZE - 1, _to);
          try {
            const chunk = await contract.queryFilter(filter, current, end);
            results.push(...chunk);
          } catch (err) {
            const msg = err?.message || '';
            // Too many results / timeout / rate limit → split chunk in half and retry
            if (msg.includes('too many') || msg.includes('timeout') || msg.includes('exceeded') || msg.includes('limit') || err?.error?.code === -32005) {
              const mid = Math.floor((current + end) / 2);
              const left = await queryChunked(contract, filter, current, mid);
              const right = await queryChunked(contract, filter, mid + 1, end);
              results.push(...left, ...right);
            } else {
              throw err;
            }
          }
          current = end + 1;
        }
        return results;
      };

      const sealedEvents = await queryChunked(vaultContract, vaultContract.filters.CapsuleSealed(null, userAddress), fromBlock, toBlock);
      const revealedEvents = await queryChunked(vaultContract, vaultContract.filters.CapsuleRevealed(null, userAddress), fromBlock, toBlock);
      const claimedEvents = await queryChunked(vaultContract, vaultContract.filters.LegacyClaimed(null, userAddress), fromBlock, toBlock);
      const pingEvents = await queryChunked(vaultContract, vaultContract.filters.PingRecorded(null, userAddress), fromBlock, toBlock);

      let stakingLogs = { staked: [], withdrawn: [], claimed: [] };
      if (IS_STAKING_ADDRESS_CONFIGURED) {
        try {
          const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingABI, provider);
          stakingLogs.staked = await queryChunked(stakingContract, stakingContract.filters.Staked(userAddress), fromBlock, toBlock);
          stakingLogs.withdrawn = await queryChunked(stakingContract, stakingContract.filters.Withdrawn(userAddress), fromBlock, toBlock);
          stakingLogs.claimed = await queryChunked(stakingContract, stakingContract.filters.RewardClaimed(userAddress), fromBlock, toBlock);
        } catch (stakeErr) {
          console.log(t.consoleStakingFail, stakeErr);
        }
      }

      const allLogs = [
        ...sealedEvents.map((e) => ({ e, kind: 'sealed' })),
        ...revealedEvents.map((e) => ({ e, kind: 'revealed' })),
        ...claimedEvents.map((e) => ({ e, kind: 'claimed' })),
        ...pingEvents.map((e) => ({ e, kind: 'ping' })),
        ...stakingLogs.staked.map((e) => ({ e, kind: 'staked' })),
        ...stakingLogs.withdrawn.map((e) => ({ e, kind: 'withdrawn' })),
        ...stakingLogs.claimed.map((e) => ({ e, kind: 'rewardClaimed' })),
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
            const tierName = TIER_INDEX_TO_LABEL[Number(e.args.tier)] || 'Kapsul';
            const costHuman = parseFloat(ethers.formatUnits(e.args.cost, 18));
            return { ...base, type: t.txSealTitle.replace('{tier}', tierName), detail: t.txSealDetail.replace('{cost}', costHuman).replace('{id}', e.args.capsuleId), amount: costHuman, direction: 'out', tierIdx: Number(e.args.tier) };
          }
          case 'revealed': return { ...base, type: t.txRevealTitle, detail: t.txRevealDetail.replace('{id}', e.args.capsuleId), amount: 0, direction: 'neutral' };
          case 'claimed': return { ...base, type: t.txClaimTitle, detail: t.txClaimDetail.replace('{id}', e.args.capsuleId), amount: 0, direction: 'neutral' };
          case 'ping': return { ...base, type: t.txPingTitle, detail: t.txPingDetail.replace('{id}', e.args.capsuleId), amount: 0, direction: 'neutral' };
          case 'staked': return { ...base, type: t.txStakeTitle, detail: t.txStakeDetail, amount: parseFloat(ethers.formatUnits(e.args.amount, 18)), direction: 'out' };
          case 'withdrawn': return { ...base, type: t.txWithdrawTitle, detail: t.txWithdrawDetail, amount: parseFloat(ethers.formatUnits(e.args.amount, 18)), direction: 'in' };
          case 'rewardClaimed': return { ...base, type: t.txRewardClaimTitle, detail: t.txRewardClaimDetail, amount: parseFloat(ethers.formatUnits(e.args.reward, 18)), direction: 'in' };
          default: return null;
        }
      });

      // If loading full history, replace. If loading recent, merge & dedupe.
      if (loadFromBlock === DEPLOY_BLOCK_NUMBER) {
        setTransactions(built.filter(Boolean).sort((a, b) => b.timestamp - a.timestamp));
        setIsFullHistoryLoaded(true);
      } else {
        setTransactions(prev => {
          const combined = [...prev, ...built.filter(Boolean)];
          const deduped = Array.from(new Map(combined.map(tx => [tx.id, tx])).values());
          return deduped.sort((a, b) => b.timestamp - a.timestamp);
        });
      }

      let totalBurn = 0;
      sealedEvents.forEach((e) => {
        const cfg = onChainTierConfig[Number(e.args.tier)];
        if (cfg) totalBurn += cfg.burn;
      });
      setBurnedTotal(totalBurn);
    } catch (err) {
      console.error(t.consoleHistoryFail, err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [onChainTierConfig, showToast, extractErrorMessage, t]);
const fetchWalletData = useCallback(async () => {
    if (isConnected && walletProvider && address) {
      try {
        const provider = new ethers.BrowserProvider(walletProvider);
        const rawBalance = await provider.getBalance(address);
        setNativeBalance(parseFloat(ethers.formatEther(rawBalance)).toFixed(4));
        try {
          const tokenContract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultABI, provider);
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
      setMyCapsules([]); setTransactions([]); setBurnedTotal(0); setMyPublicKeyRegistered(false);
      myKeyPairRef.current = null; setHasLocalKeyPair(false);
    }
  }, [isConnected, walletProvider, address, fetchCapsulesFromChain, fetchOnChainHistory, isWrongNetwork, t]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

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
      setPendingFileCipherRef(result.arweaveUrl);
      setMessage(prev => prev + (prev ? '\n\n' : '') + `[${t.attachmentTag}: ${result.arweaveUrl}]`);
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
      const { publicKey: recipientPublicKey, privateKey: ownPrivateKeyForRefresh } = await resolveRecipient();
      const encryptedMessage = await encryptForPublicKey(recipientPublicKey, message);

      if (encryptedMessage.length > selectedTierData.maxLength) throw new Error(t.messageCapacityExceeded);
      const plainTitle = title || t.defaultCapsuleTitle;
      const encryptedTitle = await encryptForPublicKey(recipientPublicKey, plainTitle);
      const signer = await getSigner();
      await ensureCorrectNetwork(signer);
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
      setSelectedFile(null); setUploadedCid(''); setPendingFileCipherRef(null);
      setActiveTab('vaults');

      await fetchWalletData();
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
      const msg = extractErrorMessage(err);
      setSelectedVault(prev => ({ ...prev, error: msg }));
      showToast(t.openVaultFailPrefix + msg, 'error');
    } finally {
      setIsDecrypting(false);
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
      const tokenContract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultABI, signer);
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
    } catch (err) {
      showToast(t.claimRewardFailPrefix + extractErrorMessage(err), "error");
    }
  };

  const renderNavMenu = (isMobile = false) => (
    <nav className="space-y-1.5">
      {[
        { id: 'create', icon: Lock, label: t.menuCreate },
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
          <div className="mt-8 pt-5 border-t border-neutral-900 px-2">
            <div className="flex items-center justify-between text-[10px] text-neutral-500">
              <span className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-cyan-500 animate-pulse" /> {t.mainnetLabel}</span>
              <span className="font-mono text-neutral-400">{TARGET_CHAIN_NAME}</span>
            </div>
          </div>
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
                    onClick={() => disconnect()}
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
              {activeTab === 'create' && (
                <div className="bg-[#0B0817] border border-neutral-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl space-y-6 sm:space-y-8">
                  <div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" /> {t.createTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-400">{t.createDesc}</p>
                    <p className="text-[10px] sm:text-xs text-cyan-500/80 mt-2 flex items-center gap-1.5">
                      <Lock className="w-3 h-3" /> {t.encryptionNotice}
                    </p>
                    {!isTierConfigLoaded && (
                      <p className="text-[10px] sm:text-xs text-amber-500/80 mt-1.5 flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin" /> {t.loadingTierNotice}
                      </p>
                    )}
                  </div>

                  <form onSubmit={handleSeal} className="space-y-5 sm:space-y-6">
                    <div>
                      <label className="block text-[10px] sm:text-xs font-bold text-cyan-500 uppercase tracking-widest mb-1.5 sm:mb-2">{t.capsuleTitleLabel}</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={t.capsuleTitlePlaceholder}
                        className="w-full bg-[#05030F] border border-neutral-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-white focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.1)] outline-none transition-all font-medium"
                        required
                      />
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <label className="block text-[10px] sm:text-xs font-bold text-cyan-500 uppercase tracking-widest">{t.securityTierLabel}</label>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {Object.entries(tiers).map(([key, data]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setTier(key)}
                            className={`p-3 sm:p-5 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${tier === key ? `${data.border} bg-neutral-900/90` : 'border-neutral-900 bg-[#05030F] hover:border-neutral-700'}`}
                          >
                            <div>
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2 sm:gap-0">
                                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl ${data.icon} flex items-center justify-center shrink-0`}>
                                  {key === 'legacy' ? <UserX className={`w-3 h-3 sm:w-4 sm:h-4 ${data.color}`} /> : <Shield className={`w-3 h-3 sm:w-4 sm:h-4 ${data.color}`} />}
                                </div>
                                <span className="font-mono text-[9px] sm:text-xs font-bold text-white px-2 py-0.5 sm:py-1 bg-[#05030F] rounded-md sm:rounded-lg border border-neutral-800">{data.cost} AETH</span>
                              </div>
                              <div className="font-bold text-xs sm:text-sm mb-1 text-white truncate">{data.name}</div>
                              <p className="text-[9px] sm:text-[11px] text-neutral-400 mb-3 sm:mb-4 leading-relaxed line-clamp-2 sm:line-clamp-none">{data.desc}</p>
                            </div>
                            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between border-t border-neutral-800/80 pt-2 sm:pt-3 w-full gap-1.5 xl:gap-0">
                              <span className="text-[8px] sm:text-[10px] text-neutral-500 uppercase tracking-wider font-mono hidden sm:block">{t.autoBurnProtocol}</span>
                              <span className="text-[9px] sm:text-[10px] text-red-400 font-bold flex items-center gap-1 font-mono"><Flame className="w-3 h-3" /> {data.burn} {t.burnLabel}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 mt-4 sm:mt-6">
                      <label className="text-[10px] sm:text-xs font-bold text-cyan-500 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                        <UploadCloud className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {t.ipfsAttachment}
                        {!isPermanentTier && <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px]">{t.locked}</span>}
                        {(tier === 'eternal' || tier === 'legacy') && (
                          <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] normal-case font-normal">
                            {t.arweavePermanentText}
                          </span>
                        )}
                      </label>

                      <div className={`border-2 border-dashed rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center transition-all ${isPermanentTier ? 'border-cyan-500/30 hover:border-cyan-500 bg-[#05030F]' : 'border-neutral-800 bg-[#0B0817] opacity-60 cursor-not-allowed'}`}>
                        {!isPermanentTier ? (
                          <div>
                            <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-600 mx-auto mb-2" />
                            <p className="text-[10px] sm:text-xs text-neutral-500">{t.ipfsLockedDesc}</p>
                          </div>
                        ) : uploadedCid ? (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-cyan-500/10 border border-cyan-500/30 p-2 sm:p-3 rounded-xl gap-2 sm:gap-0">
                            <div className="flex items-center gap-2 sm:gap-3 w-full">
                              <FileImage className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 shrink-0" />
                              <div className="text-left flex-1 min-w-0">
                                <p className="text-[10px] sm:text-xs font-bold text-white truncate w-full">{selectedFile?.name}</p>
                                <p className="text-[9px] sm:text-[10px] text-cyan-500 font-mono truncate w-full">{uploadedCid}</p>
                              </div>
                            </div>
                            <button type="button" onClick={() => {setSelectedFile(null); setUploadedCid(''); setPendingFileCipherRef(null);}} className="text-neutral-500 hover:text-red-400 p-1 sm:p-2 cursor-pointer ml-auto">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : isPreparingUpload ? (
                          <div className="py-3 sm:py-4">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2 sm:mb-3"></div>
                            <p className="text-[10px] sm:text-xs font-bold text-cyan-400 animate-pulse">{t.encryptingAndEstimating}</p>
                          </div>
                        ) : stagedUpload ? (
                          <div className="text-left space-y-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <FileImage className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] sm:text-xs font-bold text-white truncate">{stagedUpload.file.name}</p>
                                <p className="text-[9px] sm:text-[10px] text-neutral-500">{(stagedUpload.file.size / 1024).toFixed(1)} KB (setelah dienkripsi)</p>
                              </div>
                            </div>
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg sm:rounded-xl p-2.5 sm:p-3">
                              <p className="text-[10px] sm:text-xs text-purple-200">
                                {t.estimatedCostLabel} <span className="font-mono font-bold">~{stagedUpload.estimatedCost} POL</span>
                              </p>
                              <p className="text-[9px] sm:text-[10px] text-neutral-400 mt-1">
                                {t.arweaveWarning}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {isUploading ? (
                                <div className="flex-1 flex items-center justify-center gap-2 py-2.5 text-cyan-400 text-[10px] sm:text-xs font-bold">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t.uploadingArweave}
                                </div>
                              ) : (
                                <>
                                  <button type="button" onClick={handleConfirmArweaveUpload} className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 font-bold py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs cursor-pointer">
                                    {t.confirmPayBtn}
                                  </button>
                                  <button type="button" onClick={handleCancelStagedUpload} className="px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs cursor-pointer">
                                    {t.cancelBtn}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <input type="file" onChange={handleFileSelected} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,.pdf,.zip" />
                            <UploadCloud className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-500/50 mx-auto mb-1.5 sm:mb-2" />
                            <p className="text-[10px] sm:text-xs text-neutral-400"><span className="text-cyan-400 font-bold">{t.ipfsUploadPrompt}</span></p>
                            <p className="text-[9px] sm:text-[10px] text-neutral-600 mt-1">{t.ipfsUploadSub}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="block text-[10px] sm:text-xs font-bold text-cyan-500 uppercase tracking-widest">{t.payloadLabel}</label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t.payloadPlaceholder}
                        className="w-full h-32 sm:h-40 bg-[#05030F] border border-neutral-800 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-[11px] sm:text-sm text-white focus:border-cyan-500 outline-none resize-none font-mono transition-all"
                        required
                      />
                      <div className="text-right text-[9px] sm:text-xs text-neutral-500 font-mono">
                        {t.charCount} {message.length} / {tiers[tier].maxLength}
                      </div>
                    </div>

                    <div className="pt-2">
                      {tier === 'legacy' ? (
                        <div className="space-y-4 sm:space-y-5 bg-red-950/10 border border-red-500/20 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                          <div>
                            <label className="block text-[10px] sm:text-xs font-bold text-red-400 uppercase tracking-widest mb-1.5 sm:mb-2">{t.deadManLimitLabel}</label>
                            <select
                              value={inactivityYears}
                              onChange={(e) => setInactivityYears(e.target.value)}
                              className="w-full bg-[#05030F] border border-neutral-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-white focus:border-red-500 outline-none cursor-pointer"
                            >
                              <option value="5">{t.inactivity5y}</option>
                              <option value="10">{t.inactivity10y}</option>
                              <option value="20">{t.inactivity20y}</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] sm:text-xs font-bold text-red-400 uppercase tracking-widest mb-1.5 sm:mb-2">{t.heirAddressLabel}</label>
                            <input
                              type="text"
                              value={heirAddress}
                              onChange={(e) => setHeirAddress(e.target.value)}
                              placeholder="0x..."
                              className="w-full bg-[#05030F] border border-neutral-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-white focus:border-red-500 outline-none font-mono"
                              required
                            />
                            <p className="text-[9px] sm:text-[10px] text-neutral-500 mt-1.5">{t.heirNote}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5 sm:space-y-2">
                          <label className="block text-[10px] sm:text-xs font-bold text-cyan-500 uppercase tracking-widest">{t.timeLockLabel}</label>
                          <div className="relative">
                            <Clock className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500 pointer-events-none" />
                            <input
                              type="datetime-local"
                              value={unlockDate}
                              onChange={(e) => setUnlockDate(e.target.value)}
                              min={getMinUnlockDatetimeLocal()}
                              className="w-full bg-[#05030F] border border-neutral-800 rounded-xl sm:rounded-2xl pl-10 sm:pl-12 pr-4 sm:pr-5 py-3 sm:py-4 text-xs sm:text-sm text-white focus:border-cyan-500 outline-none font-mono transition-all"
                              style={{ colorScheme: 'dark' }}
                              required
                            />
                          </div>
                          <p className="text-[9px] sm:text-[10px] text-neutral-500">
                            {t.timezoneNote.replace('{tz}', Intl.DateTimeFormat().resolvedOptions().timeZone)}
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={!isConnected || isSealing || isWrongNetwork}
                      className={`w-full font-bold py-3 sm:py-4 rounded-full flex justify-center items-center gap-1.5 sm:gap-2 transition-all text-xs sm:text-sm mt-2 sm:mt-4 ${isConnected && !isSealing && !isWrongNetwork ? 'bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 hover:from-cyan-400 hover:via-violet-400 hover:to-fuchsia-400 text-white shadow-[0_0_25px_-3px_rgba(168,85,247,0.5),0_0_15px_-3px_rgba(34,211,238,0.4)] cursor-pointer' : 'bg-[#0B0817] text-neutral-600 cursor-not-allowed border border-neutral-800'}`}
                    >
                      {isSealing ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      {isSealing ? t.processingBtn : isWrongNetwork ? t.switchToChainFirstBtn.replace('{chain}', TARGET_CHAIN_NAME) : (isConnected ? t.sealButton : t.connectToSeal)}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB: BRANKAS SAYA */}
              {activeTab === 'vaults' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-[#0B0817] border border-neutral-900 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl">
                    <h3 className="font-display text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">{t.vaultsTitle}</h3>
                    <p className="text-xs sm:text-sm text-neutral-400">{t.vaultsDesc}</p>
                  </div>

                  {isLoadingCapsules ? (
                    <div className="text-center py-16 sm:py-24 bg-[#0B0817] rounded-2xl sm:rounded-3xl border border-dashed border-neutral-800">
                      <Loader2 className="w-8 h-8 text-cyan-500 mx-auto mb-3 animate-spin" />
                    </div>
                  ) : myCapsules.length === 0 ? (
                    <div className="text-center py-16 sm:py-24 bg-[#0B0817] rounded-2xl sm:rounded-3xl border border-dashed border-neutral-800">
                      <Layers className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-700 mx-auto mb-3 sm:mb-4" />
                      <p className="text-neutral-300 font-bold mb-1 text-sm sm:text-base">{t.noVaultsTitle}</p>
                      <p className="text-neutral-500 text-[11px] sm:text-sm max-w-sm mx-auto mb-5 sm:mb-6 px-4">{t.noVaultsDesc}</p>
                      <button onClick={() => setActiveTab('create')} className="bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 hover:from-cyan-400 hover:via-violet-400 hover:to-fuchsia-400 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-[10px] sm:text-xs font-bold cursor-pointer shadow-[0_0_20px_-3px_rgba(168,85,247,0.4),0_0_12px_-3px_rgba(34,211,238,0.3)] transition-all">
                        {t.createNowBtn}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {myCapsules.map((cap) => {
                        const canPingAlive = cap.isLegacy && !cap.asHeir && !cap.isClaimedOrRevealed;
                        const canDeleteContent = cap.isClaimedOrRevealed && !cap.contentDeleted;
                        const isOwnUnclaimableLegacy = canPingAlive;
                        const canOpen = !cap.contentDeleted && !isOwnUnclaimableLegacy && (cap.isReady || cap.isClaimedOrRevealed);

                        return (
                        <div key={cap.id} className="bg-[#0B0817] border border-neutral-900 hover:border-cyan-500/30 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 shadow-lg transition-colors">
                          <div className="space-y-2 w-full md:w-auto">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              <span className="text-[9px] sm:text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg uppercase border border-cyan-500/20 font-mono">{cap.tierLabel}{cap.asHeir ? t.asHeirSuffix : ''}</span>
                              <span className="text-[9px] sm:text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg uppercase border border-amber-500/20 font-mono flex items-center gap-1 sm:gap-1.5">
                                <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {cap.status}
                              </span>
                            </div>
                            <h4 className="text-sm sm:text-base font-bold text-white truncate">{cap.title}</h4>
                            <p className="text-[9px] sm:text-[10px] text-neutral-500 font-mono flex items-center gap-1.5">
                              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                              {cap.isLegacy
                                ? `${t.lastPingLabel} ${formatUnlockDateTime(cap.lastPingAlive)}`
                                : `${t.unlockLabel} ${formatUnlockDateTime(cap.unlockTimestamp)}`}
                            </p>
                          </div>
                          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                            {canPingAlive && (
                              <button
                                onClick={() => handlePingAlive(cap)}
                                disabled={isPinging === cap.id || isWrongNetwork}
                                className="w-full md:w-auto bg-transparent hover:bg-green-500/10 disabled:opacity-40 text-green-400 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-full text-[10px] sm:text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-green-500/50 transition-all"
                              >
                                {isPinging === cap.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                                {t.btnPingAlive}
                              </button>
                            )}
                            {canDeleteContent && (
                              <button
                                onClick={() => handleDeleteOpenedContent(cap)}
                                disabled={isDeletingContent === cap.id || isWrongNetwork}
                                className="w-full md:w-auto bg-transparent hover:bg-red-500/10 disabled:opacity-40 text-red-400 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-full text-[10px] sm:text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-red-500/50 transition-all"
                              >
                                {isDeletingContent === cap.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                                {t.btnDeleteContent}
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenVault(cap)}
                              disabled={!canOpen || isWrongNetwork}
                              className="w-full md:w-auto bg-transparent hover:bg-cyan-500/10 disabled:opacity-40 disabled:cursor-not-allowed text-cyan-400 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-full text-[10px] sm:text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-cyan-500/50 transition-all"
                            >
                              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              {cap.contentDeleted
                                ? t.statusAlreadyDeleted
                                : isOwnUnclaimableLegacy
                                  ? (cap.isReady ? t.statusWaitingHeir : t.statusNotReady)
                                  : cap.isClaimedOrRevealed
                                    ? t.btnViewAgain
                                    : (cap.isReady ? t.openVaultBtn : t.statusNotReady)}
                            </button>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: HISTORY */}
              {activeTab === 'history' && (
                <div className="bg-[#0B0817] border border-neutral-900 p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl space-y-4 sm:space-y-6">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white">{t.historyTitle}</h3>
                  {isLoadingHistory ? (
                    <div className="text-center py-12 sm:py-16 text-neutral-500 text-xs sm:text-sm">
                      <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-500 mx-auto mb-2 sm:mb-3 animate-spin" />
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 text-neutral-500 text-xs sm:text-sm">
                      <History className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-700 mx-auto mb-2 sm:mb-3" />
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
                  {!isFullHistoryLoaded && !isLoadingHistory && transactions.length > 0 && (
                    <div className="pt-4 text-center">
                      <button
                        onClick={() => fetchOnChainHistory(address, DEPLOY_BLOCK_NUMBER)}
                        className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white px-5 py-2.5 rounded-full text-[10px] sm:text-xs font-bold transition-all cursor-pointer"
                      >
                        Load Full History (from genesis block)
                      </button>
                      <p className="text-[9px] sm:text-[10px] text-neutral-600 mt-2">
                        Full sync may take a while depending on RPC rate limits.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: STATS */}
              {activeTab === 'stats' && (
                <div className="bg-[#0B0817] border border-neutral-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-4 sm:space-y-6 shadow-xl">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white">{t.statsTitle}</h3>
                  <div className="grid grid-cols-2 gap-3 sm:gap-5">
                    <div className="bg-[#05030F] border border-neutral-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl flex flex-col justify-center">
                      <span className="text-[9px] sm:text-xs uppercase text-neutral-500 block mb-1.5 sm:mb-2 font-bold font-mono">{t.totalBurnedLabel}</span>
                      <span className="text-lg sm:text-3xl font-extrabold font-mono text-red-400 flex items-center gap-1.5 sm:gap-2">
                        {isLoadingHistory ? <Loader2 className="w-4 h-4 sm:w-6 sm:h-6 animate-spin" /> : <Flame className="w-4 h-4 sm:w-6 sm:h-6" />} {burnedTotal.toFixed(2)} <span className="text-[10px] sm:text-lg">AETH</span>
                      </span>
                    </div>
                    <div className="bg-[#05030F] border border-neutral-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl flex flex-col justify-center">
                      <span className="text-[9px] sm:text-xs uppercase text-neutral-500 block mb-1.5 sm:mb-2 font-bold font-mono">{t.activeCapsulesLabel}</span>
                      <span className="text-lg sm:text-3xl font-extrabold font-mono text-cyan-400 flex items-center gap-1.5">{myCapsules.length} <span className="text-[10px] sm:text-lg text-neutral-500">{t.unit}</span></span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: STAKING */}
              {activeTab === 'staking' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-gradient-to-r from-cyan-900/30 via-violet-900/25 to-fuchsia-900/20 border border-violet-500/30 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
                    <div>
                      <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2">
                        <Coins className="text-cyan-400 w-5 h-5 sm:w-6 sm:h-6" /> {t.stakingTitle}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-400 max-w-md leading-relaxed">{t.stakingDesc}</p>
                    </div>
                    <div className="bg-[#05030F]/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-violet-500/30 min-w-full md:min-w-[200px] text-center md:text-left shadow-[0_0_25px_-8px_rgba(168,85,247,0.4)]">
                      <p className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-widest font-bold mb-0.5 sm:mb-1">{t.currentApy}</p>
                      <p className="font-display text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                        {apyPercent !== null ? `${apyPercent}%` : '...'}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-[#0B0817] border border-neutral-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg">
                      <h4 className="text-[11px] sm:text-sm font-bold text-white mb-3 sm:mb-4 uppercase tracking-widest">{t.stakeAethTitle}</h4>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="bg-[#05030F] border border-neutral-800 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                          <div className="flex justify-between text-[9px] sm:text-xs text-neutral-500 mb-1.5 sm:mb-2">
                            <span>{t.stakeAmountLabel}</span>
                            <span>{t.balanceLabel} <span className="font-bold text-white">{aethBalance.toFixed(2)}</span> AETH</span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <input
                              type="number"
                              value={stakeInput}
                              onChange={(e) => setStakeInput(e.target.value)}
                              placeholder="0.0"
                              className="w-full bg-transparent text-lg sm:text-2xl font-mono text-white outline-none"
                            />
                            <button onClick={() => setStakeInput(aethBalance.toString())} className="text-[9px] sm:text-xs font-bold bg-cyan-500/10 text-cyan-400 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg border border-cyan-500/20 cursor-pointer hover:bg-cyan-500/20">{t.maxBtn}</button>
                          </div>
                        </div>
                        <button onClick={handleStake} disabled={isStaking || isWrongNetwork} className="w-full py-3 sm:py-4 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 hover:from-cyan-400 hover:via-violet-400 hover:to-fuchsia-400 disabled:opacity-50 rounded-xl sm:rounded-full font-bold text-xs sm:text-sm text-white shadow-lg cursor-pointer flex items-center justify-center gap-2">
                          {isStaking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          {t.stakeBtn}
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#0B0817] border border-neutral-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg flex flex-col justify-between">
                      <div>
                        <h4 className="text-[11px] sm:text-sm font-bold text-white mb-3 sm:mb-4 uppercase tracking-widest">{t.positionTitle}</h4>
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex justify-between items-center border-b border-neutral-800 pb-2 sm:pb-3">
                            <span className="text-neutral-400 text-[10px] sm:text-sm">{t.totalStaked}</span>
                            <span className="text-white font-mono font-bold text-[11px] sm:text-base">{stakedBalance.toFixed(2)} AETH</span>
                          </div>
                          <div className="flex justify-between items-center pb-2 sm:pb-3">
                            <span className="text-neutral-400 text-[10px] sm:text-sm">{t.pendingRewards}</span>
                            <span className="text-green-400 font-mono font-bold text-[11px] sm:text-base">+{pendingReward.toFixed(4)} AETH</span>
                          </div>
                        </div>

                        {stakedBalance > 0 && (
                          <div className="mt-3 sm:mt-4 bg-[#05030F] border border-neutral-800 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                            <div className="flex justify-between text-[9px] sm:text-xs text-neutral-500 mb-1.5 sm:mb-2">
                              <span>{t.unstakeAmountLabel}</span>
                              <span>Staked: <span className="font-bold text-white">{stakedBalance.toFixed(2)}</span> AETH</span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <input
                                type="number"
                                value={unstakeInput}
                                onChange={(e) => setUnstakeInput(e.target.value)}
                                placeholder="0.0"
                                className="w-full bg-transparent text-lg sm:text-2xl font-mono text-white outline-none"
                              />
                              <button onClick={() => setUnstakeInput(stakedBalance.toString())} className="text-[9px] sm:text-xs font-bold bg-red-500/10 text-red-300 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg border border-red-500/20 cursor-pointer hover:bg-red-500/20">{t.maxBtn}</button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 mt-4">
                        {stakedBalance > 0 && (
                          <button
                            onClick={handleWithdrawStake}
                            disabled={isWithdrawingStake || isWrongNetwork}
                            className="w-full py-3 sm:py-4 border border-red-500/40 text-red-300 hover:bg-red-500/10 disabled:opacity-50 rounded-xl sm:rounded-full font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                          >
                            {isWithdrawingStake && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            {t.unstakeBtn}
                          </button>
                        )}
                        <button onClick={handleClaimReward} disabled={isWrongNetwork} className="w-full py-3 sm:py-4 border border-green-500/40 text-green-400 hover:bg-green-500/10 disabled:opacity-50 rounded-xl sm:rounded-full font-bold text-xs sm:text-sm transition-colors cursor-pointer">
                          {t.claimRewardsBtn}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: INFO KEAMANAN */}
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

                  <div className="bg-[#0B0817] border border-cyan-500/20 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg space-y-3">
                    <h5 className="text-sm sm:text-base font-bold text-white flex items-center gap-2"><KeyRound className="w-4 h-4 text-cyan-400"/> {t.secHowProtected}</h5>
                    <p className="text-[11px] sm:text-sm text-neutral-400 leading-relaxed">{t.secDesc1}</p>
                    <p className="text-[10px] sm:text-xs text-neutral-500 leading-relaxed">{t.secDesc2}</p>
                    <p className="text-[10px] sm:text-xs text-neutral-500 leading-relaxed">{t.secDesc3}</p>
                    <p className="text-[10px] sm:text-xs text-neutral-500 leading-relaxed">{t.secDesc4}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-[#0B0817] border border-cyan-500/30 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-cyan-600 text-[8px] sm:text-[10px] font-bold px-2.5 sm:px-3 py-1 rounded-bl-xl uppercase tracking-widest text-white">Active</div>
                      <h5 className="text-sm sm:text-lg font-bold text-white mb-1.5 sm:mb-2 flex items-center gap-2"><Lock className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400"/> ReentrancyGuard</h5>
                      <p className="text-[10px] sm:text-sm text-neutral-400 mb-4 sm:mb-6 leading-relaxed">{t.reentrancyDesc}</p>
                      <a href={`https://polygonscan.com/address/${STAKING_CONTRACT_ADDRESS}#code`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 sm:px-4 py-2 rounded-lg hover:bg-cyan-500/20 transition-all border border-cyan-500/30">
                        {t.viewCodeBtn} <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="bg-[#0B0817] border border-neutral-900 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg relative overflow-hidden">
                      <h5 className="text-sm sm:text-lg font-bold text-white mb-1.5 sm:mb-2 flex items-center gap-2"><Coins className="w-4 h-4 sm:w-5 h-5 text-yellow-500"/> {t.vaultReserveTitle}</h5>
                      <p className="text-[10px] sm:text-sm text-neutral-400 mb-4 sm:mb-6 leading-relaxed">{t.vaultReserveDesc}</p>
                      <a href={`https://polygonscan.com/address/${STAKING_CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-xs font-bold text-yellow-400 bg-yellow-500/10 px-3 sm:px-4 py-2 rounded-lg hover:bg-yellow-500/20 transition-all border border-yellow-500/30">
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
                          <input type="text" disabled value={READ_ONLY_RPC_URL} className="bg-[#0B0817] border border-neutral-800 text-neutral-400 text-[9px] sm:text-xs font-mono px-2.5 sm:px-3 py-2 rounded-lg w-full sm:w-48 outline-none" />
                          <span className={`text-[8px] sm:text-[10px] px-2 sm:px-3 py-2 rounded-lg font-bold uppercase tracking-widest shrink-0 ${isWrongNetwork ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>{isWrongNetwork ? t.wrongNetwork : t.connected}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#05030F] border border-neutral-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 sm:gap-2"><UploadCloud className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500"/> {t.storageLabel}</p>
                          <p className="text-[10px] sm:text-xs text-neutral-500 mt-1">{t.storageDesc}</p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
                          <input type="text" disabled value="Arweave via Irys" className="bg-[#0B0817] border border-neutral-800 text-neutral-400 text-[9px] sm:text-xs font-mono px-2.5 sm:px-3 py-2 rounded-lg w-full sm:w-48 outline-none text-center sm:text-left" />
                          <span className="text-[8px] sm:text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 sm:px-3 py-2 rounded-lg font-bold uppercase tracking-widest shrink-0">{t.permanentStatus}</span>
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
            &copy; {new Date().getFullYear()} Nienzer. All rights reserved. Decentralized Protocol V2.
          </p>
        </div>
      </footer>

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
              <div className="w-full bg-[#05030F] border border-neutral-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-[11px] sm:text-sm text-cyan-300 font-mono break-words leading-relaxed max-h-[50vh] sm:max-h-60 overflow-y-auto whitespace-pre-wrap shadow-inner">
                {selectedVault.decryptedMessage}
              </div>
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