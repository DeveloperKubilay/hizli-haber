import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Heart, Calendar, Trash2, BookmarkCheck, Search, 
  ThumbsDown, Image, ArrowLeft, SlidersHorizontal, Grid, List 
} from 'lucide-react';
import { auth, db } from '../services/firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Services
import { CATEGORY_COLORS, translateTagsToTurkish } from '../services/categories';

// SavedNewsCard bileşeni - Grid veya Liste görünümü için
function SavedNewsCard({ item, index, viewMode, onRemove, formatDate }) {
  // Saved haber kartı içeriği
  return (
    <motion.div 
      className={`bg-primary rounded-lg shadow-lg hover:shadow-xl border border-primaryBG w-full overflow-hidden ${
        viewMode === 'grid' ? "p-3.5" : "p-4"
      }`}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1, 
        ease: "easeOut" 
      }}
      whileHover={{ 
        scale: 1.01,
        transition: { duration: 0.2 }
      }}
    >
      <div className={`flex ${viewMode === 'grid' ? "flex-col h-full" : "gap-4"}`}>
        {/* Görsel kısmı */}
        <div className={`${
          viewMode === 'grid' ? "w-full h-[150px]" : "flex-shrink-0 w-[150px] h-[100px]"
        } bg-primaryBG rounded-lg overflow-hidden flex items-center justify-center`}>
          {item.image ? (
            <Link to={`/haberler/${item.newsId}`}>
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = "/imgs/logo.png"; // Fallback resim
                }} 
              />
            </Link>
          ) : (
            <div className="flex flex-col items-center justify-center text-textPrimary">
              <Image size={30} className="opacity-40 mb-1" />
              <span className="text-xs opacity-60">Görsel yok</span>
            </div>
          )}
        </div>
        
        {/* İçerik kısmı */}
        <div className={`flex-1 flex flex-col ${viewMode === 'grid' ? "mt-3" : ""}`}>
          {/* Başlık */}
          <Link to={`/haberler/${item.newsId}`} className="block">
            <h3 className="font-semibold text-lg text-textHeading mb-2 hover:text-secondary transition-colors">
              {item.name}
            </h3>
          </Link>
          
          {/* Açıklama */}
          {viewMode === 'grid' && (
            <p className="text-textSecondary text-sm mb-3 line-clamp-3">
              {item.minides || "Açıklama bulunmuyor."}
            </p>
          )}
          
          {/* Etiketler */}
          {item.tag && Array.isArray(item.tag) && item.tag.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-3">
              {translateTagsToTurkish(item.tag).slice(0, 3).map((category, idx) => {
                const bgColorClass = CATEGORY_COLORS[category] || 'bg-gray-100';
                return (
                  <span 
                    key={idx}
                    className={`text-xs px-2 py-0.5 rounded-full ${bgColorClass}`}
                  >
                    {category}
                  </span>
                );
              })}
            </div>
          )}
          
          {/* Footer - Beğeni sayıları ve işlemler */}
          <div className="mt-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-4">
              {/* Beğeniler */}
              <div className="flex items-center gap-1.5">
                <Heart size={16} className="text-rose-500" />
                <span className="text-xs text-textSecondary">{item.likes || 0}</span>
              </div>
              
              {/* Beğenmeyenler */}
              <div className="flex items-center gap-1.5">
                <ThumbsDown size={16} className="text-blue-600" />
                <span className="text-xs text-textSecondary">{item.dislikes || 0}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {/* Kaydetme tarihi */}
              <div className="flex items-center gap-1.5 text-xs text-textSecondary">
                <Calendar size={14} />
                <span>{formatDate(item.savedAt)}</span>
              </div>
              
              {/* Kayıttan çıkar butonu */}
              <button 
                onClick={() => onRemove(item.saveId)} 
                className="ml-2 p-1.5 text-textSecondary hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Kaydedilenlerden çıkar"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}



