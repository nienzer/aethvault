"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { id } from '@/locales/id';
import { en } from '@/locales/en';

// Membuat wadah Context
const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  // Membaca memori browser saat pertama kali dimuat
  useEffect(() => {
    const savedLang = localStorage.getItem('aeth_lang');
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  // Fungsi mengubah bahasa dan menyimpannya di memori
  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('aeth_lang', newLang);
  };

  // Otomatis memilih kamus berdasarkan bahasa yang aktif
  const t = lang === 'en' ? en : id;

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook khusus agar halaman lain mudah memanggil data bahasa
export const useLanguage = () => useContext(LanguageContext);