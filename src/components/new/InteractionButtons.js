import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ThumbsDown, Share2, Bookmark } from 'lucide-react';

function InteractionButtons({ 
  news, 
  liked, 
  disliked, 
  handleLike, 
  handleDislike, 
  handleShare 
}) {
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
      className="flex flex-wrap items-center gap-4 py-6 border-t border-primary"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
    >
      <motion.button
        onClick={handleLike}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
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
          <Heart size={20} />
        </motion.div>
        <motion.span
          key={news.likes || 0}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {news.likes || 0}
        </motion.span>
      </motion.button>

      <motion.button
        onClick={handleDislike}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
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
          <ThumbsDown size={20} />
        </motion.div>
        <motion.span
          key={news.dislikes || 0}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {news.dislikes || 0}
        </motion.span>
      </motion.button>

      <motion.button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-textPrimary hover:bg-primaryBG transition-colors"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Share2 size={20} />
        Paylaş
      </motion.button>

      <motion.button
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-textPrimary hover:bg-primaryBG transition-colors"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Bookmark size={20} />
        Kaydet
      </motion.button>
    </motion.div>
  );
}

export default InteractionButtons;
