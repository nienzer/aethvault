"use client";
// 1. IMPORT HOOKS WALLETCONNECT SECARA LENGKAP
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider, useDisconnect } from '@web3modal/ethers/react';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
} from '@/lib/cryptoUtils';
import { uploadToArweavePermanent, estimateArweaveCost, getIrysUploader } from '@/lib/arweaveUpload';

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
    ], "name": "LegacyClaimed", "type": "event" }
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

// ==========================================
// ALAMAT SMART CONTRACT
// ==========================================
const CONTRACT_ADDRESS = "0x63317e60C7bEC4a3e8a61e1a2436624d1b998576"; 
const STAKING_CONTRACT_ADDRESS = "0x318Ec508E9D33DaD230a76A600E04C26757A71FD"; 

const PLACEHOLDER_ADDRESS = "0x000000000000000000000000000000000000dEaD";
const IS_CONTRACT_ADDRESS_CONFIGURED =
  CONTRACT_ADDRESS.toLowerCase() !== PLACEHOLDER_ADDRESS.toLowerCase();
const IS_STAKING_ADDRESS_CONFIGURED =
  STAKING_CONTRACT_ADDRESS.toLowerCase() !== PLACEHOLDER_ADDRESS.toLowerCase();

// ==========================================
// MODE: TESTNET (Polygon Amoy)
// ==========================================
const TARGET_CHAIN_ID = 80002;
const TARGET_CHAIN_ID_HEX = "0x" + TARGET_CHAIN_ID.toString(16);
const TARGET_CHAIN_NAME = "Polygon Amoy Testnet";

const CIPHERTEXT_OVERHEAD_FACTOR = 2.5;

const TIER_ENUM_MAP = {
  basic: 0,
  premium: 1, 
  eternal: 2,
  legacy: 3,
};

const TIER_INDEX_TO_LABEL = {
  0: 'Basic',
  1: 'VIP',
  2: 'Eternal',
  3: 'Legacy',
};

const TIER_INDEX_TO_KEY = {
  0: 'basic',
  1: 'premium',
  2: 'eternal',
  3: 'legacy',
};

// ==========================================
// DAFTAR RPC OTOMATIS (Akan dicoba satu per satu jika ada yang mati)
// ==========================================
const RPC_LIST = [
  "https://polygon-amoy.g.alchemy.com/v2/alch_t_rxF7Xm42lFIqpP2ucAM", // 1. Utama (Paling Kuat) - Ganti tulisan ini!
  "https://rpc-amoy.polygon.technology",                            // 2. Cadangan 
  "https://polygon-amoy-bor-rpc.publicnode.com",                    // 3. Cadangan
  "https://rpc.amoy.polygon.gateway.fm"                             // 4. Cadangan
];

// FUNGSI PINTAR: Membuat Provider yang otomatis berpindah jika error
const getAutomaticProvider = () => {
  const providers = RPC_LIST.map(url => new ethers.JsonRpcProvider(url));
  return new ethers.FallbackProvider(providers);
};

