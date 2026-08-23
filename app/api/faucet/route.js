import { ethers } from 'ethers';
import { NextResponse } from 'next/server';

// In-memory tracker to prevent multiple claims (Anti-Sybil)
const claimedAddresses = new Set();

export async function POST(req) {
  try {
    const body = await req.json();
    const address = body.address;
    
    // Fallback to environment variable if tokenAddress is missing from request body
    const tokenAddress = body.tokenAddress || process.env.NEXT_PUBLIC_AETH_TOKEN_ADDRESS;

    if (!address) return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
    if (!tokenAddress) return NextResponse.json({ error: "Token contract address not configured on server" }, { status: 500 });

    // Check if wallet has already claimed
    if (claimedAddresses.has(address.toLowerCase())) {
      return NextResponse.json({ error: "This wallet has already claimed the testnet faucet!" }, { status: 400 });
    }

    const PRIVATE_KEY = process.env.FAUCET_PRIVATE_KEY;
    if (!PRIVATE_KEY) return NextResponse.json({ error: "Server faucet private key is not configured" }, { status: 500 });

    // Connect to BSC Testnet
    const RPC_URL = "https://data-seed-prebsc-1-s1.binance.org:8545";
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    // Minimal ABI for ERC-20 token transfer
    const abi = ["function transfer(address to, uint256 amount) returns (bool)"];
    const contract = new ethers.Contract(tokenAddress, abi, wallet);

    // Send 1,000 AETH (Assuming standard 18 decimals)
    const amount = ethers.parseUnits("1000", 18);
    
    console.log(`Transferring 1000 AETH to ${address} using contract ${tokenAddress}...`);
    const tx = await contract.transfer(address, amount);
    
    // Wait for transaction confirmation on-chain
    await tx.wait();
    console.log(`Transaction successful! Hash: ${tx.hash}`);

    // Mark address as claimed ONLY AFTER successful transaction
    claimedAddresses.add(address.toLowerCase());

    return NextResponse.json({ success: true, txHash: tx.hash });
  } catch (error) {
    console.error("Faucet Error Detail:", error);
    return NextResponse.json({ error: "Failed to transfer tokens. Please ensure the faucet wallet has sufficient tBNB gas." }, { status: 500 });
  }
}