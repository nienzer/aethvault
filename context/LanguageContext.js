"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { id } from '@/locales/id';
import { en } from '@/locales/en';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    // FIX: Guard untuk Cloudflare edge runtime (tidak ada localStorage di server)
    if (typeof window !== 'undefined') {
      try {
        const savedLang = localStorage.getItem('aeth_lang');
        if (savedLang) setLang(savedLang);
      } catch (e) {
        // Silent fail kalau localStorage blocked/dilarang
      }
    }
  }, []);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('aeth_lang', newLang);
      } catch (e) {
        // Silent fail
      }
    }
  };

  const t = lang === 'en' ? en : id;

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
};