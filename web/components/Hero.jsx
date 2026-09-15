'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CategoryNav from './CategoryNav';
import { useTranslation } from '../lib/i18n/LocaleContext';

export default function Hero() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { t } = useTranslation();

  // Handle the search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== '') {
      router.push(`/?search=${encodeURIComponent(searchTerm)}#items`);
    } else {
      router.push(`/#items`);
    }
  };



  return (
    <section className="relative bg-surface py-20 md:py-28 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
      <div className="max-w-5xl mx-auto text-center">
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-textMain tracking-tight mb-6">
          {t('hero.titleLine1')} <span className="text-[#003B95]">{t('hero.titleAccent')}</span>
        </h1>

        <p className="text-lg md:text-xl text-textMuted mb-10 max-w-2xl mx-auto">
          {t('hero.subtitle')}
        </p>

        {/* Search Form Area */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
          <div className="relative group flex items-center shadow-sm hover:shadow-md transition-shadow duration-300 rounded-full bg-white border border-gray-200 focus-within:border-[#003B95] focus-within:ring-4 focus-within:ring-[#003B95]/10">

            <Search className="absolute left-6 text-textMuted w-5 h-5 group-focus-within:text-[#003B95] transition-colors" />

            <input
              type="text"
              placeholder={t('hero.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-32 py-4 text-lg bg-transparent border-none rounded-full focus:outline-none focus:ring-0 text-textMain placeholder:text-gray-400"
            />

            <button
              type="submit"
              className="absolute right-2 bg-[#003B95] hover:bg-[#002b6e] text-white px-6 py-2.5 rounded-full font-medium transition-colors"
            >
              {t('hero.searchButton')}
            </button>
          </div>
        </form>

        {/* Category Navigation Section */}
        <CategoryNav />



      </div>
    </section>
  );
}