function SavedNews() {
  const [savedNewsWithCounts, setSavedNewsWithCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // Auth durumu için
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' veya 'list'
  const [sortBy, setSortBy] = useState('tarih');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Auth state'i dinle
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Kaydedilmiş haberleri getir - Auth hazır olunca
  useEffect(() => {
    const fetchSavedNews = async () => {
      if (authLoading) return; // Auth henüz hazır değilse bekle
      
      if (!user) {
        setError('Kaydettiğiniz haberleri görmek için giriş yapmalısınız');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null); // Önceki hataları temizle
        const userId = user.uid;
        
        // savednews/{userId}/news/ collection'ından çek
        const savedNewsRef = collection(db, 'savednews', userId, 'news');
        const querySnapshot = await getDocs(savedNewsRef);
        
        const savedNewsData = [];
        
        querySnapshot.forEach((docSnap) => {
          const saveData = docSnap.data();
          savedNewsData.push({
            saveId: docSnap.id, // news document ID
            savedAt: saveData.savedAt?.toDate?.() || saveData.savedAt, // Firebase Timestamp'ı Date'e çevir
            newsId: saveData.newsId,
            name: saveData.newsTitle,
            image: saveData.newsImage,
            minides: saveData.newsMinides,
            tag: saveData.newsTag || [], // Etiketler için
            likes: saveData.likes || 0,
            dislikes: saveData.dislikes || 0,
            // Diğer alanlar InteractionButtons'ta setDoc ile kaydediliyor
            ...saveData
          });
        });
        
        // Kaydetme tarihine göre sırala (yeniden eskiye)
        savedNewsData.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
        
        // Like/dislike sayılarını çek
        await loadLikeDislikeCounts(savedNewsData);
        
      } catch (error) {
        console.error('Kaydettiğiniz haberler getirilemedi:', error);
        setError('Haberler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedNews();
  }, [authLoading, user]); // Auth ve user state'ine bağımlı

  // Like/dislike sayılarını yükle
  const loadLikeDislikeCounts = async (savedNewsData) => {
    try {
      const newsWithCountsData = await Promise.all(
        savedNewsData.map(async (newsItem) => {
          try {
            // Like sayısını al
            const likesRef = collection(db, 'news', newsItem.newsId, 'likes');
            const allLikesSnapshot = await getDocs(likesRef);
            const likesCount = allLikesSnapshot.size;

            // Dislike sayısını al
            const dislikesRef = collection(db, 'news', newsItem.newsId, 'dislikes');
            const allDislikesSnapshot = await getDocs(dislikesRef);
            const dislikesCount = allDislikesSnapshot.size;

            return {
              ...newsItem,
              likes: likesCount,
              dislikes: dislikesCount
            };
          } catch (error) {
            console.error(`Haber ${newsItem.newsId} için like/dislike sayıları alınamadı:`, error);
            return {
              ...newsItem,
              likes: 0,
              dislikes: 0
            };
          }
        })
      );
      
      setSavedNewsWithCounts(newsWithCountsData);
    } catch (error) {
      console.error('Like/dislike sayıları yüklenirken hata:', error);
      // Hata durumunda orijinal savedNews'i kullan
      setSavedNewsWithCounts(savedNewsData);
    }
  };

  // Haberi kaydetme listesinden çıkar - User state kullan
  const handleRemoveSavedNews = async (newsId) => {
    if (!user) {
      alert('İşlem için giriş yapmalısınız');
      return;
    }

    try {
      const userId = user.uid;
      await deleteDoc(doc(db, 'savednews', userId, 'news', newsId));
      setSavedNewsWithCounts(prev => prev.filter(item => item.saveId !== newsId));
    } catch (error) {
      console.error('Haber kaydedilen listeden çıkarılamadı:', error);
      alert('Haber çıkarılırken bir hata oluştu');
    }
  };

  // Arama işlemi
  const filteredNews = savedNewsWithCounts.filter(item => 
    searchTerm === '' || 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.minides?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.tag && Array.isArray(item.tag) && item.tag.some(tag => 
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  // Sıralama işlemi
  const sortedNews = [...filteredNews].sort((a, b) => {
    switch (sortBy) {
      case 'baslik':
        return (a.name || '').localeCompare(b.name || '');
      case 'begeniler':
        return ((b.likes || 0) - (b.dislikes || 0)) - ((a.likes || 0) - (a.dislikes || 0));
      case 'tarih':
      default:
        return new Date(b.savedAt || 0) - new Date(a.savedAt || 0);
    }
  });

  // Tarih formatla - Firebase Timestamp uyumlu
  const formatDate = (dateInput) => {
    if (!dateInput) return 'Bilinmiyor';
    
    try {
      // Firebase Timestamp'sa Date'e çevir
      let date;
      if (dateInput.toDate && typeof dateInput.toDate === 'function') {
        date = dateInput.toDate();
      } else {
        date = new Date(dateInput);
      }
      
      if (isNaN(date)) return 'Geçersiz tarih';
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}.${month}.${year} ${hours}:${minutes}`;
    } catch (error) {
      return 'Tarih hatası';
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-[1400px] mx-auto py-8 px-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-textPrimary">Kaydettiğiniz haberler yükleniyor... 🔄</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="max-w-[1400px] mx-auto py-8 px-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
          >
            <p className="text-red-700 mb-4">⚠️ {error}</p>
            <Link 
              to="/haberler"
              className="bg-secondary hover:bg-secondaryHover text-white px-6 py-2 rounded-lg transition-colors"
            >
              Haberlere Dön 🏠
            </Link>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Kaydedilen Haberlerim - Hızlı Haber</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#16181c" />
        <meta name="msapplication-navbutton-color" content="#16181c" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="description" content="Kaydettiğin haberleri burada bul! Hızlı Haber ile favori haberlerini kaydet, istediğin zaman tekrar oku." />
        <meta name="keywords" content="kaydedilen haberler, favori haberler, hızlı haber, haber kaydet, haber arşivi, haber platformu, haber listesi, haber özetleri, haber takip" />
        <meta property="og:title" content="Kaydedilen Haberlerim - Hızlı Haber" />
        <meta property="og:description" content="Kaydettiğin haberleri burada bul! Hızlı Haber ile favori haberlerini kaydet, istediğin zaman tekrar oku." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hizlihaber.com/savednews" />
        <meta property="og:image" content="https://hizlihaber.com/favicon.ico" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Kaydedilen Haberlerim - Hızlı Haber" />
        <meta name="twitter:description" content="Kaydettiğin haberleri burada bul! Hızlı Haber ile favori haberlerini kaydet, istediğin zaman tekrar oku." />
        <meta name="twitter:image" content="https://hizlihaber.com/favicon.ico" />
        <meta name="author" content="Hızlı Haber Ekibi" />
        <link href="https://hizlihaber.com/savednews" />
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
      </Helmet>
      <Navbar />
      <div className="max-w-[1400px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header - Başlık */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <BookmarkCheck className="text-secondary" size={32} />
              <h1 className="text-3xl md:text-4xl font-bold text-textHeading">
                Kaydettiğim Haberler 📑
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-textPrimary">
                {filteredNews.length} haber kaydedildi ✅
              </div>
              <Link 
                to="/haberler"
                className="flex items-center gap-2 text-secondary hover:text-secondaryHover transition-colors text-sm"
              >
                <ArrowLeft size={16} />
                <span>Haberlere Dön</span>
              </Link>
            </div>
          </motion.div>
          
          {/* Kontrol Paneli */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 justify-between mb-4"
          >
            {/* Arama kutusu */}
            <div className="relative w-full sm:max-w-md">
              <div className="absolute inset-y-0 start-0 flex items-center pl-3 pointer-events-none">
                <Search size={18} className="text-textSecondary" />
              </div>
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full p-2.5 pl-10 text-sm text-textPrimary border rounded-lg bg-primary border-primaryBG focus:ring-secondary focus:border-secondary"
                placeholder="Kaydedilen haberlerde ara... 🔎"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 end-0 flex items-center pr-3 text-textSecondary hover:text-textPrimary"
                >
                  <span className="text-xs bg-gray-200 p-1 rounded-full">×</span>
                </button>
              )}
            </div>
            
            {/* Görünüm ve Sıralama */}
            <div className="flex gap-3">
              {/* Sıralama */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 bg-primary border border-primaryBG rounded-lg px-3.5 py-2.5 text-sm hover:bg-primaryBG transition-colors"
                >
                  <SlidersHorizontal size={16} className="text-textSecondary" />
                  <span className="hidden sm:inline">Sırala:</span>
                  <span className="font-medium capitalize">
                    {sortBy === 'tarih' ? 'En Yeni 🕒' : sortBy === 'baslik' ? 'Başlık (A-Z) 📝' : 'Beğeniler ❤️'}
                  </span>
                </button>
                
                {showSortDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 overflow-hidden">
                    <div className="py-1">
                      <button
                        onClick={() => { setSortBy('tarih'); setShowSortDropdown(false); }}
                        className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${sortBy === 'tarih' ? 'bg-gray-100' : ''}`}
                      >
                        En Yeni 🕒
                      </button>
                      <button
                        onClick={() => { setSortBy('baslik'); setShowSortDropdown(false); }}
                        className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${sortBy === 'baslik' ? 'bg-gray-100' : ''}`}
                      >
                        Başlık (A-Z) 📝
                      </button>
                      <button
                        onClick={() => { setSortBy('begeniler'); setShowSortDropdown(false); }}
                        className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${sortBy === 'begeniler' ? 'bg-gray-100' : ''}`}
                      >
                        Beğeniler ❤️
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Görünüm modu */}
              <div className="flex">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center justify-center px-3.5 py-2.5 rounded-l-lg border text-sm ${
                    viewMode === 'grid' 
                      ? 'bg-secondaryLight border-secondary text-secondary' 
                      : 'bg-primary border-primaryBG text-textSecondary'
                  }`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center justify-center px-3.5 py-2.5 rounded-r-lg border text-sm ${
                    viewMode === 'list' 
                      ? 'bg-secondaryLight border-secondary text-secondary' 
                      : 'bg-primary border-primaryBG text-textSecondary'
                  }`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Haberler Listesi */}
          {filteredNews.length === 0 ? (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col items-center justify-center bg-primary border border-primaryBG rounded-lg p-8 text-center min-h-[300px]"
            >
              {searchTerm ? (
                <>
                  <Search size={40} className="text-gray-400 mb-3" />
                  <h3 className="text-xl font-bold text-textHeading mb-2">Arama sonucu bulunamadı 😕</h3>
                  <p className="text-textSecondary mb-4">"{searchTerm}" ile eşleşen kaydedilmiş haber bulunamadı.</p>
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="text-secondary hover:text-secondaryHover font-medium"
                  >
                    Aramayı temizle 🧹
                  </button>
                </>
              ) : (
                <>
                  <BookmarkCheck size={40} className="text-gray-400 mb-3" />
                  <h3 className="text-xl font-bold text-textHeading mb-2">Henüz haber kaydetmediniz 📰</h3>
                  <p className="text-textSecondary mb-4">İlginizi çeken haberleri kaydedin ve daha sonra okuyun!</p>
                  <Link 
                    to="/haberler"
                    className="bg-secondary hover:bg-secondaryHover text-white px-5 py-2 rounded-lg transition-colors"
                  >
                    Haberlere Göz At 🔍
                  </Link>
                </>
              )}
            </motion.div>
          ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {sortedNews.map((item, index) => (
                <SavedNewsCard 
                  key={item.saveId}
                  item={item} 
                  index={index} 
                  viewMode={viewMode}
                  onRemove={handleRemoveSavedNews}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default SavedNews;
