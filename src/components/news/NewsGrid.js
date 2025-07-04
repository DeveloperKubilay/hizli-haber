import React from 'react';
import { motion } from 'framer-motion';
import NewsCard from './NewsCard';
import { Search, FileText, Trash2, Clock } from 'lucide-react';

function NewsGrid({ news, loading, searchTerm, selectedCategory, onClearSearch, viewMode = 'grid' }) {
  if (loading) {
    return (
      <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6" : "space-y-3 sm:space-y-4"}>
        {/* Loading skeleton'ları - viewMode'a göre */}
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className={`bg-primary rounded-lg shadow-lg border border-primaryBG w-full ${
              viewMode === 'grid' ? "p-2 sm:p-3 md:p-3.5" : "p-2 sm:p-4"
            }`}>
              <div className={`flex ${viewMode === 'grid' ? "flex-col h-full" : "gap-2 sm:gap-4"}`}>
                {/* Görsel kısmı skeleton */}
                <div className={`${
                  viewMode === 'grid' ? "w-full h-[120px] sm:h-[150px] mb-2 sm:mb-3" : "flex-shrink-0 w-[80px] sm:w-[150px] h-[70px] sm:h-[100px]"
                } bg-gray-300 rounded-lg`}></div>
                
                {/* İçerik kısmı skeleton */}
                <div className={`flex-1 flex flex-col space-y-2 sm:space-y-3 ${
                  viewMode === 'grid' ? "h-[200px] sm:h-[250px]" : ""
                }`}>
                  {/* Başlık skeleton */}
                  <div className="space-y-1 sm:space-y-2">
                    <div className="h-3 sm:h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-3 sm:h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                  
                  {/* Açıklama skeleton - sadece grid modunda */}
                  {viewMode === 'grid' && (
                    <div className="space-y-1 sm:space-y-2">
                      <div className="h-2 sm:h-3 bg-gray-300 rounded w-full"></div>
                      <div className="h-2 sm:h-3 bg-gray-300 rounded w-5/6"></div>
                      <div className="h-2 sm:h-3 bg-gray-300 rounded w-4/5"></div>
                    </div>
                  )}
                  
                  {/* Etiketler skeleton */}
                  <div className="flex gap-1 sm:gap-1.5">
                    <div className="h-5 sm:h-6 bg-gray-300 rounded-full w-12 sm:w-16"></div>
                    <div className="h-5 sm:h-6 bg-gray-300 rounded-full w-16 sm:w-20"></div>
                  </div>
                  
                  {/* Footer skeleton - Like/Dislike ve Tarih */}
                  <div className="mt-auto flex justify-between items-center pt-2">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="h-3 sm:h-4 bg-gray-300 rounded w-10 sm:w-12"></div>
                      <div className="h-3 sm:h-4 bg-gray-300 rounded w-10 sm:w-12"></div>
                    </div>
                    <div className="h-3 sm:h-4 bg-gray-300 rounded w-16 sm:w-24"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading mesajı */}
        <div className="col-span-full flex justify-center items-center py-4 sm:py-8">
          <div className="flex items-center gap-2 sm:gap-3 text-base sm:text-xl text-gray-500">
            <Clock size={20} className="animate-spin" />
            Haberler yükleniyor...
          </div>
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-10 sm:py-20">
        <div className="text-base sm:text-xl text-textPrimary">
          {searchTerm ? 
            <>
              <Search size={36} className="mx-auto mb-3 sm:mb-4 text-textPrimary opacity-50" />
              "{searchTerm}" için sonuç bulunamadı
            </> :
            <>
              <FileText size={36} className="mx-auto mb-3 sm:mb-4 text-textPrimary opacity-50" />
              {selectedCategory === 'Tümü' ? 'Henüz haber yok' : `${selectedCategory} kategorisinde haber bulunamadı`}
            </>
          }
        </div>
        {searchTerm && (
          <button
            onClick={onClearSearch}
            className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-secondary text-white rounded-lg hover:bg-secondaryHover transition-colors flex items-center gap-2 mx-auto text-sm sm:text-base"
          >
            <Trash2 size={14} />
            Aramayı temizle
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div 
      className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6" : "space-y-3 sm:space-y-4"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {news.map((item, index) => (
        <NewsCard key={item.id} item={item} index={index} viewMode={viewMode} />
      ))}
    </motion.div>
  );
}

export default NewsGrid;
