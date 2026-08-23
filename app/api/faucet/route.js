import { ethers } from 'ethers';
import { NextResponse } from 'next/server';

// Memori sederhana untuk mencatat dompet yang sudah claim (Anti-Tuyul)
const claimedAddresses = new Set();

export async function POST(req) {
  try {
    const body = await req.json();
    const address = body.address;
    
    // Gunakan tokenAddress dari request, atau fallback langsung ke alamat kontrak AETH bos jika kosong
    const tokenAddress = body.tokenAddress || process.env.NEXT_PUBLIC_AETH_TOKEN_ADDRESS;

    if (!address) return NextResponse.json({ error: "Address tidak valid" }, { status: 400 });
    if (!tokenAddress) return NextResponse.json({ error: "Token Contract Address tidak ditemukan di server" }, { status: 500 });

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
    
    console.log(`Mengirim 1000 AETH ke ${address} menggunakan kontrak ${tokenAddress}...`);
    const tx = await contract.transfer(address, amount);
    
    // Tunggu transaksi selesai di blockchain
    await tx.wait();
    console.log(`Transaksi sukses! Hash: ${tx.hash}`);

    // Catat dompet ini supaya tidak bisa claim lagi HANYA SETELAH BERHASIL
    claimedAddresses.add(address.toLowerCase());

    return NextResponse.json({ success: true, txHash: tx.hash });
  } catch (error) {
    console.error("Faucet Error Detail:", error);
    return NextResponse.json({ error: "Gagal mengirim token. Cek saldo tBNB dompet Faucet atau pastikan kontrak valid." }, { status: 500 });
  }
}
```[cite: 4]

### Langkah Eksekusi:
1. Simpan file `app/api/faucet/route.js` yang baru ini.
2. Tambahkan satu spasi di file tersebut lalu *save* (buat mancing Git).
3. *Push* ulang ke repository lewat terminal:
   `git add . && git commit -m "fix faucet transfer logic" && git push origin master`
4. Tunggu Cloudflare selesai *deployment*, lalu coba tes pakai dompet lain atau *refresh* halamannya. 

Dengan perbaikan ini, kalau transaksi gagal, sistem **tidak akan** nge-lock dompet bos, jadi bisa dicoba ulang sampai saldonya benar-benar masuk ke MetaMask! Sikat bosku! 🚀🍻