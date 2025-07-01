import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db, auth, ai } from '../services/firebase';
import { doc, getDoc, collection, getDocs, updateDoc, increment } from 'firebase/firestore';
import { 
  Heart, 
  ThumbsDown, 
  Calendar, 
  Share2, 
  ArrowLeft,
  Eye,
  Bookmark,
  Brain
} from 'lucide-react';

// Components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  CATEGORY_COLORS, 
  CATEGORY_ICONS, 
  translateTagsToTurkish 
} from '../services/categories';

function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [relatedNews, setRelatedNews] = useState([]);
  const [aiSummary, setAiSummary] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');

  // Haber detayını çek
  useEffect(() => {
    const fetchNewsDetail = async () => {
      console.log('🔍 Fetching news with ID:', id);
      
      if (!id) {
        console.error('❌ No ID provided');
        setError('Haber ID\'si bulunamadı');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🚀 Starting Firebase request...');
        
        // Firebase bağlantısını test et
        console.log('📊 Database instance:', db);
        
        const newsDoc = doc(db, 'news', id);
        console.log('📄 Document reference created:', newsDoc);
        
        const newsSnapshot = await getDoc(newsDoc);
        console.log('📥 Document snapshot received:', newsSnapshot);
        console.log('📋 Document exists:', newsSnapshot.exists());
        
        if (!newsSnapshot.exists()) {
          console.warn('⚠️ Document not found for ID:', id);
          setError('Haber bulunamadı');
          setLoading(false);
          return;
        }

        const newsData = {
          id: newsSnapshot.id,
          ...newsSnapshot.data()
        };
        
        console.log('✅ News data loaded:', newsData);
        setNews(newsData);
        
        // Okunma sayısını artır (hata olursa devam et)
        try {
          await updateDoc(newsDoc, {
            views: increment(1)
          });
          console.log('📈 View count incremented');
        } catch (viewError) {
          console.warn('⚠️ Could not increment view count:', viewError);
        }
        
        // Benzer haberleri çek
        try {
          await fetchRelatedNews(newsData);
          console.log('🔗 Related news loaded');
        } catch (relatedError) {
          console.warn('⚠️ Could not load related news:', relatedError);
        }
        
      } catch (error) {
        console.error('Haber detayı çekilirken hata:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          stack: error.stack
        });
        setError(`Haber yüklenirken hata: ${error.message || error.toString()}`);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [id]);

  // Benzer haberleri çek
  const fetchRelatedNews = async (currentNews) => {
    console.log('🔗 Fetching related news...');
    try {
      const newsCollection = collection(db, 'news');
      console.log('📚 News collection reference:', newsCollection);
      
      const allNewsSnapshot = await getDocs(newsCollection);
      console.log('📊 All news snapshot received, docs count:', allNewsSnapshot.docs.length);
      
      const allNews = allNewsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => item.id !== currentNews.id);

      console.log('📋 Filtered news count:', allNews.length);

      // Aynı kategorideki haberleri bul
      const related = allNews.filter(item => {
        if (!currentNews.tag || !item.tag) return false;
        return item.tag.some(tag => currentNews.tag.includes(tag));
      }).slice(0, 4);

      console.log('🎯 Related news found:', related.length);
      setRelatedNews(related);
    } catch (error) {
      console.error('❌ Benzer haberler çekilirken hata:', error);
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

  // AI özeti oluştur
  const generateAiSummary = async () => {
    if (!news?.content) return;
    
    setIsLoadingAi(true);
    try {
      const prompt = `Bu haber metnini Türkçe olarak özetle ve ana noktaları çıkar:\n\n${news.content}`;
      const summary = await ai(prompt);
      setAiSummary(summary);
    } catch (error) {
      console.error('AI özeti oluşturulurken hata:', error);
      setAiSummary('Özet oluşturulurken bir hata oluştu.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  // AI'ya soru sor
  const askAiQuestion = async () => {
    if (!aiQuestion.trim() || !news?.content) return;
    
    setIsLoadingAi(true);
    try {
      const prompt = `Bu haber metni hakkında sorulan soruyu cevapla:\n\nHaber: ${news.content}\n\nSoru: ${aiQuestion}\n\nCevabı Türkçe ver:`;
      const answer = await ai(prompt);
      setAiAnswer(answer);
    } catch (error) {
      console.error('AI sorusu cevaplanırken hata:', error);
      setAiAnswer('Soru cevaplanırken bir hata oluştu.');
    } finally {
      setIsLoadingAi(false);
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
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto py-8 px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-primary rounded mb-4"></div>
            <div className="h-64 bg-primary rounded mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-primary rounded w-3/4"></div>
              <div className="h-4 bg-primary rounded w-1/2"></div>
              <div className="h-4 bg-primary rounded w-5/6"></div>
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
        <div className="max-w-4xl mx-auto py-8 px-6 text-center">
          <h1 className="text-2xl font-bold text-textHeading mb-4">Hata</h1>
          <p className="text-textPrimary mb-6">{error}</p>
          <button
            onClick={() => navigate('/haberler')}
            className="bg-secondary hover:bg-secondaryHover text-white px-6 py-2 rounded-lg transition-colors"
          >
            Haberlere Dön
          </button>
        </div>
        <Footer />
      </>
    );
  }

  if (!news) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto py-8 px-6 text-center">
          <h1 className="text-2xl font-bold text-textHeading mb-4">Haber Bulunamadı</h1>
          <p className="text-textPrimary mb-6">Aradığınız haber mevcut değil.</p>
          <button
            onClick={() => navigate('/haberler')}
            className="bg-secondary hover:bg-secondaryHover text-white px-6 py-2 rounded-lg transition-colors"
          >
            Haberlere Dön
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 px-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Geri dön butonu */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/haberler')}
              className="flex items-center gap-2 text-textPrimary hover:text-textHeading transition-colors"
            >
              <ArrowLeft size={20} />
              Haberlere Dön
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ana içerik */}
            <div className="lg:col-span-2">
              {/* Başlık ve meta bilgiler */}
              <div className="mb-6">
                <h1 className="text-3xl lg:text-4xl font-bold text-textHeading mb-4 leading-tight">
                  {news.name}
                </h1>
                
                {/* Kısa açıklama */}
                <p className="text-lg text-textPrimary mb-4 leading-relaxed">
                  {news.minides}
                </p>

                {/* Meta bilgiler */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-textPrimary mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{formatDate(news.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye size={16} />
                    <span>{news.views || 0} görüntülenme</span>
                  </div>
                </div>

                {/* Kategoriler */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {news.tag && translateTagsToTurkish(news.tag).map((category, idx) => (
                    <span key={idx} className={`text-sm px-3 py-2 rounded-full inline-flex items-center gap-1.5 ${CATEGORY_COLORS[category] || 'bg-primaryBG text-textPrimary'}`}>
                      {CATEGORY_ICONS[category]} {category}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ana resim */}
              {news.image && (
                <div className="mb-8">
                  <img 
                    src={news.image} 
                    alt={news.name}
                    className="w-full h-64 lg:h-96 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* İçerik */}
              <div className="prose prose-lg max-w-none mb-8">
                <div className="text-textPrimary leading-relaxed whitespace-pre-wrap">
                  {news.content || news.description || news.minides || 'İçerik mevcut değil.'}
                </div>
              </div>

              {/* Etkileşim butonları */}
              <div className="flex flex-wrap items-center gap-4 py-6 border-t border-primary">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    liked ? 'bg-red-500 text-white' : 'bg-primary text-textPrimary hover:bg-primaryBG'
                  }`}
                >
                  <Heart size={20} />
                  <span>{news.likes || 0}</span>
                </button>

                <button
                  onClick={handleDislike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    disliked ? 'bg-blue-500 text-white' : 'bg-primary text-textPrimary hover:bg-primaryBG'
                  }`}
                >
                  <ThumbsDown size={20} />
                  <span>{news.dislikes || 0}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-textPrimary hover:bg-primaryBG transition-colors"
                >
                  <Share2 size={20} />
                  Paylaş
                </button>

                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-textPrimary hover:bg-primaryBG transition-colors"
                >
                  <Bookmark size={20} />
                  Kaydet
                </button>
              </div>

              {/* AI Panel */}
              <div className="bg-primary p-6 rounded-lg mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="text-secondary" size={24} />
                  <h3 className="text-xl font-bold text-textHeading">AI Asistanı</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Özet oluştur */}
                  <div>
                    <button
                      onClick={generateAiSummary}
                      disabled={isLoadingAi}
                      className="bg-secondary hover:bg-secondaryHover text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isLoadingAi ? 'Özet oluşturuluyor...' : 'Haberi Özetle'}
                    </button>
                    
                    {aiSummary && (
                      <div className="mt-4 p-4 bg-primaryBG rounded-lg">
                        <h4 className="font-semibold text-textHeading mb-2">AI Özeti:</h4>
                        <p className="text-textPrimary">{aiSummary}</p>
                      </div>
                    )}
                  </div>

                  {/* Soru sor */}
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                        placeholder="Bu haber hakkında bir soru sorun..."
                        className="flex-1 px-4 py-2 bg-primaryBG text-textPrimary rounded-lg border border-primaryBG focus:border-secondary focus:outline-none"
                      />
                      <button
                        onClick={askAiQuestion}
                        disabled={isLoadingAi || !aiQuestion.trim()}
                        className="bg-secondary hover:bg-secondaryHover text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Sor
                      </button>
                    </div>
                    
                    {aiAnswer && (
                      <div className="mt-4 p-4 bg-primaryBG rounded-lg">
                        <h4 className="font-semibold text-textHeading mb-2">AI Cevabı:</h4>
                        <p className="text-textPrimary">{aiAnswer}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Yan panel */}
            <div className="lg:col-span-1">
              {/* Benzer haberler */}
              {relatedNews.length > 0 && (
                <div className="bg-primary p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-bold text-textHeading mb-4">Benzer Haberler</h3>
                  <div className="space-y-4">
                    {relatedNews.map((item) => (
                      <Link
                        key={item.id}
                        to={`/haber/${item.id}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-textHeading group-hover:text-secondary transition-colors line-clamp-2">
                              {item.name}
                            </h4>
                            <p className="text-xs text-textPrimary mt-1">
                              {formatDate(item.createdAt)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Reklam alanı */}
              <div className="bg-primary p-6 rounded-lg text-center">
                <h3 className="text-lg font-bold text-textHeading mb-2">Reklam</h3>
                <p className="text-textPrimary text-sm">Bu alan reklam için ayrılmıştır</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}

export default NewsDetail;
