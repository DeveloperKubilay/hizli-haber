import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ThumbsDown, Calendar } from 'lucide-react';
import { 
  CATEGORY_COLORS, 
  CATEGORY_ICONS, 
  translateTagsToTurkish 
} from '../../services/categories';
import { getNewsUrl } from '../../utils/url';

function NewsCard({ item, index, viewMode = 'grid' }) {
  // Tarih ve saat formatını düzenlemek için yardımcı fonksiyon
  const formatDate = (dateString) => {
    if (!dateString) return 'Bilinmiyor';
    
    try {
      const date = new Date(dateString);
      
      // Geçerli bir tarih değilse orijinal değeri döndür
      if (isNaN(date)) {
        return dateString;
      }
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}.${month}.${year} ${hours}:${minutes}`;
    } catch (error) {
      console.error("❌ Tarih formatlanırken hata oluştu:", error);
      return dateString;
    }
  };

  return (
    <Link to={getNewsUrl(item)} className="block">
      <motion.div 
        className={`news-card-fixed-height bg-primary rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-primaryBG w-full cursor-pointer overflow-hidden ${
          viewMode === 'grid' ? "p-2 sm:p-3 md:p-3.5" : "p-2 sm:p-3"
        }`}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 0.5, 
          delay: index * 0.1,
          ease: "easeOut" 
        }}
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
      >
      <div className={`flex ${viewMode === 'grid' ? "flex-col h-full" : "gap-2 sm:gap-4"}`}>
        {/* Görsel kısmı */}
        <div className={`${
          viewMode === 'grid' ? "w-full h-[120px] sm:h-[150px]" : "flex-shrink-0 w-[80px] sm:w-[120px] h-[70px] sm:h-[90px]"
        } bg-primaryBG rounded-lg overflow-hidden flex items-center justify-center ${
          viewMode === 'grid' ? "mb-2 sm:mb-3" : ""
        }`}>
          {item.image && !item.image.includes('logo') ? (
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/imgs/logos/logo192.png';
                e.target.className = 'w-16 h-16 sm:w-20 sm:h-20 object-contain opacity-60 p-2';
              }} 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primaryBG/50 p-2">
              <img 
                src="/imgs/logos/logo192.png" 
                alt="Hızlı Haber" 
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain opacity-60" 
              />
            </div>
          )}
        </div>
        
        {/* İçerik kısmı */}
        <div className={`flex-1 flex flex-col ${
          viewMode === 'grid' ? "h-[200px] sm:h-[250px]" : "h-auto"
        }`}>
          {/* Başlık */}
          <h3 className={
            `font-bold mb-1 sm:mb-2 text-textHeading ${viewMode === 'grid' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'} line-clamp-2`
          }>
            {item.name}
          </h3>
          {/* Açıklama - Her iki görünümde de göster */}
          <p className={`text-xs sm:text-sm text-textPrimary mb-1 sm:mb-2 ${viewMode === 'grid' ? 'line-clamp-3' : 'line-clamp-1'}`}>
            {item.minides}
          </p>
          {/* Etiketler */}
          <div className={`flex flex-wrap gap-1 sm:gap-1.5 ${viewMode === 'grid' ? 'mb-2 sm:mb-3' : 'mb-1 sm:mb-2'}`}>
            {item.tag && translateTagsToTurkish(item.tag).slice(0, viewMode === 'grid' ? 3 : 2).map((category, idx) => (
              <span key={idx} className={`text-xs ${viewMode === 'grid' ? 'px-2 py-1 sm:px-3 sm:py-2' : 'px-2 py-1'} rounded-full inline-flex items-center gap-1 sm:gap-1.5 ${CATEGORY_COLORS[category] || 'bg-primaryBG text-textPrimary'}`}>
                {CATEGORY_ICONS[category]} {category}
              </span>
            ))}
          </div>
          
          {/* Footer - Like/Dislike ve Tarih */}
          <div className="mt-auto flex justify-between items-center text-xs sm:text-sm text-textPrimary pt-0">
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="flex items-center gap-1 sm:gap-2 hover:text-red-500 transition-colors">
                <Heart size={14} />
                <span className="font-medium">{item.likes || 0}</span>
              </button>
              <button className="flex items-center gap-1 sm:gap-2 hover:text-blue-500 transition-colors">
                <ThumbsDown size={14} />
                <span className="font-medium">{item.dislikes || 0}</span>
              </button>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Calendar size={14} />
              <span className={`font-medium text-xs ${viewMode === 'list' ? '' : ''}`}>
                {formatDate(item.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
    </Link>
  );
}

export default NewsCard;
