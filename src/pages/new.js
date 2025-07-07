import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../services/firebase';
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

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

// Rastgele dizi karıştırıcı fonksiyon
function shuffleArray(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

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
  const [currentRelatedIndex, setCurrentRelatedIndex] = useState(0);
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
        setLoading(false);
        setRelatedLoading(true);
        fetchRelatedNews(newsData).then(() => {
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

  // Benzer haberler değişince currentRelatedIndex'i güncelle
  useEffect(() => {
    if (!relatedNews || !news) return;
    const idx = relatedNews.findIndex(n => n.id === news.id);
    setCurrentRelatedIndex(idx === -1 ? 0 : idx);
  }, [relatedNews, news]);

  // Sadece relatedNews üzerinden yeni haber yükle
  const loadNextRelatedNews = useCallback(async () => {
    if (currentRelatedIndex >= relatedNews.length - 1) return;
    if (isLoadingNextNews || scrollCooldown) return;
    setScrollCooldown(true);
    setIsLoadingNextNews(true);
    const initialScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    try {
      const nextNews = relatedNews[currentRelatedIndex + 1];
      if (nextNews) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollDifference = Math.abs(currentScrollTop - initialScrollTop);
        if (scrollDifference > 100 && currentScrollTop < initialScrollTop) {
          setIsLoadingNextNews(false);
          setTimeout(() => setScrollCooldown(false), 2000);
          return;
        }
        window.scrollTo(0, 0);
        window.history.replaceState(null, '', `/haberler/${nextNews.id}`);
        window.location.reload();
      }
    } catch (error) {
      console.error('Yeni haber yüklenirken hata:', error);
    } finally {
      setIsLoadingNextNews(false);
      setTimeout(() => {
        setScrollCooldown(false);
      }, 2000);
    }
  }, [currentRelatedIndex, relatedNews, isLoadingNextNews, scrollCooldown]);

  // Scroll ile yeni haber yükleme (sadece relatedNews üzerinden)
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      if (
        scrollTop + windowHeight >= documentHeight * 0.95 &&
        !isLoadingNextNews &&
        !scrollCooldown &&
        relatedNews.length > 0
      ) {
        loadNextRelatedNews();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [relatedNews, currentRelatedIndex, isLoadingNextNews, scrollCooldown, loadNextRelatedNews]);

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
          const recentNews = shuffleArray(
            recentNewsSnapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter(item => item.id !== currentNews.id)
          ).slice(0, 4);
          
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

      // Tag'ler varsa
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
        const tagNews = shuffleArray(
          tagSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(item => item.id !== currentNews.id)
        ).slice(0, 4);

        console.log('✅ Tag ile bulunan haberler:', tagNews.length);
        setRelatedNews(tagNews);
      } catch (tagError) {
        console.log('⚠️ Tag query hatası, fallback kullanılıyor:', tagError);
        // Fallback: tag olmadan en son haberler
        const fallbackSnapshot = await getDocs(query(newsCollection, limit(10)));
        const fallbackNews = shuffleArray(
          fallbackSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(item => item.id !== currentNews.id)
        ).slice(0, 4);
        
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
        const fallbackNews = shuffleArray(
          fallbackSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(item => item.id !== currentNews.id)
        ).slice(0, 4);
        
        console.log('✅ Fallback haberler:', fallbackNews.length);
        setRelatedNews(fallbackNews);
      } catch (fallbackError) {
        console.error('❌ Fallback da başarısız:', fallbackError);
        setRelatedNews([]);
      }
    }
  };

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
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(window.location.href);
          alert('Haber linki kopyalandı!');
        } else {
          throw new Error('Kopyalama desteklenmiyor');
        }
      } catch (err) {
        alert('Kopyalama desteklenmiyor veya bir hata oluştu. Link: ' + window.location.href);
      }
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

  const handleLike = async () => {
    if (!auth.currentUser) {
      alert('Beğenmek için giriş yapmanız gerekmektedir.');
      return;
    }
    if (!id) return;

    const userId = auth.currentUser.uid;
    const likesRef = collection(db, 'news', id, 'likes');
    const dislikesRef = collection(db, 'news', id, 'dislikes');
    const userLikeDoc = doc(likesRef, userId);
    const userDislikeDoc = doc(dislikesRef, userId);

    const userLikeQuery = query(likesRef, where('__name__', '==', userId));
    const userDislikeQuery = query(dislikesRef, where('__name__', '==', userId));

    const likeSnapshot = await getDocs(userLikeQuery);
    const dislikeSnapshot = await getDocs(userDislikeQuery);

    if (likeSnapshot.empty) {
      // Kullanıcı daha önce like yapmamış, ekle
      setLiked(true);
      setLikesCount((prev) => prev + 1);

      // Eğer dislike varsa kaldır
      if (!dislikeSnapshot.empty) {
        setDisliked(false);
        setDislikesCount((prev) => prev - 1);
      }

      // Firebase işlemleri arka planda yapılacak
      updateDoc(doc(db, 'news', id), {
        likeCount: likesCount + 1,
        updatedAt: new Date()
      });
      setDoc(userLikeDoc, {});

      if (!dislikeSnapshot.empty) {
        updateDoc(doc(db, 'news', id), {
          dislikeCount: dislikesCount - 1,
          updatedAt: new Date()
        });
        deleteDoc(userDislikeDoc);
      }
    } else {
      // Kullanıcı daha önce like yapmış, kaldır
      setLiked(false);
      setLikesCount((prev) => prev - 1);

      // Firebase işlemleri arka planda yapılacak
      updateDoc(doc(db, 'news', id), {
        likeCount: likesCount - 1,
        updatedAt: new Date()
      });
      deleteDoc(userLikeDoc);
    }
  };

  const handleDislike = async () => {
    if (!auth.currentUser) {
      alert('Dislike için giriş yapmanız gerekmektedir.');
      return;
    }
    if (!id) return;

    const userId = auth.currentUser.uid;
    const likesRef = collection(db, 'news', id, 'likes');
    const dislikesRef = collection(db, 'news', id, 'dislikes');
    const userLikeDoc = doc(likesRef, userId);
    const userDislikeDoc = doc(dislikesRef, userId);

    const userLikeQuery = query(likesRef, where('__name__', '==', userId));
    const userDislikeQuery = query(dislikesRef, where('__name__', '==', userId));

    const likeSnapshot = await getDocs(userLikeQuery);
    const dislikeSnapshot = await getDocs(userDislikeQuery);

    if (dislikeSnapshot.empty) {
      // Kullanıcı daha önce dislike yapmamış, ekle
      setDisliked(true);
      setDislikesCount((prev) => prev + 1);

      // Eğer like varsa kaldır
      if (!likeSnapshot.empty) {
        setLiked(false);
        setLikesCount((prev) => prev - 1);
      }

      // Firebase işlemleri arka planda yapılacak
      updateDoc(doc(db, 'news', id), {
        dislikeCount: dislikesCount + 1,
        updatedAt: new Date()
      });
      setDoc(userDislikeDoc, {});

      if (!likeSnapshot.empty) {
        updateDoc(doc(db, 'news', id), {
          likeCount: likesCount - 1,
          updatedAt: new Date()
        });
        deleteDoc(userLikeDoc);
      }
    } else {
      // Kullanıcı daha önce dislike yapmış, kaldır
      setDisliked(false);
      setDislikesCount((prev) => prev - 1);

      // Firebase işlemleri arka planda yapılacak
      updateDoc(doc(db, 'news', id), {
        dislikeCount: dislikesCount - 1,
        updatedAt: new Date()
      });
      deleteDoc(userDislikeDoc);
    }
  };

  // Sayfanın sonuna gelindiğinde otomatik olarak sonraki haberi yükle
  useEffect(() => {
    const handleScrollToEnd = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Sayfanın sonuna ulaşıldığında sıradaki habere geç
      if (
        scrollTop + windowHeight >= documentHeight - 500 && // 500px boşluk sonuna ulaşıldı
        !isLoadingNextNews &&
        !scrollCooldown &&
        relatedNews.length > 0
      ) {
        loadNextRelatedNews();
      }
    };

    window.addEventListener('scroll', handleScrollToEnd);
    return () => window.removeEventListener('scroll', handleScrollToEnd);
  }, [relatedNews, currentRelatedIndex, isLoadingNextNews, scrollCooldown, loadNextRelatedNews]);

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

            {/* Ekstra boşluk */}
            <div className="hidden sm:block" style={{ height: '500px' }}></div>
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
      {/* Footer için ekstra boşluk */}
      <div className="py-12"></div>
      <Footer />
      {/* AI Chat Assistant */}
      <AIChat news={news} />
    </>
  );
}

export default NewsDetail;
