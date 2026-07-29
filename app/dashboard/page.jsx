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

  // BARU: baca ulang ciphertext kapsul yang SUDAH pernah dibuka — fungsi
  // VIEW (gratis, tanpa gas), boleh dipanggil berkali-kali. Beda dari
  // revealCapsule/claimLegacy yang state-changing dan cuma sekali pakai.
  { "inputs": [{ "internalType": "uint256", "name": "_capsuleIndex", "type": "uint256" }], "name": "getOpenedCiphertext", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  // BARU: hapus konten kapsul yang sudah dibuka (opsional, manual, oleh
  // owner/heir yang berhak). Lihat peringatan jujur soal ini di
  // AetherVault.sol — ini TIDAK menghapus riwayat blockchain lama secara
  // mutlak, cuma dari state saat ini dan ke depan.
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

  // BARU: definisi EVENT (sebelumnya tidak ada satu pun event di ABI, jadi
  // queryFilter/filters tidak bisa dipakai sama sekali). Ini yang membuat
  // tab Riwayat Transaksi & Statistik Deflasi cuma bisa baca dari memori
  // sesi (hilang tiap refresh) — sekarang dibaca ulang dari log blockchain
  // yang permanen, jadi tahan refresh/logout/ganti perangkat.
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
  // BARU: withdraw/unstake — sudah ada di kontrak sejak awal, tapi
  // sebelumnya TIDAK PERNAH dipanggil dari frontend (bug: user tidak
  // punya cara menarik pokok stake-nya kembali lewat aplikasi).
  { "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "claimReward", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "stakedBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }], "name": "calculateReward", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  // BARU: baca APY langsung dari kontrak (constant, tidak akan pernah
  // berubah tanpa deploy ulang) — supaya angka di UI tidak mungkin lagi
  // tidak sinkron kalau suatu saat kontrak staking di-redeploy dengan
  // rewardRate berbeda.
  { "inputs": [], "name": "rewardRate", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  // BARU: cek berapa reward yang MASIH BISA dibayar tanpa memakan pokok
  // user lain — dipakai untuk validasi sebelum user coba klaim.
  { "inputs": [], "name": "availableRewardPool", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },

  // BARU: definisi event untuk membangun ulang riwayat staking dari chain.
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
// ALAMAT SMART CONTRACT — GANTI SETELAH DEPLOY ULANG DARI REMIX
// ==========================================
const CONTRACT_ADDRESS = "0x63317e60C7bEC4a3e8a61e1a2436624d1b998576"; // TODO: isi alamat hasil deploy AetherVault.sol (40 hex char setelah 0x!)
const STAKING_CONTRACT_ADDRESS = "0x318Ec508E9D33DaD230a76A600E04C26757A71FD"; // TODO: isi alamat staking (40 hex char setelah 0x!)

// ==========================================
// GUARD: ALAMAT PLACEHOLDER BELUM DIGANTI
// ==========================================
// "0x000...dEaD" adalah format alamat yang VALID secara sintaks — ethers.js
// tidak akan menganggapnya error, jadi kalau lupa diganti sebelum deploy
// produksi, aplikasi akan tetap "jalan" tanpa error yang jelas, hanya saja
// terikat ke kontrak yang tidak ada/salah. Guard eksplisit ini mencegah
// kesalahan itu lolos diam-diam.
const PLACEHOLDER_ADDRESS = "0x000000000000000000000000000000000000dEaD";
const IS_CONTRACT_ADDRESS_CONFIGURED =
  CONTRACT_ADDRESS.toLowerCase() !== PLACEHOLDER_ADDRESS.toLowerCase();
const IS_STAKING_ADDRESS_CONFIGURED =
  STAKING_CONTRACT_ADDRESS.toLowerCase() !== PLACEHOLDER_ADDRESS.toLowerCase();

// ==========================================
// JARINGAN TARGET — WAJIB DIISI SESUAI JARINGAN DEPLOY SEBENARNYA
// ==========================================
// Karena kunci enkripsi diturunkan dari signature EIP-712 yang mengikat
// chainId, aplikasi HARUS menolak beroperasi di jaringan selain ini —
// kalau tidak, user bisa tanpa sadar membuat/membuka kapsul dengan
// keypair yang salah dan kehilangan akses permanen ke kapsul lamanya.
// Polygon Mainnet = 137. Ganti sesuai target (mis. 80002 untuk Amoy testnet).
// ==========================================
// MODE: TESTNET (Polygon Amoy) — GANTI KE MAINNET SAAT SUDAH SIAP PRODUKSI
// ==========================================
// Amoy adalah testnet resmi Polygon saat ini (Mumbai sudah dihentikan per
// April 2024). Chain ID 80002. Sebelum pindah ke mainnet nanti, ganti
// TARGET_CHAIN_ID ke 137 dan TARGET_CHAIN_NAME ke "Polygon", DAN deploy
// ulang kontrak ke mainnet (kontrak testnet & mainnet adalah instance
// terpisah — alamat, saldo, dan kapsul TIDAK ikut pindah otomatis).
const TARGET_CHAIN_ID = 80002;
const TARGET_CHAIN_ID_HEX = "0x" + TARGET_CHAIN_ID.toString(16);
const TARGET_CHAIN_NAME = "Polygon Amoy Testnet";

// Batas pesan ekstra untuk mengakomodasi overhead ciphertext ECIES
// (ciphertext base64 selalu lebih panjang dari plaintext aslinya)
const CIPHERTEXT_OVERHEAD_FACTOR = 2.5;

// Pemetaan key tier di frontend -> enum Tier di Solidity.
// WAJIB sama persis urutannya dengan `enum Tier { Basic, VIP, Eternal, Legacy }`
// di AetherVault.sol. Jangan diubah tanpa mengubah kontrak juga.
const TIER_ENUM_MAP = {
  basic: 0,
  premium: 1, // VIP di kontrak
  eternal: 2,
  legacy: 3,
};

// Kebalikan dari TIER_ENUM_MAP — dipakai untuk menerjemahkan angka `tier`
// yang dibaca dari getCapsuleMeta() on-chain kembali ke label yang enak
// dibaca. Sebelumnya kontrak TIDAK menyimpan tier spesifik per kapsul
// (cuma bool isLegacy), jadi Basic/VIP/Eternal semua tampil sama sebagai
// "Time-Lock" generik di daftar Brankas — sekarang dibedakan.
const TIER_INDEX_TO_LABEL = {
  0: 'Basic',
  1: 'VIP',
  2: 'Eternal',
  3: 'Legacy',
};

// RPC publik read-only untuk membaca tierConfigs TANPA perlu wallet
// terhubung (mis. saat user pertama kali membuka halaman). Untuk produksi
// sebaiknya ganti ke provider RPC dedicated (Alchemy/Infura/QuickNode)
// supaya tidak bergantung pada rate-limit endpoint publik.
const READ_ONLY_RPC_URL = "https://polygon-amoy.g.alchemy.com/v2/alch_t_rxF7Xm42lFIqpP2ucAM"; // RPC publik Amoy testnet — TODO: ganti ke provider dedicated (Alchemy/Infura) sebelum mainnet

// Nilai fallback HANYA dipakai selagi tierConfigs on-chain belum berhasil
// dimuat (mis. RPC lambat/gagal). Begitu fetch on-chain sukses, nilai ini
// langsung ditimpa. Ini mencegah UI kosong/blank saat loading pertama.
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

  // 2. INISIALISASI MESIN WALLETCONNECT
  const { open } = useWeb3Modal();
  const { address, isConnected, chainId } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const { disconnect } = useDisconnect();

  const isWrongNetwork = isConnected && chainId !== undefined && Number(chainId) !== TARGET_CHAIN_ID;

  // State Mobile Menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State Utama
  const [nativeBalance, setNativeBalance] = useState('0.0000');
  const [aethBalance, setAethBalance] = useState(0);
  const [burnedTotal, setBurnedTotal] = useState(0);
  const [activeTab, setActiveTab] = useState('create');

  // State Form Kapsul
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [tier, setTier] = useState('premium');
  const [inactivityYears, setInactivityYears] = useState('5');
  const [heirAddress, setHeirAddress] = useState('');
  const [isSealing, setIsSealing] = useState(false);

  // State Fitur IPFS
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedCid, setUploadedCid] = useState('');
  const [pendingFileCipherRef, setPendingFileCipherRef] = useState(null);

  // State Ekstra untuk Staking
  const [stakeInput, setStakeInput] = useState('');
  const [unstakeInput, setUnstakeInput] = useState('');
  const [stakedBalance, setStakedBalance] = useState(0);
  const [pendingReward, setPendingReward] = useState(0);
  const [isStaking, setIsStaking] = useState(false);
  const [isWithdrawingStake, setIsWithdrawingStake] = useState(false);
  // Dibaca langsung dari kontrak (rewardRate), bukan hardcode — nilainya
  // 125 di on-chain berarti 12.5% (dibagi 10 untuk tampilan persen).
  const [apyPercent, setApyPercent] = useState(null);

  // State Kunci Enkripsi
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

  // ==========================================
  // FIX (perbaikan dari review sebelumnya): keypair identitas disimpan di
  // REF, bukan useState. Ini murni cache in-memory yang tidak pernah perlu
  // memicu re-render sendiri — sebelumnya pakai useState menyebabkan
  // useEffect utama re-trigger sekali ekstra tiap kali kunci baru pertama
  // kali diturunkan (identitas fungsi getOrDeriveKeyPair berubah karena
  // dependency [myKeyPair] ikut berubah), sehingga semua data wallet
  // di-fetch dua kali secara redundant saat pertama connect. Dengan ref,
  // fungsi getOrDeriveKeyPair punya identitas STABIL sepanjang komponen
  // hidup, jadi tidak lagi memicu effect tambahan.
  // ==========================================
  const myKeyPairRef = useRef(null);
  const [hasLocalKeyPair, setHasLocalKeyPair] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ==========================================
  // BACA tierConfigs LANGSUNG DARI KONTRAK
  // ==========================================
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
    basic: { name: 'Basic', desc: t.tiersList.basicDesc, icon: 'bg-neutral-800', color: 'text-gray-300', border: 'border-neutral-500 shadow-[0_0_15px_-3px_rgba(255,255,255,0.1)]' },
    premium: { name: 'VIP Vault', desc: t.tiersList.vipDesc, icon: 'bg-gradient-to-br from-cyan-500/20 to-violet-500/20', color: 'text-cyan-300', border: 'border-cyan-400/70 shadow-[0_0_25px_-4px_rgba(168,85,247,0.45),0_0_15px_-4px_rgba(34,211,238,0.4)]' },
    eternal: { name: 'Eternal', desc: t.tiersList.eternalDesc, icon: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20', color: 'text-amber-300', border: 'border-amber-400/70 shadow-[0_0_25px_-4px_rgba(245,158,11,0.45),0_0_15px_-4px_rgba(251,146,60,0.35)]' },
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

  // ==========================================
  // FIX: validasi jaringan SEBELUM operasi kripto/transaksi apa pun.
  // ==========================================
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

  // Mengambil keypair identitas dari cache REF bila sudah ada, atau
  // menurunkannya sekali dari signature wallet (meminta user tanda tangan
  // SATU KALI per sesi, gratis/tanpa gas). Identitas fungsi ini STABIL
  // (tidak berubah tiap render) karena tidak lagi bergantung pada state.
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
      return null; // bukan penerima ciphertext ini — kondisi normal, bukan bug
    }
  };

  // ==========================================
  // FETCH DATA WALLET + KAPSUL DARI BLOCKCHAIN (bukan state lokal)
  // ==========================================
  const fetchCapsulesFromChain = useCallback(async (provider, userAddress, privateKeyForTitles) => {
    setIsLoadingCapsules(true);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultABI, provider);
      const [ownedIds, heirIds] = await Promise.all([
        contract.getUserCapsules(userAddress),
        contract.getHeirCapsules(userAddress),
      ]);

      // FIX: Deduplikasi — jika user adalah owner sekaligus heir kapsul yang sama,
      // jangan tampilkan dua kali. Priority: owner (asHeir: false) lebih utama.
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
            // Sebelumnya semua kapsul non-Legacy tampil sebagai "Time-Lock"
            // generik karena kontrak lama tidak menyimpan tier spesifik.
            // Sekarang pakai meta.tier (Basic/VIP/Eternal/Legacy) langsung.
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

  // ==========================================
  // FIX (Riwayat Transaksi & Statistik Deflasi kosong setelah logout/login)
  // ==========================================
  // Sebelumnya `transactions` dan `burnedTotal` cuma state React di memori,
  // ditambah manual tiap kali user berhasil melakukan aksi DI SESI ITU JUGA
  // — tidak pernah dibaca dari mana pun. Begitu refresh/logout, hilang total.
  // Bukan soal koneksi internet lambat; datanya memang tidak pernah disimpan.
  //
  // Sekarang dibangun ulang dari LOG EVENT BLOCKCHAIN yang permanen —
  // CapsuleSealed/Revealed/LegacyClaimed/PingRecorded dari vault, dan
  // Staked/Withdrawn/RewardClaimed dari staking — jadi selalu akurat, tahan
  // refresh, tahan ganti perangkat, sinkron ke event log sungguhan.
  const fetchOnChainHistory = useCallback(async (userAddress) => {
    setIsLoadingHistory(true);
    try {
      // FIX: Gunakan JsonRpcProvider read-only, BUKAN BrowserProvider wallet.
      // Wallet provider sering membatasi/reject eth_getLogs. JsonRpcProvider
      // lebih stabil untuk query event history.
      const provider = new ethers.JsonRpcProvider(READ_ONLY_RPC_URL);
      const vaultContract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultABI, provider);

      const [sealedEvents, revealedEvents, claimedEvents, pingEvents] = await Promise.all([
        vaultContract.queryFilter(vaultContract.filters.CapsuleSealed(null, userAddress), 0, "latest"),
        vaultContract.queryFilter(vaultContract.filters.CapsuleRevealed(null, userAddress), 0, "latest"),
        vaultContract.queryFilter(vaultContract.filters.LegacyClaimed(null, userAddress), 0, "latest"),
        vaultContract.queryFilter(vaultContract.filters.PingRecorded(null, userAddress), 0, "latest"),
      ]);

      let stakingLogs = { staked: [], withdrawn: [], claimed: [] };
      if (IS_STAKING_ADDRESS_CONFIGURED) {
        try {
          const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingABI, provider);
          const [staked, withdrawn, claimed] = await Promise.all([
            stakingContract.queryFilter(stakingContract.filters.Staked(userAddress), 0, "latest"),
            stakingContract.queryFilter(stakingContract.filters.Withdrawn(userAddress), 0, "latest"),
            stakingContract.queryFilter(stakingContract.filters.RewardClaimed(userAddress), 0, "latest"),
          ]);
          stakingLogs = { staked, withdrawn, claimed };
        } catch (stakeErr) {
          console.log("Gagal memuat riwayat staking (kontrak mungkin belum siap):", stakeErr);
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

      // FIX: Pre-fetch semua block unik untuk hindari race condition & redundant request.
      // Ethers v6 Log tidak punya method .getBlock() — harus pakai provider.getBlock().
      const uniqueBlockNumbers = [...new Set(allLogs.map(({ e }) => e.blockNumber))];
      const blockTimeCache = new Map();
      await Promise.all(
        uniqueBlockNumbers.map(async (blockNumber) => {
          const block = await provider.getBlock(blockNumber);
          blockTimeCache.set(blockNumber, block.timestamp);
        })
      );

      const formatDate = (unixSeconds) => new Date(unixSeconds * 1000).toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });

      // Timestamp sudah di-cache — tidak perlu Promise.all lagi.
      const built = allLogs.map(({ e, kind }) => {
        const timestamp = blockTimeCache.get(e.blockNumber);
        const date = formatDate(timestamp);
        const base = { id: `${kind}-${e.transactionHash}-${e.index ?? e.logIndex}`, date, timestamp, txHash: e.transactionHash };

        switch (kind) {
          case 'sealed': {
            const tierName = TIER_INDEX_TO_LABEL[Number(e.args.tier)] || 'Kapsul';
            const costHuman = parseFloat(ethers.formatUnits(e.args.cost, 18));
            return { ...base, type: `Segel Kapsul (${tierName})`, detail: `Membayar ${costHuman} AETH untuk menyegel kapsul #${e.args.capsuleId}.`, amount: costHuman, direction: 'out', tierIdx: Number(e.args.tier) };
          }
          case 'revealed':
            return { ...base, type: 'Buka Kapsul', detail: `Kapsul #${e.args.capsuleId} berhasil dibuka.`, amount: 0, direction: 'neutral' };
          case 'claimed':
            return { ...base, type: 'Klaim Warisan (Legacy)', detail: `Kapsul #${e.args.capsuleId} berhasil diklaim sebagai ahli waris.`, amount: 0, direction: 'neutral' };
          case 'ping':
            return { ...base, type: 'Lapor Masih Aktif', detail: `Reset jam mundur untuk kapsul #${e.args.capsuleId}.`, amount: 0, direction: 'neutral' };
          case 'staked':
            return { ...base, type: 'Stake Token', detail: 'Menambahkan likuiditas ke Smart Contract Staking.', amount: parseFloat(ethers.formatUnits(e.args.amount, 18)), direction: 'out' };
          case 'withdrawn':
            return { ...base, type: 'Unstake Token', detail: 'Menarik pokok dari Smart Contract Staking.', amount: parseFloat(ethers.formatUnits(e.args.amount, 18)), direction: 'in' };
          case 'rewardClaimed':
            return { ...base, type: 'Klaim Reward Staking', detail: 'Menarik bunga staking.', amount: parseFloat(ethers.formatUnits(e.args.reward, 18)), direction: 'in' };
          default:
            return null;
        }
      });

      setTransactions(built.filter(Boolean).sort((a, b) => b.timestamp - a.timestamp));

      // Total dibakar dihitung dari burnPart tierConfigs ON-CHAIN (bukan
      // hardcode) dikalikan jumlah kapsul tiap tier yang pernah disegel
      // user ini — akurat walau tierConfigs berbeda antar deployment.
      let totalBurn = 0;
      sealedEvents.forEach((e) => {
        const cfg = onChainTierConfig[Number(e.args.tier)];
        if (cfg) totalBurn += cfg.burn;
      });
      setBurnedTotal(totalBurn);
    } catch (err) {
      console.error("Gagal memuat riwayat on-chain:", err);
      showToast(`Gagal memuat riwayat: ${extractErrorMessage(err)}`, 'error');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [onChainTierConfig, showToast, extractErrorMessage]);

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
              // rewardRate on-chain 125 == 12.5% APY (dibagi 10 untuk tampilan).
              setApyPercent(Number(rawRate) / 10);
            }
          } catch (stakingErr) {
            console.log("Staking contract sync skipped/pending.");
          }

          // Jangan minta tanda tangan derivasi kunci kalau user sedang di
          // jaringan yang salah — hasilnya toh tidak akan valid dipakai.
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
          await fetchOnChainHistory(address);
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
        setBurnedTotal(0);
        setMyPublicKeyRegistered(false);
        myKeyPairRef.current = null; // bersihkan private key dari memori saat disconnect
        setHasLocalKeyPair(false);
      }
    };

    fetchWalletData();
    // getOrDeriveKeyPair sengaja TIDAK dimasukkan ke dependency array —
    // identitasnya sekarang stabil (lihat komentar di definisinya).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, walletProvider, address, fetchCapsulesFromChain, fetchOnChainHistory, isWrongNetwork]);

  const formatAddress = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '';

  // Nilai minimum untuk input datetime-local (format wajib: YYYY-MM-DDTHH:mm,
  // tanpa detik/zona). Dikasih buffer 5 menit ke depan supaya user tidak
  // bisa pilih waktu yang sudah lewat detik itu juga saat submit.
  const getMinUnlockDatetimeLocal = () => {
    const d = new Date(Date.now() + 5 * 60 * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // Format timestamp on-chain (detik) jadi tanggal+jam yang enak dibaca,
  // memakai zona waktu perangkat pembaca (bukan UTC mentah) — dipakai di
  // kartu daftar kapsul (Temuan #1: tanggal buka kunci tidak ditampilkan).
  const formatUnlockDateTime = (unixSeconds) => {
    if (!unixSeconds) return '-';
    return new Date(unixSeconds * 1000).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  // ==========================================
  // REGISTRASI KUNCI PUBLIK ENKRIPSI
  // ==========================================
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

  // ==========================================
  // UPLOAD FILE — DIENKRIPSI DI BROWSER, DISIMPAN PERMANEN DI ARWEAVE
  // ==========================================
  // Semua lampiran (hanya tersedia untuk tier Eternal & Legacy — Basic/VIP
  // memang tidak menyediakan fitur lampiran, itu keputusan produk terpisah
  // dari storage) disimpan lewat Irys ke Arweave. TIDAK ADA lagi jalur ke
  // 4everland/IPFS — biaya penyimpanan permanen dibayar LANGSUNG oleh
  // wallet user yang membuat kapsul, bukan developer.
  const isPermanentTier = tier === 'eternal' || tier === 'legacy';

  // Batas ukuran file SEBELUM diproses. Tanpa ini, file besar dibaca penuh
  // ke memori sebagai base64 lalu dienkripsi di main thread browser — bisa
  // bikin tab freeze/crash sebelum user sempat lihat estimasi biaya.
  // Atribut `accept` di <input type="file"> hanyalah HINT UI (gampang
  // dilewati user pilih "All files"), BUKAN validasi sungguhan — jadi cek
  // ukuran ini WAJIB dilakukan di JS, bukan diserahkan ke atribut HTML.
  const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

  // Upload Arweave sekarang DUA LANGKAH: (1) enkripsi + hitung estimasi
  // biaya SAJA, ditaruh di state `stagedUpload` untuk direview user; (2)
  // user klik konfirmasi eksplisit (handleConfirmArweaveUpload) baru benar-
  // benar membayar & upload. Sebelumnya upload (dan pembayarannya) langsung
  // jalan otomatis begitu file dipilih — kalau user lanjut berubah pikiran
  // atau transaksi sealCapsule() gagal setelahnya, biaya Arweave yang sudah
  // dibayar TIDAK BISA dikembalikan. Konfirmasi eksplisit ini tidak
  // menghilangkan risiko itu (pembayaran tetap non-refundable begitu
  // dikonfirmasi), tapi memastikan user benar-benar melihat estimasi biaya
  // dan sengaja menekan tombol sebelum uang keluar dari wallet-nya.
  const [stagedUpload, setStagedUpload] = useState(null); // {file, encryptedBytes, estimatedCost}
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
    if (isWrongNetwork) return showToast(`Pindah ke jaringan ${TARGET_CHAIN_NAME} terlebih dahulu.`, 'error');
    setIsUploading(true);
    try {
      // Tag "App-Name: AetherVault" SENGAJA DIHAPUS. Irys/Arweave secara
      // inheren tetap mempublikasikan alamat wallet penanda tangan tiap
      // data item (itu properti dasar protokolnya, tidak bisa dihindari) —
      // tapi tag identik di semua upload platform ini membuatnya TRIVIAL
      // untuk siapa pun query GraphQL Arweave dan mendapat daftar lengkap
      // (wallet, waktu, ukuran) setiap lampiran yang pernah diupload lewat
      // AetherVault, dikorelasikan dengan event CapsuleSealed on-chain yang
      // juga publik. Menghapus tag ini tidak menghilangkan linkability
      // wallet->upload (itu tidak bisa dihindari), tapi menghapus cara
      // termudah untuk MENGELOMPOKKAN semua upload platform ini sekaligus.
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

  // ==========================================
  // FIX (closure basi): fungsi ini sekarang mengembalikan keypair LENGKAP
  // (bukan cuma publicKey), sehingga pemanggil bisa memakai privateKey-nya
  // langsung tanpa bergantung pada state React yang bisa basi (setState
  // bersifat async, tidak langsung tercermin di closure yang sama).
  // Untuk tier Legacy, privateKey dikembalikan null — memang benar, pemilik
  // sendiri tidak seharusnya bisa mendekripsi kapsul Legacy miliknya sendiri.
  // ==========================================
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

  // ==========================================
  // MENYEGEL KAPSUL — PESAN DIENKRIPSI SEBELUM DIKIRIM KE KONTRAK
  // ==========================================
  const handleSeal = async (e) => {
    e.preventDefault();
    if (!isConnected) return showToast('Otorisasi ditolak. Harap hubungkan dompet.', 'error');
    if (isWrongNetwork) return showToast(`Pindah ke jaringan ${TARGET_CHAIN_NAME} terlebih dahulu.`, 'error');

    const selectedTierData = tiers[tier];

    // FIX: Cek byte length (bukan character length) untuk akurasi batas kontrak.
    // Emoji/CJK bisa 3-4 byte per karakter — message.length JS salah hitung.
    const messageByteLength = new TextEncoder().encode(message).length;
    if (messageByteLength > selectedTierData.maxLength) {
      return showToast(`Pesan terlalu panjang! Maksimal ${selectedTierData.maxLength} byte (≈${selectedTierData.maxLength} karakter Latin). Pesan Anda: ${messageByteLength} byte.`, 'error');
    }

    if (aethBalance < selectedTierData.cost) {
      return showToast(`Saldo AETH tidak mencukupi. Dibutuhkan ${selectedTierData.cost} AETH, Anda punya ${aethBalance.toFixed(4)} AETH.`, 'error');
    }

    if (tier === 'legacy' && !ethers.isAddress(heirAddress)) {
      return showToast('Format alamat Dompet Ahli Waris tidak valid!', 'error');
    }

    setIsSealing(true);
    try {
      showToast('Mengenkripsi pesan Anda di browser...', 'info');

      // FIX: tangkap keypair (termasuk privateKey bila ada) di variabel
      // LOKAL, bukan bergantung pada state React yang bisa basi.
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
        if (!unlockDate) throw new Error("Pilih tanggal & jam pembukaan kapsul!");
        const unlockTimeMs = new Date(unlockDate).getTime();
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
      setTitle(''); setMessage(''); setUnlockDate(''); setHeirAddress('');
      setSelectedFile(null); setUploadedCid(''); setPendingFileCipherRef(null);
      setActiveTab('vaults');

      // FIX: pakai ownPrivateKeyForRefresh yang ditangkap LANGSUNG dari
      // resolveRecipient() di atas — bukan membaca ulang state React yang
      // mungkin belum ter-update (closure basi).
      const provider = new ethers.BrowserProvider(walletProvider);
      await fetchCapsulesFromChain(provider, address, ownPrivateKeyForRefresh);
      // FIX (Riwayat/Statistik): baca ulang dari event log on-chain, bukan
      // push manual ke state sementara — supaya tetap benar setelah
      // refresh/logout, dan angka totalBurn selalu dari tierConfigs asli.
      await fetchOnChainHistory(address);

    } catch (err) {
      console.error(err);
      showToast(`Gagal: ${extractErrorMessage(err)}`, 'error');
    } finally {
      setIsSealing(false);
    }
  };

  // ==========================================
  // MEMBUKA KAPSUL — VERIFIKASI ON-CHAIN + DEKRIPSI LOKAL
  // ==========================================
  // FIX (Bug #1): sebelumnya fungsi ini SELALU mencoba revealCapsule/
  // claimLegacy, yang cuma boleh dipanggil SEKALI (state-changing, gerbang
  // waktu/kepemilikan). Kalau user sudah pernah membuka lalu menutup modal
  // atau refresh browser, klik "Buka" lagi akan selalu gagal — pesan yang
  // sudah legit dibuka jadi tidak bisa diakses ulang tanpa alasan.
  //
  // Sekarang: kalau kapsul SUDAH pernah dibuka (isClaimedOrRevealed==true),
  // kita pakai getOpenedCiphertext() — fungsi VIEW gratis tanpa gas, boleh
  // dipanggil berkali-kali kapan saja. Kalau BELUM pernah dibuka, tetap
  // pakai alur lama (staticCall dulu untuk validasi + tx asli sekali).
  const handleOpenVault = async (capsule) => {
    if (isWrongNetwork) {
      return showToast(`Pindah ke jaringan ${TARGET_CHAIN_NAME} terlebih dahulu.`, 'error');
    }
    if (capsule.contentDeleted) {
      // Konten sudah sengaja dihapus oleh owner/heir lewat deleteOpenedContent().
      // Tidak ada ciphertext untuk diambil sama sekali — jangan coba decrypt.
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
        // Sudah pernah dibuka sebelumnya — baca ulang GRATIS, tanpa tx,
        // tanpa menunggu konfirmasi blok. Bisa diklik berkali-kali kapan pun.
        showToast('Mengambil ulang kapsul yang sudah pernah dibuka (gratis, tanpa gas)...', 'info');
        ciphertext = await contract.getOpenedCiphertext(capsule.id);
      } else {
        // Pertama kali dibuka — tetap butuh transaksi asli (mengubah state
        // isClaimedOrRevealed jadi true), dan staticCall dulu untuk ambil
        // nilai kembalian SEBELUM state berubah (lihat catatan lama soal
        // urutan staticCall vs tx.wait()).
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
      await fetchOnChainHistory(address);
    } catch (err) {
      console.error(err);
      const msg = extractErrorMessage(err);
      setSelectedVault(prev => ({ ...prev, error: msg }));
      showToast(`Gagal membuka kapsul: ${msg}`, 'error');
    } finally {
      setIsDecrypting(false);
    }
  };

  // ==========================================
  // FIX (Bug #3): tombol "Saya Masih Aktif" untuk tier Legacy
  // ==========================================
  // pingAlive() sudah ada di kontrak & ABI sejak awal, tapi TIDAK ADA satu
  // pun tombol di UI yang memanggilnya. Tanpa ini, tier Legacy secara
  // praktis rusak: pemilik tidak punya cara "lapor masih hidup" lewat
  // aplikasi, jadi ahli waris otomatis bisa klaim begitu jangka waktu
  // minimum terlewati — walau pemiliknya masih hidup dan aktif.
  const [isPinging, setIsPinging] = useState(null); // simpan id kapsul yang sedang diproses

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
      await fetchOnChainHistory(address);
    } catch (err) {
      console.error(err);
      showToast(`Gagal melaporkan status aktif: ${extractErrorMessage(err)}`, 'error');
    } finally {
      setIsPinging(null);
    }
  };

  // ==========================================
  // FIX (fitur baru diminta user): hapus konten kapsul yang sudah dibuka
  // ==========================================
  // OPSIONAL — hanya bisa dipanggil kalau kapsul sudah pernah legit dibuka.
  // Lihat peringatan jujur di AetherVault.sol: ini menghapus dari state
  // SAAT INI dan ke depan, BUKAN dari seluruh riwayat blockchain lama
  // (archive node/indexer pihak ketiga tetap bisa punya salinan lama).
  // Karena itu konfirmasi di sini eksplisit menyebutkan batasan tsb, bukan
  // menjanjikan "hilang total tanpa jejak".
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

      const refreshProvider = new ethers.BrowserProvider(walletProvider);
      await fetchOnChainHistory(address);

    } catch (err) {
      console.error(err);
      showToast(`Gagal staking: ${extractErrorMessage(err)}`, "error");
    } finally {
      setIsStaking(false);
    }
  };

  // ==========================================
  // FIX (Temuan #3 audit staking): tombol Unstake/Withdraw yang tadinya
  // hilang total dari UI. Kontrak sudah punya withdraw() sejak awal, tapi
  // tidak ada satu pun jalan memanggilnya dari aplikasi — dari sudut
  // pandang user, dana yang di-stake terkesan "terkunci selamanya".
  // withdraw() di kontrak SENGAJA tidak bisa di-pause, jadi tombol ini
  // tetap aktif walau kontrak sedang dijeda owner untuk investigasi.
  // ==========================================
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

      const refreshProvider1 = new ethers.BrowserProvider(walletProvider);
      await fetchOnChainHistory(address);

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
    if (pendingReward <= 0) return showToast("Tidak ada reward yang tersedia untuk diklaim.", "error");

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

      const refreshProvider2 = new ethers.BrowserProvider(walletProvider);
      await fetchOnChainHistory(address);

    } catch (err) {
      console.error(err);
      // FIX: pesan error dari kontrak sekarang bisa berupa "Pool reward
      // belum mencukupi..." (bukan gagal generik) berkat perbaikan invariant
      // solvabilitas di kontrak staking — user dapat penjelasan yang jelas
      // kenapa klaimnya gagal, bukan cuma "transaksi gagal".
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

  // ==========================================
  // BLOCKING GUARD: JANGAN JALANKAN APLIKASI DENGAN ALAMAT PLACEHOLDER
  // ==========================================
  // Ditaruh SEBELUM return utama supaya tidak ada jalur (termasuk connect
  // wallet, baca tierConfigs, dsb) yang bisa jalan diam-diam dengan alamat
  // yang salah. Ini pengaman developer, bukan untuk end-user produksi —
  // begitu CONTRACT_ADDRESS/STAKING_CONTRACT_ADDRESS diisi alamat asli,
  // blok ini otomatis tidak pernah tampil lagi.
  if (!IS_CONTRACT_ADDRESS_CONFIGURED || !IS_STAKING_ADDRESS_CONFIGURED) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05030F] text-gray-200 p-6">
        <div className="max-w-md w-full bg-[#0B0817] border border-red-500/40 rounded-3xl p-6 sm:p-8 space-y-4 text-center shadow-[0_0_30px_rgba(239,68,68,0.15)]">
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
    <div className="min-h-screen flex flex-col bg-[#05030F] text-gray-200 font-sans selection:bg-fuchsia-500/30 relative">
      {/* ==========================================
          DESIGN TOKENS — arah "Web3 bold/glowing" (ala Uniswap/OpenSea)
          ==========================================
          Signature: gradient cyan -> violet -> magenta dipakai konsisten
          di tombol utama, border aktif, dan aksen teks penting — bukan
          disebar acak ke semua elemen (biar tetap terasa 1 identitas,
          bukan pelangi). Font display baru (Space Grotesk) dipakai khusus
          untuk judul section & angka besar, supaya tidak generik-Inter. */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap');
        .font-display { font-family: 'Space Grotesk', ui-sans-serif, sans-serif; letter-spacing: -0.01em; }
      `}</style>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-4 sm:right-8 z-[100] animate-in fade-in slide-in-from-right-8 duration-300">
          <div className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-2xl border ${toast.type === 'success' ? 'bg-green-950/90 border-green-500/40 text-green-300' : toast.type === 'error' ? 'bg-red-950/90 border-red-500/40 text-red-300' : 'bg-[#0B0817] border-violet-500/40 text-cyan-300 shadow-[0_0_20px_rgba(168,85,247,0.25)]'} backdrop-blur-md max-w-[90vw]`}>
            {toast.type === 'success' ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 shrink-0" /> : toast.type === 'error' ? <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 shrink-0" /> : <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />}
            <p className="text-[11px] sm:text-sm font-medium">{toast.msg}</p>
          </div>
        </div>
      )}

      {/* MOBILE MENU OVERLAY */}
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

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full pt-0 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

          {/* WEB3 CONTROL PANEL */}
          <div className="bg-[#0B0817] border border-neutral-900 p-3 sm:p-4 rounded-2xl sm:rounded-3xl mb-6 lg:mb-8 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400 hover:text-white"
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

            {/* Konten Tab */}
            <div className="lg:col-span-3 space-y-6">

              {/* TAB: BUAT KAPSUL */}
              {activeTab === 'create' && (
                <div className="bg-[#0B0817] border border-neutral-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl space-y-6 sm:space-y-8">
                  <div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2">
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
                              <span className="text-[9px] sm:text-[10px] text-red-400 font-bold flex items-center gap-1 font-mono"><Flame className="w-3 h-3" /> {data.burn} Burn</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* AREA UPLOAD FILE (ARWEAVE PERMANEN) */}
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
                              className="w-full bg-[#05030F] border border-neutral-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-white focus:border-red-500 outline-none font-mono"
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
                            Waktu memakai zona waktu perangkat Anda saat ini ({Intl.DateTimeFormat().resolvedOptions().timeZone}). Kapsul akan bisa dibuka mulai jam-menit yang dipilih, bukan hanya tanggalnya.
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
                      {isSealing ? 'Memproses...' : isWrongNetwork ? `Pindah ke ${TARGET_CHAIN_NAME} dulu` : (isConnected ? t.sealButton : t.connectToSeal)}
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
                      <p className="text-neutral-400 text-xs sm:text-sm">Memuat kapsul dari blockchain...</p>
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
                        // Tombol "Saya Masih Aktif" hanya untuk kapsul Legacy
                        // MILIK SENDIRI (bukan sebagai ahli waris) yang belum
                        // diklaim ahli waris. Ini yang tadinya hilang total
                        // dari UI walau fungsinya sudah ada di kontrak.
                        const canPingAlive = cap.isLegacy && !cap.asHeir && !cap.isClaimedOrRevealed;
                        // Tombol hapus konten hanya untuk kapsul yang sudah
                        // pernah dibuka dan belum dihapus.
                        const canDeleteContent = cap.isClaimedOrRevealed && !cap.contentDeleted;

                        // FIX (bug baru ditemukan sebelum deploy testnet):
                        // Kapsul Legacy HANYA bisa dibuka via claimLegacy() oleh
                        // ahli waris — pemilik sendiri (asHeir === false) TIDAK
                        // PERNAH berwenang memanggil revealCapsule/claimLegacy
                        // untuk kapsul Legacy miliknya sendiri, walau isReady
                        // sudah true (masa tidak-aktif terlewati). Sebelumnya
                        // tombol "Buka" tetap aktif untuk kondisi ini dan akan
                        // SELALU revert on-chain ("Gunakan claimLegacy()...")
                        // begitu diklik — membingungkan pemilik yang cuma ingin
                        // memantau status kapsulnya sendiri. Kondisinya SAMA
                        // dengan canPingAlive di atas (pemilik & belum diklaim),
                        // jadi dipakai ulang, bukan didefinisikan dua kali.
                        const isOwnUnclaimableLegacy = canPingAlive;
                        const canOpen = !cap.contentDeleted && !isOwnUnclaimableLegacy && (cap.isReady || cap.isClaimedOrRevealed);

                        return (
                        <div key={cap.id} className="bg-[#0B0817] border border-neutral-900 hover:border-cyan-500/30 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 shadow-lg transition-colors">
                          <div className="space-y-2 w-full md:w-auto">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              <span className="text-[9px] sm:text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg uppercase border border-cyan-500/20 font-mono">{cap.tierLabel}{cap.asHeir ? ' • Sebagai Ahli Waris' : ''}</span>
                              <span className="text-[9px] sm:text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg uppercase border border-amber-500/20 font-mono flex items-center gap-1 sm:gap-1.5">
                                <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {cap.status}
                              </span>
                            </div>
                            <h4 className="text-sm sm:text-base font-bold text-white truncate">{cap.title}</h4>
                            <p className="text-[9px] sm:text-[10px] text-neutral-500 font-mono flex items-center gap-1.5">
                              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                              {cap.isLegacy
                                ? `Terakhir lapor aktif: ${formatUnlockDateTime(cap.lastPingAlive)}`
                                : `Buka: ${formatUnlockDateTime(cap.unlockTimestamp)}`}
                            </p>
                          </div>
                          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                            {canPingAlive && (
                              <button
                                onClick={() => handlePingAlive(cap)}
                                disabled={isPinging === cap.id || isWrongNetwork}
                                className="w-full md:w-auto bg-transparent hover:bg-green-500/10 disabled:opacity-40 text-green-400 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-full text-[10px] sm:text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-green-500/50 transition-all"
                                title="Reset jam mundur dead-man switch — lapor ke kontrak bahwa Anda masih aktif"
                              >
                                {isPinging === cap.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                                Saya Masih Aktif
                              </button>
                            )}
                            {canDeleteContent && (
                              <button
                                onClick={() => handleDeleteOpenedContent(cap)}
                                disabled={isDeletingContent === cap.id || isWrongNetwork}
                                className="w-full md:w-auto bg-transparent hover:bg-red-500/10 disabled:opacity-40 text-red-400 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-full text-[10px] sm:text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-red-500/50 transition-all"
                                title="Hapus konten dari kontrak (opsional, tidak bisa dibatalkan)"
                              >
                                {isDeletingContent === cap.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                                Hapus
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenVault(cap)}
                              disabled={!canOpen || isWrongNetwork}
                              className="w-full md:w-auto bg-transparent hover:bg-cyan-500/10 disabled:opacity-40 disabled:cursor-not-allowed text-cyan-400 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-full text-[10px] sm:text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-cyan-500/50 transition-all"
                            >
                              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              {cap.contentDeleted
                                ? 'Sudah Dihapus'
                                : isOwnUnclaimableLegacy
                                  ? (cap.isReady ? 'Menunggu Diklaim Ahli Waris' : 'Belum Siap')
                                  : cap.isClaimedOrRevealed
                                    ? 'Lihat Lagi'
                                    : (cap.isReady ? t.openVaultBtn : 'Belum Siap')}
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
                      Memuat riwayat dari blockchain...
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
                            <button onClick={() => setStakeInput(aethBalance.toString())} className="text-[9px] sm:text-xs font-bold bg-cyan-500/10 text-cyan-400 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg border border-cyan-500/20 cursor-pointer hover:bg-cyan-500/20">MAX</button>
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

                        {/* BARU: panel Unstake — sebelumnya fitur ini hilang
                            total dari UI walau sudah ada di kontrak sejak
                            awal. withdraw() di kontrak sengaja tidak bisa
                            di-pause, jadi selalu tersedia untuk user. */}
                        {stakedBalance > 0 && (
                          <div className="mt-3 sm:mt-4 bg-[#05030F] border border-neutral-800 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                            <div className="flex justify-between text-[9px] sm:text-xs text-neutral-500 mb-1.5 sm:mb-2">
                              <span>Jumlah Unstake</span>
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
                              <button onClick={() => setUnstakeInput(stakedBalance.toString())} className="text-[9px] sm:text-xs font-bold bg-red-500/10 text-red-300 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg border border-red-500/20 cursor-pointer hover:bg-red-500/20">MAX</button>
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
                            Unstake
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
                    <h5 className="text-sm sm:text-base font-bold text-white flex items-center gap-2"><KeyRound className="w-4 h-4 text-cyan-400"/> Bagaimana isi kapsul dijaga</h5>
                    <p className="text-[11px] sm:text-sm text-neutral-400 leading-relaxed">
                      Judul, pesan, dan lampiran dienkripsi (ECIES/secp256k1) langsung di browser Anda sebelum meninggalkan perangkat.
                      Kunci dekripsi diturunkan dari signature EIP-712 wallet Anda sendiri dan tidak pernah dikirim ke mana pun, termasuk ke server AetherVault.
                      Yang tersimpan di blockchain dan Arweave hanyalah ciphertext — tidak bisa dibaca tanpa wallet asli penerima yang dituju.
                    </p>
                    <p className="text-[10px] sm:text-xs text-neutral-500 leading-relaxed">
                      Yang TIDAK dienkripsi (dan selalu terlihat publik di blockchain): alamat pemilik, alamat ahli waris, waktu kapsul dibuat/dibuka, dan tier yang dipilih. Rahasiakan hanya melalui isinya, bukan metadatanya.
                    </p>
                    <p className="text-[10px] sm:text-xs text-neutral-500 leading-relaxed">
                      Kunci enkripsi terikat pada jaringan ({TARGET_CHAIN_NAME}) yang sedang Anda pakai. Jangan menggunakan AetherVault sambil terhubung ke jaringan lain — aplikasi akan memblokir aksi dan meminta Anda pindah jaringan dulu untuk mencegah kehilangan akses.
                    </p>
                    <p className="text-[10px] sm:text-xs text-neutral-500 leading-relaxed">
                      Catatan jujur: keamanan ini setara dengan keamanan wallet Anda sendiri. Jaga seed phrase Anda dan waspada permintaan tanda tangan dari situs tak dikenal — siapa pun yang menguasai wallet Anda (lewat seed phrase bocor maupun tanda tangan yang ditipu) juga bisa menurunkan kunci dekripsi yang sama.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-[#0B0817] border border-cyan-500/30 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-cyan-600 text-[8px] sm:text-[10px] font-bold px-2.5 sm:px-3 py-1 rounded-bl-xl uppercase tracking-widest text-white">Active</div>
                      <h5 className="text-sm sm:text-lg font-bold text-white mb-1.5 sm:mb-2 flex items-center gap-2"><Lock className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400"/> ReentrancyGuard</h5>
                      <p className="text-[10px] sm:text-sm text-neutral-400 mb-4 sm:mb-6 leading-relaxed">Smart Contract Staking is multi-layered with chain-linked execution control functions.</p>
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
                          <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 sm:gap-2"><KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500"/> Kunci Enkripsi Wallet</p>
                          <p className="text-[10px] sm:text-xs text-neutral-500 mt-1">Diperlukan agar orang lain bisa menjadikan Anda ahli waris kapsul terenkripsi.</p>
                        </div>
                        <button
                          onClick={handleRegisterEncryptionKey}
                          disabled={isRegisteringKey || myPublicKeyRegistered || isWrongNetwork}
                          className={`text-[9px] sm:text-[10px] px-3 sm:px-4 py-2 rounded-lg font-bold uppercase tracking-widest shrink-0 flex items-center gap-2 ${myPublicKeyRegistered ? 'bg-green-500/10 text-green-400 border border-green-500/20 cursor-default' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 cursor-pointer disabled:opacity-50'}`}
                        >
                          {isRegisteringKey && <Loader2 className="w-3 h-3 animate-spin" />}
                          {myPublicKeyRegistered ? 'Terdaftar' : 'Daftarkan'}
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
                          <span className={`text-[8px] sm:text-[10px] px-2 sm:px-3 py-2 rounded-lg font-bold uppercase tracking-widest shrink-0 ${isWrongNetwork ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>{isWrongNetwork ? 'Jaringan Salah' : t.connected}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#05030F] border border-neutral-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 sm:gap-2"><UploadCloud className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500"/> Penyimpanan Lampiran</p>
                          <p className="text-[10px] sm:text-xs text-neutral-500 mt-1">Lampiran kapsul disimpan permanen di Arweave lewat Irys, dibayar langsung dari wallet Anda saat upload — tidak ada pihak ketiga penyimpanan lain yang terlibat.</p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
                          <input type="text" disabled value="Arweave via Irys" className="bg-[#0B0817] border border-neutral-800 text-neutral-400 text-[9px] sm:text-xs font-mono px-2.5 sm:px-3 py-2 rounded-lg w-full sm:w-48 outline-none text-center sm:text-left" />
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

      {/* FOOTER */}
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

      {/* MODAL DEKRIPSI KAPSUL */}
      {selectedVault && (
        <div className="fixed inset-0 bg-[#05030F]/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0B0817] border border-cyan-500/30 max-w-lg w-full rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-4 sm:space-y-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative">
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