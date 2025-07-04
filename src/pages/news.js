import React, { useState, useEffect } from 'react';
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
  translateTagsToTurkish,
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
  const [pageCache, setPageCache] = useState({});
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Cache anahtarı: sayfa-kategori-arama
  const getCacheKey = (page, category, search) => `${page}-${category}-${search}`;

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
  const paginatedNews = sortedNews;
  
  // Data fetching
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const cacheKey = getCacheKey(currentPage, selectedCategory, searchTerm);
      if (pageCache[cacheKey]) {
        setNewsWithCounts(pageCache[cacheKey]);
        setLoading(false);
        return;
      }
      try {
        console.log(`Veri çekiliyor: Sayfa ${currentPage}, Kategori: ${selectedCategory}`);
        const newsCollection = collection(db, 'news');
        let qArgs = [newsCollection];
        
        // Firebase indeks sorunu için önce orderBy eklemeden basit sorgu yapalım
        if (selectedCategory === CATEGORIES.ALL) {
          // Tüm kategoriler için sorgu yapısı
          qArgs.push(orderBy('createdAt', 'desc'));
        }
        // Kategori filtresi uygula (her zaman, ALL hariç)
        if (selectedCategory !== CATEGORIES.ALL) {
          try {
            let engCat = translateCategoryToEnglish(selectedCategory);
            
            // İngilizce kategori adı belirli bir formatta olmalı (ilk harf büyük, diğerleri küçük)
            // Firebase'deki tag değerlerine göre ayarlama yapalım
            engCat = engCat.charAt(0).toUpperCase() + engCat.slice(1).toLowerCase();
            
            console.log('Firebase sorgusu için kategori:', engCat); 
            console.log('Mevcut seçili kategori:', selectedCategory);
            
            // Debug için Firebase'e sorgu atmadan önce kategori bilgisini göster
            console.log(`Firebase'e sorgu: where('tag', 'array-contains', '${engCat}')`);
            
            // Firebase indeks sorununu önlemek için basit sorgu yapalım
            // İlk önce sadece kategori filtresi uygulayalım, sıralama olmadan
            qArgs = [newsCollection];
            qArgs.push(where('tag', 'array-contains', engCat));
            
            // Sonra sıralama ve limit ekleyelim
            qArgs.push(orderBy('createdAt', 'desc'));
            
            if (currentPage > 1 && lastDocs[currentPage - 2]) {
              qArgs.push(startAfter(lastDocs[currentPage - 2]));
            }
            qArgs.push(limit(itemsPerPage));
          } catch (error) {
            console.error('Kategori filtreleme hatası:', error);
            // Hata durumunda filtresiz devam et
          }
        }
        
        // Eğer sayfa 1'den büyükse ve önceki sayfanın son belgesine sahipsek
        // pagination için kullanılacak
        if (currentPage > 1 && lastDocs[currentPage - 2]) {
          qArgs.push(startAfter(lastDocs[currentPage - 2]));
        }
        qArgs.push(limit(itemsPerPage));
        let q = query(...qArgs);
        const snapshot = await getDocs(q);
        let pageData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Debug için Firebase'den gelen verileri ve tag'leri göster
        console.log(`Firebase'den ${pageData.length} haber alındı`);
        if (pageData.length > 0) {
          console.log('İlk haberin tag değerleri:', pageData[0].tag);
          console.log('Son haberin tag değerleri:', pageData[pageData.length-1].tag);
          
          // Tag değerlerini analiz et
          const allTags = pageData.flatMap(item => item.tag || []);
          const uniqueTags = [...new Set(allTags)];
          console.log('Tüm benzersiz etiketler:', uniqueTags);
          
          // Seçili kategoriye göre manuel filtreleme yapalım (indeks sorununu aşmak için)
          if (selectedCategory !== CATEGORIES.ALL) {
            const engCat = translateCategoryToEnglish(selectedCategory);
            const normalizedEngCat = engCat.charAt(0).toUpperCase() + engCat.slice(1).toLowerCase();
            
            console.log(`Manuel kategori filtresi uygulanıyor: ${normalizedEngCat}`);
            
            // Farklı etiket formatlarını deneyerek filtreleme yapalım
            pageData = pageData.filter(item => {
              if (!item.tag || !Array.isArray(item.tag)) return false;
              
              // Case-insensitive karşılaştırma yapalım
              return item.tag.some(tag => 
                tag.toLowerCase() === normalizedEngCat.toLowerCase() ||
                tag.toLowerCase() === engCat.toLowerCase()
              );
            });
            
            console.log(`Filtreleme sonrası ${pageData.length} haber kaldı`);
          }
        }
        
        // Sadece arama varsa client-side filtre uygula
        if (searchTerm) {
          pageData = pageData.filter(item =>
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.minides?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.tag?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }
        setNewsWithCounts(pageData);
        setPageCache(prev => ({ ...prev, [cacheKey]: pageData }));
        if (snapshot.docs.length > 0) {
          setLastDocs(prev => {
            const newLastDocs = [...prev];
            newLastDocs[currentPage - 1] = snapshot.docs[snapshot.docs.length - 1];
            return newLastDocs;
          });
        }
        // Toplam haber sayısını Firestore'dan çek (kategoriye göre de say)
        let countQArgs = [newsCollection];
        if (selectedCategory !== CATEGORIES.ALL) {
          let engCat = translateCategoryToEnglish(selectedCategory);
          engCat = engCat.toLowerCase();
          countQArgs.push(where('tag', 'array-contains', engCat));
        }
        const countSnapshot = await getCountFromServer(query(...countQArgs));
        setTotalCount(countSnapshot.data().count);
      } catch (error) {
        console.error('❌ Haber verileri çekilirken hata:', error);
        
        // Hata Firebase indeks hatası ise daha basit bir sorgu yapmayı deneyelim
        if (error.message && error.message.includes('requires an index')) {
          try {
            console.log('İndeks hatası nedeniyle basit sorguya geçiliyor...');
            
            // Daha basit bir sorgu yapalım - sadece zaman sıralaması
            const simpleQuery = query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(itemsPerPage));
            const simpleSnapshot = await getDocs(simpleQuery);
            let simpleData = simpleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Verileri aldıktan sonra JavaScript tarafında filtreleme yapalım
            if (selectedCategory !== CATEGORIES.ALL) {
              const engCat = translateCategoryToEnglish(selectedCategory);
              const normalizedEngCat = engCat.charAt(0).toUpperCase() + engCat.slice(1).toLowerCase();
              
              console.log(`İndeks sorun çözümü: Manuel filtre uygulanıyor - ${normalizedEngCat}`);
              
              simpleData = simpleData.filter(item => {
                return item.tag && Array.isArray(item.tag) && 
                  item.tag.some(tag => tag.toLowerCase() === normalizedEngCat.toLowerCase());
              });
            }
            
            // Sonuçları ayarla
            setNewsWithCounts(simpleData);
            setPageCache(prev => ({ ...prev, [cacheKey]: simpleData }));
          } catch (secondError) {
            console.error('Basitleştirilmiş sorgu da başarısız oldu:', secondError);
            // En azından boş dizi ayarlayarak UI'ın düzgün çalışmasını sağlayalım
            setNewsWithCounts([]);
          }
        } else {
          // Hata durumunda boş dizi ayarla
          setNewsWithCounts([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
    // Tüm bağımlılıkları burada listeliyoruz
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, selectedCategory, searchTerm]);

  // URL handling
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    
    if (hash) {
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
        
        // Kategori değişimi için cache ve lastDocs'u temizleyin
        setLastDocs([]);
        setPageCache({});
        
        setSelectedCategory(categoryName);
        setCurrentPage(1);
      } else {
        console.log("Eşleşen kategori bulunamadı");
      }
    }
  }, [location]);

  // Reset page when search/sort changes
  useEffect(() => {
    setCurrentPage(1);
    
    // Kategori, arama veya sıralama değiştiğinde lastDocs ve önbelleği sıfırla
    setLastDocs([]);
    setPageCache({});
    
    // Arama veya sıralama değişirken URL'deki kategoriyi koru
    if (selectedCategory !== CATEGORIES.ALL) {
      const categoryKey = Object.entries(CATEGORIES).find(
        ([key, value]) => value === selectedCategory
      )?.[0];
      
      if (categoryKey) {
        navigate(`/haberler#${categoryKey.toLowerCase()}`, { replace: true });
      }
    }
  }, [searchTerm, sortBy, selectedCategory, navigate]);

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
    // Kategori değiştiğinde önbelleği temizle
    setPageCache({});
    
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
