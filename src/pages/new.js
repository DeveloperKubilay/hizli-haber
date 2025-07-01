import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db, auth } from '../services/firebase';
import { doc, getDoc, collection, getDocs, updateDoc, increment } from 'firebase/firestore';

// Components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BackButton from '../components/new/BackButton';
import NewsHeader from '../components/new/NewsHeader';
import NewsImage from '../components/new/NewsImage';
import NewsContent from '../components/new/NewsContent';
import InteractionButtons from '../components/new/InteractionButtons';
import CommentSection from '../components/new/CommentSection';
import RelatedNews from '../components/new/RelatedNews';
import AdSection from '../components/new/AdSection';
import LoadingState from '../components/new/LoadingState';
import ErrorState from '../components/new/ErrorState';
import NotFoundState from '../components/new/NotFoundState';

function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [relatedNews, setRelatedNews] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // Haber detayını çek
  useEffect(() => {
    const fetchNewsDetail = async () => {
      if (!id) {
        setError('Haber ID\'si bulunamadı');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const newsDoc = doc(db, 'news', id);
        const newsSnapshot = await getDoc(newsDoc);
        
        if (!newsSnapshot.exists()) {
          setError('Haber bulunamadı');
          setLoading(false);
          return;
        }

        const newsData = {
          id: newsSnapshot.id,
          ...newsSnapshot.data()
        };
        
        setNews(newsData);
        setLoading(false); // Ana loading'i burada bitir
        
        // Benzer haberleri background'da çek
        setRelatedLoading(true);
        fetchRelatedNews(newsData).finally(() => {
          setRelatedLoading(false);
        });
        
      } catch (error) {
        console.error('Haber detayı çekilirken hata:', error);
        setError(`Haber yüklenirken hata: ${error.message || error.toString()}`);
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [id]);

  // Benzer haberleri çek
  const fetchRelatedNews = async (currentNews) => {
    try {
      // Eğer tag yoksa en son haberleri göster
      if (!currentNews.tag || currentNews.tag.length === 0) {
        const newsCollection = collection(db, 'news');
        const recentNewsSnapshot = await getDocs(newsCollection);
        const recentNews = recentNewsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(item => item.id !== currentNews.id)
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 4);
        
        setRelatedNews(recentNews);
        return;
      }

      // Benzer kategorilerdeki haberleri bul (optimized)
      const newsCollection = collection(db, 'news');
      const allNewsSnapshot = await getDocs(newsCollection);
      
      const related = allNewsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => {
          if (item.id === currentNews.id) return false;
          if (!item.tag || !Array.isArray(item.tag)) return false;
          
          // En az bir tag eşleşmesi var mı?
          return item.tag.some(tag => currentNews.tag.includes(tag));
        })
        .sort((a, b) => {
          // Tag eşleşme sayısına göre sırala
          const aMatches = a.tag.filter(tag => currentNews.tag.includes(tag)).length;
          const bMatches = b.tag.filter(tag => currentNews.tag.includes(tag)).length;
          if (bMatches !== aMatches) return bMatches - aMatches;
          
          // Sonra tarihe göre sırala
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        })
        .slice(0, 4);

      setRelatedNews(related);
    } catch (error) {
      console.error('❌ Benzer haberler çekilirken hata:', error);
      setRelatedNews([]); // Hata durumunda boş array
    }
  };

  // Beğeni/beğenmeme işlemleri
  const handleLike = async () => {
    if (!auth.currentUser) {
      alert('Beğenmek için giriş yapmalısınız');
      return;
    }

    try {
      const newsDoc = doc(db, 'news', id);
      
      if (liked) {
        // Beğeniyi geri çek
        await updateDoc(newsDoc, {
          likes: increment(-1)
        });
        setLiked(false);
      } else {
        // Beğen
        await updateDoc(newsDoc, {
          likes: increment(1)
        });
        setLiked(true);
        
        // Eğer dislike yapmışsa onu geri çek
        if (disliked) {
          await updateDoc(newsDoc, {
            dislikes: increment(-1)
          });
          setDisliked(false);
        }
      }
      
      // Haberi yeniden çek
      const updatedNews = await getDoc(newsDoc);
      setNews(prev => ({ ...prev, ...updatedNews.data() }));
      
    } catch (error) {
      console.error('Beğeni işleminde hata:', error);
    }
  };

  const handleDislike = async () => {
    if (!auth.currentUser) {
      alert('Beğenmemek için giriş yapmalısınız');
      return;
    }

    try {
      const newsDoc = doc(db, 'news', id);
      
      if (disliked) {
        // Beğenmemeyi geri çek
        await updateDoc(newsDoc, {
          dislikes: increment(-1)
        });
        setDisliked(false);
      } else {
        // Beğenme
        await updateDoc(newsDoc, {
          dislikes: increment(1)
        });
        setDisliked(true);
        
        // Eğer like yapmışsa onu geri çek
        if (liked) {
          await updateDoc(newsDoc, {
            likes: increment(-1)
          });
          setLiked(false);
        }
      }
      
      // Haberi yeniden çek
      const updatedNews = await getDoc(newsDoc);
      setNews(prev => ({ ...prev, ...updatedNews.data() }));
      
    } catch (error) {
      console.error('Beğenmeme işleminde hata:', error);
    }
  };

  // Paylaş
  const handleShare = () => {
    if (navigator.share && news) {
      navigator.share({
        title: news.name,
        text: news.minides,
        url: window.location.href
      });
    } else {
      // Fallback: URL'yi kopyala
      navigator.clipboard.writeText(window.location.href);
      alert('Haber linki kopyalandı!');
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
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} navigate={navigate} />;
  }

  if (!news) {
    return <NotFoundState navigate={navigate} />;
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-6 lg:px-8">
        {/* Geri dön butonu - Hızlı giriş animasyonu */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-8"
        >
          <BackButton navigate={navigate} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Ana içerik */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Başlık ve meta bilgiler */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8"
            >
              <NewsHeader news={news} formatDate={formatDate} />
            </motion.div>

            {/* Ana resim */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-8"
            >
              <NewsImage image={news.image} name={news.name} />
            </motion.div>

            {/* İçerik */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mb-10"
            >
              <NewsContent news={news} />
            </motion.div>

            {/* Etkileşim butonları */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mb-6"
            >
              <InteractionButtons 
                news={news}
                liked={liked}
                disliked={disliked}
                handleLike={handleLike}
                handleDislike={handleDislike}
                handleShare={handleShare}
              />
            </motion.div>

            {/* Yorum Sistemi */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mb-8"
            >
              <CommentSection newsId={id} />
            </motion.div>
          </motion.div>

          {/* Yan panel */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Yan bilgiler ve benzer haberler */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mb-8"
            >
              <RelatedNews 
                relatedNews={relatedNews}
                relatedLoading={relatedLoading}
                formatDate={formatDate}
                currentNews={news}
              />
            </motion.div>

            {/* Reklam alanı */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <AdSection />
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Footer için ekstra boşluk */}
      <div className="py-12"></div>
      <Footer />
    </>
  );
}

export default NewsDetail;
