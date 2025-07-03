import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  const [allNews, setAllNews] = useState([]);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [isLoadingNextNews, setIsLoadingNextNews] = useState(false);
  const [scrollCooldown, setScrollCooldown] = useState(false);

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
        
        // Tüm haberleri al
        const newsCollection = collection(db, 'news');
        const allNewsSnapshot = await getDocs(newsCollection);
        const allNewsData = allNewsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        
        setAllNews(allNewsData);
        
        // Mevcut haberin index'ini bul
        const currentIndex = allNewsData.findIndex(n => n.id === id);
        setCurrentNewsIndex(currentIndex);
        
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

  // Yeni haber yükleme fonksiyonu
  const loadNextNews = useCallback(async () => {
    if (currentNewsIndex >= allNews.length - 1) return; // Son haberdeyse çık
    if (isLoadingNextNews || scrollCooldown) return; // Loading varsa veya cooldown aktifse çık
    
    // Loading başlamadan önce scroll pozisyonunu kaydet
    const initialScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Cooldown başlat (2 saniye)
    setScrollCooldown(true);
    setIsLoadingNextNews(true);
    
    try {
      const nextNewsIndex = currentNewsIndex + 1;
      const nextNews = allNews[nextNewsIndex];
      
      if (nextNews) {
        // 1 saniye bekle (kullanıcı deneyimi için)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Yönlendirme öncesi son kontrol - kullanıcı scroll pozisyonunu değiştirdi mi?
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollDifference = Math.abs(currentScrollTop - initialScrollTop);
        
        // Eğer kullanıcı 100px'den fazla yukarı kaydırdıysa işlemi iptal et
        if (scrollDifference > 100 && currentScrollTop < initialScrollTop) {
          console.log('Kullanıcı yukarı kaydırdı, yeni haber yükleme iptal edildi');
          return;
        }
        
        // Direkt yeni URL'ye git (tam sayfa yenileme gibi)
        navigate(`/haberler/${nextNews.id}`, { replace: true });
        
        // Scroll pozisyonunu zorla en başa al
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 0);
      }
    } catch (error) {
      console.error('Yeni haber yüklenirken hata:', error);
    } finally {
      setIsLoadingNextNews(false);
      
      // 2 saniye sonra cooldown'u kaldır
      setTimeout(() => {
        setScrollCooldown(false);
      }, 2000);
    }
  }, [allNews, currentNewsIndex, isLoadingNextNews, scrollCooldown, navigate]);

  // Scroll event listener - Sayfa sonuna gelince yeni haber yükle
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Sayfanın %95'ine ulaştığında yeni haber yükle
      // ANCAK: loading yoksa VE cooldown yoksa VE haberler varsa
      if (
        scrollTop + windowHeight >= documentHeight * 0.95 && 
        !isLoadingNextNews && 
        !scrollCooldown && 
        allNews.length > 0
      ) {
        loadNextNews();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [allNews, currentNewsIndex, isLoadingNextNews, scrollCooldown, loadNextNews]);

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
      const likeRef = doc(db, 'news', news.id, 'likes', userId);
      const dislikeRef = doc(db, 'news', news.id, 'dislikes', userId);

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
      const likeRef = doc(db, 'news', news.id, 'likes', userId);
      const dislikeRef = doc(db, 'news', news.id, 'dislikes', userId);

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
              <CommentSection newsId={news?.id} />
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
      
      {/* Yeni haber yükleniyor göstergesi - Fixed position */}
      {isLoadingNextNews && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="relative"
          >
            {/* Ana loading kartı */}
            <div className="bg-gradient-to-br from-primary to-primaryBG rounded-2xl p-8 shadow-2xl border border-gray-700/50 backdrop-blur-sm">
              {/* Glow efekti */}
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-secondaryHover/20 rounded-2xl blur-xl -z-10"></div>
              
              <div className="flex flex-col items-center space-y-6">
                {/* Gelişmiş spinner */}
                <div className="relative">
                  {/* Ana spinner */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-blackSelectBg rounded-full border-t-secondary shadow-lg"
                  />
                  
                  {/* İç spinner */}
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 w-12 h-12 border-3 border-transparent rounded-full border-t-secondaryHover"
                  />
                  
                  {/* Merkez nokta */}
                  <div className="absolute inset-1/2 w-2 h-2 bg-secondary rounded-full transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-full h-full bg-secondary rounded-full animate-ping"></div>
                  </div>
                </div>

                {/* Loading metni */}
                <div className="text-center space-y-2">
                  <motion.h3
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-lg font-semibold text-textHeading"
                  >
                    Yeni Haber Yükleniyor
                  </motion.h3>
                  
                  <div className="flex items-center justify-center space-x-1 text-textPrimary text-sm">
                    <span>Lütfen bekleyin</span>
                    <motion.div
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    >
                      .
                    </motion.div>
                    <motion.div
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                    >
                      .
                    </motion.div>
                    <motion.div
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                    >
                      .
                    </motion.div>
                  </div>
                </div>

                {/* İlerleme çizgisi */}
                <div className="w-32 h-1 bg-blackSelectBg rounded-full overflow-hidden">
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-full h-full bg-gradient-to-r from-transparent via-secondary to-transparent"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Gizli boşluk - kullanıcı fark etmesin, sadece kaydırsın */}
      {!isLoadingNextNews && currentNewsIndex < allNews.length - 1 && (
        <div className="py-24"></div>
      )}
      
      {/* Footer için ekstra boşluk */}
      <div className="py-12"></div>
      <Footer />
    </>
  );
}

export default NewsDetail;
