import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Info, Tag, FileText, Heart, ThumbsDown, Calendar, Newspaper, Megaphone } from 'lucide-react';
import { CATEGORY_COLORS, CATEGORY_ICONS, translateTagsToTurkish, CATEGORIES } from '../../services/categories';

function RelatedNews({ relatedNews, relatedLoading, formatDate, currentNews }) {
  const navigate = useNavigate();

  // Kategori tıklama handler'ı
  const handleCategoryClick = (category) => {
    // Kategori adından kategori key'ini bul
    const categoryKey = Object.entries(CATEGORIES).find(
      ([key, value]) => value === category
    )?.[0];

    if (categoryKey && categoryKey !== 'ALL') {
      navigate(`/haberler#${categoryKey.toLowerCase()}`);
    } else {
      navigate('/haberler');
    }
  };
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
      {/* Bilgiler (Tarih, Beğeni, Etiketler) */}
      <motion.div
        className="bg-primary p-5 rounded-lg"
        variants={itemVariants}
        whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Info className="text-secondary" size={22} />
          <h3 className="text-xl font-bold text-textHeading">Bilgiler</h3>
        </div>

        <div className="space-y-3">
          {/* Yayın Tarihi */}
          <div className="flex items-center gap-3 text-textPrimary bg-primaryBG/60 p-3 rounded-lg border border-secondary/10">
            <Calendar size={18} className="text-secondary shrink-0" />
            <div>
              <span className="text-xs text-textSecondary block">Yayınlanma Tarihi</span>
              <span className="font-medium text-sm">{formatDate(currentNews?.createdAt)}</span>
            </div>
          </div>

          {/* Beğeni / Reaksiyon */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-textPrimary bg-primaryBG/60 p-3 rounded-lg border border-secondary/10">
              <Heart size={18} className="text-red-500 shrink-0" />
              <div>
                <span className="text-xs text-textSecondary block">Beğeni</span>
                <span className="font-medium text-sm">{currentNews?.likes || 0}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-textPrimary bg-primaryBG/60 p-3 rounded-lg border border-secondary/10">
              <ThumbsDown size={18} className="text-blue-500 shrink-0" />
              <div>
                <span className="text-xs text-textSecondary block">Beğenmeme</span>
                <span className="font-medium text-sm">{currentNews?.dislikes || 0}</span>
              </div>
            </div>
          </div>

          {/* Kategoriler / Etiketler */}
          {currentNews?.tag && currentNews.tag.length > 0 && (
            <div className="pt-2">
              <span className="text-xs text-textSecondary block mb-2">Kategoriler</span>
              <div className="flex flex-wrap gap-2">
                {translateTagsToTurkish(currentNews.tag).map((category, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleCategoryClick(category)}
                    className={`text-xs px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 cursor-pointer transition-all hover:shadow-md ${CATEGORY_COLORS[category] || 'bg-primaryBG text-textPrimary'}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {CATEGORY_ICONS[category]} {category}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Özet */}
      {currentNews?.summary && (
        <motion.div
          className="bg-primary p-5 rounded-lg"
          variants={itemVariants}
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        >
          <motion.div
            className="flex items-center gap-3 mb-6"
            variants={itemVariants}
          >
            <FileText className="text-secondary" size={22} />
            <h3 className="text-xl font-bold text-textHeading">Özet</h3>
          </motion.div>
          <motion.p
            className="text-textPrimary leading-relaxed text-base w-full"
            variants={itemVariants}
          >
            {currentNews.summary}
          </motion.p>
        </motion.div>
      )}

      {/* Yazar Bilgisi */}
      <motion.div
        className="bg-primary p-5 rounded-lg"
        variants={itemVariants}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      >
        <motion.div
          className="flex items-center gap-3 mb-6"
          variants={itemVariants}
        >
          <Megaphone className="text-secondary" size={22} />
          <h3 className="text-xl font-bold text-textHeading">Yazar</h3>
        </motion.div>
        <motion.div
          className="flex items-center gap-4"
          variants={itemVariants}
        >
          <motion.img
            src="https://avatars.githubusercontent.com/u/107062509?v=4"
            alt="Kubilay"
            className="w-16 h-16 rounded-full object-cover border-2 border-secondary"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          />
          <div>
            <motion.h4
              className="text-lg font-bold text-textHeading"
              whileHover={{ y: -1 }}
            >
              Kubilay
            </motion.h4>
            <motion.p
              className="text-sm text-textPrimary"
              initial={{ opacity: 0.7 }}
              whileHover={{ opacity: 1 }}
            >
              Hızlı Haber Editörü
            </motion.p>
          </div>
        </motion.div>
      </motion.div>

      {/* Benzer Haberler */}
      <motion.div
        className="bg-primary p-5 rounded-lg"
        variants={itemVariants}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      >
        <motion.div
          className="flex items-center gap-3 mb-6"
          variants={itemVariants}
        >
          <Newspaper className="text-secondary" size={22} />
          <h3 className="text-xl font-bold text-textHeading">Benzer Haberler</h3>
        </motion.div>

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
                  to={`/haberler/${item.id}`}
                  className="block group"
                >
                  <div className="flex gap-3">
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
