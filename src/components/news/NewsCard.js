import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ThumbsDown, Calendar, Image } from 'lucide-react';
import { 
  CATEGORY_COLORS, 
  CATEGORY_ICONS, 
  translateTagsToTurkish 
} from '../../services/categories';

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
    <Link to={`/haberler/${item.id}`} className="block">
      <motion.div 
        className={`bg-primary rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-primaryBG w-full cursor-pointer overflow-hidden ${
          viewMode === 'grid' ? "p-3.5" : "p-4"
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
      <div className={`flex ${viewMode === 'grid' ? "flex-col h-full" : "gap-4"}`}>
        {/* Görsel kısmı */}
        <div className={`${
          viewMode === 'grid' ? "w-full h-[150px]" : "flex-shrink-0 w-[150px] h-[100px]"
        } bg-primaryBG rounded-lg overflow-hidden flex items-center justify-center ${
          viewMode === 'grid' ? "mb-3" : ""
        }`}>
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
              <Image size={viewMode === 'grid' ? 40 : 30} className="opacity-40 mb-2" />
              <span className={`${viewMode === 'grid' ? 'text-sm' : 'text-xs'} opacity-60`}>
                Görsel yok
              </span>
            </div>
          )}
        </div>
        
        {/* İçerik kısmı */}
        <div className={`flex-1 flex flex-col ${
          viewMode === 'grid' ? "h-[250px]" : ""
        }`}>
          {/* Başlık */}
          <h3 className={`font-bold mb-2 text-textHeading ${
            viewMode === 'grid' ? 'text-lg line-clamp-3' : 'text-lg line-clamp-2'
          }`}>
            {item.name}
          </h3>
          
          {/* Açıklama - Grid modunda göster, List modunda gösterme */}
          {viewMode === 'grid' && (
            <p className="text-sm text-textPrimary mb-2 line-clamp-3">{item.minides}</p>
          )}
          
          {/* Etiketler */}
          <div className={`flex flex-wrap gap-1.5 ${viewMode === 'grid' ? 'mb-3' : 'mb-2'}`}>
            {item.tag && translateTagsToTurkish(item.tag).slice(0, viewMode === 'grid' ? 3 : 2).map((category, idx) => (
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
              <span className={`font-medium ${viewMode === 'list' ? 'text-sm' : ''}`}>
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
