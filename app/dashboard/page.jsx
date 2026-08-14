"use client";
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider, useDisconnect } from '@web3modal/ethers/react';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Buffer } from 'buffer'; // 🚀 FIX: Import Buffer
// ⚡ FIX 9: Unused imports dibersihkan
import { Lock, Clock, Shield, Wallet, LogOut, Layers, Eye, Sparkles, Flame, Check, Bell, Activity, History, Cpu, Coins, Settings, AlertTriangle, FileImage, X, ArrowUpRight, Menu, KeyRound, Loader2, Download, Award, Fingerprint, Globe, ShieldAlert, Unlock } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
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

// 🚀 SDK IRYS TERBARU
import { WebUploader } from "@irys/web-upload";
import { WebBNB } from "@irys/web-upload-ethereum";
import { EthersV6Adapter } from "@irys/web-upload-ethereum-ethers-v6";

// ⭐ IMPORT SEMUA KOMPONEN
import CertificateModal from '@/components/CertificateModal';
import StakingPanel from '@/components/StakingPanel';
import GlobalStats from '@/components/GlobalStats';
import VaultsList from '@/components/VaultsList';
import CreateCapsule from '@/components/CreateCapsule';
import AetherProofHub from '@/components/AetherProofHub';
import HallOfProof from '@/components/HallOfProof';

// ⭐ IMPORT ABI
import AetherVaultV3Artifact from '@/contracts/AetherVaultV3ABI.json';
import StakingArtifact from '@/contracts/StakingABI.json';
import TeamVestingArtifact from '@/contracts/TeamVestingABI.json';

// ⚡ FIX: Ekstrak array ABI dari dalam objek JSON bawaan Hardhat
const AetherVaultV3ABI = AetherVaultV3Artifact.abi || AetherVaultV3Artifact;
const StakingABI = StakingArtifact.abi || StakingArtifact;
const TeamVestingABI = TeamVestingArtifact.abi || TeamVestingArtifact;

// ⚡ FIX 5: Buat Mini ABI khusus untuk fungsi Token ERC20 agar tidak error
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)"
];

const getNewIrysUploader = async (walletProvider) => {
  const provider = new ethers.BrowserProvider(walletProvider);
  const irysUploader = await WebUploader(WebBNB)
    .withAdapter(EthersV6Adapter(provider))
    .withRpc("https://bsc-testnet-rpc.publicnode.com")
    .devnet();
  return irysUploader;
};

// ⭐ ALAMAT KONTRAK
const AETH_TOKEN_ADDRESS = "0x2121a501Db9bBf122a69b856AEAaB3F908467cED"; 
const CONTRACT_ADDRESS = "0xCda136B176baE8F92d0Dbc7851C0A1E282469265"; 
const STAKING_CONTRACT_ADDRESS = "0xe6FdC38895E2B7D463151423EE86ffcE268f5167"; 
const VESTING_CONTRACT_ADDRESS = "0x62026F3bAcb3c4C726a2278Df94D2Fd436a8409c";

const PLACEHOLDER_ADDRESS = "0x000000000000000000000000000000000000dEaD";
const IS_CONTRACT_ADDRESS_CONFIGURED = CONTRACT_ADDRESS.toLowerCase() !== PLACEHOLDER_ADDRESS.toLowerCase();
const IS_STAKING_ADDRESS_CONFIGURED = STAKING_CONTRACT_ADDRESS.toLowerCase() !== PLACEHOLDER_ADDRESS.toLowerCase();

const TARGET_CHAIN_ID = 97;
const TARGET_CHAIN_ID_HEX = "0x" + TARGET_CHAIN_ID.toString(16);
const TARGET_CHAIN_NAME = "BSC Testnet";

const TIER_ENUM_MAP = { basic: 0, premium: 1, eternal: 2, legacy: 3 };
const TIER_INDEX_TO_LABEL = { 0: 'Basic', 1: 'VIP', 2: 'Eternal', 3: 'Legacy' };
const READ_ONLY_RPC_URL = "https://bsc-testnet-rpc.publicnode.com";

