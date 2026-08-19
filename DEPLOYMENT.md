# 📉 Downgrade Aethervaul: 16.2.11 → 15.5.21

## ⚠️ Kenapa 15.5.21, bukan 15.2.4?

`@opennextjs/cloudflare` versi terbaru (1.20.2+) mensyaratkan:
- Next.js `>=15.5.21 <16` ✅ **(pilihan kita)**
- Atau Next.js `>=16.2.11` ❌ (terlalu buggy)

Jadi 15.5.21 adalah **versi 15 paling rendah yang didukung adapter**.

---

## 🧹 Langkah 1: Backup
```cmd
cd C:\proyekethervault
copy package.json package.json.backup.v16
copy package-lock.json package-lock.json.backup.v16
git add .
git commit -m "backup: sebelum downgrade ke 15.5.21"
git push origin main
```

## 🧹 Langkah 2: Hapus Total (Windows CMD)
```cmd
rmdir /s /q node_modules
rmdir /s /q .next
rmdir /s /q .open-next
rmdir /s /q .wrangler
del package-lock.json
del .env.local
```

## 🧹 Langkah 3: Copy File Baru
Extract zip ini, copy ke `C:\proyekethervault` (timpa yang lama).

## 🧹 Langkah 4: Install
```cmd
npm install
```

## 🧹 Langkah 5: Verifikasi
```cmd
npx next --version
```
Harus muncul: `15.5.21` atau lebih tinggi (tetap 15.x)

## 🧹 Langkah 6: Setup KV
```cmd
npx wrangler kv namespace create "NEXT_INC_CACHE_KV"
```
Copy ID ke `wrangler.toml`.

## 🧹 Langkah 7: Deploy
```cmd
npm run deploy
```

## 🧹 Langkah 8: GitHub Auto-Deploy
Sama seperti panduan sebelumnya (API Token → GitHub Secrets → Reconnect GitHub → Push).

---

## ✅ Perbedaan 15.2.4 vs 15.5.21

| | 15.2.4 | 15.5.21 |
|---|--------|---------|
| **Adapter Support** | ❌ Tidak didukung | ✅ Didukung penuh |
| **Stabilitas** | Stabil | Stabil (sama) |
| **Bug dari 16.2.11** | ✅ Tidak ada | ✅ Tidak ada |
| **Bundle Size** | Kecil | Kecil (sama) |
| **Web3 Support** | ✅ Lancer | ✅ Lancer |

---

Kalau error lagi, screenshot, bos! 💪
