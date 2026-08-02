"use client";
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';

// ==========================================================================
// WEB3MODAL CONFIG — TESTNET (Polygon Amoy)
// ==========================================================================
// File ini konfigurasi Web3Modal untuk jaringan Polygon Amoy Testnet
// (Chain ID 80002). Gunakan file ini HANYA untuk development/testing.
//
// PERBEDAAN DENGAN MAINNET:
// - Chain ID: 80002 (bukan 137)
// - RPC: Amoy testnet RPC
// - Explorer: amoy.polygonscan.com
// - User butuh testnet POL (bukan POL mainnet real)
// - Project ID BISA pakai yang sama dengan mainnet (WalletConnect tidak
//   membedakan mainnet/testnet di project ID)
//
// PENTING:
// - JANGAN deploy file ini ke production/mainnet.
// - Pastikan user sudah add network Amoy di MetaMask:
//   https://chainlist.org/?search=amoy&testnets=true
// ==========================================================================

const projectId = '3a3b654d5b853b6f34f7aeab2a6ef27e'; // ← BISA pakai ID yang sama dengan mainnet

const polygonAmoyTestnet = {
  chainId: 80002,
  name: 'Polygon Amoy Testnet',
  currency: 'POL',
  explorerUrl: 'https://amoy.polygonscan.com',
  rpcUrl: 'https://rpc-amoy.polygon.technology/'
};

const metadata = {
  name: 'AetherVault (Testnet)',
  description: 'Secure Time-Locked Crypto Vault on Polygon Testnet',
  url: 'https://aethervault.xyz',
  icons: ['https://aethervault.xyz/logo.png']
};

const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true,
});

createWeb3Modal({
  ethersConfig,
  chains: [polygonAmoyTestnet],
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