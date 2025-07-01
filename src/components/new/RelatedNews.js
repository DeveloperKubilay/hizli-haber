import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Tag, FileText, Heart, ThumbsDown, Calendar } from 'lucide-react';
import { CATEGORY_COLORS, CATEGORY_ICONS, translateTagsToTurkish } from '../../services/categories';

function RelatedNews({ relatedNews, relatedLoading, formatDate, currentNews }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Haber Resmi ve Bilgiler */}
      <motion.div 
        className="bg-primary p-6 rounded-lg"
        variants={itemVariants}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      >
        <motion.div 
          className="w-full h-48 bg-primaryBG rounded-lg overflow-hidden flex items-center justify-center mb-4"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {currentNews?.image ? (
            <img
              src={currentNews.image}
              alt={currentNews.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/imgs/logo.png";
              }}
            />
          ) : (
            <motion.img
              src="/imgs/logo.png"
              alt="Site Logosu"
              className="w-32 h-32 object-contain opacity-60"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.div>
        
        {/* Like/Dislike ve Tarih */}
        <div className="space-y-3">
          {/* Like/Dislike Butonları */}
          <motion.div 
            className="flex items-center gap-4"
            variants={itemVariants}
          >
            <motion.div 
              className="flex items-center gap-2 text-textPrimary"
              whileHover={{ scale: 1.05 }}
            >
              <Heart size={18} className="text-red-500" />
              <span className="font-medium">{currentNews?.likes || 0} Beğeni</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2 text-textPrimary"
              whileHover={{ scale: 1.05 }}
            >
              <ThumbsDown size={18} className="text-blue-500" />
              <span className="font-medium">{currentNews?.dislikes || 0} Beğenmeme</span>
            </motion.div>
          </motion.div>
          
          {/* Tarih */}
          <motion.div 
            className="flex items-center gap-2 text-textPrimary"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
          >
            <Calendar size={18} className="text-secondary" />
            <span className="font-medium">{formatDate(currentNews?.createdAt)}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Etiketler */}
      {currentNews?.tag && currentNews.tag.length > 0 && (
        <motion.div 
          className="bg-primary p-6 rounded-lg"
          variants={itemVariants}
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        >
          <motion.div 
            className="flex items-center gap-2 mb-4"
            variants={itemVariants}
          >
            <Tag className="text-secondary" size={20} />
            <h3 className="text-lg font-bold text-textHeading">Etiketler</h3>
          </motion.div>
          <motion.div 
            className="flex flex-wrap gap-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {translateTagsToTurkish(currentNews.tag).map((category, index) => (
              <motion.span
                key={index}
                className={`text-sm px-3 py-2 rounded-full inline-flex items-center gap-1.5 ${CATEGORY_COLORS[category] || 'bg-primaryBG text-textPrimary'}`}
                variants={itemVariants}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {CATEGORY_ICONS[category]} {category}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Özet */}
      {currentNews?.summary && (
        <motion.div 
          className="bg-primary p-6 rounded-lg"
          variants={itemVariants}
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        >
          <motion.div 
            className="flex items-center gap-2 mb-4"
            variants={itemVariants}
          >
            <FileText className="text-secondary" size={20} />
            <h3 className="text-lg font-bold text-textHeading">Özet</h3>
          </motion.div>
          <motion.p 
            className="text-textPrimary leading-relaxed"
            variants={itemVariants}
          >
            {currentNews.summary}
          </motion.p>
        </motion.div>
      )}

      {/* Benzer Haberler */}
      <motion.div 
        className="bg-primary p-6 rounded-lg"
        variants={itemVariants}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      >
        <motion.h3 
          className="text-xl font-bold text-textHeading mb-4"
          variants={itemVariants}
        >
          Benzer Haberler
        </motion.h3>
        
        <motion.div 
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {relatedLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <motion.div 
                key={index} 
                className="animate-pulse"
                variants={itemVariants}
              >
                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-primaryBG rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-primaryBG rounded w-full mb-2"></div>
                    <div className="h-3 bg-primaryBG rounded w-1/2"></div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : relatedNews.length > 0 ? (
            relatedNews.map((item, index) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                whileHover={{ scale: 1.03, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={`/haber/${item.id}`}
                  className="block group"
                >
                  <div className="flex gap-3">
                    {item.image && (
                      <motion.img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        whileHover={{ scale: 1.1 }}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    <div className="flex-1">
                      <motion.h4 
                        className="text-sm font-semibold text-textHeading group-hover:text-secondary transition-colors line-clamp-2"
                        whileHover={{ y: -1 }}
                      >
                        {item.name}
                      </motion.h4>
                      <motion.p 
                        className="text-xs text-textPrimary mt-1"
                        initial={{ opacity: 0.7 }}
                        whileHover={{ opacity: 1 }}
                      >
                        {formatDate(item.createdAt)}
                      </motion.p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <motion.p 
              className="text-textPrimary text-sm"
              variants={itemVariants}
            >
              Benzer haber bulunamadı.
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default RelatedNews;
