"use client";
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';

// 1. KODE PROJECT ID DARI WALLETCONNECT CLOUD
const projectId = '3a3b654d5b853b6f34f7aeab2a6ef27e'; 

// 2. Setting Jaringan (DIUBAH KE POLYGON AMOY TESTNET)
const polygonAmoy = {
  chainId: 80002,
  name: 'Polygon Amoy',
  currency: 'POL',
  explorerUrl: 'https://amoy.polygonscan.com',
  rpcUrl: 'https://rpc-amoy.polygon.technology'
};

// 3. Info Website Bos
const metadata = {
  name: 'AetherVault (Testnet)',
  description: 'Secure Time-Locked Crypto Vault on Polygon Amoy',
  url: 'https://aethervault.xyz',
  icons: ['https://aethervault.xyz/logo.png']
};

// 4. Konfigurasi Mesin Ethers
const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true,
  enableInjected: true, 
  enableCoinbase: true,
});

// 5. Render Tampilan UI Pop-Up Web3Modal
createWeb3Modal({
  ethersConfig,
  chains: [polygonAmoy], // Menggunakan jaringan Amoy Testnet
  projectId,
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // ID MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // ID Trust Wallet
    '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // ID OKX Wallet
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