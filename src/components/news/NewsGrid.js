import React from 'react';
import { motion } from 'framer-motion';
import NewsCard from './NewsCard';
import { Search, FileText, Trash2, Clock } from 'lucide-react';

function NewsGrid({ news, loading, searchTerm, selectedCategory, onClearSearch }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Loading skeleton'ları - NewsCard'ların kare yapısına uygun */}
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-primary p-3.5 rounded-lg shadow-lg border border-primaryBG w-full">
              <div className="flex flex-col h-full">
                {/* Görsel kısmı skeleton - 150px */}
                <div className="w-full h-[150px] bg-gray-300 rounded-lg mb-3"></div>
                
                {/* İçerik kısmı skeleton - 250px */}
                <div className="h-[250px] flex flex-col space-y-3">
                  {/* Başlık skeleton */}
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                  
                  {/* Açıklama skeleton */}
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-300 rounded w-full"></div>
                    <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-300 rounded w-4/5"></div>
                  </div>
                  
                  {/* Etiketler skeleton */}
                  <div className="flex gap-1.5">
                    <div className="h-6 bg-gray-300 rounded-full w-16"></div>
                    <div className="h-6 bg-gray-300 rounded-full w-20"></div>
                  </div>
                  
                  {/* Footer skeleton - Like/Dislike ve Tarih */}
                  <div className="mt-auto flex justify-between items-center pt-2">
                    <div className="flex items-center gap-4">
                      <div className="h-4 bg-gray-300 rounded w-12"></div>
                      <div className="h-4 bg-gray-300 rounded w-12"></div>
                    </div>
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading mesajı */}
        <div className="col-span-full flex justify-center items-center py-8">
          <div className="flex items-center gap-3 text-xl text-gray-500">
            <Clock size={24} className="animate-spin" />
            Haberler yükleniyor...
          </div>
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-xl text-textPrimary">
          {searchTerm ? 
            <>
              <Search size={48} className="mx-auto mb-4 text-textPrimary opacity-50" />
              "{searchTerm}" için sonuç bulunamadı
            </> :
            <>
              <FileText size={48} className="mx-auto mb-4 text-textPrimary opacity-50" />
              {selectedCategory === 'Tümü' ? 'Henüz haber yok' : `${selectedCategory} kategorisinde haber bulunamadı`}
            </>
          }
        </div>
        {searchTerm && (
          <button
            onClick={onClearSearch}
            className="mt-4 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondaryHover transition-colors flex items-center gap-2 mx-auto"
          >
            <Trash2 size={16} />
            Aramayı temizle
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {news.map((item, index) => (
        <NewsCard key={item.id} item={item} index={index} />
      ))}
    </motion.div>
  );
}

export default NewsGrid;
