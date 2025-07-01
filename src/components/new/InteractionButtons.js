import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ThumbsDown, Share2, Bookmark, BookmarkCheck } from 'lucide-react';
import { auth, db } from '../../services/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

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

  // Kaydetme durumunu kontrol et
  useEffect(() => {
    const checkSaveStatus = async () => {
      if (!auth.currentUser || !news?.id) return;

      try {
        const savedNewsRef = collection(db, 'savedNews');
        const q = query(
          savedNewsRef,
          where('userId', '==', auth.currentUser.uid),
          where('newsId', '==', news.id)
        );
        
        const querySnapshot = await getDocs(q);
        setSaved(!querySnapshot.empty);
      } catch (error) {
        console.error('Kaydetme durumu kontrol edilemedi:', error);
      }
    };

    checkSaveStatus();
  }, [news?.id]);

  // Haberi kaydet/çıkar
  const handleSave = async () => {
    if (!auth.currentUser) {
      alert('Haber kaydetmek için giriş yapmalısınız');
      return;
    }

    if (savingInProgress) return;

    try {
      setSavingInProgress(true);

      if (saved) {
        // Kaydedilmişse çıkar
        const savedNewsRef = collection(db, 'savedNews');
        const q = query(
          savedNewsRef,
          where('userId', '==', auth.currentUser.uid),
          where('newsId', '==', news.id)
        );
        
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (docSnapshot) => {
          await deleteDoc(doc(db, 'savedNews', docSnapshot.id));
        });
        
        setSaved(false);
      } else {
        // Kaydet
        await addDoc(collection(db, 'savedNews'), {
          userId: auth.currentUser.uid,
          newsId: news.id,
          savedAt: new Date().toISOString()
        });
        
        setSaved(true);
      }
    } catch (error) {
      console.error('Kaydetme işleminde hata:', error);
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
        className={`flex items-center gap-3 md:gap-4 px-5 md:px-7 py-3 md:py-4 rounded-lg transition-colors text-base font-medium ${
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
        className={`flex items-center gap-3 md:gap-4 px-5 md:px-7 py-3 md:py-4 rounded-lg transition-colors text-base font-medium ${
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
        className="flex items-center gap-3 md:gap-4 px-5 md:px-7 py-3 md:py-4 rounded-lg bg-primary text-textPrimary hover:bg-primaryBG transition-colors text-base font-medium"
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
        className={`flex items-center gap-3 md:gap-4 px-5 md:px-7 py-3 md:py-4 rounded-lg transition-colors text-base font-medium ${
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
