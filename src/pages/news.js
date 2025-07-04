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

  // Toplam sayfa sayısını hesapla
  const totalPages = Math.ceil(
    searchTerm ? filteredNews.length / itemsPerPage : totalCount / itemsPerPage
  );
  
  // Arama sonuçları her zaman sayfalandırılmalı
  const paginatedNews = sortedNews.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );
  
  // Data fetching
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      // Önbellek kullanımını tamamen kaldırıyoruz, her zaman Firebase'den veri çekeceğiz
      
      try {
        console.log(`Veri çekiliyor: Sayfa ${currentPage}, Kategori: ${selectedCategory}, Sayfa başına: ${itemsPerPage}`);
        const newsCollection = collection(db, 'news');
        
        // Firestore sorgu hazırlama
        let qArgs = [newsCollection];
        let countQArgs = [newsCollection];
        
        // Kategori filtresi uygula
        if (selectedCategory !== CATEGORIES.ALL) {
          const engCat = translateCategoryToEnglish(selectedCategory);
          const normalizedEngCat = engCat.charAt(0).toUpperCase() + engCat.slice(1).toLowerCase();
          
          console.log('Firebase sorgusu için kategori:', normalizedEngCat);
          
          // Ana sorgu için kategori filtresi
          qArgs.push(where('tag', 'array-contains', normalizedEngCat));
          
          // Count sorgusu için kategori filtresi
          countQArgs.push(where('tag', 'array-contains', normalizedEngCat));
        }
        
        // Sıralama ekle
        qArgs.push(orderBy('createdAt', 'desc'));
        
        // Sayfalama için startAfter ekle (arama yapılırken tüm veri çekileceği için gerekmez)
        if (!searchTerm && currentPage > 1 && lastDocs[currentPage - 2]) {
          qArgs.push(startAfter(lastDocs[currentPage - 2]));
        }
        
        // Limit ekle (arama varsa limit yok, tüm sonuçlar çekilsin)
        if (!searchTerm) {
          qArgs.push(limit(itemsPerPage));
        } else {
          // Arama yapılırken tüm sonuçları çekmek için limit yüksek olmalı (max 1000 çekebiliriz)
          qArgs.push(limit(1000)); // Firestore limiti
        }
        
        // Sorguları çalıştır
        const [snapshot, countSnapshot] = await Promise.all([
          getDocs(query(...qArgs)),
          getCountFromServer(query(...countQArgs))
        ]);
        
        let pageData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        console.log(`Firebase'den ${pageData.length} haber alındı`);
        console.log(`Toplam haber sayısı (kategori: ${selectedCategory}): ${countSnapshot.data().count}`);
        
        // Client-side arama filtresi (sadece arama varsa)
        if (searchTerm) {
          console.log(`Arama terimi: "${searchTerm}", filtreleme öncesi: ${pageData.length} sonuç`);
          
          pageData = pageData.filter(item =>
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.minides?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.tag?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
          );
          
          console.log(`Arama terimi: "${searchTerm}", filtreleme sonrası: ${pageData.length} sonuç bulundu`);
        }
        
        // State güncelleme
        setNewsWithCounts(pageData);
        setTotalCount(countSnapshot.data().count);
        
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
        console.error('❌ Haber verileri çekilirken hata:', error);
        
        // Firebase indeks hatası için fallback
        if (error.message && error.message.includes('requires an index')) {
          try {
            console.log('İndeks hatası nedeniyle basit sorguya geçiliyor...');
            
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
              
              console.log(`Fallback: Manuel kategori filtresi - ${normalizedEngCat}`);
              
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
            
            console.log(`Fallback: ${paginatedFallbackData.length} haber gösteriliyor, toplam: ${fallbackData.length}`);
            
          } catch (secondError) {
            console.error('Fallback sorgu da başarısız oldu:', secondError);
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
      // URL'de hash varsa kategori filtreleme yapalım
      const categoryKey = hash.toLowerCase();
      console.log("URL'den alınan kategori:", categoryKey);
      
      // Önce tam eşleşme deneyin
      let categoryEntry = Object.entries(CATEGORIES).find(
        ([key]) => key.toLowerCase() === categoryKey
      );
      
      // Tam eşleşme yoksa, içeren bir key arayın
      if (!categoryEntry) {
        categoryEntry = Object.entries(CATEGORIES).find(
          ([key]) => key.toLowerCase().includes(categoryKey) || categoryKey.includes(key.toLowerCase())
        );
      }
      
      if (categoryEntry) {
        const categoryName = categoryEntry[1];
        console.log("Eşleşen kategori bulundu:", categoryName);
        
        // Sadece kategori gerçekten değişmişse state'i güncelle
        if (selectedCategory !== categoryName) {
          // Kategori değişimi için lastDocs'u temizleyin
          setLastDocs([]);
          
          setSelectedCategory(categoryName);
          setCurrentPage(1);
        }
      } else {
        console.log("Eşleşen kategori bulunamadı");
      }
    } else {
      // URL'de hash yoksa "Tüm Haberler" kategorisini gösterelim
      if (selectedCategory !== CATEGORIES.ALL) {
        console.log("URL boş, Tüm Haberler gösteriliyor");
        setSelectedCategory(CATEGORIES.ALL);
        setCurrentPage(1);
        setLastDocs([]);
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
    
    // Arama çubuğu boşsa ve URL'de kategori varsa, o kategoriye git
    if (!term && selectedCategory !== CATEGORIES.ALL) {
      const categoryKey = Object.entries(CATEGORIES).find(
        ([key, value]) => value === selectedCategory
      )?.[0];
      
      if (categoryKey) {
        navigate(`/haberler#${categoryKey.toLowerCase()}`, { replace: true });
      }
    }
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
      <Navbar />
      <div className="max-w-[1400px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Kategoriler */}
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />

          {/* Ana içerik - Sol reklam, Sağ haberler */}
          <div className="flex gap-8">
            {/* Sol reklam alanı */}
            <AdSidebar />

            {/* Sağ haberler alanı */}
            <motion.div 
              className="flex-1 mt-1"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 }}
            >
              {/* Arama ve Kontrol Paneli */}
              <div className="bg-transparent px-0 pt-0 pb-6 mb-8">
                <SearchBar 
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                  autoFocus={shouldAutoFocusSearch}
                />

                <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
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
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Dinamik Spacer - Sadece içerik az ise boşluk ekle */}
      <div style={{ 
        minHeight: paginatedNews.length < 5 ? '500px' : '50px' 
      }} className="bg-tbackground"></div>
      
      {/* Footer */}
      <Footer />
    </>
  );
}

export default Home;
