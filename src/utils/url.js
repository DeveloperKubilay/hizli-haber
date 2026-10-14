/**
 * Türkçe karakter uyumlu slug oluşturucu
 */
export function slugify(text) {
  if (!text) return '';
  const trMap = {
    'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'Ö': 'o'
  };
  return String(text)
    .replace(/[çÇğĞşŞüÜıİöÖ]/g, match => trMap[match] || match)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Haber objesinden zengin SEO uyumlu URL üretir: /haberler/:kategori/:slug-:id
 */
export function getNewsUrl(item) {
  if (!item) return '/haberler';
  const id = item.id || item.newsId;
  if (!id) return '/haberler';
  
  const rawCat = (item.tag && Array.isArray(item.tag) && item.tag[0]) ? item.tag[0] : 'gundem';
  const categorySlug = slugify(rawCat) || 'gundem';
  const newsSlug = item.slug || slugify(item.name || 'haber') || 'detay';
  
  return `/haberler/${categorySlug}/${newsSlug}-${id}`;
}
