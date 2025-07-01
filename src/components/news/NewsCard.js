import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ThumbsDown, Calendar, Image } from 'lucide-react';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../services/categories';

function NewsCard({ item, index }) {
  // Tarih formatını düzenlemek için yardımcı fonksiyon
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
      
      return `${day}.${month}.${year}`;
    } catch (error) {
      console.error("❌ Tarih formatlanırken hata oluştu:", error);
      return dateString;
    }
  };

  return (
    <motion.div 
      className="bg-primary p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-primaryBG w-full"
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
      <div className="flex flex-col h-full">
        {/* Görsel kısmı - 160px */}
        <div className="w-full h-[160px] bg-primaryBG rounded-lg overflow-hidden mb-3 flex items-center justify-center">
          {item.image ? (
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                console.log("Resim yüklenemedi:", e);
                e.target.onerror = null; 
                e.target.src = "/imgs/logo.png"; // Fallback resim
              }} 
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-textPrimary">
              <Image size={40} className="opacity-40 mb-2" />
              <span className="text-sm opacity-60">Görsel yok</span>
            </div>
          )}
        </div>
        
        {/* İçerik kısmı - 213px */}
        <div className="h-[213px] flex flex-col">
          {/* Başlık */}
          <h3 className="text-lg font-bold mb-2 text-textHeading line-clamp-2">{item.name}</h3>
          
          {/* Açıklama */}
          <p className="text-sm text-textPrimary mb-3 line-clamp-3">{item.minides}</p>
          
          {/* Etiketler - Roundedli */}
          <div className="flex flex-wrap gap-2 mb-3">
            {item.tag && item.tag.map((category, idx) => (
              <span key={idx} className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${CATEGORY_COLORS[category] || 'bg-primaryBG text-textPrimary'}`}>
                {CATEGORY_ICONS[category]} {category}
              </span>
            ))}
          </div>
          
          {/* Footer - Like/Dislike ve Tarih */}
          <div className="mt-auto flex justify-between items-center text-xs text-textPrimary">
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                <Heart size={12} />
                <span>{item.likes || 0}</span>
              </button>
              <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                <ThumbsDown size={12} />
                <span>{item.dislikes || 0}</span>
              </button>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{formatDate(item.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default NewsCard;
