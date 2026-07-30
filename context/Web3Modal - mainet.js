"use client";
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';

// ==========================================================================
// WEB3MODAL CONFIG — MAINNET (Polygon)
// ==========================================================================
// File ini konfigurasi Web3Modal untuk jaringan Polygon Mainnet (Chain ID 137).
//
// PENTING:
// - Project ID ini HARUS diganti dengan project ID asli dari WalletConnect Cloud
//   (https://cloud.walletconnect.com) sebelum production. Project ID dummy
//   bisa menyebabkan rate limit atau modal tidak muncul.
// - RPC URL public (polygon-rpc.com) bisa lambat. Untuk production, ganti
//   dengan Alchemy/Infura private RPC.
// ==========================================================================

const projectId = '3a3b654d5b853b6f34f7aeab2a6ef27e'; // ← GANTI dengan Project ID asli WalletConnect Cloud

const polygonMainnet = {
  chainId: 137,
  name: 'Polygon Mainnet',
  currency: 'POL',
  explorerUrl: 'https://polygonscan.com',
  rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2/alch_EJ4vIEBOFNz5ybhl8CbuD' // ← Public RPC, untuk production pakai Alchemy/Infura
};

const metadata = {
  name: 'AetherVault',
  description: 'Secure Time-Locked Crypto Vault on Polygon',
  url: 'https://aethvault.xyz',
  icons: ['https://aethervault.xyz/logo.png']
};

const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true,  // Auto-deteksi wallet extension (MetaMask, Rabby, dll)
  enableInjected: true, // Support browser-injected wallet
  enableCoinbase: true, // Support Coinbase Wallet
});

createWeb3Modal({
  ethersConfig,
  chains: [polygonMainnet],
  projectId,
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
    '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // OKX Wallet
  ],
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#06b6d4',
    '--w3m-border-radius-master': '16px'
  }
});

export function Web3ModalProvider({ children }) {
  return children;
}