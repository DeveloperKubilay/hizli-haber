import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db, auth } from '../services/firebase';
import { doc, getDoc, collection, getDocs, setDoc, deleteDoc, query, where } from 'firebase/firestore';

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
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
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

  // Like/dislike sayıları ve user durumunu çek (her zaman çalışsın)
  useEffect(() => {
    const loadLikeDislikeCounts = async () => {
      if (!id) return;

      try {
        // Like sayısını al
        const likesRef = collection(db, 'news', id, 'likes');
        const allLikesSnapshot = await getDocs(likesRef);
        setLikesCount(allLikesSnapshot.size);

        // Dislike sayısını al
        const dislikesRef = collection(db, 'news', id, 'dislikes');
        const allDislikesSnapshot = await getDocs(dislikesRef);
        setDislikesCount(allDislikesSnapshot.size);

        // User login'se durumunu da kontrol et
        if (auth.currentUser) {
          const userId = auth.currentUser.uid;
          
          // User'ın like durumunu kontrol et
          const userLikeQuery = query(likesRef, where('__name__', '==', userId));
          const likeSnapshot = await getDocs(userLikeQuery);
          setLiked(!likeSnapshot.empty);

          // User'ın dislike durumunu kontrol et
          const userDislikeQuery = query(dislikesRef, where('__name__', '==', userId));
          const dislikeSnapshot = await getDocs(userDislikeQuery);
          setDisliked(!dislikeSnapshot.empty);
        } else {
          // User login değilse false yap
          setLiked(false);
          setDisliked(false);
        }

      } catch (error) {
        console.error('Like/dislike sayıları yüklenirken hata:', error);
      }
    };

    loadLikeDislikeCounts();
  }, [id]); // Sadece id değişince çalışsın

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

  // Beğeni işlemi - Instant response + backend update
  const handleLike = async () => {
    if (!auth.currentUser) {
      alert('Beğenmek için giriş yapmalısınız');
      return;
    }

    // Instant UI update
    const wasLiked = liked;
    const wasDisliked = disliked;

    if (wasLiked) {
      // Like'ı kaldır (instant)
      setLiked(false);
      setLikesCount(prev => prev - 1);
    } else {
      // Like ekle (instant)
      setLiked(true);
      setLikesCount(prev => prev + 1);
      
      // Eğer dislike yapmışsa onu kaldır (instant)
      if (wasDisliked) {
        setDisliked(false);
        setDislikesCount(prev => prev - 1);
      }
    }

    // Backend update (background)
    try {
      const userId = auth.currentUser.uid;
      const likeRef = doc(db, 'news', id, 'likes', userId);
      const dislikeRef = doc(db, 'news', id, 'dislikes', userId);

      if (wasLiked) {
        await deleteDoc(likeRef);
      } else {
        if (wasDisliked) {
          await deleteDoc(dislikeRef);
        }
        await setDoc(likeRef, { likedAt: new Date() });
      }
      
    } catch (error) {
      console.error('Like backend update hatası:', error);
      // Error durumunda UI'ı geri al
      setLiked(wasLiked);
      setDisliked(wasDisliked);
      setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
      if (wasDisliked && !wasLiked) {
        setDislikesCount(prev => prev + 1);
      }
    }
  };

  const handleDislike = async () => {
    if (!auth.currentUser) {
      alert('Beğenmemek için giriş yapmalısınız');
      return;
    }

    // Instant UI update
    const wasLiked = liked;
    const wasDisliked = disliked;

    if (wasDisliked) {
      // Dislike'ı kaldır (instant)
      setDisliked(false);
      setDislikesCount(prev => prev - 1);
    } else {
      // Dislike ekle (instant)
      setDisliked(true);
      setDislikesCount(prev => prev + 1);
      
      // Eğer like yapmışsa onu kaldır (instant)
      if (wasLiked) {
        setLiked(false);
        setLikesCount(prev => prev - 1);
      }
    }

    // Backend update (background)
    try {
      const userId = auth.currentUser.uid;
      const likeRef = doc(db, 'news', id, 'likes', userId);
      const dislikeRef = doc(db, 'news', id, 'dislikes', userId);

      if (wasDisliked) {
        await deleteDoc(dislikeRef);
      } else {
        if (wasLiked) {
          await deleteDoc(likeRef);
        }
        await setDoc(dislikeRef, { dislikedAt: new Date() });
      }
      
    } catch (error) {
      console.error('Dislike backend update hatası:', error);
      // Error durumunda UI'ı geri al
      setDisliked(wasDisliked);
      setLiked(wasLiked);
      setDislikesCount(prev => wasDisliked ? prev + 1 : prev - 1);
      if (wasLiked && !wasDisliked) {
        setLikesCount(prev => prev + 1);
      }
    }
  };

  // Memoized news object - re-render'ları önlemek için
  const newsWithCounts = useMemo(() => ({
    ...news,
    likes: likesCount,
    dislikes: dislikesCount
  }), [news, likesCount, dislikesCount]);

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
              <NewsContent key={news?.id} news={news} />
            </motion.div>

            {/* Etkileşim butonları */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mb-6"
            >
              <InteractionButtons 
                news={newsWithCounts}
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
                currentNews={newsWithCounts}
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
