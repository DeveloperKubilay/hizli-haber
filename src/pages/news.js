import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

// Components
import Navbar from '../components/Navbar';
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
  translateTagsToTurkish 
} from '../services/categories';

function Home() {
  // State management
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(APP_CONFIG.DEFAULT_CATEGORY);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('tarih');
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  
  const location = useLocation();
  
  // Data filtering and processing
  const filteredNews = news.filter(item => {
    // Kategori eşleştirmesi - backend'den gelen İngilizce tag'leri Türkçe kategorilerle karşılaştır
    const categoryMatch = selectedCategory === CATEGORIES.ALL || 
      (item.tag && Array.isArray(item.tag) && 
       item.tag.some(tag => translateTagsToTurkish([tag]).includes(selectedCategory)));
    
    const searchMatch = searchTerm === '' || 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.minides?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tag?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return categoryMatch && searchMatch;
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

  const totalPages = Math.ceil(sortedNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNews = sortedNews.slice(startIndex, startIndex + itemsPerPage);
  
  // Data fetching
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsCollection = collection(db, 'news');
        const newsSnapshot = await getDocs(newsCollection);
        
        const newsData = newsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data
          };
        });
        
        setNews(newsData);
      } catch (error) {
        console.error("❌ Haber verileri çekilirken hata:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNews();
  }, []);

  // URL handling
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    
    if (hash) {
      const categoryKey = hash.toLowerCase();
      const categoryName = Object.entries(CATEGORIES).find(
        ([key]) => key.toLowerCase() === categoryKey
      )?.[1];
      
      if (categoryName) {
        setSelectedCategory(categoryName);
        setCurrentPage(1);
      }
    }
  }, [location]);

  // Reset page when search/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

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
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Check if should auto focus search
  const shouldAutoFocusSearch = new URLSearchParams(location.search).get('focus') === 'search';

  return (
    <>
      <Navbar />
      <div className="max-w-[1300px] mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Kategoriler */}
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />

          {/* Ana içerik - Sol reklam, Sağ haberler */}
          <div className="flex gap-6">
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
              <div className="bg-transparent px-0 pt-0 pb-4 mb-6">
                <SearchBar 
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                  autoFocus={shouldAutoFocusSearch}
                />

                <div className="flex flex-wrap items-center justify-between gap-4">
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
                  />

                  {/* Sayfalama */}
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>

              {/* Haber Grid */}
              <NewsGrid 
                news={paginatedNews}
                loading={loading}
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                onClearSearch={handleClearSearch}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
