import { ethers } from 'ethers';
import { NextResponse } from 'next/server';

// Memori sederhana untuk mencatat dompet yang sudah claim (Anti-Tuyul)
const claimedAddresses = new Set();

export async function POST(req) {
  try {
    const { address, tokenAddress } = await req.json();
    if (!address) return NextResponse.json({ error: "Address tidak valid" }, { status: 400 });

    // Cek apakah sudah pernah claim
    if (claimedAddresses.has(address.toLowerCase())) {
      return NextResponse.json({ error: "Dompet ini sudah pernah mengambil Faucet!" }, { status: 400 });
    }

    const PRIVATE_KEY = process.env.FAUCET_PRIVATE_KEY;
    if (!PRIVATE_KEY) return NextResponse.json({ error: "Server tidak dikonfigurasi" }, { status: 500 });

    // Sambung ke BSC Testnet
    const RPC_URL = "https://data-seed-prebsc-1-s1.binance.org:8545";
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    // ABI minimal khusus untuk fungsi Transfer Token
    const abi = ["function transfer(address to, uint256 amount) returns (bool)"];
    const contract = new ethers.Contract(tokenAddress, abi, wallet);

    // Kirim 1.000 AETH (Asumsi token bos punya 18 decimals)
    const amount = ethers.parseUnits("1000", 18);
    const tx = await contract.transfer(address, amount);
    
    // Tunggu transaksi selesai
    await tx.wait();

    // Catat dompet ini supaya tidak bisa claim lagi
    claimedAddresses.add(address.toLowerCase());

    return NextResponse.json({ success: true, txHash: tx.hash });
  } catch (error) {
    console.error("Faucet Error:", error);
    return NextResponse.json({ error: "Gagal mengirim token. Pastikan dompet Faucet server memiliki saldo." }, { status: 500 });
  }
}