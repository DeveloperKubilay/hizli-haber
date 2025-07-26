import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy, limit, startAfter, getCountFromServer, where } from 'firebase/firestore';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CategoryFilter from '../components/news/CategoryFilter';
import SearchBar from '../components/news/SearchBar';
import ControlPanel from '../components/news/ControlPanel';
import Pagination from '../components/news/Pagination';
import NewsGrid from '../components/news/NewsGrid';
import AdSidebar from '../components/news/AdSidebar';

// Services
import {
  CATEGORIES,
  APP_CONFIG,
  translateCategoryToEnglish
} from '../services/categories';

import { Helmet } from 'react-helmet';

function Home() {
  // State management
  const [newsWithCounts, setNewsWithCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(APP_CONFIG.DEFAULT_CATEGORY);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('tarih');
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [totalCount, setTotalCount] = useState(0);
  const [lastDocs, setLastDocs] = useState([]); // Her sayfanın son dokümanı

  const location = useLocation();
  const navigate = useNavigate();

  // Data filtering and processing
  const filteredNews = newsWithCounts.filter(item => {
    // Sadece arama terimi varsa filtre uygula
    if (!searchTerm) return true;
    return (
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.minides?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tag?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const sortedNews = [...filteredNews].sort((a, b) => {
    switch (sortBy) {
      case 'baslik':
        return (a.name || '').localeCompare(b.name || '');
      case 'begeniler':
        return ((b.likes || 0) - (b.dislikes || 0)) - ((a.likes || 0) - (a.dislikes || 0));
      case 'tarih':
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // searchTerm varsa, zaten veri çekerken filtreleme yapılmış oluyor
  // yani newsWithCounts (ve türevleri sortedNews, filteredNews) zaten filtrelenmiş veri
  const paginatedNews = sortedNews;

  // Data fetching
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      // Önbellek kullanımını tamamen kaldırıyoruz, her zaman Firebase'den veri çekeceğiz

      try {
        const newsCollection = collection(db, 'news');

        // Firestore sorgu hazırlama
        let qArgs = [newsCollection];
        let countQArgs = [newsCollection];

        // Kategori filtresi uygula
        if (selectedCategory !== CATEGORIES.ALL) {
          const engCat = translateCategoryToEnglish(selectedCategory);
          const normalizedEngCat = engCat.charAt(0).toUpperCase() + engCat.slice(1).toLowerCase();

          // Ana sorgu için kategori filtresi
          qArgs.push(where('tag', 'array-contains', normalizedEngCat));

          // Count sorgusu için kategori filtresi
          countQArgs.push(where('tag', 'array-contains', normalizedEngCat));
        }

        // Eğer arama terimi varsa ve "Tümü" kategorisindeyse client-side yerine doğrudan Firebase'de filtreleme yapalım
        if (searchTerm && selectedCategory === CATEGORIES.ALL) {
          // Firebase arama indeksleri olmadığı için client-side filtreleme hala gerekecek, 
          // ancak tüm verileri çekelim ki "Tümü" kategorisinde arama yapabilelim
        }

        // Sıralama ekle
        qArgs.push(orderBy('createdAt', 'desc'));

        // Sayfalama için startAfter ekle
        if (currentPage > 1 && lastDocs[currentPage - 2]) {
          qArgs.push(startAfter(lastDocs[currentPage - 2]));
        }

        // Limit ekle - "Tümü" kategorisinde arama varsa, daha fazla veri çek
        if (searchTerm && selectedCategory === CATEGORIES.ALL) {
          // Arama varken "Tümü" kategorisinde daha fazla veri çekerek client filtreleme için kaynak sağla
          const expandedLimit = itemsPerPage * 20; // 20 kat daha fazla veri çekelim (daha fazla sonuç için)
          qArgs.push(limit(expandedLimit));
        } else {
          qArgs.push(limit(itemsPerPage));
        }

        // Sorguları çalıştır
        const [snapshot, countSnapshot] = await Promise.all([
          getDocs(query(...qArgs)),
          getCountFromServer(query(...countQArgs))
        ]);

        let pageData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Client-side arama filtresi (sadece arama varsa)
        if (searchTerm) {
          // "Tümü" kategorisinde daha fazla veri çekmemiz gerekebilir
          if (selectedCategory === CATEGORIES.ALL && pageData.length < itemsPerPage * 3 && snapshot.docs.length === itemsPerPage) {
            // Bu durumda filtreleme sonrası çok az sonuç kalabilir, kullanıcıya bilgi verilmeli
          }

          pageData = pageData.filter(item =>
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.minides?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.tag?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }

        // State güncelleme
        setNewsWithCounts(pageData);

        // Toplam sayfa sayısını güncelleme - arama yapılırken filtreli sonuçları kullan
        if (searchTerm) {
          // Arama varsa, filtrelenmiş veri sayısını kullan (client-side filtrelenmiş veriler)
          setTotalCount(pageData.length);
        } else {
          // Arama yoksa, Firestore'dan gelen toplam sayıyı kullan
          setTotalCount(countSnapshot.data().count);
        }

        // Önbellek güncellemesini devre dışı bıraktık

        // Last doc güncelleme
        if (snapshot.docs.length > 0) {
          setLastDocs(prev => {
            const newLastDocs = [...prev];
            newLastDocs[currentPage - 1] = snapshot.docs[snapshot.docs.length - 1];
            return newLastDocs;
          });
        }

      } catch (error) {
        // Firebase indeks hatası için fallback
        if (error.message && error.message.includes('requires an index')) {
          try {

            // Basit sorgu - sadece zaman sıralaması ve limit
            const fallbackQuery = query(
              collection(db, 'news'),
              orderBy('createdAt', 'desc'),
              limit(itemsPerPage * currentPage) // Daha fazla veri çek
            );

            const fallbackSnapshot = await getDocs(fallbackQuery);
            let fallbackData = fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Client-side kategori filtresi
            if (selectedCategory !== CATEGORIES.ALL) {
              const engCat = translateCategoryToEnglish(selectedCategory);
              const normalizedEngCat = engCat.charAt(0).toUpperCase() + engCat.slice(1).toLowerCase();

              fallbackData = fallbackData.filter(item => {
                return item.tag && Array.isArray(item.tag) &&
                  item.tag.some(tag => tag.toLowerCase() === normalizedEngCat.toLowerCase());
              });
            }

            // Client-side arama filtresi
            if (searchTerm) {
              fallbackData = fallbackData.filter(item =>
                item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.minides?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.tag?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
              );
            }

            // Sayfalama için slice uygula
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedFallbackData = fallbackData.slice(startIndex, endIndex);

            setNewsWithCounts(paginatedFallbackData);
            setTotalCount(fallbackData.length);

          } catch (secondError) {
            setNewsWithCounts([]);
            setTotalCount(0);
          }
        } else {
          setNewsWithCounts([]);
          setTotalCount(0);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    // lastDocs ve pageCache dependency olarak eklenmez çünkü sonsuz döngü yaratır
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, selectedCategory, searchTerm]);

  // URL handling
  useEffect(() => {
    const hash = location.hash.replace('#', '');

    if (hash) {
      const categoryKey = hash.toLowerCase();

      // Önce tam eşleşme deneyin - key adına göre (örn. TECHNOLOGY)
      let categoryEntry = Object.entries(CATEGORIES).find(
        ([key]) => key.toLowerCase() === categoryKey
      );

      // Tam eşleşme yoksa, değere göre deneyin (örn. Teknoloji)
      if (!categoryEntry) {
        categoryEntry = Object.entries(CATEGORIES).find(
          ([_, value]) => value.toLowerCase() === categoryKey
        );
      }

      // Hala bulunamadıysa, içeren bir key/value arayın
      if (!categoryEntry) {
        categoryEntry = Object.entries(CATEGORIES).find(
          ([key, value]) =>
            key.toLowerCase().includes(categoryKey) ||
            categoryKey.includes(key.toLowerCase()) ||
            value.toLowerCase().includes(categoryKey) ||
            categoryKey.includes(value.toLowerCase())
        );
      }

      if (categoryEntry) {
        const categoryName = categoryEntry[1];

        // Sadece kategori gerçekten değişmişse state'i güncelle
        if (selectedCategory !== categoryName) {
          // Kategori değişimi için lastDocs'u temizleyin
          setLastDocs([]);

          setSelectedCategory(categoryName);
          setCurrentPage(1);
        }
      } else {
        // Eşleşen kategori bulunamadı
      }
    } else {
      // URL'de hash yoksa (yani /haberler sayfasındaysa), "Tüm Haberler" kategorisine dön
      if (selectedCategory !== CATEGORIES.ALL) {
        setSelectedCategory(CATEGORIES.ALL);
        setLastDocs([]);
        setCurrentPage(1);
      }
    }
  }, [location, selectedCategory]);

  // Reset page when search/sort changes (but not when only category changes)
  const prevSearchTerm = useRef(searchTerm);
  const prevSortBy = useRef(sortBy);

  useEffect(() => {
    // Sadece arama terimi veya sıralama değiştiğinde sayfa sıfırlansın
    if (prevSearchTerm.current !== searchTerm || prevSortBy.current !== sortBy) {
      setCurrentPage(1);

      // Arama veya sıralama değiştiğinde lastDocs'u sıfırla
      setLastDocs([]);

      // Arama veya sıralama değişirken URL'deki kategoriyi koru
      if (selectedCategory !== CATEGORIES.ALL) {
        const categoryKey = Object.entries(CATEGORIES).find(
          ([key, value]) => value === selectedCategory
        )?.[0];

        if (categoryKey) {
          navigate(`/haberler#${categoryKey.toLowerCase()}`, { replace: true });
        }
      }
    }

    // Ref'leri güncelle
    prevSearchTerm.current = searchTerm;
    prevSortBy.current = sortBy;
  }, [searchTerm, sortBy, selectedCategory, navigate]);

  // Reset cache when items per page changes
  useEffect(() => {
    // itemsPerPage değiştiğinde pagination'ı sıfırla
    setLastDocs([]);
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSortDropdown(false);
      setShowViewDropdown(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Event handlers
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    // Kategori değiştiğinde son belgeleri sıfırla
    setLastDocs([]);
    // Kategori değiştiğinde önbelleği temizle işlemi kaldırıldı

    // URL'yi güncelle
    if (category === CATEGORIES.ALL) {
      // "Tüm Haberler" seçilince # kaldır
      navigate('/haberler', { replace: true });
    } else {
      // Diğer kategoriler için # ekle
      const categoryKey = Object.entries(CATEGORIES).find(
        ([key, value]) => value === category
      )?.[0];

      if (categoryKey) {
        navigate(`/haberler#${categoryKey.toLowerCase()}`, { replace: true });
      }
    }
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Arama yapıldığında sayfayı sıfırla
    setLastDocs([]); // Cache'i temizle
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);

    // Sayfa değişirken de URL'deki kategoriyi koru
    if (selectedCategory !== CATEGORIES.ALL) {
      const categoryKey = Object.entries(CATEGORIES).find(
        ([key, value]) => value === selectedCategory
      )?.[0];

      if (categoryKey) {
        navigate(`/haberler#${categoryKey.toLowerCase()}`, { replace: true });
      }
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Check if should auto focus search
  const shouldAutoFocusSearch = new URLSearchParams(location.search).get('focus') === 'search';

  return (
    <>
      <Helmet>
        <title>Hızlı Haber - Tüm Haberler</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#16181c" />
        <meta name="msapplication-navbutton-color" content="#16181c" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="description" content="Hızlı Haber ile gündemi anında takip et! Son dakika haberleri, özetler ve daha fazlası burada. Türkiye ve dünyadan en güncel haberler, trend başlıklar ve kategorilere göre filtreleme imkanı." />
        <meta name="keywords" content="haber, hızlı haber, son dakika, gündem" />
        <meta property="og:title" content="Hızlı Haber - Tüm Haberler" />
        <meta property="og:description" content="Hızlı Haber ile gündemi anında takip et! Son dakika haberleri, özetler ve daha fazlası burada. Türkiye ve dünyadan en güncel haberler, trend başlıklar ve kategorilere göre filtreleme imkanı." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hizlihaber.com/haberler" />
        <meta property="og:image" content="https://hizlihaber.com/favicon.ico" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hızlı Haber - Tüm Haberler" />
        <meta name="twitter:description" content="Hızlı Haber ile gündemi anında takip et! Son dakika haberleri, özetler ve daha fazlası burada. Türkiye ve dünyadan en güncel haberler, trend başlıklar ve kategorilere göre filtreleme imkanı." />
        <meta name="twitter:image" content="https://hizlihaber.com/favicon.ico" />
        <meta name="author" content="Hızlı Haber Ekibi" />
        <link href="https://hizlihaber.com/haberler" />
        <link rel="icon" href="/imgs/logos/logo64.png" sizes="64x64" type="image/png" />
        <link rel="icon" href="/imgs/logos/logo128.png" sizes="128x128" type="image/png" />
        <link rel="icon" href="/imgs/logos/logo180.png" sizes="180x180" type="image/png" />
        <link rel="icon" href="/imgs/logos/logo192.png" sizes="192x192" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/imgs/logos/logo180.png" />
        <link rel="manifest" href="/manifest.json" />
      </Helmet>
      <Navbar />
      <div className="max-w-[1400px] mx-auto py-4 sm:py-6 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          {/* Kategoriler */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />

          {/* Ana içerik - Sol reklam, Sağ haberler */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
            {/* Sol reklam alanı - mobilde gizle */}
            <div className="hidden lg:block">
              <AdSidebar />
            </div>

            {/* Haberler alanı */}
            <motion.div
              className="flex-1 mt-0 sm:mt-1"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 }}
            >
              {/* Arama ve Kontrol Paneli */}
              <div className="bg-transparent px-0 pt-0 pb-3 sm:pb-4 md:pb-6 mb-4 sm:mb-6 md:mb-8">
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                  autoFocus={shouldAutoFocusSearch}
                />

                <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-4 mt-3 sm:mt-4">
                  <ControlPanel
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    itemsPerPage={itemsPerPage}
                    setItemsPerPage={setItemsPerPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    showSortDropdown={showSortDropdown}
                    setShowSortDropdown={setShowSortDropdown}
                    showViewDropdown={showViewDropdown}
                    setShowViewDropdown={setShowViewDropdown}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                  />

                  {/* Sayfalama - Sadece haber varsa göster */}
                  {!loading && paginatedNews.length > 0 && totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </div>
              </div>

              {/* Haber Grid */}
              <NewsGrid
                news={paginatedNews}
                loading={loading}
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                onClearSearch={handleClearSearch}
                viewMode={viewMode}
              />

              {/* Mobilde alt sayfalama - sadece haber varsa göster */}
              {!loading && paginatedNews.length > 0 && totalPages > 1 && (
                <div className="mt-6 sm:hidden">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}

              {/* Mobilde alt reklam alanı */}
              <div className="mt-6 lg:hidden">
                <AdSidebar isMobile={true} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Dinamik Spacer - Sadece içerik az ise boşluk ekle */}
      <div style={{
        minHeight: paginatedNews.length < 5 ? '300px' : '30px'
      }} className="bg-tbackground"></div>

      {/* Alt Sayfalama - Masaüstü için */}
      {!loading && paginatedNews.length > 0 && totalPages > 1 && (
        <div className="hidden sm:flex justify-center mb-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Footer */}
      <Footer />
    </>
  );
}

export default Home;
