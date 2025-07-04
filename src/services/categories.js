import React from 'react';
import { 
  ClipboardList, 
  Trophy, 
  Laptop, 
  Heart, 
  GraduationCap, 
  Building, 
  DollarSign, 
  Palette, 
  Globe,
  Star,
  Microscope
} from 'lucide-react';

export const CATEGORIES = {
  ALL: 'Tümü',
  SPORTS: 'Spor',
  TECHNOLOGY: 'Teknoloji',
  HEALTH: 'Sağlık',
  EDUCATION: 'Eğitim',
  POLITICS: 'Politika',
  ECONOMY: 'Ekonomi',
  CULTURE: 'Kültür',
  WORLD: 'Dünya',
  MAGAZINE: 'Magazin',
  SCIENCE: 'Bilim'
};

// Backend'den gelen İngilizce kategori adlarını Türkçe karşılıklarına çeviren mapping
export const ENGLISH_TO_TURKISH_CATEGORIES = {
  'Sports': 'Spor', 
  'Technology': 'Teknoloji',
  'Health': 'Sağlık',
  'Education': 'Eğitim',
  'Politics': 'Politika',
  'Economy': 'Ekonomi',
  'Culture': 'Kültür',
  'World': 'Dünya',
  'Magazine': 'Magazin',
  'Science': 'Bilim'
};

// Tersi mapping - Türkçe'den İngilizce'ye
export const TURKISH_TO_ENGLISH_CATEGORIES = {
  'Spor': 'Sports',
  'Teknoloji': 'Technology', 
  'Sağlık': 'Health',
  'Eğitim': 'Education',
  'Politika': 'Politics',
  'Ekonomi': 'Economy',
  'Kültür': 'Culture',
  'Dünya': 'World',
  'Magazin': 'Magazine',
  'Bilim': 'Science'
};

// İngilizce kategori adını Türkçe'ye çeviren fonksiyon
export const translateCategoryToTurkish = (englishCategory) => {
  return ENGLISH_TO_TURKISH_CATEGORIES[englishCategory] || englishCategory;
};

// Türkçe kategori adını İngilizce'ye çeviren fonksiyon  
export const translateCategoryToEnglish = (turkishCategory) => {
  // Hata ayıklama için tüm mevcut çeviri eşleştirmelerini göster
  console.log('Mevcut çeviri tablosu:', TURKISH_TO_ENGLISH_CATEGORIES);
  
  // Tam eşleşme deneyin
  if (TURKISH_TO_ENGLISH_CATEGORIES[turkishCategory]) {
    const englishCategory = TURKISH_TO_ENGLISH_CATEGORIES[turkishCategory];
    console.log(`Kategori çevirisi (tam eşleşme): ${turkishCategory} -> ${englishCategory}`);
    return englishCategory;
  }
  
  // Eğer tam eşleşme bulunamazsa, bu muhtemelen zaten bir İngilizce kategoridir
  console.log(`Kategori çevirisi (eşleşme yok, değer aynen kullanılıyor): ${turkishCategory}`);
  return turkishCategory;
};

// Backend'den gelen tag array'ini Türkçe'ye çeviren fonksiyon
export const translateTagsToTurkish = (englishTags) => {
  if (!Array.isArray(englishTags)) return [];
  return englishTags.map(tag => translateCategoryToTurkish(tag));
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export const CATEGORY_ICONS = {
  [CATEGORIES.ALL]: <ClipboardList size={16} />,
  [CATEGORIES.SPORTS]: <Trophy size={16} />,
  [CATEGORIES.TECHNOLOGY]: <Laptop size={16} />,
  [CATEGORIES.HEALTH]: <Heart size={16} />,
  [CATEGORIES.EDUCATION]: <GraduationCap size={16} />,
  [CATEGORIES.POLITICS]: <Building size={16} />,
  [CATEGORIES.ECONOMY]: <DollarSign size={16} />,
  [CATEGORIES.CULTURE]: <Palette size={16} />,
  [CATEGORIES.WORLD]: <Globe size={16} />,
  [CATEGORIES.MAGAZINE]: <Star size={16} />,
  [CATEGORIES.SCIENCE]: <Microscope size={16} />
};

export const CATEGORY_COLORS = {
  [CATEGORIES.ALL]: 'bg-primaryBG text-gray-300',
  [CATEGORIES.SPORTS]: 'bg-primaryBG text-green-400', 
  [CATEGORIES.TECHNOLOGY]: 'bg-primaryBG text-purple-400',
  [CATEGORIES.HEALTH]: 'bg-primaryBG text-red-400',
  [CATEGORIES.EDUCATION]: 'bg-primaryBG text-yellow-400',
  [CATEGORIES.POLITICS]: 'bg-primaryBG text-indigo-400',
  [CATEGORIES.ECONOMY]: 'bg-primaryBG text-emerald-400',
  [CATEGORIES.CULTURE]: 'bg-primaryBG text-pink-400',
  [CATEGORIES.WORLD]: 'bg-primaryBG text-cyan-400',
  [CATEGORIES.MAGAZINE]: 'bg-primaryBG text-orange-400',
  [CATEGORIES.SCIENCE]: 'bg-primaryBG text-blue-400'
};

export const APP_CONFIG = {
  SITE_NAME: 'Hızlı Haber',
  SITE_DESCRIPTION: 'En hızlı ve güvenilir haber kaynağı',
  DEFAULT_CATEGORY: CATEGORIES.ALL,
  POSTS_PER_PAGE: 12,
  AUTO_REFRESH_INTERVAL: 30000 
};

// Navbar dropdown için kategori renkleri (Tümü hariç)
export const NAVBAR_CATEGORIES = Object.entries(CATEGORIES)
  .filter(([key]) => key !== 'ALL') // Tümü kategorisini hariç tut
  .map(([key, value]) => ({
    name: value,
    href: `/haberler#${key.toLowerCase()}`,
    bgColor: getNavbarCategoryColor(key)
  }));

// Navbar kategori renklerini belirle
function getNavbarCategoryColor(categoryKey) {
  const colorMap = {
    'SPORTS': 'bg-red-600', 
    'TECHNOLOGY': 'bg-purple-600',
    'HEALTH': 'bg-pink-600',
    'EDUCATION': 'bg-cyan-600',
    'POLITICS': 'bg-indigo-600',
    'ECONOMY': 'bg-amber-600',
    'CULTURE': 'bg-orange-600',
    'WORLD': 'bg-teal-600',
    'MAGAZINE': 'bg-yellow-600',
    'SCIENCE': 'bg-blue-600'
  };
  return colorMap[categoryKey] || 'bg-gray-600';
}
