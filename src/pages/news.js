import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import { CATEGORY_LIST, CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS, APP_CONFIG } from '../services/categories';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  X, 
  BarChart3, 
  Eye, 
  Calendar, 
  AlignLeft, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  FileText,
  Clock,
  Megaphone,
  Trash2
} from 'lucide-react';

function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(APP_CONFIG.DEFAULT_CATEGORY);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('tarih'); // 'tarih', 'baslik', 'okunmaSayisi'
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  
  const location = useLocation();
  const searchInputRef = useRef(null);
  
  // Filtreleme ve arama
  const filteredBlogs = blogs.filter(blog => {
    const categoryMatch = selectedCategory === CATEGORIES.ALL || blog.kategori === selectedCategory;
    const searchMatch = searchTerm === '' || 
      blog.baslik?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.kisaAciklama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.etiketler?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return categoryMatch && searchMatch;
  });

  // Sıralama
  const sortedBlogs = [...filteredBlogs].sort((a, b) => {
    switch (sortBy) {
      case 'baslik':
        return (a.baslik || '').localeCompare(b.baslik || '');
      case 'okunmaSayisi':
        return (b.okunmaSayisi || 0) - (a.okunmaSayisi || 0);
      case 'tarih':
      default:
        return new Date(b.tarih || 0) - new Date(a.tarih || 0);
    }
  });

  // Sayfalama
  const totalPages = Math.ceil(sortedBlogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBlogs = sortedBlogs.slice(startIndex, startIndex + itemsPerPage);
  
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogsCollection = collection(db, 'blogs');
        const blogsSnapshot = await getDocs(blogsCollection);
        setBlogs(blogsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogs();
  }, []);

  // URL hash ve query parametrelerini handle et
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const hash = location.hash.replace('#', '');
    
    // Eğer focus=search parametresi varsa arama kutusuna focus yap
    if (urlParams.get('focus') === 'search') {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
    
    // Hash'tan kategori belirle
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

  // Arama değiştiğinde sayfa numarasını sıfırla
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  // Dropdown dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSortDropdown(false);
      setShowViewDropdown(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const sortOptions = [
    { value: 'tarih', label: 'Tarihe göre', icon: <Calendar size={16} /> },
    { value: 'baslik', label: 'Başlığa göre', icon: <AlignLeft size={16} /> },
    { value: 'okunmaSayisi', label: 'Okunma sayısına göre', icon: <Eye size={16} /> }
  ];

  const viewOptions = [
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' },
    { value: 100, label: '100' }
  ];

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Kategoriler */}
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="bg-primary p-1 rounded-3xl shadow-lg w-fit mx-auto">
              <div className="flex flex-wrap justify-center">
                {CATEGORY_LIST.map((category, index) => (
                  <motion.button
                    key={category}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category
                        ? 'bg-secondaryBG text-secondary border border-secondary shadow-md hover:bg-selectBox hover:text-white'
                        : 'bg-transparent text-textPrimary hover:bg-primaryBG hover:text-textHeading border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {CATEGORY_ICONS[category]}
                      <span>{category}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Ana içerik - Sol reklam, Sağ haberler */}
          <div className="flex gap-6">
            {/* Sol reklam alanı 300px */}
            <motion.div 
              className="w-[300px] flex-shrink-0"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
            >
              <div className="bg-primary p-6 rounded-2xl shadow-lg sticky top-6">
                <div className="text-center text-textPrimary">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Megaphone size={20} className="text-textHeading" />
                    <h3 className="text-lg font-semibold text-textHeading">Reklam Alanı</h3>
                  </div>
                  <div className="bg-primaryBG rounded-xl p-8 min-h-[400px] flex items-center justify-center">
                    <p className="text-textPrimary">Buraya reklam gelecek!</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Sağ haberler alanı */}
            <motion.div 
              className="flex-1 mt-1"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 }}
            >
              {/* Arama ve Kontrol Paneli */}
              <div className="bg-transparent px-0 pt-0 pb-4 mb-6">
                {/* Arama Kutusu */}
                <div className="mb-4">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textPrimary" size={20} />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Haber ara... (başlık, açıklama veya etiket)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-primaryBG text-textPrimary placeholder-textPrimary border border-primaryBG rounded-2xl focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50 hover:border-selectBox transition-all duration-200"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textPrimary hover:text-secondary transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Kontrol Paneli */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* Sol taraf - Sort by ve View */}
                  <div className="flex items-center gap-4">
                    {/* Sıralama */}
                    <div className="relative">
                      <div 
                        className="bg-primaryBG rounded-full px-4 py-3 border border-primaryBG cursor-pointer hover:border-secondary transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSortDropdown(!showSortDropdown);
                          setShowViewDropdown(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <BarChart3 size={16} />
                          <span className="text-textPrimary text-sm font-medium">Sırala:</span>
                          <span className="text-textPrimary text-sm">
                            {sortOptions.find(option => option.value === sortBy)?.label}
                          </span>
                          <ChevronDown size={14} className={`text-textPrimary transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                      
                      {/* Custom Dropdown */}
                      {showSortDropdown && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-primary border border-primaryBG rounded-xl shadow-xl z-50 overflow-hidden">
                          <div className="p-1.5">
                            {sortOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSortBy(option.value);
                                  setShowSortDropdown(false);
                                }}
                                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                                  sortBy === option.value 
                                    ? 'bg-secondaryBG text-secondary border border-secondary hover:text-secondaryHover hover:bg-selectBox' 
                                    : 'text-textPrimary hover:text-textHeading hover:bg-primaryBG'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {option.icon}
                                  <span className="text-sm font-medium">{option.label}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Görüntüleme */}
                    <div className="relative">
                      <div 
                        className="bg-primaryBG rounded-full px-4 py-3 border border-primaryBG cursor-pointer hover:border-secondary transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowViewDropdown(!showViewDropdown);
                          setShowSortDropdown(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Eye size={16} />
                          <span className="text-textPrimary text-sm font-medium">Göster:</span>
                          <span className="text-textPrimary text-sm">{itemsPerPage}</span>
                          <ChevronDown size={14} className={`text-textPrimary transition-transform ${showViewDropdown ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                      
                      {/* Custom Dropdown */}
                      {showViewDropdown && (
                        <div className="absolute top-full left-0 mt-2 w-32 bg-primary border border-primaryBG rounded-xl shadow-xl z-50 overflow-hidden">
                          <div className="p-1.5">
                            {viewOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setItemsPerPage(option.value);
                                  setCurrentPage(1);
                                  setShowViewDropdown(false);
                                }}
                                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                                  itemsPerPage === option.value 
                                    ? 'bg-secondaryBG text-secondary border border-secondary hover:text-secondaryHover hover:bg-selectBox' 
                                    : 'text-textPrimary hover:text-textHeading hover:bg-primaryBG'
                                }`}
                              >
                                <span className="text-sm font-medium">{option.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sağ taraf - Sayfalama */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {/* Önceki */}
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-2 py-1 text-lg text-textPrimary hover:text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      {/* Sayfa numaraları */}
                      <div className="flex items-center gap-1">
                        {/* İlk sayfa */}
                        {currentPage > 3 && (
                          <>
                            <button
                              onClick={() => setCurrentPage(1)}
                              className="px-3 py-1 text-sm rounded-full border transition-all bg-selectBox text-black border-selectBox hover:bg-secondary hover:border-secondary"
                            >
                              1
                            </button>
                            {currentPage > 4 && (
                              <span className="text-textPrimary px-1">-</span>
                            )}
                          </>
                        )}

                        {/* Ortadaki sayfalar */}
                        {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage <= 2) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 1) {
                            pageNum = totalPages - 2 + i;
                          } else {
                            pageNum = currentPage - 1 + i;
                          }
                          
                          if (pageNum <= 0 || pageNum > totalPages) return null;
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-1 text-sm rounded-full border transition-all ${
                                currentPage === pageNum
                                  ? 'bg-secondary text-black border-secondary font-semibold hover:bg-secondaryHover hover:text-black'
                                  : 'bg-selectBox text-black border-selectBox hover:bg-secondary hover:border-secondary'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

                        {/* Son sayfa */}
                        {currentPage < totalPages - 2 && totalPages > 3 && (
                          <>
                            {currentPage < totalPages - 3 && (
                              <span className="text-textPrimary px-1">-</span>
                            )}
                            <button
                              onClick={() => setCurrentPage(totalPages)}
                              className="px-3 py-1 text-sm rounded-full border transition-all bg-selectBox text-black border-selectBox hover:bg-secondary hover:border-secondary"
                            >
                              {totalPages}
                            </button>
                          </>
                        )}
                      </div>

                      {/* Sonraki */}
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-2 py-1 text-lg text-textPrimary hover:text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="flex items-center gap-3 text-xl text-gray-500">
                    <Clock size={24} className="animate-spin" />
                    Haberler yükleniyor...
                  </div>
                </div>
              ) : paginatedBlogs.length > 0 ? (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {paginatedBlogs.map((blog, index) => (
                    <motion.div 
                      key={blog.id} 
                      className="bg-primary p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-primaryBG"
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: index * 0.1,
                        ease: "easeOut" 
                      }}
                      whileHover={{ 
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <h3 className="text-xl font-bold mb-3 text-textHeading">{blog.baslik}</h3>
                      <p className="text-textPrimary mb-4 line-clamp-3">{blog.kisaAciklama}</p>
                      {blog.kategori && (
                        <span className={`text-sm px-3 py-1 rounded-full mb-3 inline-flex items-center gap-1 ${CATEGORY_COLORS[blog.kategori] || 'bg-primaryBG text-textPrimary'}`}>
                          {CATEGORY_ICONS[blog.kategori]} {blog.kategori}
                        </span>
                      )}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {blog.etiketler && blog.etiketler.map((tag, index) => (
                          <span key={index} className="bg-primaryBG text-textPrimary text-xs px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-sm text-textPrimary">
                        <div className="flex items-center gap-1">
                          <Eye size={14} />
                          <span>{blog.okunmaSayisi || 0} okunma</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{blog.tarih || 'Bilinmiyor'}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-20">
                  <div className="text-xl text-textPrimary">
                    {searchTerm ? 
                      <>
                        <Search size={48} className="mx-auto mb-4 text-textPrimary opacity-50" />
                        "{searchTerm}" için sonuç bulunamadı
                      </> :
                      selectedCategory === CATEGORIES.ALL ? 
                        <>
                          <FileText size={48} className="mx-auto mb-4 text-textPrimary opacity-50" />
                          Henüz haber yok
                        </> : 
                        <>
                          <FileText size={48} className="mx-auto mb-4 text-textPrimary opacity-50" />
                          {selectedCategory} kategorisinde haber bulunamadı
                        </>
                    }
                  </div>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-4 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondaryHover transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Trash2 size={16} />
                      Aramayı temizle
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;