const TIER_FALLBACK_CONFIG = {
  basic: { cost: 10, burn: 2, maxLength: 250, maxYears: 1 },
  premium: { cost: 50, burn: 10, maxLength: 1000, maxYears: 5 },
  eternal: { cost: 200, burn: 40, maxLength: 2000, maxYears: 100 },
  legacy: { cost: 500, burn: 100, maxLength: 2000, maxYears: 50 },
};

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { t: globalT } = useLanguage();
  const t = (globalT && globalT.dashboard) ? globalT.dashboard : {};

  // ⚡ FIX 4: Mencegah re-fetch data on-chain saat ganti bahasa
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const { open } = useWeb3Modal();
  const { address, isConnected, chainId } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const { disconnect } = useDisconnect();

  const isWrongNetwork = isConnected && chainId !== undefined && Number(chainId) !== TARGET_CHAIN_ID;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [nativeBalance, setNativeBalance] = useState('0.0000');
  const [aethBalance, setAethBalance] = useState(0);
  const [activeTab, setActiveTab] = useState('create');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (pathname && pathname.includes('/admin')) {
      setActiveTab('admin');
    }
  }, [pathname]);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [tier, setTier] = useState('');
  const [inactivityYears, setInactivityYears] = useState('5');
  const [heirAddress, setHeirAddress] = useState('');
  const [isSealing, setIsSealing] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedCid, setUploadedCid] = useState('');
  const [stagedUpload, setStagedUpload] = useState(null); 
  const [isPreparingUpload, setIsPreparingUpload] = useState(false);
  const [uploadError, setUploadError] = useState(''); 

  const [stakeInput, setStakeInput] = useState('');
  const [totalUserStaked, setTotalUserStaked] = useState(0);
  const [pendingReward, setPendingReward] = useState(0);
  const [userDeposits, setUserDeposits] = useState([]);
  const [isStaking, setIsStaking] = useState(false);
  const [isWithdrawingStake, setIsWithdrawingStake] = useState(false);

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

  // ⚡ FIX 1: Hapus deklarasi showToast yang duplikat, gunakan yang useCallback saja
  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  }, []);

  const fetchGlobalStats = useCallback(async () => {
    setIsFetchingGlobalStats(true);
    try {
      const provider = new ethers.JsonRpcProvider(READ_ONLY_RPC_URL);
      
      try {
        const vaultContract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultV3ABI, provider);
        const stats = await vaultContract.getPlatformStats();
        setPlatformStats({
          capsules: Number(stats[0] || 0),
          users: Number(stats[1] || 0), 
          burned: parseFloat(ethers.formatUnits(stats[2] || 0, 18)),
          supply: parseFloat(ethers.formatUnits(stats[3] || 0, 18))
        });
      } catch (vaultErr) {
        console.error("Gagal platform stats:", vaultErr);
      }
      
      if (IS_STAKING_ADDRESS_CONFIGURED) {
        try {
          const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingABI, provider);
          
          const sTotalStaked = await stakingContract.totalStaked();
          const sTotalRewards = await stakingContract.totalRewardClaimed();
          const sStakers = await stakingContract.totalStakers();

          setStakingGlobalStats({
            totalStaked: parseFloat(ethers.formatUnits(sTotalStaked, 18)),
            totalRewards: parseFloat(ethers.formatUnits(sTotalRewards, 18)),
            stakers: Number(sStakers)
          });
        } catch (stakeErr) { 
          console.error("Gagal staking stats:", stakeErr); 
        }
      }
    } catch (err) {
      console.error("Gagal global sync:", err);
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
        const provider = walletProvider
          ? new ethers.BrowserProvider(walletProvider)
          : new ethers.JsonRpcProvider(READ_ONLY_RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultV3ABI, provider);
        const results = [];
        for (let idx = 0; idx <= 3; idx++) {
          try {
            const r = await contract.tierConfigs(idx);
            results.push(r);
          } catch (e) {
            results.push(null); 
          }
        }
        if (cancelled) return;
        
        const parsed = {};
        results.forEach((r, idx) => {
          if (r) { 
            parsed[idx] = {
              cost: parseFloat(ethers.formatUnits(r.cost, 18)),
              burn: parseFloat(ethers.formatUnits(r.burnPart, 18)),
              maxDurationSeconds: Number(r.maxDuration)
            };
          }
        });
        setOnChainTierConfig(parsed);
      } catch (err) {
        console.error("Tier Config Error:", err);
      }
    };
    fetchTierConfigs();
    return () => { cancelled = true; };
  }, [walletProvider]);

  const tierDisplayMeta = {
    basic: { name: t.tiersList?.basicName || 'Basic', desc: t.tiersList?.basicDesc || '', icon: 'bg-neutral-800', color: 'text-gray-300', border: 'border-neutral-500 shadow-[0_0_15px_-3px_rgba(255,255,255,0.1)]' },
    premium: { name: t.tiersList?.vipName || 'VIP', desc: t.tiersList?.vipDesc || '', icon: 'bg-gradient-to-br from-cyan-500/20 to-violet-500/20', color: 'text-cyan-300', border: 'border-cyan-400/70 shadow-[0_0_25px_-4px_rgba(168,85,247,0.45),0_0_15px_-4px_rgba(34,211,238,0.4)]' },
    eternal: { name: t.tiersList?.eternalName || 'Eternal', desc: t.tiersList?.eternalDesc || '', icon: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20', color: 'text-amber-300', border: 'border-amber-400/70 shadow-[0_0_25px_-4px_rgba(245,158,11,0.45),0_0_15px_-4px_rgba(251,146,60,0.35)]' },
    legacy: { name: t.tiersList?.legacyName || 'Legacy', desc: t.tiersList?.legacyDesc || '', icon: 'bg-gradient-to-br from-fuchsia-500/20 to-rose-500/20', color: 'text-fuchsia-300', border: 'border-fuchsia-400/70 shadow-[0_0_25px_-4px_rgba(232,121,249,0.45),0_0_15px_-4px_rgba(244,63,94,0.35)]' },
  };

  const tiers = Object.keys(tierDisplayMeta).reduce((acc, key) => {
    const idx = TIER_ENUM_MAP[key];
    const onChain = onChainTierConfig[idx];
    const fallback = TIER_FALLBACK_CONFIG[key];
    acc[key] = {
      ...tierDisplayMeta[key],
      cost: onChain ? onChain.cost : fallback.cost,
      burn: onChain ? onChain.burn : fallback.burn,
      maxLength: fallback.maxLength, 
      maxYears: onChain ? Math.floor(onChain.maxDurationSeconds / (365 * 24 * 60 * 60)) : fallback.maxYears,
    };
    return acc;
  }, {});

  const extractErrorMessage = useCallback((err) => {
    const errorString = err?.message?.toLowerCase() || "";
    if (err?.code === 4001 || errorString.includes("user rejected") || errorString.includes("denied")) {
      return tRef.current.errUserRejected || "Transaksi dibatalkan oleh pengguna.";
    }
    if (errorString.includes("insufficient funds") || errorString.includes("exceeds balance")) {
      return tRef.current.errInsufficientFunds || "Saldo tidak mencukupi.";
    }
    if (errorString.includes("network error") || errorString.includes("timeout") || errorString.includes("rpc")) {
      return tRef.current.errNetworkIssue || "Gangguan jaringan/RPC.";
    }
    if (err?.reason) { return `${tRef.current.errContractReverted || "Ditolak Jaringan:"} ${err.reason}`; }
    if (err?.data?.message) { return err.data.message.replace("execution reverted: ", ""); }
    return tRef.current.defaultTxErrorMessage || "Transaksi gagal. Cek saldo dan jaringan Anda.";
  }, []);

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
      showToast(tRef.current.errNetworkSwitchSuccess?.replace('{chain}', TARGET_CHAIN_NAME) || "Jaringan berhasil dialihkan", 'success');
    } catch (err) {
      showToast((tRef.current.errNetworkSwitchFailPrefix || "Gagal alih jaringan: ") + extractErrorMessage(err), 'error');
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
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultV3ABI, provider);
      
      let ownedIds = [];
      let heirIds = [];
      try {
        const totalOwned = await contract.getUserCapsuleCount(userAddress);
        if (totalOwned > 0n) {
          ownedIds = await contract.getUserCapsulesPaginated(userAddress, 0, Number(totalOwned));
        }
      } catch (e) {
        console.warn(`[CapsuleCount] ${e.message}`);
      }

      try {
        const totalHeir = await contract.getHeirCapsuleCount(userAddress);
        if (totalHeir > 0n) {
          heirIds = await contract.getHeirCapsulesPaginated(userAddress, 0, Number(totalHeir));
        }
      } catch (e) {
        console.warn(`[HeirCount] ${e.message}`);
      }
      
      const allIdsMap = new Map();
      if (ownedIds && ownedIds.length) {
        ownedIds.forEach((id) => allIdsMap.set(id.toString(), { id, asHeir: false }));
      }
      if (heirIds && heirIds.length) {
        heirIds.forEach((id) => {
          const key = id.toString();
          if (!allIdsMap.has(key)) {
            allIdsMap.set(key, { id, asHeir: true });
          }
        });
      }
      const allIds = Array.from(allIdsMap.values());
      const results = [];

      for (const { id, asHeir } of allIds) {
        try {
          const meta = await contract.getCapsuleMeta(id);
          let ready = false;
          try {
            ready = await contract.isCapsuleReady(id);
          } catch (e) {
            ready = false;
          }

          if (!ready) {
            const nowSec = Math.floor(Date.now() / 1000);
            if (meta.isLegacy) {
              const deadlineSec = Number(meta.lastPingAlive) + Number(meta.inactivityLimit);
              if (nowSec > deadlineSec) ready = true;
            } else {
              if (nowSec >= Number(meta.unlockTimestamp)) ready = true;
            }
          }

          const decryptedTitle = await tryDecryptTitle(meta.title, privateKeyForTitles);
          
          results.push({
            id: id.toString(),
            title: decryptedTitle ?? (tRef.current.lockedTitleFallback || `Capsule #${id}`),
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
            tierLabel: TIER_INDEX_TO_LABEL[Number(meta.tier)] || (meta.isLegacy ? (tRef.current.tierLabelLegacy || 'Legacy') : (tRef.current.tierLabelTimeLock || 'TimeLock')),
            status: meta.contentDeleted ? (tRef.current.statusDeleted || 'DELETED') : meta.isClaimedOrRevealed ? (tRef.current.statusOpened || 'OPENED') : ready ? (tRef.current.statusReady || 'READY') : (tRef.current.statusLocked || 'LOCKED'),
          });
        } catch (itemErr) {
          console.warn(`[CapsuleMeta][${id}] ${itemErr.message}`);
        }
      }

      results.sort((a, b) => Number(b.id) - Number(a.id));
      setMyCapsules(results);
    } catch (err) {
      setMyCapsules([]);
    } finally {
      setIsLoadingCapsules(false);
    }
  }, []);

  const fetchOnChainHistory = useCallback(async (userAddress) => {
    setIsLoadingHistory(true);
    try {
      const provider = new ethers.JsonRpcProvider(READ_ONLY_RPC_URL);
      const vaultContract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultV3ABI, provider);
      const stakeContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingABI, provider);
      
      const currentBlock = await provider.getBlockNumber();
      const DEPLOY_BLOCK = Math.max(0, currentBlock - 1900); 
      
      let sealed = []; let revealed = []; let claimed = []; let ping = [];
      try { sealed = await vaultContract.queryFilter(vaultContract.filters.CapsuleSealed(null, userAddress), DEPLOY_BLOCK, "latest"); } catch(e) {}
      try { revealed = await vaultContract.queryFilter(vaultContract.filters.CapsuleRevealed(userAddress), DEPLOY_BLOCK, "latest"); } catch(e) {}
      try { claimed = await vaultContract.queryFilter(vaultContract.filters.LegacyClaimed(userAddress), DEPLOY_BLOCK, "latest"); } catch(e) {}
      try { ping = await vaultContract.queryFilter(vaultContract.filters.PingRecorded(userAddress), DEPLOY_BLOCK, "latest"); } catch(e) {}

      let staked = []; let withdrawn = []; let rewardClaimed = [];
      try { staked = await stakeContract.queryFilter(stakeContract.filters.Staked(userAddress, null, null, null, null), DEPLOY_BLOCK, "latest"); } catch(e) {}
      try { withdrawn = await stakeContract.queryFilter(stakeContract.filters.Withdrawn(userAddress, null, null), DEPLOY_BLOCK, "latest"); } catch(e) {}
      try { rewardClaimed = await stakeContract.queryFilter(stakeContract.filters.RewardClaimed(userAddress, null), DEPLOY_BLOCK, "latest"); } catch(e) {}

      const allLogs = [
        ...sealed.map(e => ({ e, kind: 'SEALED' })),
        ...revealed.map(e => ({ e, kind: 'REVEALED' })),
        ...claimed.map(e => ({ e, kind: 'CLAIMED_LEGACY' })),
        ...ping.map(e => ({ e, kind: 'PING' })),
        ...staked.map(e => ({ e, kind: 'STAKED' })),
        ...withdrawn.map(e => ({ e, kind: 'WITHDRAWN' })),
        ...rewardClaimed.map(e => ({ e, kind: 'REWARD' }))
      ];

      allLogs.sort((a, b) => b.e.blockNumber - a.e.blockNumber);

      const built = await Promise.all(allLogs.map(async ({ e, kind }) => {
        const block = await provider.getBlock(e.blockNumber);
        const date = new Date((block?.timestamp || Date.now() / 1000) * 1000).toLocaleString(tRef.current.dateLocale || 'id-ID', {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        let amount = 0;
        try {
          if (kind === 'SEALED' && e.args[3]) amount = parseFloat(ethers.formatUnits(e.args[3], 18));
          else if ((kind === 'STAKED' || kind === 'WITHDRAWN') && e.args[2]) amount = parseFloat(ethers.formatUnits(e.args[2], 18));
          else if (kind === 'REWARD' && e.args[1]) amount = parseFloat(ethers.formatUnits(e.args[1], 18));
        } catch (err) { amount = 0; }
        
        return {
          id: `${kind}-${e.transactionHash}`,
          date: date,
          type: kind,
          detail: kind.includes('STAKED') || kind === 'WITHDRAWN' ? `Staking Action: ${kind}` : `Kapsul ID: ${e.args[0] || 'N/A'}`,
          amount: amount.toFixed(2),
          direction: (kind === 'STAKED' || kind === 'SEALED') ? 'out' : 'in'
        };
      }));

      setTransactions(built);
    } catch (err) {
      console.error("History Error:", err);
      setTransactions([]); 
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const fetchWalletData = useCallback(async () => {
    if (isConnected && walletProvider && address) {
      try {
        const provider = new ethers.BrowserProvider(walletProvider);
        const rawBalance = await provider.getBalance(address);
        setNativeBalance(parseFloat(ethers.formatEther(rawBalance)).toFixed(4));
        try {
          const tokenContract = new ethers.Contract(AETH_TOKEN_ADDRESS, ERC20_ABI, provider);
          const rawAethBalance = await tokenContract.balanceOf(address);
          setAethBalance(parseFloat(ethers.formatUnits(rawAethBalance, 18)));

          const mainContract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultV3ABI, provider);
          const registeredKey = await mainContract.encryptionPublicKeys(address);
          setMyPublicKeyRegistered(registeredKey && registeredKey !== '0x');

          const contractOwner = await mainContract.owner();
          setIsOwner(contractOwner.toLowerCase() === address.toLowerCase());
        } catch (err) {
          setIsOwner(false);
        }
        
        try {
          if (STAKING_CONTRACT_ADDRESS) {
            const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingABI, provider);
            
            const rawStaked = await stakingContract.userTotalStaked(address);
            const rawReward = await stakingContract.calculateReward(address);
            setTotalUserStaked(parseFloat(ethers.formatUnits(rawStaked, 18)));
            setPendingReward(parseFloat(ethers.formatUnits(rawReward, 18)));

            const depositCount = await stakingContract.getUserDepositCount(address);
            if (depositCount > 0n) {
              const deposits = await stakingContract.getUserDepositsPaginated(address, 0, Number(depositCount));
              const formattedDeposits = deposits.map(dep => ({
                id: Number(dep.id),
                tierId: Number(dep.tierId),
                amount: dep.amount.toString(), 
                unlockTime: Number(dep.unlockTime),
                apy: Number(dep.apy)
              }));
              setUserDeposits(formattedDeposits);
            } else {
              setUserDeposits([]);
            }
          }
        } catch (stakingErr) { console.error("Staking Fetch Error:", stakingErr); }
        
        let privateKeyForTitles = null;
        if (!isWrongNetwork) {
          try {
            const kp = await getOrDeriveKeyPair();
            privateKeyForTitles = kp.privateKey;
          } catch (keyErr) {}
        }
        
        await fetchCapsulesFromChain(provider, address, privateKeyForTitles);
        await fetchOnChainHistory(address);
      } catch (err) {}
    } else {
      setNativeBalance('0.0000'); setAethBalance(0); setTotalUserStaked(0); setPendingReward(0); setUserDeposits([]);
      setMyCapsules([]); setTransactions([]); setMyPublicKeyRegistered(false); setIsOwner(false);
      myKeyPairRef.current = null;
    }
  }, [isConnected, walletProvider, address, fetchCapsulesFromChain, fetchOnChainHistory, isWrongNetwork, getOrDeriveKeyPair]);

  useEffect(() => {
    if (isConnected && address && !isWrongNetwork) {
      fetchWalletData();
    }
  }, [isConnected, address, isWrongNetwork, fetchWalletData]);

  const formatAddress = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '';
  const getMinUnlockDatetimeLocal = () => {
    const d = new Date(Date.now() + 5 * 60 * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const formatUnlockDateTime = (unixSeconds) => {
    if (!unixSeconds) return '-';
    return new Date(unixSeconds * 1000).toLocaleString(tRef.current.dateLocale || 'id-ID', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const handleRegisterEncryptionKey = async () => {
    if (!isConnected) return showToast(t.connectWalletFirst || "Hubungkan dompet terlebih dahulu", 'error');
    if (isWrongNetwork) return showToast(t.switchNetworkFirst?.replace('{chain}', TARGET_CHAIN_NAME), 'error');
    setIsRegisteringKey(true);
    try {
      const { publicKey } = await getOrDeriveKeyPair();
      const signer = await getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultV3ABI, signer);
      const tx = await contract.registerPublicKey(publicKeyToBytes(publicKey));
      showToast(t.registeringKey || "Mendaftarkan kunci...", 'info');
      await tx.wait();
      setMyPublicKeyRegistered(true);
      showToast(t.keyRegisteredSuccess || "Kunci berhasil terdaftar", 'success');
    } catch (err) {
      showToast((t.keyRegisterFailPrefix || "Gagal: ") + extractErrorMessage(err), 'error');
    } finally {
      setIsRegisteringKey(false);
    }
  };

  const isPermanentTier = tier === 'eternal' || tier === 'legacy';
  const maxFileSizeMB = tier === 'legacy' ? 10 : 5;
  const MAX_ATTACHMENT_SIZE_BYTES = maxFileSizeMB * 1024 * 1024;

  // 🚀 FIX BUFFER: handleFileSelected
  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isConnected) return showToast(t.connectWalletBeforeAttach || "Hubungkan dompet dulu", 'error');
    if (isWrongNetwork) return showToast(t.switchNetworkFirst?.replace('{chain}', TARGET_CHAIN_NAME), 'error');
    
    if (tier === 'legacy' && !ethers.isAddress(heirAddress)) {
      showToast(t.uploadHeirWarning || "Masukkan alamat Heir yang valid terlebih dahulu", "error");
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) return showToast(t.fileTooLarge?.replace('{size}', MAX_ATTACHMENT_SIZE_BYTES / (1024 * 1024)) || "File terlalu besar", 'error');

    setUploadedCid('');
    setSelectedFile(file);
    setIsPreparingUpload(true);
    try {
      const { publicKey: recipientPublicKey } = await resolveRecipient();
      const fileBase64 = await fileToBase64(file);
      const cipherPayload = JSON.stringify({ name: file.name, type: file.type, data: fileBase64 });
      const encryptedPayload = await encryptForPublicKey(recipientPublicKey, cipherPayload);
      
      // ✅ FIX BUFFER: Menggunakan Buffer.from() murni
      const encryptedBytes = Buffer.from(encryptedPayload);
      
      const irysUploader = await getNewIrysUploader(walletProvider);
      const price = await irysUploader.getPrice(encryptedBytes.length);
      const estimatedCost = ethers.formatEther(price.toString()); 

      setStagedUpload({ file, encryptedBytes, estimatedCost });
    } catch (error) {
      showToast((t.prepareAttachmentFailPrefix || "Gagal memproses file: ") + extractErrorMessage(error), "error");
      setSelectedFile(null);
    } finally {
      setIsPreparingUpload(false);
    }
  };

  // 🚀 FIX BUFFER: handleConfirmArweaveUpload
  const handleConfirmArweaveUpload = async () => {
    if (!stagedUpload) return;
    if (isWrongNetwork) return showToast(t.switchNetworkFirst?.replace('{chain}', TARGET_CHAIN_NAME), 'error');
    
    setUploadError(''); 
    setIsUploading(true);
    try {
      const irysUploader = await getNewIrysUploader(walletProvider);
      
      // ✅ FIX BUFFER: Pastikan data berupa Node.js Buffer
      const dataBuffer = Buffer.isBuffer(stagedUpload.encryptedBytes)
        ? stagedUpload.encryptedBytes
        : Buffer.from(stagedUpload.encryptedBytes);

      const price = await irysUploader.getPrice(dataBuffer.length);
      try {
        await irysUploader.fund(price);
      } catch (fundErr) {
        throw new Error("Gagal fund Irys: " + fundErr.message);
      }

      const tags = [
        { name: "Content-Type", value: "application/octet-stream" },
        { name: "App-Name", value: "AetherVault" },
        { name: "Encryption", value: "ECIES-secp256k1" }
      ];

      const receipt = await irysUploader.upload(dataBuffer, { tags });
      const irysUrl = `https://devnet.irys.xyz/${receipt.id}`;
      
      setUploadedCid(irysUrl);
      setMessage(prev => prev + (prev ? '\n\n' : '') + `[${t.attachmentTag || 'Attachment'}: ${irysUrl}]`);
      showToast(t.fileUploadedSuccess || "Upload berhasil!", "success");
      setStagedUpload(null);
    } catch (error) {
      console.error("DETAIL ERROR IRYS:", error);
      showToast((t.fileUploadFailPrefix || "Gagal upload: ") + extractErrorMessage(error), "error");
      setUploadError(error.message || extractErrorMessage(error)); 
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelStagedUpload = () => {
    setStagedUpload(null);
    setSelectedFile(null);
    setUploadError(''); 
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string' && result.includes(',')) {
        resolve(result.split(',')[1]);
      } else {
        reject(new Error("Format file tidak didukung / rusak"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const resolveRecipient = async () => {
    const provider = new ethers.BrowserProvider(walletProvider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultV3ABI, provider);
    if (tier === 'legacy') {
      if (!ethers.isAddress(heirAddress)) throw new Error(t.enterValidHeirAddress || "Alamat pewaris tidak valid");
      const heirKey = await contract.encryptionPublicKeys(heirAddress);
      if (!heirKey || heirKey === '0x') throw new Error(t.heirKeyNotRegistered || "Pewaris belum mendaftarkan public key");
      return { publicKey: heirKey, privateKey: null };
    }
    const kp = await getOrDeriveKeyPair();
    return { publicKey: publicKeyToBytes(kp.publicKey), privateKey: kp.privateKey };
  };

  const handleSeal = async (e) => {
    e.preventDefault();
    if (!isConnected) return showToast(t.authRejectedConnectWallet || "Hubungkan dompet", 'error');
    if (isWrongNetwork) return showToast(t.switchNetworkFirst?.replace('{chain}', TARGET_CHAIN_NAME), 'error');

    if (stagedUpload && !uploadedCid) {
      return showToast(t.unconfirmedAttachmentWarning || "⚠️ You haven't confirmed the attachment. Please click 'Confirm & Pay Storage' first!", "error");
    }

    if (!tier || !tiers[tier]) return showToast("Pilih tier enkripsi terlebih dahulu!", "error");

    const selectedTierData = tiers[tier];
    const messageByteLength = new TextEncoder().encode(message).length;
    if (messageByteLength > selectedTierData.maxLength) return showToast(t.messageTooLong?.replace('{max}', selectedTierData.maxLength) || "Pesan terlalu panjang", 'error');
    if (aethBalance < selectedTierData.cost) return showToast(t.insufficientBalance || "Saldo tidak mencukupi", 'error');
    if (tier === 'legacy' && !ethers.isAddress(heirAddress)) return showToast(t.invalidHeirAddress || "Alamat pewaris tidak valid", 'error');

    setIsSealing(true);
    try {
      showToast(t.encryptingMessage || "Mengenkripsi pesan...", 'info');
      const { publicKey: recipientPublicKey } = await resolveRecipient();
      const encryptedMessage = await encryptForPublicKey(recipientPublicKey, message);

      if (encryptedMessage.length > selectedTierData.maxLength) throw new Error(t.messageCapacityExceeded || "Kapasitas maksimal terlampaui setelah enkripsi");
      const plainTitle = title || t.defaultCapsuleTitle || "Capsule";
      const encryptedTitle = await encryptForPublicKey(recipientPublicKey, plainTitle);
      
      const signer = await getSigner();
      await ensureCorrectNetwork(signer);

      const requiredCostWei = ethers.parseUnits(selectedTierData.cost.toString(), 18);
      
      const tokenContract = new ethers.Contract(AETH_TOKEN_ADDRESS, ERC20_ABI, signer);
      
      showToast(t.checkingAllowance || "Memeriksa izin token...", "info");
      const currentAllowance = await tokenContract.allowance(address, CONTRACT_ADDRESS);

      if (currentAllowance < requiredCostWei) {
        showToast(t.requestingApprove || "Meminta persetujuan token...", "info");
        const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, requiredCostWei);
        await approveTx.wait();
        showToast(t.approveSuccess || "Persetujuan token sukses!", "success");
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultV3ABI, signer);
      showToast(t.preparingOnChainTx || "Mempersiapkan transaksi on-chain...", 'info');

      let tx;
      if (tier === 'legacy') {
        const inactivitySeconds = 180; 
        tx = await contract.sealLegacyCapsule(encryptedTitle, encryptedMessage, inactivitySeconds, heirAddress);
      } else {
        if (!unlockDate) throw new Error(t.selectUnlockDateTime || "Pilih waktu buka");
        const unlockTimeMs = new Date(unlockDate).getTime();
        const unlockTimestamp = Math.floor(unlockTimeMs / 1000);
        tx = await contract.sealTimeLockCapsule(TIER_ENUM_MAP[tier], encryptedTitle, encryptedMessage, BigInt(unlockTimestamp));
      }
      showToast(t.txSentWaitingConfirm || "Transaksi terkirim. Menunggu konfirmasi...", "info");
      await tx.wait();
      showToast(t.sealSuccess || "Kapsul berhasil disegel!", 'success');
      setTitle(''); setMessage(''); setUnlockDate(''); setHeirAddress('');
      setSelectedFile(null); setUploadedCid('');
      setActiveTab('vaults');

      await fetchWalletData();
      await fetchGlobalStats(); 
    } catch (err) {
      showToast((t.genericFailPrefix || "Gagal: ") + extractErrorMessage(err), 'error');
    } finally {
      setIsSealing(false);
    }
  };

  const handleOpenVault = async (capsule) => {
    if (isWrongNetwork) return showToast(t.switchNetworkFirst?.replace('{chain}', TARGET_CHAIN_NAME), 'error');
    if (capsule.contentDeleted) {
      setSelectedVault({ ...capsule, decryptedMessage: null, error: t.statusAlreadyDeleted || "Sudah dihapus" });
      return;
    }
    setSelectedVault({ ...capsule, decryptedMessage: null, error: null });
    setIsDecrypting(true);
    try {
      const signer = await getSigner();
      await ensureCorrectNetwork(signer);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultV3ABI, signer);
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
      showToast(t.decryptSuccess || "Dekripsi berhasil", 'success');
      await fetchWalletData();
    } catch (err) {
      showToast((t.openVaultFailPrefix || "Gagal membuka: ") + extractErrorMessage(err), 'error');
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleViewCertificate = async (capsuleId) => {
    if (isWrongNetwork) return showToast(t.switchNetworkFirst?.replace('{chain}', TARGET_CHAIN_NAME), 'error');
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultV3ABI, signer);
      
      const meta = await contract.getCapsuleMeta(capsuleId);
      
      setSelectedCertificate({
        capsuleId: capsuleId.toString(),
        owner: meta.owner,
        tier: TIER_INDEX_TO_LABEL[Number(meta.tier)],
        isLegacy: meta.isLegacy,
        proofHash: "Encrypted On-Chain", 
        creationTimestamp: Number(meta.lastPingAlive), 
        blockNumber: 0 
      });
    } catch (err) {
      showToast((t.certFetchFail || "Gagal memuat sertifikat: ") + extractErrorMessage(err), 'error');
    }
  };

  const [isPinging, setIsPinging] = useState(null);
  const handlePingAlive = async (capsule) => {
    if (isWrongNetwork) return showToast(t.switchNetworkFirst?.replace('{chain}', TARGET_CHAIN_NAME), 'error');
    setIsPinging(capsule.id);
    try {
      const signer = await getSigner();
      await ensureCorrectNetwork(signer);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultV3ABI, signer);
      const tx = await contract.pingAlive(capsule.id);
      await tx.wait();
      showToast(t.pingSuccess || "Ping berhasil dikirim", 'success');
      await fetchWalletData();
    } catch (err) {
      showToast((t.pingFailPrefix || "Gagal ping: ") + extractErrorMessage(err), 'error');
    } finally {
      setIsPinging(null);
    }
  };

  const [isDeletingContent, setIsDeletingContent] = useState(null);
  const handleDeleteOpenedContent = async (capsule) => {
    if (isWrongNetwork) return showToast(t.switchNetworkFirst?.replace('{chain}', TARGET_CHAIN_NAME), 'error');
    const confirmed = window.confirm(t.deleteConfirmText || "Yakin ingin menghapus secara permanen?");
    if (!confirmed) return;
    setIsDeletingContent(capsule.id);
    try {
      const signer = await getSigner();
      await ensureCorrectNetwork(signer);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultV3ABI, signer);
      const tx = await contract.deleteOpenedContent(capsule.id);
      await tx.wait();
      showToast(t.deleteContentSuccess || "Konten terhapus", 'success');
      setSelectedVault(null);
      await fetchWalletData();
    } catch (err) {
      showToast((t.deleteContentFailPrefix || "Gagal menghapus: ") + extractErrorMessage(err), 'error');
    } finally {
      setIsDeletingContent(null);
    }
  };

  const handleStake = async (tierId, amountInput) => {
    const sanitizedAmount = amountInput
      .replace(/,/g, '.')
      .replace(/[^0-9.]/g, '')
      .replace(/(\..*)\./g, '$1');

    if (isNaN(parseFloat(sanitizedAmount)) || parseFloat(sanitizedAmount) <= 0) {
      return showToast("Nominal tidak valid", "error");
    }

    if (!isConnected) return showToast(t.connectWalletFirst || "Hubungkan dompet terlebih dahulu", "error");
    if (isWrongNetwork) return showToast(t.switchNetworkFirst?.replace('{chain}', TARGET_CHAIN_NAME), 'error');

    setIsStaking(true);
    try {
      const signer = await getSigner();
      await ensureCorrectNetwork(signer);
      const amountInWei = ethers.parseUnits(sanitizedAmount, 18);
      
      const tokenContract = new ethers.Contract(AETH_TOKEN_ADDRESS, ERC20_ABI, signer);
      const currentAllowance = await tokenContract.allowance(address, STAKING_CONTRACT_ADDRESS);

      if (currentAllowance < amountInWei) {
        showToast(t.requestingApprove || "Meminta izin akses token (Approve)...", "info");
        const approveTx = await tokenContract.approve(STAKING_CONTRACT_ADDRESS, amountInWei);
        await approveTx.wait();
      }

      const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingABI, signer);
      const tx = await stakingContract.stake(tierId, amountInWei);
      showToast(t.txSentWaitingConfirm || "Memproses Staking di jaringan...", "info");
      await tx.wait();
      
      setStakeInput('');
      showToast(t.stakeSuccess?.replace("{amount}", sanitizedAmount) || `Berhasil Stake ${sanitizedAmount} AETH!`, "success");
      await fetchWalletData();
      await fetchGlobalStats();
    } catch (err) {
      showToast((t.stakeFailPrefix || "Gagal Staking: ") + extractErrorMessage(err), "error");
    } finally {
      setIsStaking(false);
    }
  };

  const handleWithdrawStake = async (depositId) => {
    if (!isConnected) return showToast(t.connectWalletFirst || "Hubungkan dompet", "error");
    if (isWrongNetwork) return showToast(t.switchNetworkFirst?.replace('{chain}', TARGET_CHAIN_NAME), 'error');
    
    const dep = userDeposits.find(d => d.id === depositId);
    if (!dep) return;

    setIsWithdrawingStake(true);
    try {
      const signer = await getSigner();
      await ensureCorrectNetwork(signer);
      const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingABI, signer);
      
      const tx = await stakingContract.withdraw(depositId, BigInt(dep.amount));
      showToast(t.txSentWaitingConfirm || "Memproses Withdraw di jaringan...", "info");
      await tx.wait();
      
      showToast(t.unstakeSuccess?.replace("{amount}", ethers.formatUnits(dep.amount, 18)) || "Withdraw Berhasil!", "success");
      await fetchWalletData();
      await fetchGlobalStats();
    } catch (err) {
      showToast((t.unstakeFailPrefix || "Gagal Withdraw: ") + extractErrorMessage(err), "error");
    } finally {
      setIsWithdrawingStake(false);
    }
  };

  const handleEmergencyWithdraw = async (depositId) => {
    if (!isConnected) return showToast(t.connectWalletFirst || "Hubungkan dompet", "error");
    if (isWrongNetwork) return showToast(t.switchNetworkFirst?.replace('{chain}', TARGET_CHAIN_NAME), 'error');
    
    const confirmed = window.confirm(t.emergencyWarning || "PERINGATAN! Menarik paksa sebelum waktu selesai akan MENGHANGUSKAN semua bunga pada deposit ini. Lanjutkan?");
    if (!confirmed) return;

    setIsWithdrawingStake(true);
    try {
      const signer = await getSigner();
      await ensureCorrectNetwork(signer);
      const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingABI, signer);
      
      const tx = await stakingContract.emergencyWithdraw(depositId);
      showToast(t.txSentWaitingConfirm || "Memproses Emergency Withdraw...", "info");
      await tx.wait();
      
      showToast(t.emergencySuccess || "Dana Darurat Berhasil Ditarik!", "success");
      await fetchWalletData();
      await fetchGlobalStats();
    } catch (err) {
      showToast((t.emergencyFailPrefix || "Gagal Emergency Withdraw: ") + extractErrorMessage(err), "error");
    } finally {
      setIsWithdrawingStake(false);
    }
  };

  const handleClaimReward = async () => {
    if (!isConnected) return showToast(t.connectWalletFirst || "Hubungkan dompet", "error");
    if (isWrongNetwork) return showToast(t.switchNetworkFirst?.replace('{chain}', TARGET_CHAIN_NAME), 'error');
    if (pendingReward <= 0) return showToast(t.noRewardAvailable || "Belum ada bunga", "error");

    try {
      const signer = await getSigner();
      await ensureCorrectNetwork(signer);
      const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingABI, signer);
      const tx = await stakingContract.claimReward();
      await tx.wait();
      showToast(t.claimRewardSuccess || "Bunga berhasil diklaim!", "success");
      await fetchWalletData();
      await fetchGlobalStats();
    } catch (err) {
      showToast((t.claimRewardFailPrefix || "Gagal Klaim Bunga: ") + extractErrorMessage(err), "error");
    }
  };

  const extractArweaveUrl = (text) => {
    const match = text?.match(/(https:\/\/(arweave\.net|devnet\.irys\.xyz|gateway\.irys\.xyz)\/[a-zA-Z0-9_-]+)/);
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
      
      const binaryString = atob(fileData.data);
      const byteArray = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
      }
      
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

  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [newTreasuryInput, setNewTreasuryInput] = useState('');

  const handleAdminTogglePause = async (isPause, isStakingTarget = false) => {
    try {
      setIsAdminLoading(true);
      const signer = await getSigner();
      const targetAddress = isStakingTarget ? STAKING_CONTRACT_ADDRESS : CONTRACT_ADDRESS;
      const abi = isStakingTarget ? StakingABI : AetherVaultV3ABI;
      const contract = new ethers.Contract(targetAddress, abi, signer);

      const tx = isPause ? await contract.pause() : await contract.unpause();
      showToast(t.adminTxSending || "Mengirim transaksi darurat...", "info");
      await tx.wait();
      showToast(isPause ? (t.adminPauseSuccess || "Berhasil di-PAUSE!") : (t.adminUnpauseSuccess || "Berhasil di-UNPAUSE!"), "success");
    } catch (err) {
      showToast((t.adminPauseFail || "Gagal ubah status pause: ") + err.message, "error");
    } finally {
      setIsAdminLoading(false);
    }
  };

  const handleAdminUpdateTreasury = async (e) => {
    e.preventDefault();
    if (!ethers.isAddress(newTreasuryInput)) return showToast(t.invalidTreasuryAddress || "Alamat treasury tidak valid!", "error");
    try {
      setIsAdminLoading(true);
      const signer = await getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultV3ABI, signer);
      const tx = await contract.setTreasuryAddress(newTreasuryInput);
      showToast(t.adminTreasuryUpdating || "Memperbarui treasury...", "info");
      await tx.wait();
      showToast(t.adminTreasurySuccess || "Treasury sukses diperbarui!", "success");
      setNewTreasuryInput('');
    } catch (err) {
      showToast((t.adminTreasuryFail || "Gagal update treasury: ") + err.message, "error");
    } finally {
      setIsAdminLoading(false);
    }
  };
  
  const handleAdminClaimVesting = async () => {
    const confirmed = window.confirm("Yakin ingin mencairkan token Vesting developer sekarang?");
    if (!confirmed) return;
    
    try {
      setIsAdminLoading(true);
      const signer = await getSigner();
      const vestingContract = new ethers.Contract(VESTING_CONTRACT_ADDRESS, TeamVestingABI, signer);
      
      showToast(t.adminVestingClaiming || "Memproses pencairan token developer...", "info");
      const tx = await vestingContract.claim(); 
      await tx.wait();
      showToast(t.adminVestingSuccess || "Mantap! Gaji developer berhasil masuk dompet!", "success");
    } catch (err) {
      showToast((t.adminVestingFail || "Gagal mencairkan vesting: ") + err.message, "error");
    } finally {
      setIsAdminLoading(false);
    }
  };

  const renderNavMenu = (isMobile = false) => (
    <nav className="space-y-1.5">
      {[
        { id: 'create', icon: Lock, label: t.menuCreate || 'Create' },
        { id: 'proof', icon: Award, label: t.menuProof || 'Aether Proof' },
        { id: 'hall', icon: Globe, label: t.menuHall || 'Hall of Proof' },
        { id: 'vaults', icon: Layers, label: t.menuVaults || 'My Vaults', count: myCapsules.length > 0 ? myCapsules.length : undefined },
        { id: 'history', icon: History, label: t.menuHistory || 'History' },
        { id: 'stats', icon: Flame, label: t.menuStats || 'Global Stats' },
        { id: 'staking', icon: Coins, label: t.menuStaking || 'Staking V6' },
        { id: 'security', icon: Shield, label: t.menuSecurity || 'Security' },
        { id: 'settings', icon: Settings, label: t.menuSettings || 'Settings' }
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
          <h2 className="text-lg font-extrabold text-red-300">{t.configIncompleteTitle || "Configuration Incomplete"}</h2>
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
            <h2 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest font-mono">{t.menuTitle || "Navigation"}</h2>
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
                <Activity className="w-4 h-4" /> {t.web3TerminalLabel || "Web3 Terminal"}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {!isConnected ? (
                <button
                  onClick={() => open()}
                  className="bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 hover:from-cyan-400 hover:via-violet-400 hover:to-fuchsia-400 text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-full font-bold flex items-center gap-1.5 sm:gap-2 transition-all shadow-[0_0_25px_-3px_rgba(168,85,247,0.5),0_0_15px_-3px_rgba(34,211,238,0.4)] text-[10px] sm:text-sm cursor-pointer whitespace-nowrap"
                >
                  <Wallet className="w-3 h-3 sm:w-4 sm:h-4" /> {t.connectWallet || "Connect"}
                </button>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <div className="hidden md:flex items-center gap-2.5 bg-[#05030F] px-4 py-2 rounded-full border border-neutral-800">
                    <Cpu className="w-4 h-4 text-cyan-500" />
                    <div className="flex flex-col">
                      <span className="text-[9px] text-neutral-400 uppercase tracking-wider">{t.gasFeeLabel || "Gas Coin"}</span>
                      <span className="text-xs font-bold font-mono text-white">{nativeBalance} tBNB</span>
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
                  <p className="text-xs sm:text-sm font-bold text-red-300">{t.wrongNetworkTitle || "Wrong Network"}</p>
                  <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">{t.wrongNetworkDesc?.replace('{chain}', TARGET_CHAIN_NAME) || "Please switch to BSC Testnet."}</p>
                </div>
              </div>
              <button
                onClick={handleSwitchNetwork}
                disabled={isSwitchingNetwork}
                className="whitespace-nowrap bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 text-red-300 px-4 py-2 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSwitchingNetwork ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                {t.switchToChainBtn?.replace('{chain}', TARGET_CHAIN_NAME) || "Switch Network"}
              </button>
            </div>
          )}

          {isConnected && !isWrongNetwork && !myPublicKeyRegistered && (
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <KeyRound className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-bold text-amber-300">{t.keyNotRegisteredTitle || "Encryption Key Missing"}</p>
                  <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">{t.keyNotRegisteredDesc || "Register your key to use the Vault."}</p>
                </div>
              </div>
              <button
                onClick={handleRegisterEncryptionKey}
                disabled={isRegisteringKey}
                className="whitespace-nowrap bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 px-4 py-2 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isRegisteringKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                {t.registerKeyBtn || "Register Key"}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="hidden lg:block lg:col-span-1 space-y-6">
              <div className="bg-[#0B0817] border border-neutral-900 p-5 rounded-3xl sticky top-28 shadow-xl">
                <h2 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-4 px-3 font-mono">{t.menuTitle || "Navigation"}</h2>
                {renderNavMenu()}
                <div className="mt-8 pt-5 border-t border-neutral-900 px-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <span className="flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-cyan-500 animate-pulse" /> {t.mainnetLabel || "Network"}</span>
                    <span className="font-mono text-neutral-400">{TARGET_CHAIN_NAME}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6">
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
                  uploadError={uploadError} 
                />
              )}

              {activeTab === 'proof' && (
                <AetherProofHub
                  t={t}
                  address={address}
                  TARGET_CHAIN_NAME={TARGET_CHAIN_NAME}
                  myCapsules={myCapsules}
                  handleViewCertificate={handleViewCertificate}
                  setActiveTab={setActiveTab}
                  platformStats={platformStats}
                  isFetchingGlobalStats={isFetchingGlobalStats}
                />
              )}

              {activeTab === 'hall' && (
                <HallOfProof 
                  handleViewCertificate={handleViewCertificate} 
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'vaults' && (
                <VaultsList
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

              {activeTab === 'history' && (
                <div className="bg-[#0B0817] border border-neutral-900 p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl space-y-4 sm:space-y-6">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white">{t.historyTitle || "History"}</h3>
                  {isLoadingHistory ? (
                    <div className="text-center py-12 text-neutral-500 text-xs sm:text-sm">
                      <Loader2 className="w-8 h-8 text-cyan-500 mx-auto mb-2 animate-spin" />
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500 text-xs sm:text-sm">
                      <History className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
                      {t.historyEmpty || "No history found"}
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

              {activeTab === 'stats' && (
                <GlobalStats
                  isFetchingGlobalStats={isFetchingGlobalStats}
                  platformStats={platformStats}
                  stakingGlobalStats={stakingGlobalStats}
                />
              )}

              {activeTab === 'staking' && (
                <StakingPanel
                  stakingGlobalStats={stakingGlobalStats}
                  isFetchingGlobalStats={isFetchingGlobalStats}
                  aethBalance={aethBalance}
                  isConnected={isConnected}
                  stakeInput={stakeInput}
                  setStakeInput={setStakeInput}
                  handleStake={handleStake}
                  isStaking={isStaking}
                  isWrongNetwork={isWrongNetwork}
                  totalUserStaked={totalUserStaked}
                  pendingReward={pendingReward}
                  userDeposits={userDeposits}
                  handleWithdrawStake={handleWithdrawStake}
                  handleEmergencyWithdraw={handleEmergencyWithdraw}
                  isWithdrawingStake={isWithdrawingStake}
                  handleClaimReward={handleClaimReward}
                />
              )}

              {activeTab === 'security' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-[#0B0817] border border-neutral-900 p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="font-display text-lg sm:text-xl font-bold text-white mb-1 flex items-center gap-2">
                        <Shield className="text-green-500 w-4 h-4 sm:w-5 sm:h-5" /> 
                        {t.securityTitle || 'Security Infrastructure'}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-400">
                        {t.securityDesc || 'Learn how your data and funds are protected.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-[#0B0817] border border-fuchsia-500/30 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg relative overflow-hidden sm:col-span-2">
                      <div className="absolute top-0 right-0 bg-fuchsia-600 text-[8px] sm:text-[10px] font-bold px-2.5 sm:px-3 py-1 rounded-bl-xl uppercase tracking-widest text-white">Military Grade</div>
                      <h5 className="text-sm sm:text-lg font-bold text-white mb-1.5 sm:mb-4 flex items-center gap-2">
                        <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 text-fuchsia-400"/> {t.secHowProtected || 'ECIES secp256k1 Encryption'}
                      </h5>
                      <div className="space-y-3 text-[10px] sm:text-sm text-neutral-400 leading-relaxed">
                        <p>{t.secDesc1 || 'Desc 1'}</p>
                        <p>{t.secDesc2 || 'Desc 2'}</p>
                        <p className="text-neutral-500 font-bold">{t.secDesc3 || 'Desc 3'}</p>
                        <p className="text-fuchsia-500/80 italic">{t.secDesc4 || 'Desc 4'}</p>
                      </div>
                    </div>

                    <div className="bg-[#0B0817] border border-cyan-500/30 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-cyan-600 text-[8px] sm:text-[10px] font-bold px-2.5 sm:px-3 py-1 rounded-bl-xl uppercase tracking-widest text-white">Active</div>
                      <h5 className="text-sm sm:text-lg font-bold text-white mb-1.5 sm:mb-2 flex items-center gap-2">
                        <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400"/> ReentrancyGuard
                      </h5>
                      <p className="text-[10px] sm:text-sm text-neutral-400 mb-4 sm:mb-6 leading-relaxed">
                        {t.reentrancyDesc || 'Mekanisme keamanan tingkat tinggi yang mencegah serangan manipulasi berulang (re-entrancy attacks) saat proses eksekusi smart contract.'}
                      </p>
                      <a href={`https://testnet.bscscan.com/address/${STAKING_CONTRACT_ADDRESS}#code`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 sm:px-4 py-2 rounded-lg hover:bg-cyan-500/20 transition-all border border-cyan-500/30">
                        {t.viewCodeBtn || 'View Source Code'} <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="bg-[#0B0817] border border-neutral-900 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg relative overflow-hidden">
                      <h5 className="text-sm sm:text-lg font-bold text-white mb-1.5 sm:mb-2 flex items-center gap-2">
                        <Coins className="w-4 h-4 sm:w-5 h-5 text-yellow-500"/> 
                        {t.vaultReserveTitle || 'Vault Reserve'}
                      </h5>
                      <p className="text-[10px] sm:text-sm text-neutral-400 mb-4 sm:mb-6 leading-relaxed">
                        {t.vaultReserveDesc || 'Dana diamankan di dalam brankas terisolasi (isolated vault) yang terverifikasi on-chain sepenuhnya.'}
                      </p>
                      <a href={`https://testnet.bscscan.com/address/${STAKING_CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-xs font-bold text-yellow-400 bg-yellow-500/10 px-3 sm:px-4 py-2 rounded-lg hover:bg-yellow-500/20 transition-all border border-yellow-500/30">
                        {t.checkVaultBtn || 'Check Reserve'} <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="bg-[#0B0817] border border-neutral-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-6 sm:space-y-8 shadow-xl">
                  <div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-white flex items-center gap-2"><Settings className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400"/> {t.settingsTitle || 'Settings'}</h3>
                    <p className="text-[11px] sm:text-sm text-neutral-400 mt-1">{t.settingsDesc || 'Configure'}</p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-[#05030F] border border-neutral-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 sm:gap-2"><KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500"/> {t.encryptionKeyLabel || 'Encryption Key'}</p>
                          <p className="text-[10px] sm:text-xs text-neutral-500 mt-1">{t.encryptionKeyDesc || 'Register to use ECIES'}</p>
                        </div>
                        <button
                          onClick={handleRegisterEncryptionKey}
                          disabled={isRegisteringKey || myPublicKeyRegistered || isWrongNetwork}
                          className={`text-[9px] sm:text-[10px] px-3 sm:px-4 py-2 rounded-lg font-bold uppercase tracking-widest shrink-0 flex items-center gap-2 ${myPublicKeyRegistered ? 'bg-green-500/10 text-green-400 border border-green-500/20 cursor-default' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 cursor-pointer disabled:opacity-50'}`}
                        >
                          {isRegisteringKey && <Loader2 className="w-3 h-3 animate-spin" />}
                          {myPublicKeyRegistered ? (t.registeredStatus || "REGISTERED") : (t.registerBtn || "REGISTER")}
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#05030F] border border-neutral-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 sm:gap-2"><Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500"/> {t.rpcLabel || 'RPC Node'}</p>
                          <p className="text-[10px] sm:text-xs text-neutral-500 mt-1">{t.rpcDesc || 'Current provider'}</p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
                          <input type="text" disabled value="BSC Testnet" className="bg-[#0B0817] border border-neutral-800 text-neutral-400 text-[9px] sm:text-xs font-mono px-2.5 sm:px-3 py-2 rounded-lg w-full sm:w-48 outline-none text-center sm:text-left" />
                          <span className={`text-[8px] sm:text-[10px] px-2 sm:px-3 py-2 rounded-lg font-bold uppercase tracking-widest shrink-0 ${isWrongNetwork ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>{isWrongNetwork ? (t.wrongNetwork || "WRONG NETWORK") : (t.connected || "CONNECTED")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'admin' && (
                <div className="bg-[#0B0817] border border-red-500/40 rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xl animate-in fade-in duration-300">
                  <div className="flex items-center gap-3 border-b border-neutral-900 pb-4">
                    <ShieldAlert className="w-8 h-8 text-red-400 shrink-0" />
                    <div>
                      <h3 className="font-display text-lg sm:text-xl font-bold text-white uppercase tracking-wider">Restricted Admin Control</h3>
                      <p className="text-xs text-red-400 font-mono">Panel manajemen khusus Owner (Diakses via URL /admin).</p>
                    </div>
                  </div>

                  {!isOwner ? (
                    <div className="bg-red-950/20 border border-red-500/30 p-6 rounded-2xl text-center space-y-2">
                      <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
                      <h4 className="text-sm font-bold text-red-300">Akses Ditolak!</h4>
                      <p className="text-xs text-neutral-400">Dompet yang terhubung saat ini bukan pemilik sah (Owner) dari Smart Contract AetherVault.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-[#05030F] border border-neutral-800 p-4 rounded-2xl space-y-3">
                          <h4 className="text-xs font-bold text-neutral-300 uppercase font-mono">Darurat Kontrak Utama</h4>
                          <div className="flex gap-2">
                            <button 
                              disabled={isAdminLoading}
                              onClick={() => handleAdminTogglePause(true, false)} 
                              className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Lock className="w-3.5 h-3.5" /> Pause Main
                            </button>
                            <button 
                              disabled={isAdminLoading}
                              onClick={() => handleAdminTogglePause(false, false)} 
                              className="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-300 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Unlock className="w-3.5 h-3.5" /> Unpause Main
                            </button>
                          </div>
                        </div>

                        <div className="bg-[#05030F] border border-neutral-800 p-4 rounded-2xl space-y-3">
                          <h4 className="text-xs font-bold text-neutral-300 uppercase font-mono">Darurat Kontrak Staking</h4>
                          <div className="flex gap-2">
                            <button 
                              disabled={isAdminLoading}
                              onClick={() => handleAdminTogglePause(true, true)} 
                              className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Lock className="w-3.5 h-3.5" /> Pause Stake
                            </button>
                            <button 
                              disabled={isAdminLoading}
                              onClick={() => handleAdminTogglePause(false, true)} 
                              className="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-300 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Unlock className="w-3.5 h-3.5" /> Unpause Stake
                            </button>
                          </div>
                        </div>
                      </div>

                      <form onSubmit={handleAdminUpdateTreasury} className="bg-[#05030F] border border-neutral-800 p-5 rounded-2xl space-y-3">
                        <h4 className="text-xs font-bold text-cyan-400 uppercase font-mono">Ganti Alamat Treasury</h4>
                        <div className="flex gap-3">
                          <input 
                            type="text" 
                            placeholder="0x... (Alamat Wallet Treasury Baru)" 
                            value={newTreasuryInput}
                            onChange={(e) => setNewTreasuryInput(e.target.value)}
                            className="flex-1 bg-[#0B0817] border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                            required
                          />
                          <button 
                            type="submit" 
                            disabled={isAdminLoading}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap shadow-lg"
                          >
                            Update Treasury
                          </button>
                        </div>
                      </form>

                      <div className="bg-[#05030F] border border-neutral-800 p-5 rounded-2xl space-y-3 mt-4">
                        <h4 className="text-xs font-bold text-green-400 uppercase font-mono">Brankas Gaji Developer</h4>
                        <p className="text-[10px] text-neutral-400 font-mono mb-2">Cairkan jatah AETH yang sudah melewati masa vesting.</p>
                        <button 
                          disabled={isAdminLoading}
                          onClick={handleAdminClaimVesting} 
                          className="w-full bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-300 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg"
                        >
                          <Coins className="w-4 h-4" /> Cairkan Gaji (Claim Vesting)
                        </button>
                      </div>
                    </div>
                  )}
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
            &copy; {new Date().getFullYear()} Nin Studio. All rights reserved. Decentralized Protocol V2.2.
          </p>
        </div>
      </footer>

      <CertificateModal 
        selectedCertificate={selectedCertificate}
        setSelectedCertificate={setSelectedCertificate}
        TARGET_CHAIN_NAME={TARGET_CHAIN_NAME}
        showToast={showToast}
      />

      {selectedVault && (
        <div className="fixed inset-0 bg-[#05030F]/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0B0817] border border-cyan-500/30 max-w-lg w-full rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-4 sm:space-y-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative">
            <h4 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2 sm:gap-2.5">
              <Sparkles className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5"/> {t.modalDecryptedTitle || "Decrypted Content"}
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
                  {selectedVault.decryptedMessage 
                    ? selectedVault.decryptedMessage.replace(/\[(Attachment|Lampiran|Attachment Tag)?:?\s*https:\/\/(arweave\.net|devnet\.irys\.xyz|gateway\.irys\.xyz)\/[a-zA-Z0-9_-]+\]/gi, '').trim() || "< Tidak ada pesan teks, hanya gambar >" 
                    : ""}
                </div>

                {selectedVault.decryptedMessage && extractArweaveUrl(selectedVault.decryptedMessage) && (
                  <div className="mt-4 p-4 border border-cyan-500/30 bg-cyan-500/10 rounded-xl space-y-3 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                    <div className="flex items-center gap-2 text-cyan-300 text-[11px] sm:text-xs font-bold font-mono">
                      <FileImage className="w-4 h-4" />
                      <span>Lampiran Terenkripsi Terdeteksi!</span>
                    </div>
                    <button
                      onClick={handleDownloadAttachment}
                      disabled={isDownloadingAttachment === selectedVault.id}
                      className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 text-white font-black rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 text-[11px] sm:text-xs cursor-pointer transition-all shadow-lg"
                    >
                      {isDownloadingAttachment === selectedVault.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Memproses Dekripsi File...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Unduh & Buka File Asli
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
            <button onClick={() => setSelectedVault(null)} className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 sm:py-4 rounded-xl sm:rounded-full text-[10px] sm:text-xs cursor-pointer transition-colors outline-none border border-transparent focus:border-neutral-500">
              {t.closeVaultBtn || "Close"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}