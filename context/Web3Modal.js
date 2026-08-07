"use client";
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';

const projectId = '3a3b654d5b853b6f34f7aeab2a6ef27e';

// NAMA VARIABEL DIGANTI AGAR SESUAI DAN RAPI
const bscTestnet = {
  chainId: 97,
  name: 'BSC Testnet', // Nama dipendekkan biar cantik di tampilan dompet
  currency: 'tBNB',
  explorerUrl: 'https://testnet.bscscan.com', // Tanda / di belakang dihapus
  rpcUrl: 'https://bsc-testnet-rpc.publicnode.com' // Tanda / di belakang dihapus biar aman
};

const metadata = {
  name: 'AetherVault (Testnet)',
  description: 'Secure Time-Locked Crypto Vault on Binance Testnet',
  url: 'https://aethvault.xyz', // Alamat web sudah fix benar
  icons: ['https://aethvault.xyz/logo.png'] // Ikon juga sudah fix benar
};

const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true,
});

createWeb3Modal({
  ethersConfig,
  chains: [bscTestnet], // PANGGIL NAMA VARIABEL YANG BARU DI SINI
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