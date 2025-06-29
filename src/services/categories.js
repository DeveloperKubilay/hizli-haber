import React from 'react';
import { 
  ClipboardList, 
  Newspaper, 
  Trophy, 
  Laptop, 
  Heart, 
  GraduationCap, 
  Building, 
  DollarSign, 
  Palette, 
  Globe 
} from 'lucide-react';

export const CATEGORIES = {
  ALL: 'Tümü',
  NEWS: 'Haberler', 
  SPORTS: 'Spor',
  TECHNOLOGY: 'Teknoloji',
  HEALTH: 'Sağlık',
  EDUCATION: 'Eğitim',
  POLITICS: 'Politika',
  ECONOMY: 'Ekonomi',
  CULTURE: 'Kültür',
  WORLD: 'Dünya'
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export const CATEGORY_ICONS = {
  [CATEGORIES.ALL]: <ClipboardList size={16} />,
  [CATEGORIES.NEWS]: <Newspaper size={16} />, 
  [CATEGORIES.SPORTS]: <Trophy size={16} />,
  [CATEGORIES.TECHNOLOGY]: <Laptop size={16} />,
  [CATEGORIES.HEALTH]: <Heart size={16} />,
  [CATEGORIES.EDUCATION]: <GraduationCap size={16} />,
  [CATEGORIES.POLITICS]: <Building size={16} />,
  [CATEGORIES.ECONOMY]: <DollarSign size={16} />,
  [CATEGORIES.CULTURE]: <Palette size={16} />,
  [CATEGORIES.WORLD]: <Globe size={16} />
};

export const CATEGORY_COLORS = {
  [CATEGORIES.ALL]: 'bg-gray-100 text-gray-800',
  [CATEGORIES.NEWS]: 'bg-blue-100 text-blue-800',
  [CATEGORIES.SPORTS]: 'bg-green-100 text-green-800', 
  [CATEGORIES.TECHNOLOGY]: 'bg-purple-100 text-purple-800',
  [CATEGORIES.HEALTH]: 'bg-red-100 text-red-800',
  [CATEGORIES.EDUCATION]: 'bg-yellow-100 text-yellow-800',
  [CATEGORIES.POLITICS]: 'bg-indigo-100 text-indigo-800',
  [CATEGORIES.ECONOMY]: 'bg-emerald-100 text-emerald-800',
  [CATEGORIES.CULTURE]: 'bg-pink-100 text-pink-800',
  [CATEGORIES.WORLD]: 'bg-cyan-100 text-cyan-800'
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
    href: `/kategori/${key.toLowerCase()}`,
    bgColor: getNavbarCategoryColor(key)
  }));

// Navbar kategori renklerini belirle
function getNavbarCategoryColor(categoryKey) {
  const colorMap = {
    'NEWS': 'bg-blue-600',
    'SPORTS': 'bg-red-600', 
    'TECHNOLOGY': 'bg-purple-600',
    'HEALTH': 'bg-pink-600',
    'EDUCATION': 'bg-cyan-600',
    'POLITICS': 'bg-indigo-600',
    'ECONOMY': 'bg-amber-600',
    'CULTURE': 'bg-orange-600',
    'WORLD': 'bg-teal-600',
    'WORLD2': 'bg-green-600'
  };
  return colorMap[categoryKey] || 'bg-gray-600';
}
