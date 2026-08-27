import { NextResponse } from 'next/server';
import { Wallet, JsonRpcProvider, Contract, parseUnits } from 'ethers';

const claimedAddresses = new Set();

export async function POST(req) {
  try {
    const body = await req.json();
    const address = body.address;
    const tokenAddress = body.tokenAddress || process.env.NEXT_PUBLIC_AETH_TOKEN_ADDRESS;

    if (!address) return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
    if (!tokenAddress) return NextResponse.json({ error: "Token contract address not configured" }, { status: 500 });

    if (claimedAddresses.has(address.toLowerCase())) {
      return NextResponse.json({ error: "Wallet has already claimed faucet!" }, { status: 400 });
    }

    const PRIVATE_KEY = process.env.FAUCET_PRIVATE_KEY;
    if (!PRIVATE_KEY) return NextResponse.json({ error: "Server faucet private key is missing" }, { status: 500 });

    const provider = new JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545");
    const wallet = new Wallet(PRIVATE_KEY, provider);
    const contract = new Contract(tokenAddress, ["function transfer(address to, uint256 amount) returns (bool)"], wallet);

    const tx = await contract.transfer(address, parseUnits("1000", 18));
    await tx.wait();

    claimedAddresses.add(address.toLowerCase());
    return NextResponse.json({ success: true, txHash: tx.hash });
  } catch (error) {
    console.error("Faucet Error:", error);
    return NextResponse.json({ error: "Failed to transfer tokens." }, { status: 500 });
  }
}