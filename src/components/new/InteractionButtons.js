import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ThumbsDown, Share2, Bookmark, BookmarkCheck } from 'lucide-react';
import { auth, db } from '../../services/firebase';
import { collection, doc, getDocs, deleteDoc, setDoc } from 'firebase/firestore';

function InteractionButtons({ 
  news, 
  liked, 
  disliked, 
  handleLike, 
  handleDislike, 
  handleShare 
}) {
  const [saved, setSaved] = useState(false);
  const [savingInProgress, setSavingInProgress] = useState(false);

  // Kaydetme durumunu kontrol et - Yeni yapı
  useEffect(() => {
    const checkSaveStatus = async () => {
      if (!auth.currentUser || !news?.id) return;

      try {
        const userId = auth.currentUser.uid;
        
        // Document'in var olup olmadığını kontrol et
        const savedNewsCollection = collection(db, 'savednews', userId, 'news');
        const docSnapshot = await getDocs(savedNewsCollection);
        const isDocExists = docSnapshot.docs.some(doc => doc.id === news.id);
        setSaved(isDocExists);
        
      } catch (error) {
        console.error('Kaydetme durumu kontrol edilemedi:', error);
      }
    };

    checkSaveStatus();
  }, [news?.id]);

  // Haberi kaydet/çıkar - Like sistemi gibi
  const handleSave = async () => {
    if (!auth.currentUser) {
      alert('Haber kaydetmek için giriş yapmalısınız');
      return;
    }

    if (savingInProgress) return;

    // Instant UI update
    const wasSaved = saved;
    setSaved(!wasSaved);
    setSavingInProgress(true);

    try {
      const userId = auth.currentUser.uid;
      const savedNewsRef = doc(db, 'savednews', userId, 'news', news.id);

      if (wasSaved) {
        // Kaydedilmişse çıkar
        await deleteDoc(savedNewsRef);
      } else {
        // Kaydet
        await setDoc(savedNewsRef, {
          newsId: news.id,
          newsTitle: news.name,
          newsImage: news.image,
          newsMinides: news.minides,
          savedAt: new Date()
        });
      }
      
    } catch (error) {
      console.error('Kaydetme işleminde hata:', error);
      // Error durumunda UI'ı geri al
      setSaved(wasSaved);
      alert('Bir hata oluştu');
    } finally {
      setSavingInProgress(false);
    }
  };
  const buttonVariants = {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  const iconVariants = {
    initial: { scale: 1 },
    liked: { 
      scale: [1, 1.3, 1],
      transition: { duration: 0.4 }
    },
    disliked: {
      scale: [1, 1.3, 1],
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div 
      className="flex flex-wrap items-center gap-4 md:gap-6 py-8 border-t border-primary mt-8"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
    >
      <motion.button
        onClick={handleLike}
        className={`flex items-center gap-3 md:gap-4 px-5 md:px-7 py-3 md:py-4 rounded-lg transition-colors duration-150 text-base font-medium ${
          liked ? 'bg-red-500 text-white' : 'bg-primary text-textPrimary hover:bg-primaryBG'
        }`}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div
          variants={iconVariants}
          animate={liked ? "liked" : "initial"}
        >
          <Heart size={22} />
        </motion.div>
        <motion.span
          key={news.likes || 0}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-base font-medium"
        >
          {news.likes || 0}
        </motion.span>
      </motion.button>

      <motion.button
        onClick={handleDislike}
        className={`flex items-center gap-3 md:gap-4 px-5 md:px-7 py-3 md:py-4 rounded-lg transition-colors duration-150 text-base font-medium ${
          disliked ? 'bg-blue-500 text-white' : 'bg-primary text-textPrimary hover:bg-primaryBG'
        }`}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          variants={iconVariants}
          animate={disliked ? "disliked" : "initial"}
        >
          <ThumbsDown size={22} />
        </motion.div>
        <motion.span
          key={news.dislikes || 0}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-base font-medium"
        >
          {news.dislikes || 0}
        </motion.span>
      </motion.button>

      <motion.button
        onClick={handleShare}
        className="flex items-center gap-3 md:gap-4 px-5 md:px-7 py-3 md:py-4 rounded-lg bg-primary text-textPrimary hover:bg-primaryBG transition-colors duration-150 text-base font-medium"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Share2 size={22} />
        Paylaş
      </motion.button>

      <motion.button
        onClick={handleSave}
        disabled={savingInProgress}
        className={`flex items-center gap-3 md:gap-4 px-5 md:px-7 py-3 md:py-4 rounded-lg transition-colors duration-150 text-base font-medium ${
          saved ? 'bg-green-500 text-white' : 'bg-primary text-textPrimary hover:bg-primaryBG'
        } ${savingInProgress ? 'opacity-50 cursor-not-allowed' : ''}`}
        variants={buttonVariants}
        whileHover={savingInProgress ? {} : "hover"}
        whileTap={savingInProgress ? {} : "tap"}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {savingInProgress ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Bookmark size={22} />
          </motion.div>
        ) : saved ? (
          <BookmarkCheck size={22} />
        ) : (
          <Bookmark size={22} />
        )}
        {savingInProgress ? 'Kaydediliyor...' : saved ? 'Kaydedildi' : 'Kaydet'}
      </motion.button>
    </motion.div>
  );
}

export default InteractionButtons;
