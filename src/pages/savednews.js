import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bookmark, Heart, Calendar, Trash2, BookmarkCheck } from 'lucide-react';
import { auth, db } from '../services/firebase';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';

// Components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function SavedNews() {
  const [savedNews, setSavedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kaydedilmiş haberleri getir
  useEffect(() => {
    const fetchSavedNews = async () => {
      if (!auth.currentUser) {
        setError('Kaydettiğiniz haberleri görmek için giriş yapmalısınız');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const savedNewsRef = collection(db, 'savedNews');
        const q = query(
          savedNewsRef,
          where('userId', '==', auth.currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const savedNewsData = [];
        
        for (const docSnap of querySnapshot.docs) {
          const saveData = docSnap.data();
          
          // Her kaydetme için haber bilgilerini çek
          const newsCollection = collection(db, 'news');
          const newsQuery = query(newsCollection, where('__name__', '==', saveData.newsId));
          const newsSnapshot = await getDocs(newsQuery);
          
          if (!newsSnapshot.empty) {
            const newsData = newsSnapshot.docs[0].data();
            savedNewsData.push({
              saveId: docSnap.id,
              savedAt: saveData.savedAt,
              newsId: saveData.newsId,
              ...newsData
            });
          }
        }
        
        // Kaydetme tarihine göre sırala (yeniden eskiye)
        savedNewsData.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
        setSavedNews(savedNewsData);
        
      } catch (error) {
        console.error('Kaydettiğiniz haberler getirilemedi:', error);
        setError('Haberler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedNews();
  }, []);

  // Haberi kaydetme listesinden çıkar
  const handleRemoveSavedNews = async (saveId) => {
    try {
      await deleteDoc(doc(db, 'savedNews', saveId));
      setSavedNews(prev => prev.filter(item => item.saveId !== saveId));
    } catch (error) {
      console.error('Haber kaydedilen listeden çıkarılamadı:', error);
      alert('Haber çıkarılırken bir hata oluştu');
    }
  };

  // Tarih formatla
  const formatDate = (dateString) => {
    if (!dateString) return 'Bilinmiyor';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return dateString;
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}.${month}.${year} ${hours}:${minutes}`;
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-6xl mx-auto py-8 px-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-textPrimary">Kaydettiğiniz haberler yükleniyor...</p>
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
        <div className="max-w-6xl mx-auto py-8 px-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
          >
            <p className="text-red-700 mb-4">{error}</p>
            <Link 
              to="/haberler"
              className="bg-secondary hover:bg-secondaryHover text-white px-6 py-2 rounded-lg transition-colors"
            >
              Haberlere Dön
            </Link>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 px-6">
        {/* Başlık */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <BookmarkCheck className="text-secondary" size={32} />
            <h1 className="text-3xl md:text-4xl font-bold text-textHeading">
              Kaydettiğim Haberler
            </h1>
          </div>
          <p className="text-textPrimary">
            Kaydettiğiniz {savedNews.length} haber burada listeleniyor
          </p>
        </motion.div>

        {/* Haberler Listesi */}
        {savedNews.length === 0 ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-primary rounded-lg p-8 text-center"
          >
            <Bookmark className="mx-auto mb-4 text-textPrimary opacity-50" size={48} />
            <h3 className="text-xl font-semibold text-textHeading mb-2">
              Henüz kaydettiğiniz haber yok
            </h3>
            <p className="text-textPrimary mb-6">
              Beğendiğiniz haberleri kaydetmek için haber detay sayfasındaki "Kaydet" butonunu kullanın
            </p>
            <Link 
              to="/haberler"
              className="bg-secondary hover:bg-secondaryHover text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Bookmark size={20} />
              Haberlere Göz At
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {savedNews.map((news, index) => (
              <motion.div
                key={news.saveId}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-primary rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-6">
                  {/* Haber Resmi */}
                  {news.image && (
                    <div className="flex-shrink-0">
                      <img
                        src={news.image}
                        alt={news.name}
                        className="w-32 h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Haber İçeriği */}
                  <div className="flex-1">
                    <Link 
                      to={`/haber/${news.newsId}`}
                      className="group"
                    >
                      <h3 className="text-xl font-semibold text-textHeading group-hover:text-secondary transition-colors mb-2 line-clamp-2">
                        {news.name}
                      </h3>
                    </Link>
                    
                    {news.minides && (
                      <p className="text-textPrimary text-sm mb-4 line-clamp-3">
                        {news.minides}
                      </p>
                    )}
                    
                    {/* Meta Bilgiler */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-textPrimary">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>Kaydedildi: {formatDate(news.savedAt)}</span>
                      </div>
                      
                      {news.likes && (
                        <div className="flex items-center gap-1">
                          <Heart size={16} className="text-red-500" />
                          <span>{news.likes} beğeni</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Çıkar Butonu */}
                  <div className="flex-shrink-0">
                    <motion.button
                      onClick={() => handleRemoveSavedNews(news.saveId)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Kaydettiğim haberlerden çıkar"
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default SavedNews;
