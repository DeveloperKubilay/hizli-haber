import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db, auth } from '../services/firebase';
import { doc, getDoc, collection, getDocs, setDoc, deleteDoc, query, where, orderBy, limit, updateDoc, increment } from 'firebase/firestore';

// Components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BackButton from '../components/new/BackButton';
import NewsHeader from '../components/new/NewsHeader';
import NewsContent from '../components/new/NewsContent';
import InteractionButtons from '../components/new/InteractionButtons';
import CommentSection from '../components/new/CommentSection';
import RelatedNews from '../components/new/RelatedNews';
import AdSection from '../components/new/AdSection';
import LoadingState from '../components/new/LoadingState';
import ErrorState from '../components/new/ErrorState';
import NotFoundState from '../components/new/NotFoundState';
import AIChat from '../components/new/AIChat';

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
        
        // İlk önce sadece mevcut haberi al (hızlı yükleme için)
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
        setLoading(false); // Ana loading'i burada bitir - ÇOK HIZLI!
        
        // Background'da diğer haberleri al (scroll için)
        const newsCollection = collection(db, 'news');
        try {
          const allNewsQuery = query(
            newsCollection,
            orderBy('createdAt', 'desc'),
            limit(50)
          );
          const allNewsSnapshot = await getDocs(allNewsQuery);
          const allNewsData = allNewsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }));
          
          setAllNews(allNewsData);
          
          // Mevcut haberin index'ini bul
          const currentIndex = allNewsData.findIndex(n => n.id === id);
          setCurrentNewsIndex(currentIndex);
        } catch (allNewsError) {
          console.log('⚠️ All news query hatası, fallback kullanılıyor:', allNewsError);
          // Fallback: orderBy olmadan çek
          const allNewsSnapshot = await getDocs(newsCollection);
          const allNewsData = allNewsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => {
              const dateA = new Date(a.createdAt || 0);
              const dateB = new Date(b.createdAt || 0);
              return dateB - dateA;
            })
            .slice(0, 50);
          
          setAllNews(allNewsData);
          const currentIndex = allNewsData.findIndex(n => n.id === id);
          setCurrentNewsIndex(currentIndex);
        }
        
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
        // Önce haber dökümanından sayaçları kontrol et
        const newsDoc = doc(db, 'news', id);
        const newsSnapshot = await getDoc(newsDoc);
        
        if (newsSnapshot.exists()) {
          // Haber dökümanında likeCount ve dislikeCount var mı kontrol et
          const newsData = newsSnapshot.data();
          
          if (newsData.likeCount !== undefined) {
            setLikesCount(newsData.likeCount);
          } else {
            // Yoksa koleksiyondan say
            const likesRef = collection(db, 'news', id, 'likes');
            const allLikesSnapshot = await getDocs(likesRef);
            const likesCount = allLikesSnapshot.size;
            setLikesCount(likesCount);
            
            // Ve dökümanı güncelle
            try {
              await updateDoc(newsDoc, {
                likeCount: likesCount,
                updatedAt: new Date()
              });
            } catch (updateError) {
              console.error('Like sayacı güncellenirken hata:', updateError);
            }
          }
          
          if (newsData.dislikeCount !== undefined) {
            setDislikesCount(newsData.dislikeCount);
          } else {
            // Yoksa koleksiyondan say
            const dislikesRef = collection(db, 'news', id, 'dislikes');
            const allDislikesSnapshot = await getDocs(dislikesRef);
            const dislikesCount = allDislikesSnapshot.size;
            setDislikesCount(dislikesCount);
            
            // Ve dökümanı güncelle
            try {
              await updateDoc(newsDoc, {
                dislikeCount: dislikesCount,
                updatedAt: new Date()
              });
            } catch (updateError) {
              console.error('Dislike sayacı güncellenirken hata:', updateError);
            }
          }
        } else {
          // Eskisi gibi koleksiyonlardan say
          const likesRef = collection(db, 'news', id, 'likes');
          const allLikesSnapshot = await getDocs(likesRef);
          setLikesCount(allLikesSnapshot.size);
          
          const dislikesRef = collection(db, 'news', id, 'dislikes');
          const allDislikesSnapshot = await getDocs(dislikesRef);
          setDislikesCount(allDislikesSnapshot.size);
        }

        // User login'se durumunu da kontrol et
        if (auth.currentUser) {
          const userId = auth.currentUser.uid;
          
          // User'ın like durumunu kontrol et
          const likesRef = collection(db, 'news', id, 'likes');
          const userLikeQuery = query(likesRef, where('__name__', '==', userId));
          const likeSnapshot = await getDocs(userLikeQuery);
          setLiked(!likeSnapshot.empty);

          // User'ın dislike durumunu kontrol et
          const dislikesRef = collection(db, 'news', id, 'dislikes');
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

  // Benzer haberleri çek - BASIT VE GÜVENİLİR VERSİYON
  const fetchRelatedNews = async (currentNews) => {
    try {
      console.log('🔍 Benzer haberler aranıyor...', currentNews);
      
      const newsCollection = collection(db, 'news');
      
      // Eğer tag yoksa en son 10 haberi çek, 4 tanesini göster
      if (!currentNews.tag || currentNews.tag.length === 0) {
        console.log('📰 Tag yok, en son haberleri getiriliyor...');
        try {
          const recentNewsQuery = query(
            newsCollection,
            orderBy('createdAt', 'desc'),
            limit(10)
          );
          const recentNewsSnapshot = await getDocs(recentNewsQuery);
          const recentNews = recentNewsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(item => item.id !== currentNews.id)
            .slice(0, 4);
          
          console.log('✅ En son haberler:', recentNews.length);
          setRelatedNews(recentNews);
          return;
        } catch (orderError) {
          console.log('⚠️ OrderBy hatası, fallback kullanılıyor:', orderError);
          // Fallback: orderBy olmadan
          const fallbackSnapshot = await getDocs(newsCollection);
          const fallbackNews = fallbackSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(item => item.id !== currentNews.id)
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 4);
          
          console.log('✅ Fallback haberler:', fallbackNews.length);
          setRelatedNews(fallbackNews);
          return;
        }
      }

      // Tag'ler varsa - basit yaklaşım
      console.log('🏷️ Tag\'ler bulundu:', currentNews.tag);
      
      try {
        // İlk tag ile arama yap (basit ve güvenilir)
        const firstTag = currentNews.tag[0];
        const tagQuery = query(
          newsCollection,
          where('tag', 'array-contains', firstTag),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        
        const tagSnapshot = await getDocs(tagQuery);
        const tagNews = tagSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(item => item.id !== currentNews.id)
          .slice(0, 4);

        console.log('✅ Tag ile bulunan haberler:', tagNews.length);
        setRelatedNews(tagNews);
      } catch (tagError) {
        console.log('⚠️ Tag query hatası, fallback kullanılıyor:', tagError);
        // Fallback: tag olmadan en son haberler
        const fallbackSnapshot = await getDocs(query(newsCollection, limit(10)));
        const fallbackNews = fallbackSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(item => item.id !== currentNews.id)
          .slice(0, 4);
        
        console.log('✅ Tag fallback haberler:', fallbackNews.length);
        setRelatedNews(fallbackNews);
      }
      
    } catch (error) {
      console.error('❌ Benzer haberler hatası:', error);
      
      // Hata durumunda fallback - basit query
      try {
        console.log('🔄 Fallback: Basit query deneniyor...');
        const newsCollection = collection(db, 'news');
        const fallbackQuery = query(
          newsCollection,
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const fallbackSnapshot = await getDocs(fallbackQuery);
        const fallbackNews = fallbackSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(item => item.id !== currentNews.id)
          .slice(0, 4);
        
        console.log('✅ Fallback haberler:', fallbackNews.length);
        setRelatedNews(fallbackNews);
      } catch (fallbackError) {
        console.error('❌ Fallback da başarısız:', fallbackError);
        setRelatedNews([]);
      }
    }
  };

  // Beğeni işlemi - Instant response + backend update + sayaç güncelleme
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
      const newsRef = doc(db, 'news', news.id);

      if (wasLiked) {
        // Like'ı kaldır
        await deleteDoc(likeRef);
        
        // Ana haber dökümanında like sayacını azalt
        await updateDoc(newsRef, {
          likeCount: increment(-1),
          updatedAt: new Date()
        });
      } else {
        if (wasDisliked) {
          // Dislike'ı kaldır
          await deleteDoc(dislikeRef);
          
          // Ana haber dökümanında dislike sayacını azalt
          await updateDoc(newsRef, {
            dislikeCount: increment(-1),
            updatedAt: new Date()
          });
        }
        
        // Like ekle
        await setDoc(likeRef, { likedAt: new Date() });
        
        // Ana haber dökümanında like sayacını artır
        await updateDoc(newsRef, {
          likeCount: increment(1),
          updatedAt: new Date()
        });
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
      const newsRef = doc(db, 'news', news.id);

      if (wasDisliked) {
        // Dislike'ı kaldır
        await deleteDoc(dislikeRef);
        
        // Ana haber dökümanında dislike sayacını azalt
        await updateDoc(newsRef, {
          dislikeCount: increment(-1),
          updatedAt: new Date()
        });
      } else {
        if (wasLiked) {
          // Like'ı kaldır
          await deleteDoc(likeRef);
          
          // Ana haber dökümanında like sayacını azalt
          await updateDoc(newsRef, {
            likeCount: increment(-1),
            updatedAt: new Date()
          });
        }
        
        // Dislike ekle
        await setDoc(dislikeRef, { dislikedAt: new Date() });
        
        // Ana haber dökümanında dislike sayacını artır
        await updateDoc(newsRef, {
          dislikeCount: increment(1),
          updatedAt: new Date()
        });
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
        {/* Geri dön butonu */}
        <div className="mb-8">
          <BackButton navigate={navigate} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Ana içerik */}
          <div className="lg:col-span-2">
            {/* Başlık ve meta bilgiler */}
            <div className="mb-8">
              <NewsHeader news={news} formatDate={formatDate} />
            </div>

            {/* İçerik */}
            <div className="mb-10">
              <NewsContent key={news?.id} news={news} />
            </div>

            {/* Etkileşim butonları */}
            <div className="mb-6">
              <InteractionButtons 
                news={newsWithCounts}
                liked={liked}
                disliked={disliked}
                handleLike={handleLike}
                handleDislike={handleDislike}
                handleShare={handleShare}
              />
            </div>

            {/* Yorum Sistemi */}
            <div className="mb-8">
              <CommentSection newsId={news?.id} />
            </div>
          </div>

          {/* Yan panel */}
          <div className="lg:col-span-1">
            {/* Yan bilgiler ve benzer haberler */}
            <div className="mb-8">
              <RelatedNews 
                relatedNews={relatedNews}
                relatedLoading={relatedLoading}
                formatDate={formatDate}
                currentNews={newsWithCounts}
              />
            </div>

            {/* Reklam alanı */}
            <div>
              <AdSection />
            </div>
          </div>
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
      
      {/* AI Chat Assistant */}
      <AIChat news={news} />
    </>
  );
}

export default NewsDetail;
