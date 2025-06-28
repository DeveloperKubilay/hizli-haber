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
  [CATEGORIES.ALL]: '📋',
  [CATEGORIES.NEWS]: '📰', 
  [CATEGORIES.SPORTS]: '⚽',
  [CATEGORIES.TECHNOLOGY]: '💻',
  [CATEGORIES.HEALTH]: '🏥',
  [CATEGORIES.EDUCATION]: '📚',
  [CATEGORIES.POLITICS]: '🏛️',
  [CATEGORIES.ECONOMY]: '💰',
  [CATEGORIES.CULTURE]: '🎭',
  [CATEGORIES.WORLD]: '🌍'
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
