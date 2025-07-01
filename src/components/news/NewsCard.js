import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ThumbsDown, Calendar, Image } from 'lucide-react';
import { 
  CATEGORY_COLORS, 
  CATEGORY_ICONS, 
  translateTagsToTurkish 
} from '../../services/categories';

function NewsCard({ item, index }) {
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
    <Link to={`/haber/${item.id}`} className="block">
      <motion.div 
        className="bg-primary p-3.5 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-primaryBG w-full cursor-pointer"
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
        {/* Görsel kısmı - 130px */}
        <div className="w-full h-[150px] bg-primaryBG rounded-lg overflow-hidden mb-3 flex items-center justify-center">
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
        
        {/* İçerik kısmı - 230px */}
        <div className="h-[250px] flex flex-col">
          {/* Başlık */}
          <h3 className="text-lg font-bold mb-2 text-textHeading line-clamp-3">{item.name}</h3>
          
          {/* Açıklama */}
          <p className="text-sm text-textPrimary mb-2 line-clamp-3">{item.minides}</p>
          
          {/* Etiketler - Roundedli */}
          <div className="flex flex-wrap gap-1.5 mb-0">
            {item.tag && translateTagsToTurkish(item.tag).map((category, idx) => (
              <span key={idx} className={`text-xs px-3 py-2 rounded-full inline-flex items-center gap-1.5 ${CATEGORY_COLORS[category] || 'bg-primaryBG text-textPrimary'}`}>
                {CATEGORY_ICONS[category]} {category}
              </span>
            ))}
          </div>
          
          {/* Footer - Like/Dislike ve Tarih */}
          <div className="mt-auto flex justify-between items-center text-base text-textPrimary pt-0">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                <Heart size={16} />
                <span className="font-medium">{item.likes || 0}</span>
              </button>
              <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                <ThumbsDown size={16} />
                <span className="font-medium">{item.dislikes || 0}</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span className="font-medium">{formatDate(item.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
    </Link>
  );
}

export default NewsCard;