const TRANSACTION_HISTORY_FROM_BLOCK = 43345845;

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
  const [unlockTime, setUnlockTime] = useState('12:00');
  const [tier, setTier] = useState('premium');
  const [inactivityYears, setInactivityYears] = useState('5');
  const [heirAddress, setHeirAddress] = useState('');
  const [isSealing, setIsSealing] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedCid, setUploadedCid] = useState('');
  const [pendingFileCipherRef, setPendingFileCipherRef] = useState(null);

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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedVault, setSelectedVault] = useState(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const myKeyPairRef = useRef(null);
  const [hasLocalKeyPair, setHasLocalKeyPair] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [onChainTierConfig, setOnChainTierConfig] = useState({});
  const [isTierConfigLoaded, setIsTierConfigLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchTierConfigs = async () => {
      try {
        // Menggunakan Auto-Fallback RPC
        const provider = walletProvider
          ? new ethers.BrowserProvider(walletProvider)
          : getAutomaticProvider();

        const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultABI, provider);

        const results = await Promise.all(
          [0, 1, 2, 3].map((idx) => contract.tierConfigs(idx))
        );

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
        console.error("Gagal memuat tierConfigs dari kontrak, memakai nilai fallback:", err);
      }
    };

    fetchTierConfigs();
    return () => { cancelled = true; };
  }, [walletProvider]);

  const tierDisplayMeta = {
    basic: { name: 'Basic', desc: t.tiersList.basicDesc, icon: 'bg-neutral-800', color: 'text-gray-300', border: 'border-neutral-600' },
    premium: { name: 'VIP Vault', desc: t.tiersList.vipDesc, icon: 'bg-cyan-500/20', color: 'text-cyan-400', border: 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.15)]' },
    eternal: { name: 'Eternal', desc: t.tiersList.eternalDesc, icon: 'bg-yellow-500/20', color: 'text-yellow-400', border: 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.15)]' },
    legacy: { name: t.tiersList.legacyName, desc: t.tiersList.legacyDesc, icon: 'bg-red-500/20', color: 'text-red-400', border: 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]' },
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

  const burnedTotal = useMemo(() => {
    return myCapsules
      .filter((c) => !c.asHeir)
      .reduce((sum, c) => {
        const key = TIER_INDEX_TO_KEY[c.tierIndex];
        const burn = tiers[key]?.burn ?? 0;
        return sum + burn;
      }, 0);
  }, [myCapsules, tiers]);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  const extractErrorMessage = (err) => {
    return (
      err?.reason ||
      err?.shortMessage ||
      err?.error?.message ||
      err?.data?.message ||
      err?.message ||
      "Transaksi gagal atau ditolak jaringan"
    );
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
      showToast(`Berhasil pindah ke jaringan ${TARGET_CHAIN_NAME}.`, 'success');
    } catch (err) {
      showToast(`Gagal pindah jaringan: ${extractErrorMessage(err)}`, 'error');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      const allIds = [
        ...ownedIds.map((id) => ({ id, asHeir: false })),
        ...heirIds.map((id) => ({ id, asHeir: true })),
      ];

      const results = await Promise.all(
        allIds.map(async ({ id, asHeir }) => {
          const meta = await contract.getCapsuleMeta(id);
          const ready = await contract.isCapsuleReady(id);
          const decryptedTitle = await tryDecryptTitle(meta.title, privateKeyForTitles);

          return {
            id: id.toString(),
            title: decryptedTitle ?? '🔒 Judul terenkripsi',
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
            tierLabel: TIER_INDEX_TO_LABEL[Number(meta.tier)] || (meta.isLegacy ? 'Legacy' : 'Time-Lock'),
            status: meta.contentDeleted
              ? 'Konten Dihapus'
              : meta.isClaimedOrRevealed
                ? (t.statusOpened || 'Sudah Dibuka')
                : ready
                  ? (t.statusReady || 'Siap Dibuka')
                  : (t.statusLocked || 'Terkunci'),
          };
        })
      );

      results.sort((a, b) => Number(b.id) - Number(a.id));
      setMyCapsules(results);
    } catch (err) {
      console.error("Gagal memuat kapsul dari blockchain:", err);
    } finally {
      setIsLoadingCapsules(false);
    }
  }, [t]);

  const fetchTransactionHistoryFromChain = useCallback(async (provider, userAddress) => {
    setIsLoadingHistory(true);
    try {
      // FIX UTAMA: Paksa menggunakan RPC Otomatis (Fallback) yang kuat!
      const strongProvider = getAutomaticProvider();

      const vaultContract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultABI, strongProvider);
      const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingABI, strongProvider);
      
      // Ambil block saat ini, lalu mundur 50.000 block ke belakang (aman untuk RPC gratisan)
      const currentBlock = await strongProvider.getBlockNumber();
      let fromBlock = currentBlock - 50000;
      if (fromBlock < 0) fromBlock = 0; 

      const [sealedLogs, stakedLogs, withdrawnLogs, claimedLogs] = await Promise.all([
        vaultContract.queryFilter(vaultContract.filters.CapsuleSealed(null, userAddress), fromBlock),
        stakingContract.queryFilter(stakingContract.filters.Staked(userAddress), fromBlock),
        stakingContract.queryFilter(stakingContract.filters.Withdrawn(userAddress), fromBlock),
        stakingContract.queryFilter(stakingContract.filters.RewardClaimed(userAddress), fromBlock),
      ]);

      const allLogs = [
        ...sealedLogs.map((log) => ({ log, kind: 'seal' })),
        ...stakedLogs.map((log) => ({ log, kind: 'stake' })),
        ...withdrawnLogs.map((log) => ({ log, kind: 'withdraw' })),
        ...claimedLogs.map((log) => ({ log, kind: 'claim' })),
      ];

      const blockTimeCache = new Map();
      const getBlockTime = (blockNumber) => {
        if (!blockTimeCache.has(blockNumber)) {
          blockTimeCache.set(blockNumber, strongProvider.getBlock(blockNumber).then((b) => Number(b.timestamp)));
        }
        return blockTimeCache.get(blockNumber);
      };

      const rows = await Promise.all(allLogs.map(async ({ log, kind }) => {
        const ts = await getBlockTime(log.blockNumber);
        const dateStr = new Date(ts * 1000).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
        const uniqueId = `${log.transactionHash}-${log.index}`;

        if (kind === 'seal') {
          const tierName = TIER_INDEX_TO_LABEL[Number(log.args.tier)] || 'Time-Lock';
          const cost = parseFloat(ethers.formatUnits(log.args.cost, 18));
          return {
            id: uniqueId, type: `Segel Kapsul (${tierName})`,
            detail: `Kapsul #${log.args.capsuleId.toString()} disegel permanen.`,
            date: dateStr, amount: -cost, blockNumber: log.blockNumber, logIndex: log.index,
          };
        }
        if (kind === 'stake') {
          return {
            id: uniqueId, type: 'Stake Token On-Chain',
            detail: 'Menambahkan likuiditas ke Staking.',
            date: dateStr, amount: -parseFloat(ethers.formatUnits(log.args.amount, 18)),
            blockNumber: log.blockNumber, logIndex: log.index,
          };
        }
        if (kind === 'withdraw') {
          return {
            id: uniqueId, type: 'Unstake Token On-Chain',
            detail: 'Menarik pokok dari Staking.',
            date: dateStr, amount: parseFloat(ethers.formatUnits(log.args.amount, 18)),
            blockNumber: log.blockNumber, logIndex: log.index,
          };
        }
        return {
          id: uniqueId, type: 'Klaim Reward On-Chain',
          detail: 'Menarik bunga staking.',
          date: dateStr, amount: parseFloat(ethers.formatUnits(log.args.reward, 18)),
          blockNumber: log.blockNumber, logIndex: log.index,
        };
      }));

      rows.sort((a, b) => (b.blockNumber - a.blockNumber) || (b.logIndex - a.logIndex));
      setTransactions(rows);
    } catch (err) {
      console.error("Gagal memuat riwayat transaksi dari blockchain:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    const fetchWalletData = async () => {
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
          } catch (err) {
            console.log("Gagal memuat data AetherVault:", err);
          }

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
          } catch (stakingErr) {
            console.log("Staking contract sync skipped/pending.");
          }

          let privateKeyForTitles = null;
          if (!isWrongNetwork) {
            try {
              const kp = await getOrDeriveKeyPair();
              privateKeyForTitles = kp.privateKey;
            } catch (keyErr) {
              console.log("User menolak/gagal menandatangani derivasi kunci; judul akan ditampilkan terkunci.", keyErr);
            }
          }

          await fetchCapsulesFromChain(provider, address, privateKeyForTitles);
          fetchTransactionHistoryFromChain(provider, address);
        } catch (err) {
          console.error("Gagal membaca data wallet", err);
        }
      } else {
        setNativeBalance('0.0000');
        setAethBalance(0);
        setStakedBalance(0);
        setPendingReward(0);
        setMyCapsules([]);
        setTransactions([]);
        setMyPublicKeyRegistered(false);
        myKeyPairRef.current = null;
        setHasLocalKeyPair(false);
      }
    };

    fetchWalletData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, walletProvider, address, fetchCapsulesFromChain, fetchTransactionHistoryFromChain, isWrongNetwork]);

  const formatAddress = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '';

  const handleRegisterEncryptionKey = async () => {
    if (!isConnected) return showToast('Hubungkan dompet terlebih dahulu.', 'error');
    if (isWrongNetwork) return showToast(`Pindah ke jaringan ${TARGET_CHAIN_NAME} terlebih dahulu.`, 'error');
    setIsRegisteringKey(true);
    try {
      const { publicKey } = await getOrDeriveKeyPair();

      const signer = await getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultABI, signer);
      const tx = await contract.registerPublicKey(publicKeyToBytes(publicKey));
      showToast('Mendaftarkan kunci enkripsi ke blockchain...', 'info');
      await tx.wait();

      setMyPublicKeyRegistered(true);
      showToast('Kunci enkripsi berhasil didaftarkan. Orang lain kini bisa mengirim kapsul terenkripsi untuk Anda.', 'success');
    } catch (err) {
      console.error(err);
      showToast(`Gagal mendaftarkan kunci: ${extractErrorMessage(err)}`, 'error');
    } finally {
      setIsRegisteringKey(false);
    }
  };

  const isPermanentTier = tier === 'eternal' || tier === 'legacy';
  const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024; 

  const [stagedUpload, setStagedUpload] = useState(null);
  const [isPreparingUpload, setIsPreparingUpload] = useState(false);

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isConnected) {
      return showToast('Hubungkan dompet terlebih dahulu sebelum melampirkan file.', 'error');
    }
    if (isWrongNetwork) {
      return showToast(`Pindah ke jaringan ${TARGET_CHAIN_NAME} terlebih dahulu.`, 'error');
    }
    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      return showToast(`File terlalu besar (maks ${MAX_ATTACHMENT_SIZE_BYTES / (1024 * 1024)}MB).`, 'error');
    }

    setSelectedFile(file);
    setIsPreparingUpload(true);

    try {
      const { publicKey: recipientPublicKey } = await resolveRecipient();

      const fileBase64 = await fileToBase64(file);
      const cipherPayload = JSON.stringify({
        name: file.name,
        type: file.type,
        data: fileBase64,
      });
      const encryptedPayload = await encryptForPublicKey(recipientPublicKey, cipherPayload);
      const encryptedBytes = new TextEncoder().encode(encryptedPayload);

      const provider = new ethers.BrowserProvider(walletProvider);
      await ensureCorrectNetwork(await provider.getSigner());

      const uploader = await getIrysUploader(provider);
      const estimatedCost = await estimateArweaveCost(uploader, encryptedBytes.byteLength);

      setStagedUpload({ file, encryptedBytes, estimatedCost });
    } catch (error) {
      console.error("Persiapan upload gagal:", error);
      showToast(`Gagal menyiapkan lampiran: ${extractErrorMessage(error)}`, "error");
      setSelectedFile(null);
    } finally {
      setIsPreparingUpload(false);
    }
  };

  const handleConfirmArweaveUpload = async () => {
    if (!stagedUpload) return;
    setIsUploading(true);
    try {
      const result = await uploadToArweavePermanent(
        new ethers.BrowserProvider(walletProvider),
        stagedUpload.encryptedBytes,
        [{ name: "Encryption", value: "ECIES-secp256k1" }]
      );

      setUploadedCid(result.arweaveUrl);
      setPendingFileCipherRef(result.arweaveUrl);
      setMessage(prev => prev + (prev ? '\n\n' : '') + `[Lampiran Terenkripsi (Arweave permanen): ${result.arweaveUrl}]`);
      showToast("File berhasil dienkripsi dan disimpan PERMANEN di Arweave, dibayar dari wallet Anda sendiri.", "success");
      setStagedUpload(null);
    } catch (error) {
      console.error("Upload Error:", error);
      showToast(`Gagal mengunggah file: ${extractErrorMessage(error)}`, "error");
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
      if (!ethers.isAddress(heirAddress)) {
        throw new Error("Masukkan alamat ahli waris yang valid terlebih dahulu.");
      }
      const heirKey = await contract.encryptionPublicKeys(heirAddress);
      if (!heirKey || heirKey === '0x') {
        throw new Error("Ahli waris belum mendaftarkan kunci enkripsi di aplikasi ini. Minta mereka membuka AetherVault dan mendaftarkan kunci di tab Settings terlebih dahulu.");
      }
      return { publicKey: heirKey, privateKey: null };
    }

    const kp = await getOrDeriveKeyPair();
    return { publicKey: publicKeyToBytes(kp.publicKey), privateKey: kp.privateKey };
  };

  const handleSeal = async (e) => {
    e.preventDefault();
    if (!isConnected) return showToast('Otorisasi ditolak. Harap hubungkan dompet.', 'error');
    if (isWrongNetwork) return showToast(`Pindah ke jaringan ${TARGET_CHAIN_NAME} terlebih dahulu.`, 'error');

    const selectedTierData = tiers[tier];

    if (message.length > selectedTierData.maxLength) {
      return showToast(`Pesan terlalu panjang! Maksimal ${selectedTierData.maxLength} karakter.`, 'error');
    }

    if (tier === 'legacy' && !ethers.isAddress(heirAddress)) {
      return showToast('Format alamat Dompet Ahli Waris tidak valid!', 'error');
    }

    setIsSealing(true);
    try {
      showToast('Mengenkripsi pesan Anda di browser...', 'info');

      const { publicKey: recipientPublicKey, privateKey: ownPrivateKeyForRefresh } = await resolveRecipient();
      const encryptedMessage = await encryptForPublicKey(recipientPublicKey, message);

      if (encryptedMessage.length > selectedTierData.maxLength * CIPHERTEXT_OVERHEAD_FACTOR) {
        throw new Error('Pesan (setelah dienkripsi) melebihi kapasitas tier ini. Pilih tier lebih besar atau persingkat pesan.');
      }

      const plainTitle = title || "Kapsul Tanpa Judul";
      const encryptedTitle = await encryptForPublicKey(recipientPublicKey, plainTitle);

      const signer = await getSigner();
      await ensureCorrectNetwork(signer);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultABI, signer);

      showToast('Mempersiapkan transaksi On-Chain di Blockchain...', 'info');

      let tx;
      if (tier === 'legacy') {
        const inactivitySeconds = parseInt(inactivityYears) * 365 * 24 * 60 * 60;
        tx = await contract.sealLegacyCapsule(
          encryptedTitle,
          encryptedMessage,
          inactivitySeconds,
          heirAddress
        );
      } else {
        if (!unlockDate) throw new Error("Pilih tanggal pembukaan kapsul!");
        const safeTime = unlockTime && /^\d{2}:\d{2}$/.test(unlockTime) ? unlockTime : '00:00';
        const unlockTimeMs = new Date(`${unlockDate}T${safeTime}:00`).getTime();
        if (isNaN(unlockTimeMs)) throw new Error("Tanggal/jam pembukaan kapsul tidak valid!");
        const unlockTimestamp = Math.floor(unlockTimeMs / 1000);
        const tierEnumValue = TIER_ENUM_MAP[tier];
        tx = await contract.sealTimeLockCapsule(
          tierEnumValue,
          encryptedTitle,
          encryptedMessage,
          unlockTimestamp
        );
      }

      showToast("Transaksi dikirim. Menunggu konfirmasi blok...", "info");
      await tx.wait();

      setAethBalance(prev => prev - selectedTierData.cost);

      showToast(`Berhasil! Kapsul disegel permanen di Blockchain dalam bentuk terenkripsi.`, 'success');
      setTitle(''); setMessage(''); setUnlockDate(''); setUnlockTime('12:00'); setHeirAddress('');
      setSelectedFile(null); setUploadedCid(''); setPendingFileCipherRef(null);
      setActiveTab('vaults');

      const provider = new ethers.BrowserProvider(walletProvider);
      await fetchCapsulesFromChain(provider, address, ownPrivateKeyForRefresh);
      fetchTransactionHistoryFromChain(provider, address);

    } catch (err) {
      console.error(err);
      showToast(`Gagal: ${extractErrorMessage(err)}`, 'error');
    } finally {
      setIsSealing(false);
    }
  };

  const handleOpenVault = async (capsule) => {
    if (isWrongNetwork) {
      return showToast(`Pindah ke jaringan ${TARGET_CHAIN_NAME} terlebih dahulu.`, 'error');
    }
    if (capsule.contentDeleted) {
      setSelectedVault({
        ...capsule,
        decryptedMessage: null,
        error: 'Konten kapsul ini sudah dihapus permanen dari state kontrak oleh pemilik/ahli waris. Tidak ada lagi yang bisa ditampilkan.',
      });
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
        showToast('Mengambil ulang kapsul yang sudah pernah dibuka (gratis, tanpa gas)...', 'info');
        ciphertext = await contract.getOpenedCiphertext(capsule.id);
      } else {
        const fnName = capsule.asHeir ? 'claimLegacy' : 'revealCapsule';
        showToast('Memverifikasi syarat pembukaan di blockchain...', 'info');

        ciphertext = await contract[fnName].staticCall(capsule.id);

        const tx = await contract[fnName](capsule.id);
        showToast('Transaksi dikirim. Menunggu konfirmasi...', 'info');
        await tx.wait();
      }

      const { privateKey } = await getOrDeriveKeyPair();
      const plaintext = await decryptWithPrivateKey(privateKey, ciphertext);

      setSelectedVault(prev => ({ ...prev, decryptedMessage: plaintext }));
      showToast('Kapsul berhasil didekripsi secara lokal di browser Anda.', 'success');

      const provider = new ethers.BrowserProvider(walletProvider);
      await fetchCapsulesFromChain(provider, address, privateKey);
    } catch (err) {
      console.error(err);
      const msg = extractErrorMessage(err);
      setSelectedVault(prev => ({ ...prev, error: msg }));
      showToast(`Gagal membuka kapsul: ${msg}`, 'error');
    } finally {
      setIsDecrypting(false);
    }
  };

  const [isPinging, setIsPinging] = useState(null);

  const handlePingAlive = async (capsule) => {
    if (isWrongNetwork) {
      return showToast(`Pindah ke jaringan ${TARGET_CHAIN_NAME} terlebih dahulu.`, 'error');
    }
    setIsPinging(capsule.id);
    try {
      const signer = await getSigner();
      await ensureCorrectNetwork(signer);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultABI, signer);

      const tx = await contract.pingAlive(capsule.id);
      showToast('Melaporkan status masih aktif ke blockchain...', 'info');
      await tx.wait();

      showToast('Berhasil! Jam mundur ke ahli waris sudah di-reset dari sekarang.', 'success');

      const provider = new ethers.BrowserProvider(walletProvider);
      await fetchCapsulesFromChain(provider, address, myKeyPairRef.current?.privateKey ?? null);
    } catch (err) {
      console.error(err);
      showToast(`Gagal melaporkan status aktif: ${extractErrorMessage(err)}`, 'error');
    } finally {
      setIsPinging(null);
    }
  };

  const [isDeletingContent, setIsDeletingContent] = useState(null);

  const handleDeleteOpenedContent = async (capsule) => {
    if (isWrongNetwork) {
      return showToast(`Pindah ke jaringan ${TARGET_CHAIN_NAME} terlebih dahulu.`, 'error');
    }
    const confirmed = window.confirm(
      'Hapus konten kapsul ini?\n\n' +
      'Setelah dihapus, judul & pesan tidak bisa diambil lagi lewat aplikasi ini — pastikan Anda sudah menyimpan salinannya sendiri.\n\n' +
      'CATATAN JUJUR: ini menghapus dari data kontrak SAAT INI dan ke depan, TAPI riwayat blockchain lama (sebelum penghapusan ini) tetap bisa ada di full/archive node pihak lain selamanya — blockchain tidak pernah benar-benar "lupa" secara mutlak.\n\n' +
      'Lanjutkan?'
    );
    if (!confirmed) return;

    setIsDeletingContent(capsule.id);
    try {
      const signer = await getSigner();
      await ensureCorrectNetwork(signer);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultABI, signer);

      const tx = await contract.deleteOpenedContent(capsule.id);
      showToast('Menghapus konten kapsul dari kontrak...', 'info');
      await tx.wait();

      showToast('Konten kapsul berhasil dihapus dari state kontrak saat ini.', 'success');
      setSelectedVault(null);

      const provider = new ethers.BrowserProvider(walletProvider);
      await fetchCapsulesFromChain(provider, address, myKeyPairRef.current?.privateKey ?? null);
    } catch (err) {
      console.error(err);
      showToast(`Gagal menghapus konten: ${extractErrorMessage(err)}`, 'error');
    } finally {
      setIsDeletingContent(null);
    }
  };

  const handleStake = async () => {
    const amount = parseFloat(stakeInput);
    if (isNaN(amount) || amount <= 0) return showToast("Masukkan nominal AETH yang valid", "error");
    if (!isConnected) return showToast("Hubungkan dompet terlebih dahulu", "error");
    if (isWrongNetwork) return showToast(`Pindah ke jaringan ${TARGET_CHAIN_NAME} terlebih dahulu.`, 'error');

    setIsStaking(true);
    try {
      const signer = await getSigner();
      await ensureCorrectNetwork(signer);
      const amountInWei = ethers.parseUnits(amount.toString(), 18);

      const tokenContract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultABI, signer);
      const currentAllowance = await tokenContract.allowance(address, STAKING_CONTRACT_ADDRESS);

      if (currentAllowance < amountInWei) {
        showToast("Meminta izin (approve) token AETH untuk kontrak Staking...", "info");
        const approveTx = await tokenContract.approve(STAKING_CONTRACT_ADDRESS, amountInWei);
        await approveTx.wait();
      }

      showToast("Mempersiapkan transaksi Staking On-Chain...", "info");
      const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingABI, signer);
      const tx = await stakingContract.stake(amountInWei);

      showToast("Transaksi staking dikirim. Menunggu konfirmasi blockchain...", "info");
      await tx.wait();

      setAethBalance(prev => prev - amount);
      setStakedBalance(prev => prev + amount);
      setStakeInput('');
      showToast(`Berhasil melakukan Staking ${amount} AETH secara On-Chain!`, "success");

      const provider = new ethers.BrowserProvider(walletProvider);
      fetchTransactionHistoryFromChain(provider, address);

    } catch (err) {
      console.error(err);
      showToast(`Gagal staking: ${extractErrorMessage(err)}`, "error");
    } finally {
      setIsStaking(false);
    }
  };

  const handleWithdrawStake = async () => {
    const amount = parseFloat(unstakeInput);
    if (isNaN(amount) || amount <= 0) return showToast("Masukkan nominal AETH yang valid", "error");
    if (!isConnected) return showToast("Hubungkan dompet terlebih dahulu", "error");
    if (isWrongNetwork) return showToast(`Pindah ke jaringan ${TARGET_CHAIN_NAME} terlebih dahulu.`, 'error');
    if (amount > stakedBalance) return showToast("Jumlah melebihi saldo yang Anda stake", "error");

    setIsWithdrawingStake(true);
    try {
      const signer = await getSigner();
      await ensureCorrectNetwork(signer);
      const amountInWei = ethers.parseUnits(amount.toString(), 18);

      const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingABI, signer);
      const tx = await stakingContract.withdraw(amountInWei);

      showToast("Transaksi unstake dikirim. Menunggu konfirmasi blockchain...", "info");
      await tx.wait();

      setAethBalance(prev => prev + amount);
      setStakedBalance(prev => prev - amount);
      setUnstakeInput('');
      showToast(`Berhasil menarik ${amount} AETH dari staking.`, "success");

      const provider = new ethers.BrowserProvider(walletProvider);
      fetchTransactionHistoryFromChain(provider, address);

    } catch (err) {
      console.error(err);
      showToast(`Gagal unstake: ${extractErrorMessage(err)}`, "error");
    } finally {
      setIsWithdrawingStake(false);
    }
  };

  const handleClaimReward = async () => {
    if (!isConnected) return showToast("Hubungkan dompet terlebih dahulu", "error");
    if (isWrongNetwork) return showToast(`Pindah ke jaringan ${TARGET_CHAIN_NAME} terlebih dahulu.`, 'error');

    showToast("Memproses klaim reward dari blockchain...", "info");

    try {
      const signer = await getSigner();
      await ensureCorrectNetwork(signer);
      const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingABI, signer);

      const tx = await stakingContract.claimReward();

      showToast("Transaksi klaim dikirim. Menunggu konfirmasi...", "info");
      await tx.wait();

      showToast(`Berhasil klaim reward! Token telah masuk ke dompet Anda.`, "success");

      setAethBalance(prev => prev + pendingReward);
      setPendingReward(0);

      const provider = new ethers.BrowserProvider(walletProvider);
      fetchTransactionHistoryFromChain(provider, address);

    } catch (err) {
      console.error(err);
      showToast(`Gagal klaim reward: ${extractErrorMessage(err)}`, "error");
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
          className={`w-full text-left px-4 py-3.5 rounded-2xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-between group ${activeTab === menu.id ? 'bg-gradient-to-r from-cyan-500/15 via-cyan-500/10 to-violet-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.12)]' : 'text-neutral-400 hover:bg-white/[0.04] hover:text-white border border-transparent'}`}
        >
          <span className="flex items-center gap-3">
            <menu.icon className={`w-4 h-4 ${activeTab === menu.id ? 'text-cyan-400' : 'text-neutral-500 group-hover:text-neutral-300'}`} />
            {menu.label}
          </span>
          {menu.count !== undefined && (
            <span className={`px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-mono ${activeTab === menu.id ? 'bg-cyan-500/20 text-cyan-300' : 'bg-neutral-900 text-neutral-400'}`}>{menu.count}</span>
          )}
        </button>
      ))}
    </nav>
  );

  if (!IS_CONTRACT_ADDRESS_CONFIGURED || !IS_STAKING_ADDRESS_CONFIGURED) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030508] text-gray-200 p-6">
        <div className="max-w-md w-full bg-[#080808] border border-red-500/40 rounded-3xl p-6 sm:p-8 space-y-4 text-center shadow-[0_0_30px_rgba(239,68,68,0.15)]">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-lg font-extrabold text-red-300">Konfigurasi Belum Lengkap</h2>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            {!IS_CONTRACT_ADDRESS_CONFIGURED && "CONTRACT_ADDRESS "}
            {!IS_CONTRACT_ADDRESS_CONFIGURED && !IS_STAKING_ADDRESS_CONFIGURED && "dan "}
            {!IS_STAKING_ADDRESS_CONFIGURED && "STAKING_CONTRACT_ADDRESS "}
            masih memakai alamat placeholder (<code className="text-red-300 font-mono">0x000...dEaD</code>). Ganti dengan alamat hasil deploy sebenarnya di bagian atas file sebelum aplikasi ini dijalankan untuk pengguna nyata.
          </p>
          <p className="text-[10px] sm:text-xs text-neutral-600">Pesan ini hanya untuk developer — tidak akan tampil setelah dikonfigurasi dengan benar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#030508] text-gray-200 font-sans selection:bg-cyan-500/35 relative overflow-x-hidden">

      {/* AMBIENT BACKGROUND GLOW — kesan web3 modern, halus & tidak mengganggu keterbacaan */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] rounded-full bg-cyan-600/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[28rem] h-[28rem] rounded-full bg-violet-600/10 blur-[130px]" />
        <div className="absolute bottom-0 left-1/4 w-[24rem] h-[24rem] rounded-full bg-blue-600/[0.07] blur-[110px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.035)_1px,transparent_0)] bg-[size:28px_28px]" />
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-4 sm:right-8 z-[100] animate-in fade-in slide-in-from-right-8 duration-300">
          <div className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-2xl border ${toast.type === 'success' ? 'bg-green-950/90 border-green-500/40 text-green-300' : toast.type === 'error' ? 'bg-red-950/90 border-red-500/40 text-red-300' : 'bg-[#080808] border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'} backdrop-blur-md max-w-[90vw]`}>
            {toast.type === 'success' ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 shrink-0" /> : toast.type === 'error' ? <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 shrink-0" /> : <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />}
            <p className="text-[11px] sm:text-sm font-medium">{toast.msg}</p>
          </div>
        </div>
      )}

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-[#030508]/95 backdrop-blur-xl z-40 lg:hidden pt-24 px-6 pb-6 overflow-y-auto border-b border-white/[0.06] shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest font-mono">{t.menuTitle}</h2>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-neutral-400 hover:text-white p-2 bg-neutral-900 rounded-full"><X className="w-4 h-4"/></button>
          </div>
          {renderNavMenu(true)}

          <div className="mt-8 pt-5 border-t border-white/[0.06] px-2">
            <div className="flex items-center justify-between text-[10px] text-neutral-500">
              <span className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-cyan-500 animate-pulse" /> {t.mainnetLabel}</span>
              <span className="font-mono text-neutral-400">{TARGET_CHAIN_NAME}</span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full pt-0 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

          {/* WEB3 CONTROL PANEL */}
          <div className="bg-white/[0.025] backdrop-blur-xl border border-white/[0.07] p-3 sm:p-4 rounded-2xl sm:rounded-3xl mb-6 lg:mb-8 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 bg-neutral-900 border border-white/[0.08] rounded-xl text-neutral-400 hover:text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden lg:flex items-center gap-2 text-cyan-500 font-bold font-mono text-[10px] sm:text-xs uppercase tracking-widest px-2">
                <Activity className="w-4 h-4" /> Web3 Terminal
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {!isConnected ? (
                <button
                  onClick={() => open()}
                  className="bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:via-blue-500 hover:to-violet-500 text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-full font-bold flex items-center gap-1.5 sm:gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] text-[10px] sm:text-sm cursor-pointer whitespace-nowrap"
                >
                  <Wallet className="w-3 h-3 sm:w-4 sm:h-4" /> {t.connectWallet}
                </button>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <div className="hidden md:flex items-center gap-2.5 bg-[#030508] px-4 py-2 rounded-full border border-white/[0.08]">
                    <Cpu className="w-4 h-4 text-cyan-500" />
                    <div className="flex flex-col">
                      <span className="text-[9px] text-neutral-400 uppercase tracking-wider">{t.gasFeeLabel}</span>
                      <span className="text-xs font-bold font-mono text-white">{nativeBalance} POL</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 bg-[#030508] px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/[0.08] shadow-inner">
                    <div className="hidden sm:flex w-7 h-7 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 items-center justify-center shadow-md">
                      <Wallet className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-mono text-[8px] sm:text-[10px] text-cyan-400">{formatAddress(address)}</span>
                      <span className="text-[10px] sm:text-xs font-bold font-mono text-white">{aethBalance.toLocaleString()} AETH</span>
                    </div>
                  </div>
                  <button
                    onClick={() => disconnect()}
                    className="p-1.5 sm:p-2.5 bg-[#030508] hover:bg-red-500/10 border border-white/[0.08] hover:border-red-500/40 rounded-full text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* PERINGATAN: JARINGAN SALAH — diprioritaskan di atas peringatan kunci */}
          {isWrongNetwork && (
            <div className="bg-red-950/30 border border-red-500/40 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-bold text-red-300">Anda terhubung ke jaringan yang salah</p>
                  <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">AetherVault hanya berjalan di {TARGET_CHAIN_NAME}. Pindah jaringan sebelum menyegel/membuka kapsul — kunci enkripsi berbeda di tiap jaringan.</p>
                </div>
              </div>
              <button
                onClick={handleSwitchNetwork}
                disabled={isSwitchingNetwork}
                className="whitespace-nowrap bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 text-red-300 px-4 py-2 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSwitchingNetwork ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                Pindah ke {TARGET_CHAIN_NAME}
              </button>
            </div>
          )}

          {/* PERINGATAN: KUNCI ENKRIPSI BELUM TERDAFTAR */}
          {isConnected && !isWrongNetwork && !myPublicKeyRegistered && (
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <KeyRound className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-bold text-amber-300">Kunci enkripsi belum terdaftar</p>
                  <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">Daftarkan kunci enkripsi Anda agar orang lain bisa menjadikan Anda ahli waris kapsul terenkripsi.</p>
                </div>
              </div>
              <button
                onClick={handleRegisterEncryptionKey}
                disabled={isRegisteringKey}
                className="whitespace-nowrap bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 px-4 py-2 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isRegisteringKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                Daftarkan Kunci
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Sidebar Desktop */}
            <div className="hidden lg:block lg:col-span-1 space-y-6">
              <div className="bg-white/[0.025] backdrop-blur-xl border border-white/[0.07] p-5 rounded-3xl sticky top-28 shadow-xl">
                <h2 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-4 px-3 font-mono">{t.menuTitle}</h2>
                {renderNavMenu()}
                <div className="mt-8 pt-5 border-t border-white/[0.06] px-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <span className="flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-cyan-500 animate-pulse" /> {t.mainnetLabel}</span>
                    <span className="font-mono text-neutral-400">{TARGET_CHAIN_NAME}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Konten Tab */}
            <div className="lg:col-span-3 space-y-6">

              {/* TAB: BUAT KAPSUL */}
              {activeTab === 'create' && (
                <div className="bg-white/[0.025] backdrop-blur-xl border border-white/[0.07] rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl space-y-6 sm:space-y-8">
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-white mb-1 sm:mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" /> {t.createTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-400">{t.createDesc}</p>
                    <p className="text-[10px] sm:text-xs text-cyan-500/80 mt-2 flex items-center gap-1.5">
                      <Lock className="w-3 h-3" /> Pesan akan dienkripsi (ECIES) langsung di browser Anda sebelum dikirim ke blockchain.
                    </p>
                    {!isTierConfigLoaded && (
                      <p className="text-[10px] sm:text-xs text-amber-500/80 mt-1.5 flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin" /> Memuat biaya tier langsung dari kontrak... (angka di bawah sementara pakai perkiraan)
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
                        className="w-full bg-[#030508] border border-white/[0.08] rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-white focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.1)] outline-none transition-all font-medium"
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
                            className={`p-3 sm:p-5 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${tier === key ? `${data.border} bg-neutral-900/90` : 'border-white/[0.06] bg-[#030508] hover:border-neutral-700'}`}
                          >
                            <div>
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2 sm:gap-0">
                                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl ${data.icon} flex items-center justify-center shrink-0`}>
                                  {key === 'legacy' ? <UserX className={`w-3 h-3 sm:w-4 sm:h-4 ${data.color}`} /> : <Shield className={`w-3 h-3 sm:w-4 sm:h-4 ${data.color}`} />}
                                </div>
                                <span className="font-mono text-[9px] sm:text-xs font-bold text-white px-2 py-0.5 sm:py-1 bg-[#030508] rounded-md sm:rounded-lg border border-white/[0.08]">{data.cost} AETH</span>
                              </div>
                              <div className="font-bold text-xs sm:text-sm mb-1 text-white truncate">{data.name}</div>
                              <p className="text-[9px] sm:text-[11px] text-neutral-400 mb-3 sm:mb-4 leading-relaxed line-clamp-2 sm:line-clamp-none">{data.desc}</p>
                            </div>
                            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between border-t border-white/[0.08]/80 pt-2 sm:pt-3 w-full gap-1.5 xl:gap-0">
                              <span className="text-[8px] sm:text-[10px] text-neutral-500 uppercase tracking-wider font-mono hidden sm:block">{t.autoBurnProtocol}</span>
                              <span className="text-[9px] sm:text-[10px] text-red-400 font-bold flex items-center gap-1 font-mono"><Flame className="w-3 h-3" /> {data.burn} Burn</span>
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
                            Arweave permanen — biaya penyimpanan dibayar terpisah dari wallet Anda
                          </span>
                        )}
                      </label>

                      <div className={`border-2 border-dashed rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center transition-all ${isPermanentTier ? 'border-cyan-500/30 hover:border-cyan-500 bg-[#030508]' : 'border-white/[0.08] bg-[#080808] opacity-60 cursor-not-allowed'}`}>
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
                                <p className="text-[9px] sm:text-[10px] text-cyan-500 font-mono truncate w-full">{uploadedCid} (ciphertext)</p>
                              </div>
                            </div>
                            <button type="button" onClick={() => {setSelectedFile(null); setUploadedCid(''); setPendingFileCipherRef(null);}} className="text-neutral-500 hover:text-red-400 p-1 sm:p-2 cursor-pointer ml-auto">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : isPreparingUpload ? (
                          <div className="py-3 sm:py-4">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2 sm:mb-3"></div>
                            <p className="text-[10px] sm:text-xs font-bold text-cyan-400 animate-pulse">Mengenkripsi & menghitung estimasi biaya...</p>
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
                                Estimasi biaya penyimpanan permanen: <span className="font-mono font-bold">~{stagedUpload.estimatedCost} POL</span>
                              </p>
                              <p className="text-[9px] sm:text-[10px] text-neutral-400 mt-1">
                                Biaya ini dibayar SEKARANG dari wallet Anda dan TIDAK BISA dikembalikan, meskipun kapsul gagal disegel setelahnya. Wallet Anda akan meminta konfirmasi terpisah.
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {isUploading ? (
                                <div className="flex-1 flex items-center justify-center gap-2 py-2.5 text-cyan-400 text-[10px] sm:text-xs font-bold">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Mengunggah ke Arweave...
                                </div>
                              ) : (
                                <>
                                  <button type="button" onClick={handleConfirmArweaveUpload} className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 font-bold py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs cursor-pointer">
                                    Konfirmasi & Bayar
                                  </button>
                                  <button type="button" onClick={handleCancelStagedUpload} className="px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs cursor-pointer">
                                    Batal
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
                            <p className="text-[9px] sm:text-[10px] text-neutral-600 mt-1">{t.ipfsUploadSub} · Maks 10MB</p>
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
                        className="w-full h-32 sm:h-40 bg-[#030508] border border-white/[0.08] rounded-xl sm:rounded-2xl p-3 sm:p-5 text-[11px] sm:text-sm text-white focus:border-cyan-500 outline-none resize-none font-mono transition-all"
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
                              className="w-full bg-[#030508] border border-white/[0.08] rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-white focus:border-red-500 outline-none cursor-pointer"
                            >
                              <option value="5">5 Years (Minimum Legacy Standard)</option>
                              <option value="10">10 Years</option>
                              <option value="20">20 Years</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] sm:text-xs font-bold text-red-400 uppercase tracking-widest mb-1.5 sm:mb-2">{t.heirAddressLabel}</label>
                            <input
                              type="text"
                              value={heirAddress}
                              onChange={(e) => setHeirAddress(e.target.value)}
                              placeholder="0x..."
                              className="w-full bg-[#030508] border border-white/[0.08] rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-white focus:border-red-500 outline-none font-mono"
                              required
                            />
                            <p className="text-[9px] sm:text-[10px] text-neutral-500 mt-1.5">Ahli waris harus sudah membuka AetherVault sekali dan mendaftarkan kunci enkripsi di tab Settings.</p>
                          </div>
                          <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/20 rounded-lg sm:rounded-xl p-2.5 sm:p-3">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                            <p className="text-[9px] sm:text-[10px] text-neutral-400 leading-relaxed">
                              Judul & pesan kapsul Legacy dienkripsi khusus untuk ahli waris. Setelah disegel, <span className="text-red-300 font-bold">Anda sendiri tidak akan bisa membacanya lagi</span> — hanya ahli waris yang bisa, setelah syarat tidak-aktif terpenuhi.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5 sm:space-y-2">
                          <label className="block text-[10px] sm:text-xs font-bold text-cyan-500 uppercase tracking-widest">{t.timeLockLabel}</label>
                          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 sm:gap-3">
                            <div className="relative">
                              <Clock className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500" />
                              <input
                                type="date"
                                value={unlockDate}
                                onChange={(e) => setUnlockDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full bg-black/40 backdrop-blur-sm border border-white/[0.07] rounded-xl sm:rounded-2xl pl-10 sm:pl-12 pr-4 sm:pr-5 py-3 sm:py-4 text-xs sm:text-sm text-white focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10 outline-none font-mono transition-all"
                                style={{ colorScheme: 'dark' }}
                                required
                              />
                            </div>
                            <div className="relative">
                              <input
                                type="time"
                                value={unlockTime}
                                onChange={(e) => setUnlockTime(e.target.value)}
                                className="w-full sm:w-36 bg-black/40 backdrop-blur-sm border border-white/[0.07] rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm text-white focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10 outline-none font-mono transition-all"
                                style={{ colorScheme: 'dark' }}
                                required
                              />
                            </div>
                          </div>
                          <p className="text-[9px] sm:text-[10px] text-neutral-500 pl-0.5">
                            Kapsul akan otomatis siap dibuka pada tanggal & jam ini (waktu lokal perangkat Anda).
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={!isConnected || isSealing || isWrongNetwork}
                      className={`w-full font-bold py-3 sm:py-4 rounded-full flex justify-center items-center gap-1.5 sm:gap-2 transition-all text-xs sm:text-sm mt-2 sm:mt-4 ${isConnected && !isSealing && !isWrongNetwork ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:via-blue-500 hover:to-violet-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer' : 'bg-[#080808] text-neutral-600 cursor-not-allowed border border-white/[0.08]'}`}
                    >
                      {isSealing ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      {isSealing ? 'Memproses...' : isWrongNetwork ? `Pindah ke ${TARGET_CHAIN_NAME} dulu` : (isConnected ? t.sealButton : t.connectToSeal)}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB: BRANKAS SAYA */}
              {activeTab === 'vaults' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-white/[0.025] backdrop-blur-xl border border-white/[0.07] p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl">
                    <h3 className="text-lg sm:text-xl font-extrabold text-white mb-1 sm:mb-2">{t.vaultsTitle}</h3>
                    <p className="text-xs sm:text-sm text-neutral-400">{t.vaultsDesc}</p>
                  </div>

                  {isLoadingCapsules ? (
                    <div className="text-center py-16 sm:py-24 bg-[#080808] rounded-2xl sm:rounded-3xl border border-dashed border-white/[0.08]">
                      <Loader2 className="w-8 h-8 text-cyan-500 mx-auto mb-3 animate-spin" />
                      <p className="text-neutral-400 text-xs sm:text-sm">Memuat kapsul dari blockchain...</p>
                    </div>
                  ) : myCapsules.length === 0 ? (
                    <div className="text-center py-16 sm:py-24 bg-[#080808] rounded-2xl sm:rounded-3xl border border-dashed border-white/[0.08]">
                      <Layers className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-700 mx-auto mb-3 sm:mb-4" />
                      <p className="text-neutral-300 font-bold mb-1 text-sm sm:text-base">{t.noVaultsTitle}</p>
                      <p className="text-neutral-500 text-[11px] sm:text-sm max-w-sm mx-auto mb-5 sm:mb-6 px-4">{t.noVaultsDesc}</p>
                      <button onClick={() => setActiveTab('create')} className="bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:via-blue-500 hover:to-violet-500 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-[10px] sm:text-xs font-bold cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
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
                        <div key={cap.id} className="bg-white/[0.025] backdrop-blur-xl border border-white/[0.07] hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.08)] p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 shadow-lg transition-all">
                          <div className="space-y-2 w-full md:w-auto">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              <span className="text-[9px] sm:text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg uppercase border border-cyan-500/20 font-mono">{cap.tierLabel}{cap.asHeir ? ' • Sebagai Ahli Waris' : ''}</span>
                              <span className="text-[9px] sm:text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg uppercase border border-amber-500/20 font-mono flex items-center gap-1 sm:gap-1.5">
                                <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {cap.status}
                              </span>
                            </div>
                            <h4 className="text-sm sm:text-base font-bold text-white truncate">{cap.title}</h4>
                            {!cap.isLegacy && (
                              <p className="text-[10px] sm:text-xs text-neutral-500 font-mono flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-neutral-600 shrink-0" />
                                Buka: {new Date(cap.unlockTimestamp * 1000).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                            {canPingAlive && (
                              <button onClick={() => handlePingAlive(cap)} disabled={isPinging === cap.id || isWrongNetwork}
                                className="w-full md:w-auto bg-transparent hover:bg-green-500/10 disabled:opacity-40 text-green-400 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-full text-[10px] sm:text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-green-500/50 transition-all"
                                title="Reset jam mundur dead-man switch">
                                {isPinging === cap.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                                Saya Masih Aktif
                              </button>
                            )}
                            {canDeleteContent && (
                              <button onClick={() => handleDeleteOpenedContent(cap)} disabled={isDeletingContent === cap.id || isWrongNetwork}
                                className="w-full md:w-auto bg-transparent hover:bg-red-500/10 disabled:opacity-40 text-red-400 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-full text-[10px] sm:text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-red-500/50 transition-all"
                                title="Hapus konten dari kontrak">
                                {isDeletingContent === cap.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                                Hapus
                              </button>
                            )}
                            <button onClick={() => handleOpenVault(cap)} disabled={!canOpen || isWrongNetwork}
                              className="w-full md:w-auto bg-transparent hover:bg-cyan-500/10 disabled:opacity-40 disabled:cursor-not-allowed text-cyan-400 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-full text-[10px] sm:text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-cyan-500/50 transition-all">
                              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              {cap.contentDeleted ? 'Sudah Dihapus' : isOwnUnclaimableLegacy ? (cap.isReady ? 'Menunggu Diklaim Ahli Waris' : 'Belum Siap') : cap.isClaimedOrRevealed ? 'Lihat Lagi' : (cap.isReady ? t.openVaultBtn : 'Belum Siap')}
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
                <div className="bg-white/[0.025] backdrop-blur-xl border border-white/[0.07] p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl space-y-4 sm:space-y-6">
                  <h3 className="text-lg sm:text-xl font-extrabold text-white">{t.historyTitle}</h3>
                  {isLoadingHistory ? (
                    <div className="text-center py-12 sm:py-16 text-neutral-500 text-xs sm:text-sm">
                      <Loader2 className="w-8 h-8 text-cyan-500 mx-auto mb-3 animate-spin" />
                      Memuat riwayat transaksi dari blockchain...
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 text-neutral-500 text-xs sm:text-sm">
                      <History className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-700 mx-auto mb-2 sm:mb-3" />
                      {t.historyEmpty}
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-5 bg-black/30 backdrop-blur-md border border-white/[0.05] rounded-xl sm:rounded-2xl hover:border-neutral-700 transition-colors gap-2 sm:gap-0">
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-white mb-0.5 sm:mb-1">{tx.type}</p>
                            <p className="text-[10px] sm:text-xs text-neutral-500">{tx.detail} • <span className="font-mono">{tx.date}</span></p>
                          </div>
                          <span className={`text-[11px] sm:text-sm font-mono font-bold ${tx.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {tx.amount < 0 ? '' : '+'}{tx.amount} AETH
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: STATS */}
              {activeTab === 'stats' && (
                <div className="bg-white/[0.025] backdrop-blur-xl border border-white/[0.07] rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-4 sm:space-y-6 shadow-xl">
                  <h3 className="text-lg sm:text-xl font-extrabold text-white">{t.statsTitle}</h3>
                  <div className="grid grid-cols-2 gap-3 sm:gap-5">
                    <div className="bg-black/30 backdrop-blur-md border border-white/[0.05] p-4 sm:p-6 rounded-xl sm:rounded-2xl flex flex-col justify-center">
                      <span className="text-[9px] sm:text-xs uppercase text-neutral-500 block mb-1.5 sm:mb-2 font-bold font-mono">{t.totalBurnedLabel}</span>
                      <span className="text-lg sm:text-3xl font-extrabold font-mono text-red-400 flex items-center gap-1.5 sm:gap-2">
                        <Flame className="w-4 h-4 sm:w-6 sm:h-6" /> {burnedTotal} <span className="text-[10px] sm:text-lg">AETH</span>
                      </span>
                    </div>
                    <div className="bg-black/30 backdrop-blur-md border border-white/[0.05] p-4 sm:p-6 rounded-xl sm:rounded-2xl flex flex-col justify-center">
                      <span className="text-[9px] sm:text-xs uppercase text-neutral-500 block mb-1.5 sm:mb-2 font-bold font-mono">{t.activeCapsulesLabel}</span>
                      <span className="text-lg sm:text-3xl font-extrabold font-mono text-cyan-400 flex items-center gap-1.5">{myCapsules.length} <span className="text-[10px] sm:text-lg text-neutral-500">{t.unit}</span></span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: STAKING */}
              {activeTab === 'staking' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/20 border border-cyan-500/30 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-1 sm:mb-2 flex items-center gap-2">
                        <Coins className="text-cyan-400 w-5 h-5 sm:w-6 sm:h-6" /> {t.stakingTitle}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-400 max-w-md leading-relaxed">{t.stakingDesc}</p>
                    </div>
                    <div className="bg-[#030508]/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-cyan-500/20 min-w-full md:min-w-[200px] text-center md:text-left">
                      <p className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-widest font-bold mb-0.5 sm:mb-1">{t.currentApy}</p>
                      <p className="text-2xl sm:text-3xl font-mono font-extrabold text-green-400">
                        {apyPercent !== null ? `${apyPercent}%` : '...'}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-white/[0.025] backdrop-blur-xl border border-white/[0.07] rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg">
                      <h4 className="text-[11px] sm:text-sm font-bold text-white mb-3 sm:mb-4 uppercase tracking-widest">{t.stakeAethTitle}</h4>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="bg-[#030508] border border-white/[0.08] rounded-xl sm:rounded-2xl p-3 sm:p-4">
                          <div className="flex justify-between text-[9px] sm:text-xs text-neutral-500 mb-1.5 sm:mb-2">
                            <span>{t.stakeAmountLabel}</span>
                            <span>{t.balanceLabel} <span className="font-bold text-white">{aethBalance.toFixed(2)}</span> AETH</span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <input type="number" value={stakeInput} onChange={(e) => setStakeInput(e.target.value)} placeholder="0.0"
                              className="w-full bg-transparent text-lg sm:text-2xl font-mono text-white outline-none" />
                            <button onClick={() => setStakeInput(aethBalance.toString())} className="text-[9px] sm:text-xs font-bold bg-cyan-500/10 text-cyan-400 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg border border-cyan-500/20 cursor-pointer hover:bg-cyan-500/20">MAX</button>
                          </div>
                        </div>
                        <button onClick={handleStake} disabled={isStaking || isWrongNetwork}
                          className="w-full py-3 sm:py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:via-blue-500 hover:to-violet-500 disabled:opacity-50 rounded-xl sm:rounded-full font-bold text-xs sm:text-sm text-white shadow-lg cursor-pointer flex items-center justify-center gap-2">
                          {isStaking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}{t.stakeBtn}
                        </button>
                      </div>
                    </div>

                    <div className="bg-white/[0.025] backdrop-blur-xl border border-white/[0.07] rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg flex flex-col justify-between">
                      <div>
                        <h4 className="text-[11px] sm:text-sm font-bold text-white mb-3 sm:mb-4 uppercase tracking-widest">{t.positionTitle}</h4>
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex justify-between items-center border-b border-white/[0.08] pb-2 sm:pb-3">
                            <span className="text-neutral-400 text-[10px] sm:text-sm">{t.totalStaked}</span>
                            <span className="text-white font-mono font-bold text-[11px] sm:text-base">{stakedBalance.toFixed(2)} AETH</span>
                          </div>
                          <div className="flex justify-between items-center pb-2 sm:pb-3">
                            <span className="text-neutral-400 text-[10px] sm:text-sm">{t.pendingRewards}</span>
                            <span className="text-green-400 font-mono font-bold text-[11px] sm:text-base">+{pendingReward.toFixed(4)} AETH</span>
                          </div>
                        </div>
                        {stakedBalance > 0 && (
                          <div className="mt-3 sm:mt-4 bg-[#030508] border border-white/[0.08] rounded-xl sm:rounded-2xl p-3 sm:p-4">
                            <div className="flex justify-between text-[9px] sm:text-xs text-neutral-500 mb-1.5 sm:mb-2">
                              <span>Jumlah Unstake</span>
                              <span>Staked: <span className="font-bold text-white">{stakedBalance.toFixed(2)}</span> AETH</span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <input type="number" value={unstakeInput} onChange={(e) => setUnstakeInput(e.target.value)} placeholder="0.0"
                                className="w-full bg-transparent text-lg sm:text-2xl font-mono text-white outline-none" />
                              <button onClick={() => setUnstakeInput(stakedBalance.toString())} className="text-[9px] sm:text-xs font-bold bg-red-500/10 text-red-300 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg border border-red-500/20 cursor-pointer hover:bg-red-500/20">MAX</button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 mt-4">
                        {stakedBalance > 0 && (
                          <button onClick={handleWithdrawStake} disabled={isWithdrawingStake || isWrongNetwork}
                            className="w-full py-3 sm:py-4 border border-red-500/40 text-red-300 hover:bg-red-500/10 disabled:opacity-50 rounded-xl sm:rounded-full font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2">
                            {isWithdrawingStake && <Loader2 className="w-3.5 h-3.5 animate-spin" />}Unstake
                          </button>
                        )}
                        <button onClick={handleClaimReward} disabled={isWrongNetwork}
                          className="w-full py-3 sm:py-4 border border-green-500/40 text-green-400 hover:bg-green-500/10 disabled:opacity-50 rounded-xl sm:rounded-full font-bold text-xs sm:text-sm transition-colors cursor-pointer">
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
                  <div className="bg-white/[0.025] backdrop-blur-xl border border-white/[0.07] p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-extrabold text-white mb-1 flex items-center gap-2">
                        <Shield className="text-green-500 w-4 h-4 sm:w-5 sm:h-5" /> {t.securityTitle}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-400">{t.securityDesc}</p>
                    </div>
                  </div>

                  <div className="bg-[#080808] border border-cyan-500/20 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg space-y-3">
                    <h5 className="text-sm sm:text-base font-bold text-white flex items-center gap-2"><KeyRound className="w-4 h-4 text-cyan-400"/> Bagaimana isi kapsul dijaga</h5>
                    <p className="text-[11px] sm:text-sm text-neutral-400 leading-relaxed">
                      Judul, pesan, dan lampiran dienkripsi (ECIES/secp256k1) langsung di browser Anda sebelum meninggalkan perangkat.
                      Kunci dekripsi diturunkan dari signature EIP-712 wallet Anda sendiri dan tidak pernah dikirim ke mana pun.
                      Yang tersimpan di blockchain dan Arweave hanyalah ciphertext.
                    </p>
                    <p className="text-[10px] sm:text-xs text-neutral-500 leading-relaxed">
                      Yang TIDAK dienkripsi (publik): alamat pemilik, alamat ahli waris, waktu kapsul dibuat/dibuka, dan tier yang dipilih.
                    </p>
                    <p className="text-[10px] sm:text-xs text-neutral-500 leading-relaxed">
                      Kunci enkripsi terikat pada jaringan ({TARGET_CHAIN_NAME}). Jangan gunakan AetherVault di jaringan lain.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-[#080808] border border-cyan-500/30 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-cyan-600 text-[8px] sm:text-[10px] font-bold px-2.5 sm:px-3 py-1 rounded-bl-xl uppercase tracking-widest text-white">Active</div>
                      <h5 className="text-sm sm:text-lg font-bold text-white mb-1.5 sm:mb-2 flex items-center gap-2"><Lock className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400"/> ReentrancyGuard</h5>
                      <p className="text-[10px] sm:text-sm text-neutral-400 mb-4 sm:mb-6 leading-relaxed">Smart Contract dilindungi multi-layer.</p>
                      <a href={`https://polygonscan.com/address/${STAKING_CONTRACT_ADDRESS}#code`} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 sm:px-4 py-2 rounded-lg hover:bg-cyan-500/20 transition-all border border-cyan-500/30">
                        {t.viewCodeBtn} <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="bg-white/[0.025] backdrop-blur-xl border border-white/[0.07] p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg relative overflow-hidden">
                      <h5 className="text-sm sm:text-lg font-bold text-white mb-1.5 sm:mb-2 flex items-center gap-2"><Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500"/> {t.vaultReserveTitle}</h5>
                      <p className="text-[10px] sm:text-sm text-neutral-400 mb-4 sm:mb-6 leading-relaxed">{t.vaultReserveDesc}</p>
                      <a href={`https://polygonscan.com/address/${STAKING_CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-xs font-bold text-yellow-400 bg-yellow-500/10 px-3 sm:px-4 py-2 rounded-lg hover:bg-yellow-500/20 transition-all border border-yellow-500/30">
                        {t.checkVaultBtn} <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="bg-white/[0.025] backdrop-blur-xl border border-white/[0.07] rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-6 sm:space-y-8 shadow-xl">
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2"><Settings className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400"/> {t.settingsTitle}</h3>
                    <p className="text-[11px] sm:text-sm text-neutral-400 mt-1">{t.settingsDesc}</p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-black/30 backdrop-blur-md border border-white/[0.05] p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 sm:gap-2"><KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500"/> Kunci Enkripsi Wallet</p>
                          <p className="text-[10px] sm:text-xs text-neutral-500 mt-1">Diperlukan agar orang lain bisa menjadikan Anda ahli waris.</p>
                        </div>
                        <button onClick={handleRegisterEncryptionKey} disabled={isRegisteringKey || myPublicKeyRegistered || isWrongNetwork}
                          className={`text-[9px] sm:text-[10px] px-3 sm:px-4 py-2 rounded-lg font-bold uppercase tracking-widest shrink-0 flex items-center gap-2 ${myPublicKeyRegistered ? 'bg-green-500/10 text-green-400 border border-green-500/20 cursor-default' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 cursor-pointer disabled:opacity-50'}`}>
                          {isRegisteringKey && <Loader2 className="w-3 h-3 animate-spin" />}{myPublicKeyRegistered ? 'Terdaftar' : 'Daftarkan'}
                        </button>
                      </div>
                    </div>

                    <div className="bg-black/30 backdrop-blur-md border border-white/[0.05] p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 sm:gap-2"><Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500"/> {t.rpcLabel}</p>
                          <p className="text-[10px] sm:text-xs text-neutral-500 mt-1">{t.rpcDesc}</p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
                          <input type="text" disabled value="Auto-Fallback (Multi RPC)" className="bg-[#080808] border border-white/[0.08] text-neutral-400 text-[9px] sm:text-xs font-mono px-2.5 sm:px-3 py-2 rounded-lg w-full sm:w-48 outline-none" />
                          <span className={`text-[8px] sm:text-[10px] px-2 sm:px-3 py-2 rounded-lg font-bold uppercase tracking-widest shrink-0 ${isWrongNetwork ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>{isWrongNetwork ? 'Jaringan Salah' : t.connected}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/30 backdrop-blur-md border border-white/[0.05] p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 sm:gap-2"><UploadCloud className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500"/> Penyimpanan Lampiran</p>
                          <p className="text-[10px] sm:text-xs text-neutral-500 mt-1">Lampiran disimpan permanen di Arweave lewat Irys, dibayar langsung dari wallet Anda.</p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
                          <input type="text" disabled value="Arweave via Irys" className="bg-[#080808] border border-white/[0.08] text-neutral-400 text-[9px] sm:text-xs font-mono px-2.5 sm:px-3 py-2 rounded-lg w-full sm:w-48 outline-none text-center sm:text-left" />
                          <span className="text-[8px] sm:text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 sm:px-3 py-2 rounded-lg font-bold uppercase tracking-widest shrink-0">Permanen</span>
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

      <footer className="relative z-10 border-t border-white/[0.06] bg-[#030508]/80 py-5 sm:py-6 mt-auto">
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
        <div className="fixed inset-0 bg-[#030508]/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#080808] border border-cyan-500/30 max-w-lg w-full rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-4 sm:space-y-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative">
            <h4 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2 sm:gap-2.5">
              <Sparkles className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5"/> {t.modalDecryptedTitle}
            </h4>
            {isDecrypting ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-cyan-500 mx-auto mb-3 animate-spin" />
                <p className="text-neutral-400 text-xs sm:text-sm">Memverifikasi on-chain & mendekripsi secara lokal...</p>
              </div>
            ) : selectedVault.error ? (
              <div className="text-center py-6">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <p className="text-red-300 text-xs sm:text-sm">{selectedVault.error}</p>
              </div>
            ) : (
              <div className="w-full bg-[#030508] border border-white/[0.08] rounded-xl sm:rounded-2xl p-4 sm:p-5 text-[11px] sm:text-sm text-cyan-300 font-mono break-words leading-relaxed max-h-[50vh] sm:max-h-60 overflow-y-auto whitespace-pre-wrap shadow-inner">
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