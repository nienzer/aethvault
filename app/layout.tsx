import './globals.css';
import { Inter, Space_Grotesk } from 'next/font/google';
import { LanguageProvider } from '@/context/LanguageContext';
import { Web3ModalProvider } from '@/context/Web3Modal';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });

// 🌟 TAMBAHAN METADATA PWA
export const metadata = {
  title: 'AetherVault | Time-Locked Crypto Vault',
  description: 'Secure, non-custodial time-locked crypto vault on Binance Smart Chain .',
  manifest: "/manifest.json",
};

// 🌟 TAMBAHAN TEMA WARNA BROWSER UNTUK PWA
export const viewport = {
  themeColor: "#030508",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} bg-[#030508] text-gray-200 font-sans antialiased overflow-x-hidden`}>
        <LanguageProvider>
          <Web3ModalProvider>
            
            <Navbar /> 
            
            <div className="pt-16">
              {children}
            </div>

          </Web3ModalProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}