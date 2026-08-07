import './globals.css';
import { Inter, Space_Grotesk } from 'next/font/google';
import { LanguageProvider } from '@/context/LanguageContext';
import { Web3ModalProvider } from '@/context/Web3Modal'; // <-- TAMBAHKAN IMPORT INI
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });

export const metadata = {
  title: 'AetherVault | Time-Locked Crypto Vault',
  description: 'Secure, non-custodial time-locked crypto vault on Binance Smart Chain .',
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
          {/* BUNGKUS DENGAN WEB3MODAL PROVIDER DI SINI */}
          <Web3ModalProvider>
            
            <Navbar /> 
            
            {/* BUNGKUS CHILDREN DENGAN PADDING TOP SUPAYA TIDAK TERTABRAK NAVBAR */}
            <div className="pt-16">
              {children}
            </div>

          </Web3ModalProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}