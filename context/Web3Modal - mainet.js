"use client";
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';

// 1. KODE PROJECT ID DARI WALLETCONNECT CLOUD
// Sementara isi asal dulu tidak apa-apa, nanti kita ganti
const projectId = '3a3b654d5b853b6f34f7aeab2a6ef27e'; 

// 2. Setting Jaringan (Kita fokus ke Polygon Mainnet)
const polygon = {
  chainId: 137,
  name: 'Polygon',
  currency: 'POL',
  explorerUrl: 'https://polygonscan.com',
  rpcUrl: 'https://polygon-rpc.com'
};

// 3. Info Website Bos (Akan muncul saat user setuju connect di HP)
const metadata = {
  name: 'AetherVault',
  description: 'Secure Time-Locked Crypto Vault on Polygon',
  url: 'https://aethervault.xyz', // Ganti domain jika sudah ada
  icons: ['https://aethervault.xyz/logo.png']
};

// 4. Konfigurasi Mesin Ethers
const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true, // Auto-deteksi ekstensi browser
  enableInjected: true, 
  enableCoinbase: true,
});

// 5. Render Tampilan UI Pop-Up Web3Modal
createWeb3Modal({
  ethersConfig,
  chains: [polygon],
  projectId,
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // ID MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // ID Trust Wallet
    '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // ID OKX Wallet
  ],
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#06b6d4', // Warna tombol Cyan AetherVault
    '--w3m-border-radius-master': '16px'
  }
});

export function Web3ModalProvider({ children }) {
  return children;
}