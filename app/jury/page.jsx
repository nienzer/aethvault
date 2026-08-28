"use client";
import DashboardPage from '../page'; 

export default function JuryRoute() {
  // Ini akan memanggil komponen Dasbor utama kita, 
  // lalu useEffect yang kita buat tadi akan membaca URL '/jury' 
  // dan otomatis membuka tab Faucet!
  return <DashboardPage />;
}